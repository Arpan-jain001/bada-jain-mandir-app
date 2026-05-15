const router = require('express').Router();
const donation = require('../controllers/donationController');
const validate = require('../middleware/validate');
const { protect, optionalAuth, requireAdmin } = require('../middleware/auth');
const { createOrderRules, verifyPaymentRules } = require('../validators/donationValidators');

router.post('/create-order', optionalAuth, createOrderRules, validate, donation.createOrder);
router.post('/verify', optionalAuth, verifyPaymentRules, validate, donation.verifyPayment);
router.post('/verify-payment', optionalAuth, verifyPaymentRules, validate, donation.verifyPayment);
router.post('/verify-browser', verifyPaymentRules, validate, donation.verifyBrowserPayment);
router.get('/checkout/:id', donation.checkout);
router.get('/history', protect, donation.history);
router.get('/admin/history', protect, requireAdmin, donation.adminHistory);
router.get('/analytics', protect, requireAdmin, donation.analytics);
router.get('/receipt/:id', protect, donation.downloadReceipt);
router.get('/receipts/:id/download', protect, donation.downloadReceipt);
router.post('/receipts/:id/resend', protect, donation.resendReceipt);

module.exports = router;
