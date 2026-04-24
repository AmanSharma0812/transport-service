const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const User = require('../models/User');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create payment order
// @route   POST /api/payment/create-order
const createOrder = async (req, res) => {
  try {
    const { rideId, amount } = req.body;

    const ride = await Ride.findOne({
      rideId,
      rider: req.user.id,
      status: 'completed'
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    const paymentAmount = Math.round(amount * 100); // Convert to paise

    const options = {
      amount: paymentAmount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        rideId,
        riderId: req.user.id
      }
    };

    try {
      const order = await razorpay.orders.create(options);

      // Create payment record
      const payment = await Payment.create({
        paymentId: `pay_${Date.now()}`,
        ride: ride._id,
        rider: req.user.id,
        driver: ride.driver,
        amount,
        method: 'card',
        gateway: 'razorpay',
        gatewayOrderId: order.id,
        status: 'pending'
      });

      res.json({
        success: true,
        data: {
          orderId: order.id,
          amount,
          currency: 'INR',
          key: process.env.RAZORPAY_KEY_ID,
          paymentId: payment.paymentId
        }
      });
    } catch (razorpayError) {
      res.status(500).json({ error: 'Payment gateway error' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, paymentId: paymentRecordId } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature === signature) {
      // Update payment status
      await Payment.findOneAndUpdate(
        { gatewayOrderId: orderId },
        {
          status: 'completed',
          gatewayPaymentId: paymentId,
          gatewaySignature: signature,
          paidAt: new Date()
        }
      );

      // Update ride payment status
      const payment = await Payment.findOne({ gatewayOrderId: orderId });
      if (payment) {
        await Ride.findByIdAndUpdate(payment.ride, {
          'payment.status': 'completed',
          'payment.transactionId': paymentId
        });
      }

      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid signature'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Cash payment confirmation
// @route   POST /api/payment/cash-confirm
const cashPaymentConfirm = async (req, res) => {
  try {
    const { rideId } = req.body;

    const ride = await Ride.findOne({
      rideId,
      rider: req.user.id
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    ride.payment.status = 'completed';
    await ride.save();

    // Create payment record for cash
    await Payment.create({
      paymentId: `CASH${Date.now()}`,
      ride: ride._id,
      rider: req.user.id,
      driver: ride.driver,
      amount: ride.totalFare,
      method: 'cash',
      gateway: 'manual',
      status: 'completed',
      paidAt: new Date()
    });

    res.json({
      success: true,
      message: 'Cash payment recorded'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get payment history
// @route   GET /api/payment/history
const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ rider: req.user.id })
      .populate('ride')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments({ rider: req.user.id });

    res.json({
      success: true,
      data: payments,
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

// @desc    Get wallet balance (mock)
// @route   GET /api/payment/wallet
const getWalletBalance = async (req, res) => {
  try {
    // In production, calculate from payment records
    res.json({
      success: true,
      data: {
        balance: 0,
        pending: 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Refund payment
// @route   POST /api/payment/refund
const refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    const payment = await Payment.findOne({
      paymentId,
      rider: req.user.id,
      status: 'completed'
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Initiate Razorpay refund
    const refund = await razorpay.refunds.create({
      payment_id: payment.gatewayPaymentId,
      amount: Math.round(amount * 100),
      notes: { reason }
    });

    payment.status = 'refunded';
    await payment.save();

    res.json({
      success: true,
      data: refund
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  cashPaymentConfirm,
  getPaymentHistory,
  getWalletBalance,
  refundPayment
};