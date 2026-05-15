const mongoose = require('mongoose');
const { publicId } = require('../utils/ids');

const donationSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    donor_name: { type: String, required: true, trim: true },
    donor_email: { type: String, required: true, lowercase: true, trim: true, index: true },
    donor_phone: { type: String, trim: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    razorpay_order_id: { type: String, required: true, unique: true, index: true },
    razorpay_payment_id: { type: String, sparse: true, unique: true, index: true },
    razorpay_signature: String,
    status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created', index: true },
    purpose: { type: String, default: 'Temple Donation' },
    receipt: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt' },
    paid_at: Date,
    failure_reason: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

donationSchema.index({ donor_email: 1, created_at: -1 });
donationSchema.index({ user: 1, created_at: -1 });

module.exports = mongoose.model('Donation', donationSchema);
