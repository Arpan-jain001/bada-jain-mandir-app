const mongoose = require('mongoose');
const { publicId } = require('../utils/ids');

const receiptSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true, unique: true },
    receipt_number: { type: String, required: true, unique: true, index: true },
    donor_name: { type: String, required: true },
    donor_email: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    transaction_id: { type: String, required: true },
    temple_name: { type: String, default: 'Bada Jain Mandir Parham' },
    issued_at: { type: Date, default: Date.now },
    pdf_url: String,
    email_sent_at: Date,
    email_status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Receipt', receiptSchema);
