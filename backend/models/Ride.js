const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  // Primary identifiers
  rideId: {
    type: String,
    required: true,
    unique: true
  },

  // Participants
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },

  // Ride details
  vehicleType: {
    type: String,
    enum: ['bike', 'auto', 'cab'],
    required: true
  },
  packageType: {
    type: String,
    enum: ['regular', 'package'],
    default: 'regular'
  },

  // Locations
  pickup: {
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  dropoff: {
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },

  // Distance & time
  distance: {
    type: Number,
    min: 0
  }, // in km
  duration: {
    type: Number,
    min: 0
  }, // in minutes

  // Pricing
  baseFare: {
    type: Number,
    default: 0
  },
  distanceFare: {
    type: Number,
    default: 0
  },
  timeFare: {
    type: Number,
    default: 0
  },
  surgeMultiplier: {
    type: Number,
    default: 1
  },
  surgeAmount: {
    type: Number,
    default: 0
  },
  couponDiscount: {
    type: Number,
    default: 0
  },
  totalFare: {
    type: Number,
    required: true
  },
  estimatedFare: {
    type: Number
  },

  // Status
  status: {
    type: String,
    enum: [
      'requested',
      'searching',
      'accepted',
      'arriving',
      'ongoing',
      'completed',
      'cancelled',
      'failed'
    ],
    default: 'requested'
  },
  cancellationReason: {
    cancelledBy: {
      type: String,
      enum: ['rider', 'driver', 'system']
    },
    reason: String
  },

  // Payment
  payment: {
    method: {
      type: String,
      enum: ['cash', 'upi', 'wallet', 'card'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    razorpayId: String,
    paidAt: Date
  },

  // Ratings & reviews
  rating: {
    givenBy: {
      type: String,
      enum: ['rider', 'driver']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: Date
  },

  // Tracking
  route: [{
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  startedAt: Date,
  completedAt: Date,

  // Safety
  sosTriggered: {
    type: Boolean,
    default: false
  },
  sosTime: Date,

  // Invoice
  invoiceGenerated: {
    type: Boolean,
    default: false
  },
  invoiceUrl: String,

  // Coupon
  couponUsed: {
    code: String,
    discount: Number
  },

  // Referral
  referralApplied: {
    riderId: String,
    bonus: Number
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for queries
rideSchema.index({ rider: 1, createdAt: -1 });
rideSchema.index({ driver: 1, createdAt: -1 });
rideSchema.index({ status: 1 });
rideSchema.index({ 'pickup.location': '2dsphere' });
rideSchema.index({ 'dropoff.location': '2dsphere' });
rideSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ride', rideSchema);