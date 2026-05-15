const router = require('express').Router();
const upload = require('../middleware/upload');
const { protect, requireAdmin } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

router.post('/image', protect, requireAdmin, upload.any(), uploadController.uploadImage);

module.exports = router;
