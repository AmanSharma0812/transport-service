const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const PromoCode = require('../models/PromoCode');
const SOSAlert = require('../models/SOSAlert');

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Stats
    const totalUsers = await User.countDocuments({ role: 'rider' });
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ isOnline: true });
    const approvedDrivers = await Driver.countDocuments({ isApproved: true });
    const pendingDrivers = await Driver.countDocuments({ isApproved: false });

    const todayRides = await Ride.countDocuments({ createdAt: { $gte: today } });
    const todayCompleted = await Ride.countDocuments({
      status: 'completed',
      completedAt: { $gte: today }
    });

    const todayEarnings = await Payment.aggregate([
      { $match: { status: 'completed', paidAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          driverEarnings: { $sum: '$driverEarnings' },
          commission: { $sum: '$commission' }
        }
      }
    ]);

    // Recent rides
    const recentRides = await Ride.find()
      .populate('rider', 'name phone')
      .populate('driver', 'user')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent SOS alerts
    const recentSOS = await SOSAlert.find({ status: 'active' })
      .populate('user', 'name phone')
      .limit(5);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeDrivers
        },
        drivers: {
          total: totalDrivers,
          approved: approvedDrivers,
          pending: pendingDrivers,
          online: activeDrivers
        },
        rides: {
          today: todayRides,
          completed: todayCompleted,
          completionRate: todayRides ? (todayCompleted / todayRides * 100).toFixed(1) : 0
        },
        earnings: todayEarnings[0] || {
          total: 0,
          driverEarnings: 0,
          commission: 0
        },
        recentRides,
        activeSOS: recentSOS.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isBlocked } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) filter.role = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
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

