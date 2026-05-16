const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, requireAdmin } = require('../middleware/auth');
const notification = require('../controllers/notificationController');
const preferences = require('../controllers/preferencesController');

// Notification preferences routes (user)
router.get('/preferences', protect, preferences.getNotificationPreferences);
router.put('/preferences', protect, [
  body('pushEnabled').optional().isBoolean(),
  body('promotionalEnabled').optional().isBoolean(),
  body('updateEnabled').optional().isBoolean(),
  body('announcementsEnabled').optional().isBoolean(),
  body('eventEnabled').optional().isBoolean(),
  body('chatEnabled').optional().isBoolean(),
  body('emailEnabled').optional().isBoolean(),
  body('deliveryMode').optional().isIn(['push', 'email', 'both']),
  body('quietMode').optional().isBoolean()
], validate, preferences.updateNotificationPreferences);
router.post('/preferences/reset', protect, preferences.resetNotificationPreferences);

// Admin notification routes
router.get('/', protect, notification.listNotifications);
router.post(
  '/send',
  protect,
  requireAdmin,
  [body('title').trim().notEmpty(), body('message').trim().notEmpty()],
  validate,
  notification.sendNotification
);
router.post(
  '/broadcast',
  protect,
  requireAdmin,
  [body('title').trim().notEmpty(), body('message').trim().notEmpty()],
  validate,
  notification.sendBroadcast
);

module.exports = router;
