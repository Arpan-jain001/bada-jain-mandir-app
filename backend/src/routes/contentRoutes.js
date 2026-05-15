const router = require('express').Router();
const upload = require('../middleware/upload');
const { protect, requireAdmin } = require('../middleware/auth');
const content = require('../controllers/contentController');

function crud(path, controller) {
  router.get(path, controller.list);
  router.post(path, protect, requireAdmin, upload.any(), controller.create);
  router.put(`${path}/:id`, protect, requireAdmin, upload.any(), controller.update);
  router.delete(`${path}/:id`, protect, requireAdmin, controller.remove);

  router.get(`/admin${path}`, protect, requireAdmin, controller.list);
  router.post(`/admin${path}`, protect, requireAdmin, upload.any(), controller.create);
  router.put(`/admin${path}/:id`, protect, requireAdmin, upload.any(), controller.update);
  router.delete(`/admin${path}/:id`, protect, requireAdmin, controller.remove);
}

crud('/gallery', content.gallery);
crud('/projects', content.projects);
crud('/recent-work', content.recentWork);
crud('/committee', content.committee);
crud('/events', content.events);
crud('/banners', content.banners);
crud('/announcements', content.announcements);

module.exports = router;
