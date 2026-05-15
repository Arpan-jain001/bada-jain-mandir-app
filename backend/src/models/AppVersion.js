const mongoose = require('mongoose');
const { publicId } = require('../utils/ids');

const appVersionSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    platform: { type: String, enum: ['android', 'ios'], default: 'android', index: true },
    version: { type: String, required: true },
    build_number: { type: Number, required: true },
    force_update: { type: Boolean, default: false },
    update_message: { type: String, default: 'A new version is available.' },
    changelog: [{ type: String }],
    store_url: String,
    indus_store_url: String,
    is_active: { type: Boolean, default: true, index: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

appVersionSchema.index({ platform: 1, build_number: -1 });

module.exports = mongoose.model('AppVersion', appVersionSchema, 'app_versions');
