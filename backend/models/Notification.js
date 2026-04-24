const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Notification type
  type: {
    type: String,
    enum: [
      'ride_request',
      'ride_accepted',
      'ride_started',
      'ride_completed',
      'ride_cancelled',
      'payment_due',
      'payment_success',
      'driver_online',
      'driver_offline',
      'promo_available',
      'sos_alert',
      'system',
      'admin'
    ],
    required: true
  },

  // Content
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  data: {
    rideId: String,
    driverId: String,
    deepLink: String,
    action: String,
    extra: mongoose.Schema.Types.Mixed
  },

  // Delivery status
  delivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,

  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  // Channels
  channels: [{
    type: String,
    enum: ['fcm', 'sms', 'email'],
    default: ['fcm']
  }],

  // Firebase message ID
  fcmMessageId: String,

  // Expiry
  expiryAt: Date,

  // Click action
  clickAction: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ delivered: 1, read: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);