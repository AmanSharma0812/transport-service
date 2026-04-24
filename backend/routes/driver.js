const express = require('express');
const router = express.Router();
const {
  getDashboard,
  toggleStatus,
  getRideRequests,
  acceptRide,
  declineRide,
  markArriving,
  startRide,
  completeRide,
  getRideHistory,
  getEarnings,
  updateProfile,
  updateLocation,
  uploadDocument
} = require('../controllers/driverController');

// Dashboard
router.get('/dashboard', getDashboard);
router.put('/toggle-status', toggleStatus);
router.get('/ride-requests', getRideRequests);
router.post('/accept-ride/:rideId', acceptRide);
router.post('/decline-ride/:rideId', declineRide);
router.put('/arriving/:rideId', markArriving);
router.put('/start-ride/:rideId', startRide);
router.put('/complete-ride/:rideId', completeRide);
router.get('/rides', getRideHistory);
router.get('/earnings', getEarnings);
router.put('/profile', updateProfile);
router.put('/location', updateLocation);
router.post('/documents', uploadDocument);

module.exports = router;