// @desc    Block/unblock user
// @route   PUT /api/admin/users/:userId/block
const toggleUserBlock = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isBlocked: !req.body.isBlocked } },
      { new: true }
    );

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all drivers
// @route   GET /api/admin/drivers
const getDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 20, isApproved, isActive } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const drivers = await Driver.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Driver.countDocuments(filter);

    res.json({
      success: true,
      data: drivers,
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

// @desc    Approve/reject driver
// @route   PUT /api/admin/drivers/:driverId/approval
const approveDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { isApproved, rejectionReason } = req.body;
    const io = req.app.get('io');

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      {
        isApproved,
        ...(rejectionReason && { rejectionReason }),
        ...(isApproved && { rejectedAt: null })
      },
      { new: true }
    ).populate('user', 'name email phone');

    // Notify driver
    if (io) {
      io.to(driver.user._id.toString()).emit('approvalStatusChanged', {
        isApproved,
        rejectionReason
      });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all rides
// @route   GET /api/admin/rides
const getAllRides = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, vehicleType, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (vehicleType) filter.vehicleType = vehicleType;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const rides = await Ride.find(filter)
      .populate('rider', 'name phone')
      .populate('driver', 'user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ride.countDocuments(filter);

    // Get analytics summary
    const summary = await Ride.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalFare: { $sum: '$totalFare' }
        }
      }
    ]);

    res.json({
      success: true,
      data: rides,
      summary,
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

// @desc    Update ride fare/surge pricing
// @route   PUT /api/admin/pricing
const updatePricing = async (req, res) => {
  try {
    const { vehicleType, baseFare, perKmRate, perMinuteRate, surgeMultiplier, surgeThreshold } = req.body;

    // In production, store in database or config
    // For now, we'll return the updated config

    res.json({
      success: true,
      data: {
        vehicleType,
        baseFare,
        perKmRate,
        perMinuteRate,
        surgeMultiplier,
        surgeThreshold
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Manage commission rates
// @route   PUT /api/admin/commission
const updateCommission = async (req, res) => {
  try {
    const { rate } = req.body; // e.g., 0.15 for 15%

    // In production, update in config or database
    res.json({
      success: true,
      data: { commissionRate: rate }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create/manage promo codes
// @route   POST /api/admin/promo-codes
const createPromoCode = async (req, res) => {
  try {
    const promo = await PromoCode.create({
      ...req.body,
      code: req.body.code.toUpperCase()
    });

    res.status(201).json({
      success: true,
      data: promo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all promo codes
// @route   GET /api/admin/promo-codes
const getPromoCodes = async (req, res) => {
  try {
    const promos = await PromoCode.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: promos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Toggle promo code
// @route   PUT /api/admin/promo-codes/:id/toggle
const togglePromoCode = async (req, res) => {
  try {
    const promo = await PromoCode.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: !req.body.isActive } },
      { new: true }
    );

    res.json({ success: true, data: promo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get SOS alerts
// @route   GET /api/admin/sos-alerts
const getSOSAlerts = async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status !== 'all') filter.status = status;

    const alerts = await SOSAlert.find(filter)
      .populate('user', 'name phone')
      .populate('driver', 'user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SOSAlert.countDocuments(filter);

    res.json({
      success: true,
      data: alerts,
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

// @desc    Resolve SOS alert
// @route   PUT /api/admin/sos-alerts/:id/resolve
const resolveSOSAlert = async (req, res) => {
  try {
    // Fetch the alert first
    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Update with new actions
    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.actions.push({
      action: 'resolved',
      takenBy: req.user.id,
      notes: req.body.notes,
      timestamp: new Date()
    });
    await alert.save();

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get earnings report
// @route   GET /api/admin/earnings/report
const getEarningsReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'daily' } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.paidAt = {};
      if (startDate) matchStage.paidAt.$gte = new Date(startDate);
      if (endDate) matchStage.paidAt.$lte = new Date(endDate);
    }

    const groupStage = {
      _id: {}
    };

    if (groupBy === 'daily') {
      groupStage._id = {
        $dateToString: { format: '%Y-%m-%d', date: '$paidAt' }
      };
    } else if (groupBy === 'weekly') {
      groupStage._id = {
        $dateToString: { format: '%Y-%U', date: '$paidAt' }
      };
    } else if (groupBy === 'monthly') {
      groupStage._id = {
        $dateToString: { format: '%Y-%m', date: '$paidAt' }
      };
    }

    const report = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          ...groupStage,
          total: { $sum: '$amount' },
          driverEarnings: { $sum: '$driverEarnings' },
          commission: { $sum: '$commission' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Total summary
    const totals = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          driverEarnings: { $sum: '$driverEarnings' },
          commission: { $sum: '$commission' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: report,
      totals: totals[0] || { total: 0, driverEarnings: 0, commission: 0, count: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Admin create rider
// @route   POST /api/admin/users/rider
const createRider = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Simple direct creation for admin
    const user = await User.create({
      name,
      email,
      phone,
      password: password || 'password123', // Default password
      role: 'rider',
      isVerified: true,
      currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] } // Default location
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Admin create ride
// @route   POST /api/admin/rides
const createRide = async (req, res) => {
  try {
    const { riderId, pickupAddress, dropoffAddress, vehicleType } = req.body;
    
    // Calculate mock fare
    const distance = 5.2;
    const duration = 18;
    const baseFares = { bike: 20, auto: 30, cab: 50 };
    const totalFare = (baseFares[vehicleType] || 20) + (distance * 10);

    const ride = await Ride.create({
      rideId: 'QR' + Date.now().toString(36).toUpperCase(),
      rider: riderId,
      vehicleType: vehicleType || 'bike',
      pickup: { address: pickupAddress, location: { type: 'Point', coordinates: [77.5946, 12.9716] } },
      dropoff: { address: dropoffAddress, location: { type: 'Point', coordinates: [77.6245, 12.9352] } },
      distance,
      duration,
      totalFare,
      status: 'requested',
      payment: { method: 'cash', status: 'pending' }
    });

    res.status(201).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  toggleUserBlock,
  getDrivers,
  approveDriver,
  getAllRides,
  updatePricing,
  updateCommission,
  createPromoCode,
  getPromoCodes,
  togglePromoCode,
  getSOSAlerts,
  resolveSOSAlert,
  getEarningsReport,
  createRider,
  createRide
};