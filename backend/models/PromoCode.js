const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  type: {
    type: String,
    enum: ['percentage', 'fixed', 'referral'],
    required: true
  },

  discount: {
    type: Number,
    required: true
  }, // percentage or fixed amount

  minimumAmount: {
    type: Number,
    default: 0
  },

  maximumDiscount: {
    type: Number
  },

  // Usage limits
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },

  perUserLimit: {
    type: Number,
    default: 1
  },

  // Applicability
  vehicleTypes: [{
    type: String,
    enum: ['bike', 'auto', 'cab']
  }],

  validFrom: {
    type: Date,
    required: true
  },

  validUntil: {
    type: Date,
    required: true
  },

  // Referral specific
  isReferral: {
    type: Boolean,
    default: false
  },
  referrerReward: {
    type: Number,
    default: 0
  },
  refereeReward: {
    type: Number,
    default: 0
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Created by admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
promoSchema.index({ code: 1 });
promoSchema.index({ isActive: 1, validUntil: 1 });

// Virtual to check validity
promoSchema.virtual('isValid').get(function() {
  return this.isActive &&
         this.usedCount < this.usageLimit &&
         new Date() >= this.validFrom &&
         new Date() <= this.validUntil;
});

module.exports = mongoose.model('PromoCode', promoSchema);