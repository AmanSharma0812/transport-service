const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// @desc    Get driver dashboard stats
// @route   GET /api/driver/dashboard
const getDashboard = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's stats
    const todayRides = await Ride.countDocuments({
      driver: driver._id,
      status: 'completed',
      createdAt: { $gte: today }
    });

    const todayEarnings = await Payment.aggregate([
      {
        $match: {
          driver: driver._id,
          status: 'completed',
          paidAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$driverEarnings' }
        }
      }
    ]);

    // This week's stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekRides = await Ride.countDocuments({
      driver: driver._id,
      status: 'completed',
      createdAt: { $gte: weekAgo }
    });

    // Active ride if any
    const activeRide = await Ride.findOne({
      driver: driver._id,
      status: { $in: ['accepted', 'arriving', 'ongoing'] }
    }).populate('rider', 'name phone');

    res.json({
      success: true,
      data: {
        stats: {
          today: {
            rides: todayRides,
            earnings: todayEarnings[0]?.total || 0
          },
          week: {
            rides: weekRides
          },
          totalLifetime: {
            rides: driver.totalRides,
            earnings: driver.totalEarnings
          },
          rating: driver.averageRating
        },
        status: {
          isOnline: driver.isOnline,
          isActive: driver.isActive,
          currentRide: activeRide ? {
            rideId: activeRide.rideId,
            rider: activeRide.rider,
            pickup: activeRide.pickup,
            dropoff: activeRide.dropoff,
            status: activeRide.status
          } : null
        },
        vehicle: driver.vehicle
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Toggle online/offline status
// @route   PUT /api/driver/toggle-status
const toggleStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;

    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { isOnline },
      { new: true }
    );

    // Notify riders about driver availability
    io.to('rider').emit('driverStatusChanged', {
      driverId: driver._id,
      isOnline,
      location: driver.currentLocation
    });

    res.json({
      success: true,
      data: { isOnline: driver.isOnline }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get incoming ride requests
// @route   GET /api/driver/ride-requests
const getRideRequests = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });

    if (!driver.isOnline) {
      return res.status(400).json({ error: 'Please go online to receive ride requests' });
    }

    // Get recent ride requests (mock - in production, these would be real-time via socket)
    // For demo purposes, we'll return empty as requests come via socket
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Accept ride request
// @route   POST /api/driver/accept-ride/:rideId
const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driver = await Driver.findOne({ user: req.user.id });

    if (!driver.isOnline) {
      return res.status(400).json({ error: 'Please go online first' });
    }

    if (driver.isActive && !driver.currentRide) {
      return res.status(400).json({ error: 'You already have an active ride' });
    }

    const ride = await Ride.findOne({
      rideId,
      status: 'searching'
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not available' });
    }

    // Accept ride
    ride.driver = driver._id;
    ride.status = 'accepted';
    await ride.save();

    // Update driver status
    driver.currentRide = ride._id;
    driver.isActive = true;
    await driver.save();

    // Notify rider via socket
    io.to(ride.rider.toString()).emit('rideAccepted', {
      rideId: ride.rideId,
      driver: {
        name: req.user.name,
        phone: req.user.phone,
        vehicle: driver.vehicle,
        rating: driver.averageRating,
        registrationNumber: driver.vehicle.registrationNumber
      }
    });

    res.json({
      success: true,
      data: ride
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Decline ride request
// @route   POST /api/driver/decline-ride/:rideId
const declineRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findOne({
      rideId,
      status: 'searching'
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Notify rider via socket
    io.to(ride.rider.toString()).emit('rideDeclined', {
      rideId
    });

    res.json({
      success: true,
      message: 'Ride declined'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update ride status to arriving
// @route   PUT /api/driver/arriving/:rideId
const markArriving = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driver = await Driver.findOne({ user: req.user.id });

    const ride = await Ride.findOne({
      rideId,
      driver: driver._id,
      status: 'accepted'
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    ride.status = 'arriving';
    await ride.save();

    io.to(ride.rider.toString()).emit('driverArriving', { rideId });

    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Start ride
// @route   PUT /api/driver/start-ride/:rideId
const startRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { startLat, startLng } = req.body;

    const driver = await Driver.findOne({ user: req.user.id });

    const ride = await Ride.findOne({
      rideId,
      driver: driver._id,
      status: 'arriving'
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    ride.status = 'ongoing';
    ride.startedAt = new Date();
    ride.route.push({
      type: 'Point',
      coordinates: [startLng, startLat],
      timestamp: new Date()
    });
    await ride.save();

    io.to(ride.rider.toString()).emit('rideStarted', { rideId });

    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Complete ride
// @route   PUT /api/driver/complete-ride/:rideId
const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { dropoffLat, dropoffLng, distance, duration } = req.body;

    const driver = await Driver.findOne({ user: req.user.id });

    const ride = await Ride.findOne({
      rideId,
      driver: driver._id,
      status: 'ongoing'
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Update ride
    ride.status = 'completed';
    ride.completedAt = new Date();
    ride.dropoff.location.coordinates = [dropoffLng, dropoffLat];
    ride.distance = distance || ride.distance;
    ride.duration = duration || ride.duration;
    ride.route.push({
      type: 'Point',
      coordinates: [dropoffLng, dropoffLat],
      timestamp: new Date()
    });

    await ride.save();

    // Update driver stats
    driver.totalRides += 1;
    driver.currentRide = null;
    driver.isActive = false;
    await driver.save();

    // Create payment record
    const payment = await Payment.create({
      paymentId: `PAY${Date.now()}`,
      ride: ride._id,
      rider: ride.rider,
      driver: driver._id,
      amount: ride.totalFare,
      fareBreakdown: {
        baseFare: ride.baseFare,
        distanceFare: ride.distanceFare,
        timeFare: ride.timeFare,
        surgeAmount: ride.surgeAmount,
        taxes: 0,
        couponDiscount: ride.couponDiscount
      },
      method: ride.payment.method,
      status: 'pending',
      commission: ride.totalFare * 0.15,
      driverEarnings: ride.totalFare * 0.85,
      metadata: {
        vehicleType: ride.vehicleType,
        distance: ride.distance,
        duration: ride.duration
      }
    });

    // Notify rider
    io.to(ride.rider.toString()).emit('rideCompleted', {
      rideId: ride.rideId,
      paymentId: payment.paymentId
    });

    res.json({
      success: true,
      data: {
        ride,
        payment
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get ride history for driver
// @route   GET /api/driver/rides
const getRideHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const driver = await Driver.findOne({ user: req.user.id });

    const filter = { driver: driver._id };
    if (status) {
      filter.status = status;
    }

    const rides = await Ride.find(filter)
      .populate('rider', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ride.countDocuments(filter);

    res.json({
      success: true,
      data: rides,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get earnings breakdown
// @route   GET /api/driver/earnings
const getEarnings = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    const driver = await Driver.findOne({ user: req.user.id });

    let startDate;
    const now = new Date();

    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const earnings = await Payment.aggregate([
      {
        $match: {
          driver: driver._id,
          status: 'completed',
          paidAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$driverEarnings' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      }
    ]);

    // Cash payments not in Payment collection
    const cashRides = await Ride.countDocuments({
      driver: driver._id,
      status: 'completed',
      'payment.method': 'cash',
      completedAt: { $gte: startDate }
    });

    // Daily breakdown
    const dailyBreakdown = await Payment.aggregate([
      {
        $match: {
          driver: driver._id,
          status: 'completed',
          paidAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$paidAt' }
          },
          total: { $sum: '$driverEarnings' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        earnings: earnings[0] || { total: 0, count: 0, average: 0 },
        cashRides,
        dailyBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update driver profile
// @route   PUT /api/driver/profile
const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.vehicle) {
      updates.vehicle = updates.vehicle;
    }

    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update driver location
// @route   PUT /api/driver/location
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      {
        'currentLocation.type': 'Point',
        'currentLocation.coordinates': [longitude, latitude]
      },
      { new: true }
    );

    // Broadcast location to nearby riders (could be optimized)
    io.emit('driverLocationUpdate', {
      driverId: driver._id,
      location: driver.currentLocation
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Upload document
// @route   POST /api/driver/documents
const uploadDocument = async (req, res) => {
  try {
    const { docType, docNumber, frontImage, backImage } = req.body;

    const update = {};
    const docPath = `documents.${docType}`;

    update[`${docPath}.number`] = docNumber;
    update[`${docPath}.frontImage`] = frontImage;
    if (backImage) {
      update[`${docPath}.backImage`] = backImage;
    }

    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      update,
      { new: true }
    );

    res.json({
      success: true,
      data: driver.documents[docType]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  toggleStatus,
  getRideRequests,
  acceptRide,
  declineRide,
  markArriving,
  startRide,
  completeRide,
  getRideHistory,
  getEarnings,
  updateProfile,
  updateLocation,
  uploadDocument
};