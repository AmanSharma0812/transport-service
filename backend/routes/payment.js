const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Payment routes
router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/cash-confirm', paymentController.cashPaymentConfirm);
router.get('/history', paymentController.getPaymentHistory);
router.get('/wallet', paymentController.getWalletBalance);
router.post('/refund', paymentController.refundPayment);

module.exports = router;