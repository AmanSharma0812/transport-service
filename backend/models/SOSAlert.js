const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },

  // Location
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
  },

  // Alert details
  triggerMethod: {
    type: String,
    enum: ['sos_button', 'voice', 'panic', 'intelligent'],
    default: 'sos_button'
  },

  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'false_alarm'],
    default: 'active'
  },

  // Response
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin or support
  },
  acknowledgedAt: Date,
  resolvedAt: Date,

  // Actions taken
  actions: [{
    action: String,
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],

  // Emergency contacts notification
  contactsNotified: [{
    contactName: String,
    phone: String,
    notifiedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'delivered', 'read']
    }
  }],

  // Metadata
  metadata: {
    reason: String,
    riderMood: String,
    voiceNoteUrl: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
sosAlertSchema.index({ ride: 1 });
sosAlertSchema.index({ user: 1 });
sosAlertSchema.index({ status: 1, createdAt: -1 });
sosAlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);