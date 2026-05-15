const { body } = require('express-validator');

exports.signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional({ nullable: true }).trim(),
  body('accepted_privacy_policy').isBoolean().custom((value) => value === true).withMessage('Privacy Policy acceptance is required')
];

exports.loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.passwordResetRequestRules = [body('email').isEmail().normalizeEmail()];
exports.passwordResetRules = [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];
