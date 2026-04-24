const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },

  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },

  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },

  // Amount details
  amount: {
    type: Number,
    required: true
  },
  fareBreakdown: {
    baseFare: Number,
    distanceFare: Number,
    timeFare: Number,
    surgeAmount: Number,
    couponDiscount: Number,
    taxes: {
      type: Number,
      default: 0
    }
  },

  // Payment method
  method: {
    type: String,
    enum: ['cash', 'upi', 'wallet', 'card', 'razorpay'],
    required: true
  },
  gateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'manual'],
    default: 'manual'
  },

  // Gateway details
  gatewayPaymentId: String,
  gatewayOrderId: String,
  gatewaySignature: String,

  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },

  // Timestamps
  paidAt: Date,
  refundedAt: Date,

  // Commission
  commission: {
    type: Number,
    default: 0
  },
  commissionRate: {
    type: Number,
    default: 0.15
  },
  driverEarnings: {
    type: Number,
    default: 0
  },

  // Invoice
  invoiceGenerated: {
    type: Boolean,
    default: false
  },
  invoiceUrl: String,

  // Metadata
  metadata: {
    vehicleType: String,
    distance: Number,
    duration: Number,
    couponUsed: String,
    referralApplied: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ ride: 1 });
paymentSchema.index({ rider: 1 });
paymentSchema.index({ driver: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);