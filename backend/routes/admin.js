const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  toggleUserBlock,
  getDrivers,
  approveDriver,
  getAllRides,
  updatePricing,
  updateCommission,
  createPromoCode,
  getPromoCodes,
  togglePromoCode,
  getSOSAlerts,
  resolveSOSAlert,
  getEarningsReport,
  createRider,
  createRide
} = require('../controllers/adminController');

// Dashboard
router.get('/dashboard', getDashboard);

// Users management
router.get('/users', getUsers);
router.put('/users/:userId/block', toggleUserBlock);
router.post('/users/rider', createRider);

// Drivers management
router.get('/drivers', getDrivers);
router.put('/drivers/:driverId/approval', approveDriver);

// Rides management
router.get('/rides', getAllRides);
router.post('/rides', createRide);

// Pricing & Commission
router.put('/pricing', updatePricing);
router.put('/commission', updateCommission);

// Promo codes
router.post('/promo-codes', createPromoCode);
router.get('/promo-codes', getPromoCodes);
router.put('/promo-codes/:id/toggle', togglePromoCode);

// SOS Alerts
router.get('/sos-alerts', getSOSAlerts);
router.put('/sos-alerts/:id/resolve', resolveSOSAlert);

// Earnings report
router.get('/earnings/report', getEarningsReport);

module.exports = router;