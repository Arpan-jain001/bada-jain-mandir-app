const mongoose = require('mongoose');
const { publicId } = require('../utils/ids');

const settingSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    public: { type: Boolean, default: false, index: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Setting', settingSchema, 'settings');
