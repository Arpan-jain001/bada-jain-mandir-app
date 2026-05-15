const { body } = require('express-validator');

exports.createOrderRules = [
  body('amount').isFloat({ min: 1 }).withMessage('Donation amount must be at least 1'),
  body('donor_email').optional().isEmail().normalizeEmail(),
  body('donor_name').optional().trim()
];

exports.verifyPaymentRules = [
  body('razorpay_order_id').notEmpty(),
  body('razorpay_payment_id').notEmpty(),
  body('razorpay_signature').notEmpty()
];
