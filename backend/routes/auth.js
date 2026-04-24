const express = require('express');
const router = express.Router();
const {
  registerRider,
  registerDriver,
  login,
  verifyOTP,
  resendOTP,
  getProfile,
  updateProfile,
  updateLocation
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register/rider', registerRider);
router.post('/register/driver', registerDriver);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/me', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/location', authenticate, updateLocation);

module.exports = router;