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
const { sendPushToUsers } = require('../services/notificationService');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

function clean(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.__v;
  return obj;
}

const notificationConfig = {
  gallery: {
    title: 'New Gallery Photo',
    message: (doc) => doc.title || 'A new gallery photo has been added.',
    category: 'announcements'
  },
  projects: {
    title: (doc) => doc.title || 'New Project Update',
    message: (doc) => doc.description || 'A new project update has been added.',
    category: 'announcements'
  },
  recentWork: {
    title: (doc) => doc.title || 'New Recent Work',
    message: (doc) => doc.description || 'A new recent work update has been added.',
    category: 'announcements'
  },
  events: {
    title: (doc) => doc.title || 'New Event',
    message: (doc) => doc.description || 'A new temple event has been added.',
    category: 'festivals/events'
  },
  announcements: {
    title: (doc) => doc.title || 'New Announcement',
    message: (doc) => doc.message || 'A new temple announcement has been posted.',
    category: (doc) => doc.category || 'announcements'
  }
};

const resolveValue = (value, doc) => (typeof value === 'function' ? value(doc) : value);
const shouldNotify = (value) => ![false, 'false', '0', 0].includes(value);

async function notifyContentCreate(collectionName, doc, req) {
  const config = notificationConfig[collectionName];
  if (!config || !shouldNotify(req.body.notify)) return;

  const payload = {
    title: resolveValue(config.title, doc),
    message: resolveValue(config.message, doc),
    category: resolveValue(config.category, doc)
  };

  try {
    const results = await sendPushToUsers(payload);
    await Notification.create({
      ...payload,
      channels: { push: true },
      results,
      sent_by: req.user?._id,
      sent_at: new Date()
    });
  } catch (error) {
    logger.warn('Content notification failed', {
      collection: collectionName,
      itemId: doc.id,
      error: error.message
    });
  }
}

function collection(Model, imageFolder, requiredImage = true, collectionName = '') {
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
      await notifyContentCreate(collectionName, doc, req);
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

exports.gallery = collection(Gallery, 'temple/gallery', true, 'gallery');
exports.projects = collection(Project, 'temple/projects', true, 'projects');
exports.recentWork = collection(RecentWork, 'temple/recent-work', true, 'recentWork');
exports.committee = collection(CommitteeMember, 'temple/committee', true, 'committee');
exports.events = collection(Event, 'temple/events', false, 'events');
exports.banners = collection(Banner, 'temple/banners', true, 'banners');
exports.announcements = collection(Announcement, 'temple/announcements', false, 'announcements');
