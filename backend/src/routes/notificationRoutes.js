const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, requireAdmin } = require('../middleware/auth');
const notification = require('../controllers/notificationController');

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
