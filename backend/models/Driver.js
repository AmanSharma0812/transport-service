const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Vehicle details
  vehicle: {
    type: {
      type: String,
      enum: ['bike', 'auto', 'cab'],
      required: true
    },
    make: String,
    model: String,
    year: Number,
    color: String,
    registrationNumber: {
      type: String,
      required: true,
      uppercase: true
    },
    vehicleImage: String
  },

  // Documents
  documents: {
    drivingLicense: {
      number: String,
      frontImage: String,
      backImage: String,
      verified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date
    },
    rcBook: {
      number: String,
      image: String,
      verified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date
    },
    insurance: {
      number: String,
      image: String,
      verified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date
    },
    permit: {
      number: String,
      image: String,
      verified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date
    }
  },

  // Driver status
  isActive: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  currentRide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  },

  // Ratings
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRides: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },

  // Availability
  workingHours: {
    startTime: String,
    endTime: String
  },
  currentlyInCity: String,

  // Emergency info
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },

  // Bank details
  bankAccount: {
    accountNumber: String,
    ifsc: String,
    accountHolderName: String
  },

  rejectedAt: Date,
  rejectionReason: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for rides
driverSchema.virtual('rides', {
  ref: 'Ride',
  localField: '_id',
  foreignField: 'driver'
});

// Virtual for earnings
driverSchema.virtual('earnings', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'driver'
});

module.exports = mongoose.model('Driver', driverSchema);