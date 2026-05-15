const multer = require('multer');

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 15 * 1024 * 1024, fileSize: 10 * 1024 * 1024 }
});
