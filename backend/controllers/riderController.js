const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const User = require('../models/User');
const Driver = require('../models/Driver');
const PromoCode = require('../models/PromoCode');
const { io } = require('../server');

// Calculate fare based on distance and time
const calculateFare = async (vehicleType, distance, duration, surgeMultiplier = 1) => {
  const baseFares = {
    bike: 20,
    auto: 30,
    cab: 50
  };

  const perKmRates = {
    bike: 8,
    auto: 12,
    cab: 18
  };

  const perMinuteRates = {
    bike: 1,
    auto: 1.5,
    cab: 2.5
  };

  const baseFare = baseFares[vehicleType] || 20;
  const perKm = perKmRates[vehicleType] || 8;
  const perMinute = perMinuteRates[vehicleType] || 1;

  const distanceFare = distance * perKm;
  const timeFare = duration * perMinute;

  const subTotal = baseFare + distanceFare + timeFare;
  const surgeAmount = subTotal * (surgeMultiplier - 1);
  const taxes = subTotal * 0.05;
  const total = subTotal * surgeMultiplier + taxes;

  return {
    baseFare,
    distanceFare,
    timeFare,
    surgeMultiplier,
    surgeAmount,
    taxes,
    total,
    estimatedFare: total
  };
};

const generateRideId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QR${timestamp}${random}`;
};

// Get fare estimation
const getFareEstimate = async (req, res) => {
  try {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType } = req.query;
    const mockDistance = 5.2;
    const mockDuration = 18;
    const activeRides = await Ride.countDocuments({ status: { $in: ['requested', 'searching', 'accepted'] } });
    const surgeMultiplier = activeRides > 50 ? 1.3 : activeRides > 30 ? 1.15 : 1;
    const fare = await calculateFare(vehicleType || 'bike', mockDistance, mockDuration, surgeMultiplier);

    res.json({
      success: true,
      data: {
        ...fare,
        distance: mockDistance,
        duration: mockDuration,
        vehicleTypes: ['bike', 'auto', 'cab'],
        surgeMultiplier
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Book a ride
const bookRide = async (req, res) => {
  try {
    const { pickupLat, pickupLng, pickupAddress, dropoffLat, dropoffLng, dropoffAddress, vehicleType, paymentMethod, couponCode } = req.body;
    const activeRide = await Ride.findOne({
      rider: req.user.id,
      status: { $in: ['requested', 'searching', 'accepted', 'arriving', 'ongoing'] }
    });

    if (activeRide) {
      return res.status(400).json({ error: 'You already have an active ride' });
    }

    const distance = 5.2;
    const duration = 18;
    const activeRidesCount = await Ride.countDocuments({ status: { $in: ['requested', 'searching', 'accepted'] } });
    let surgeMultiplier = 1;
    if (activeRidesCount > 50) surgeMultiplier = 1.3;
    else if (activeRidesCount > 30) surgeMultiplier = 1.15;

    const fare = await calculateFare(vehicleType, distance, duration, surgeMultiplier);
    let couponDiscount = 0;

    if (couponCode) {
      const coupon = await PromoCode.findOne({ code: couponCode.toUpperCase(), isActive: true, validUntil: { $gte: new Date() } });
      if (coupon) {
        if (coupon.type === 'percentage') {
          couponDiscount = Math.min(fare.total * (coupon.discount / 100), coupon.maximumDiscount || fare.total);
        } else if (coupon.type === 'fixed') {
          couponDiscount = Math.min(coupon.discount, fare.total);
        }
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const totalFare = Math.max(0, fare.total - couponDiscount);

    const ride = await Ride.create({
      rideId: generateRideId(),
      rider: req.user.id,
      vehicleType,
      pickup: { address: pickupAddress, location: { type: 'Point', coordinates: [pickupLng, pickupLat] } },
      dropoff: { address: dropoffAddress, location: { type: 'Point', coordinates: [dropoffLng, dropoffLat] } },
      distance,
      duration,
      baseFare: fare.baseFare,
      distanceFare: fare.distanceFare,
      timeFare: fare.timeFare,
      surgeMultiplier,
      surgeAmount: fare.surgeAmount,
      estimatedFare: fare.total,
      totalFare,
      payment: { method: paymentMethod || 'cash' },
      status: 'requested',
      ...(couponCode && { couponUsed: { code: couponCode.toUpperCase(), discount: couponDiscount } })
    });

    io.to('driver').emit('newRideRequest', {
      rideId: ride.rideId,
      pickup: ride.pickup,
      dropoff: ride.dropoff,
      vehicleType,
      totalFare,
      rider: { name: req.user.name, phone: req.user.phone, rating: req.user.averageRating || 0 }
    });

    res.status(201).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;
    const ride = await Ride.findOne({ rideId, rider: req.user.id, status: { $in: ['requested', 'searching', 'accepted'] } });
    if (!ride) return res.status(404).json({ error: 'Ride not found or cannot be cancelled' });

    ride.status = 'cancelled';
    ride.cancellationReason = { cancelledBy: 'rider', reason: reason || 'No reason provided' };
    await ride.save();

    if (ride.driver) {
      io.to(ride.driver.toString()).emit('rideCancelled', { rideId });
    }

    res.json({ success: true, message: 'Ride cancelled', cancellationFee: ride.status === 'accepted' ? Math.min(ride.totalFare * 0.25, 50) : 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rateRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { rating, review, categories } = req.body;
    const ride = await Ride.findOne({ rideId, rider: req.user.id, status: 'completed' });
    if (!ride) return res.status(404).json({ error: 'Completed ride not found' });

    const existingReview = await Review.findOne({ ride: ride._id });
    if (existingReview) return res.status(400).json({ error: 'Ride already rated' });

    const newReview = await Review.create({
      ride: ride._id,
      reviewer: req.user.id,
      reviewee: ride.driver,
      rating,
      review,
      ...(categories && { categories })
    });

    const driver = await Driver.findById(ride.driver);
    const allRatings = await Review.find({ reviewee: ride.driver });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    driver.averageRating = avgRating;
    driver.totalRides += 1;
    await driver.save();

    res.json({ success: true, data: newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRideHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    const filter = { rider: req.user.id };
    if (status) filter.status = status;

    const rides = await Ride.find(filter).populate('driver', 'user vehicle').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Ride.countDocuments(filter);

    res.json({ success: true, data: rides, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRideDetails = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findOne({ rideId, rider: req.user.id }).populate('driver', 'user vehicle averageRating totalRides');
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    const payment = await Payment.findOne({ ride: ride._id });
    const review = await Review.findOne({ ride: ride._id });

    res.json({ success: true, data: { ...ride._doc, payment, review } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateInvoice = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findOne({ rideId, rider: req.user.id, status: 'completed' }).populate('driver', 'user');
    if (!ride) return res.status(404).json({ error: 'Completed ride not found' });

    const invoiceData = {
      invoiceNumber: `INV-${ride.rideId}`,
      rideId: ride.rideId,
      date: ride.completedAt,
      rider: { name: req.user.name, phone: req.user.phone },
      driver: { name: ride.driver?.user?.name || 'N/A' },
      vehicleType: ride.vehicleType,
      pickup: ride.pickup.address,
      dropoff: ride.dropoff.address,
      distance: `${ride.distance} km`,
      duration: `${ride.duration} mins`,
      fareBreakdown: { baseFare: ride.baseFare, distanceFare: ride.distanceFare, timeFare: ride.timeFare, surge: ride.surgeAmount, couponDiscount: ride.couponDiscount || 0, total: ride.totalFare }
    };

    res.json({ success: true, data: invoiceData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addEmergencyContact = async (req, res) => {
  try {
    res.json({ success: true, message: 'Emergency contact added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const triggerSOS = async (req, res) => {
  try {
    const { rideId, latitude, longitude, reason } = req.body;
    const SOSAlert = require('../models/SOSAlert');
    const sosAlert = await SOSAlert.create({
      ride: rideId,
      user: req.user.id,
      driver: rideId ? (await Ride.findOne({ rideId })).driver : null,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      metadata: { reason }
    });

    io.to('admin').emit('newSOSAlert', { alertId: sosAlert._id, userId: req.user.id, location: sosAlert.location, rideId });
    res.status(201).json({ success: true, data: sosAlert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFareEstimate,
  bookRide,
  cancelRide,
  rateRide,
  getRideHistory,
  getRideDetails,
  generateInvoice,
  addEmergencyContact,
  triggerSOS
};