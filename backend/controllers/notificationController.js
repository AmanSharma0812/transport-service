const Notification = require('../models/Notification');
const User = require('../models/User');

let messaging = null;
let firebaseInitialized = false;

// Initialize Firebase only if credentials exist
const initFirebase = () => {
  if (firebaseInitialized) return;

  try {
    const admin = require('firebase-admin');
    
    if (!process.env.FIRBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.log('⚠️ Firebase credentials not set - push notifications disabled');
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });

    messaging = admin.messaging();
    firebaseInitialized = true;
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
  }
};

// @desc    Send notification to user
// @route   POST /api/notifications/send
const sendNotification = async (req, res) => {
  try {
    // Initialize Firebase if needed
    initFirebase();

    const { userId, title, body, data } = req.body;

    const notification = await Notification.create({
      user: userId,
      type: data?.type || 'system',
      title,
      body,
      data
    });

    // Get user's FCM token
    const user = await User.findById(userId);
    if (user && user.fcmToken) {
      const message = {
        token: user.fcmToken,
        notification: { title, body },
        data: data || {}
      };

      try {
        const response = await messaging.send(message);
        notification.fcmMessageId = response;
        notification.delivered = true;
        notification.deliveredAt = new Date();
        await notification.save();

        res.json({
          success: true,
          data: { notificationId: notification._id, fcmMessageId: response }
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to send notification' });
      }
    } else {
      res.json({
        success: true,
        message: 'Notification saved but user has no FCM token',
        data: notification
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        read: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Set user FCM token
// @route   POST /api/notifications/token
const setFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    await User.findByIdAndUpdate(req.user.id, { fcmToken });

    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  setFCMToken
};