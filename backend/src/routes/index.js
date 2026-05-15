const router = require('express').Router();
const authRoutes = require('./authRoutes');
const contentRoutes = require('./contentRoutes');
const donationRoutes = require('./donationRoutes');
const notificationRoutes = require('./notificationRoutes');
const appRoutes = require('./appRoutes');
const uploadRoutes = require('./uploadRoutes');
const liveDarshan = require('../controllers/liveDarshanController');
const { protect, requireAdmin } = require('../middleware/auth');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'Bada Jain Mandir Parham', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/', contentRoutes);
router.use('/donations', donationRoutes);
router.get('/admin/donations', protect, requireAdmin, require('../controllers/donationController').adminHistory);
router.use('/notifications', notificationRoutes);
router.use('/app', appRoutes);
router.use('/uploads', uploadRoutes);
router.get('/live-darshan', liveDarshan.getLiveDarshan);
router.put('/live-darshan', protect, requireAdmin, liveDarshan.updateLiveDarshan);

module.exports = router;
