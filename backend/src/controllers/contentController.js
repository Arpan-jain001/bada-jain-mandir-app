const {
  Gallery,
  Project,
  RecentWork,
  CommitteeMember,
  Event,
  Banner,
  Announcement
} = require('../models/Content');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadImage } = require('../services/cloudinaryService');

function clean(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.__v;
  return obj;
}

function collection(Model, imageFolder, requiredImage = true) {
  return {
    list: asyncHandler(async (req, res) => {
      const items = await Model.find({ is_active: { $ne: false } }).sort(req.query.sort || '-created_at').limit(1000);
      res.json(items.map(clean));
    }),
    create: asyncHandler(async (req, res) => {
      const body = { ...req.body };
      const file = req.file || req.files?.[0];
      if (file?.buffer || body.image_data) {
        Object.assign(body, await uploadImage(file?.buffer || body.image_data, imageFolder));
        delete body.image_data;
      } else if (requiredImage) {
        throw new ApiError(400, 'Image is required');
      }
      const doc = await Model.create(body);
      res.status(201).json(clean(doc));
    }),
    update: asyncHandler(async (req, res) => {
      const doc = await Model.findOne({ id: req.params.id });
      if (!doc) throw new ApiError(404, 'Item not found');
      Object.assign(doc, req.body);
      const file = req.file || req.files?.[0];
      if (file?.buffer || req.body.image_data) {
        Object.assign(doc, await uploadImage(file?.buffer || req.body.image_data, imageFolder));
        doc.image_data = undefined;
      }
      await doc.save();
      res.json(clean(doc));
    }),
    remove: asyncHandler(async (req, res) => {
      const result = await Model.deleteOne({ id: req.params.id });
      if (!result.deletedCount) throw new ApiError(404, 'Item not found');
      res.json({ message: 'Item deleted successfully' });
    })
  };
}

exports.gallery = collection(Gallery, 'temple/gallery');
exports.projects = collection(Project, 'temple/projects');
exports.recentWork = collection(RecentWork, 'temple/recent-work');
exports.committee = collection(CommitteeMember, 'temple/committee');
exports.events = collection(Event, 'temple/events', false);
exports.banners = collection(Banner, 'temple/banners');
exports.announcements = collection(Announcement, 'temple/announcements', false);
