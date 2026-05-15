const router = require('express').Router();
const { body } = require('express-validator');
const app = require('../controllers/appController');
const validate = require('../middleware/validate');
const { protect, requireAdmin } = require('../middleware/auth');

router.get('/version/check', app.checkVersion);
router.post('/version/check', app.checkVersion);
router.get('/force-update-config', app.forceUpdateConfig);
router.post('/versions', protect, requireAdmin, [body('version').notEmpty(), body('build_number').isNumeric()], validate, app.upsertVersion);
router.get('/settings', app.publicSettings);
router.put('/settings/:key', protect, requireAdmin, app.upsertSetting);

module.exports = router;
