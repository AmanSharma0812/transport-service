const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },

  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Review details
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Categories (optional detailed ratings)
  categories: {
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    behavior: {
      type: Number,
      min: 1,
      max: 5
    },
    vehicleCondition: {
      type: Number,
      min: 1,
      max: 5
    },
    navigationSkill: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Status
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ ride: 1 }, { unique: true });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ rating: 1 });

module.exports = mongoose.model('Review', reviewSchema);