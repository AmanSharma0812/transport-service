const express = require('express');
const router = express.Router();
const {
  getFareEstimate,
  bookRide,
  cancelRide,
  rateRide,
  getRideHistory,
  getRideDetails,
  generateInvoice,
  addEmergencyContact,
  triggerSOS
} = require('../controllers/riderController');

// Fare estimation (no auth required for estimate)
router.get('/estimate-fare', getFareEstimate);

// Book a ride
router.post('/book-ride', bookRide);

// Cancel ride
router.post('/cancel-ride/:rideId', cancelRide);

// Rate completed ride
router.post('/rate-ride/:rideId', rateRide);

// Get ride history
router.get('/rides', getRideHistory);

// Get single ride details
router.get('/rides/:rideId', getRideDetails);

// Generate invoice
router.get('/rides/:rideId/invoice', generateInvoice);

// Add emergency contact
router.post('/emergency-contact', addEmergencyContact);

// SOS emergency
router.post('/sos', triggerSOS);

module.exports = router;