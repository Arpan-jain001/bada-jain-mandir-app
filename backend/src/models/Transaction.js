const mongoose = require('mongoose');
const { publicId } = require('../utils/ids');

const transactionSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', index: true },
    provider: { type: String, default: 'razorpay', index: true },
    provider_order_id: { type: String, index: true },
    provider_payment_id: { type: String, index: true },
    event: { type: String, required: true, index: true },
    status: { type: String, required: true, index: true },
    amount: Number,
    currency: String,
    payload: mongoose.Schema.Types.Mixed
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Transaction', transactionSchema, 'transactions');
