const router = require('express').Router();
const auth = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  signupRules,
  loginRules,
  passwordResetRequestRules,
  passwordResetRules
} = require('../validators/authValidators');

router.post('/signup', signupRules, validate, auth.signup);
router.post('/register', signupRules, validate, auth.signup);
router.post('/login', loginRules, validate, auth.login);
router.get('/me', protect, auth.me);
router.put('/profile', protect, auth.updateProfile);
router.put('/preferences', protect, auth.updatePreferences);
router.post('/device-token', protect, auth.registerFcmToken);
router.delete('/device-token', protect, auth.removeFcmToken);
router.post('/forgot-password', passwordResetRequestRules, validate, auth.forgotPassword);
router.post('/resend-reset-otp', passwordResetRequestRules, validate, auth.resendPasswordResetOtp);
router.post('/reset-password', passwordResetRules, validate, auth.resetPassword);

module.exports = router;
