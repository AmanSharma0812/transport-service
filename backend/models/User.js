const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  // Basic info
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^\+[1-9]\d{1,14}$/, 'Please provide a valid phone number with country code']
  },
  password: {
    type: String,
    required: function() { return !this.firebaseUid; },
    minlength: 6
  },
  profileImage: {
    type: String,
    default: ''
  },

  // Role & status
  role: {
    type: String,
    enum: ['rider', 'driver', 'admin'],
    required: true,
    default: 'rider'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },

  // Firebase for OTP
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },

  // Rider specific
  riderProfile: {
    homeAddress: String,
    workAddress: String,
    preferredVehicleType: {
      type: String,
      enum: ['bike', 'auto', 'cab'],
      default: 'bike'
    }
  },

  // Location tracking
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },

  // Settings
  notificationEnabled: {
    type: Boolean,
    default: true
  },
  sosEnabled: {
    type: Boolean,
    default: true
  },

  // Stats
  totalRides: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },

  // Timestamps
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
userSchema.index({ currentLocation: '2dsphere' });

// Virtual for driver profile
userSchema.virtual('driverProfile', {
  ref: 'Driver',
  localField: '_id',
  foreignField: 'user'
});

module.exports = mongoose.model('User', userSchema);