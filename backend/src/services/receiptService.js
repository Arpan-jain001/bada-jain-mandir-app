const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Receipt = require('../models/Receipt');
const Donation = require('../models/Donation');
const receiptNumber = require('../utils/receiptNumber');
const env = require('../config/env');
const { sendMail } = require('./mailService');

async function buildReceiptPdf(receipt) {
  const donation = await Donation.findById(receipt.donation).lean();
  const logoPath = path.resolve(__dirname, '../../../frontend/assets/images/icon.png');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const left = 48;
    const right = pageWidth - 48;
    const orange = '#FF9933';
    const green = '#138808';
    const dark = '#222222';
    const muted = '#666666';
    const light = '#FFF7ED';
    const issuedAt = new Date(receipt.issued_at);

    doc.rect(0, 0, pageWidth, 138).fill(orange);
    doc.rect(0, 118, pageWidth, 20).fill(green);

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, left, 28, { width: 72, height: 72 });
    }

    doc
      .fillColor('#FFFFFF')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('Shri Digamber Bada Jain Mandir', 132, 32, { width: right - 132, align: 'left' })
      .fontSize(16)
      .text('Parham', 132, 62)
      .fontSize(11)
      .font('Helvetica')
      .text(env.websiteUrl, 132, 86, { link: env.websiteUrl, underline: true });

    doc
      .roundedRect(left, 162, right - left, 96, 10)
      .fillAndStroke(light, '#F0D6B8');
    doc
      .fillColor(dark)
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Digital Donation Receipt', left + 20, 182)
      .fontSize(28)
      .fillColor(green)
      .text(`${receipt.currency} ${Number(receipt.amount).toLocaleString('en-IN')}`, left + 20, 208);
    doc
      .fillColor(muted)
      .font('Helvetica')
      .fontSize(10)
      .text('Payment verified via Razorpay', right - 220, 188, { width: 200, align: 'right' })
      .fillColor(dark)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('PAID', right - 96, 216, { width: 76, align: 'center' });

    const startY = 292;
    const rowGap = 30;
    const labelX = left;
    const valueX = 210;
    const rows = [
      ['Receipt Number', receipt.receipt_number],
      ['Donor Name', receipt.donor_name],
      ['Email', receipt.donor_email],
      ['Phone', donation?.donor_phone || 'N/A'],
      ['Purpose', donation?.purpose || 'Temple Donation'],
      ['Razorpay Payment ID', receipt.transaction_id],
      ['Razorpay Order ID', donation?.razorpay_order_id || 'N/A'],
      ['Date & Time', issuedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
      ['Website', env.websiteUrl]
    ];

    rows.forEach(([label, value], index) => {
      const y = startY + index * rowGap;
      doc
        .fillColor(muted)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(label, labelX, y, { width: 140 });
      doc
        .fillColor(dark)
        .font('Helvetica')
        .fontSize(11)
        .text(String(value), valueX, y, {
          width: right - valueX,
          link: label === 'Website' ? env.websiteUrl : undefined,
          underline: label === 'Website'
        });
      doc.moveTo(left, y + 20).lineTo(right, y + 20).strokeColor('#EEEEEE').stroke();
    });

    doc
      .roundedRect(left, 586, right - left, 86, 8)
      .fillAndStroke('#F8FFF8', '#CFE8CF');
    doc
      .fillColor(green)
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Thank you for your donation and support.', left + 20, 606, { width: right - left - 40, align: 'center' });
    doc
      .fillColor(muted)
      .font('Helvetica')
      .fontSize(10)
      .text('This is a digitally generated receipt after successful Razorpay payment verification.', left + 20, 632, {
        width: right - left - 40,
        align: 'center'
      });

    doc
      .fillColor('#888888')
      .fontSize(9)
      .text(`${env.appName} | ${env.websiteUrl}`, left, 760, { width: right - left, align: 'center', link: env.websiteUrl });

    doc.end();
  });
}

async function createReceiptForDonation(donation) {
  let receipt = await Receipt.findOne({ donation: donation._id });
  if (receipt) return receipt;

  receipt = await Receipt.create({
    donation: donation._id,
    receipt_number: receiptNumber(),
    donor_name: donation.donor_name,
    donor_email: donation.donor_email,
    amount: donation.amount,
    currency: donation.currency,
    transaction_id: donation.razorpay_payment_id,
    temple_name: env.appName,
    issued_at: new Date()
  });

  donation.receipt = receipt._id;
  await donation.save();
  return receipt;
}

async function emailReceipt(receipt) {
  const pdf = await buildReceiptPdf(receipt);
  await sendMail({
    to: receipt.donor_email,
    subject: `Donation Receipt - ${env.appName}`,
    text: `Donation Successful\n\nReceipt: ${receipt.receipt_number}\nAmount: ${receipt.currency} ${receipt.amount}\nTransaction ID: ${receipt.transaction_id}`,
    html: `<p><strong>Donation Successful</strong></p><p>Receipt: ${receipt.receipt_number}</p><p>Amount: ${receipt.currency} ${receipt.amount}</p><p>Transaction ID: ${receipt.transaction_id}</p>`,
    attachments: [{ filename: `${receipt.receipt_number}.pdf`, content: pdf }]
  });
  receipt.email_sent_at = new Date();
  receipt.email_status = 'sent';
  await receipt.save();
  return pdf;
}

async function getReceiptPdf(receiptId, user) {
  const receipt = await Receipt.findOne({ id: receiptId });
  if (!receipt) return null;
  if (!user.is_admin) {
    const donation = await Donation.findById(receipt.donation);
    if (!donation || String(donation.user) !== String(user._id)) return null;
  }
  return buildReceiptPdf(receipt);
}

module.exports = { buildReceiptPdf, createReceiptForDonation, emailReceipt, getReceiptPdf };
