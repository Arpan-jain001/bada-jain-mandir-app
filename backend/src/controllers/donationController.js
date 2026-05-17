const Donation = require('../models/Donation');
const Receipt = require('../models/Receipt');
const Transaction = require('../models/Transaction');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { createRazorpayOrder, fetchRazorpayPayment, verifyPaymentSignature } = require('../services/paymentService');
const { createReceiptForDonation, emailReceipt, getReceiptPdf } = require('../services/receiptService');

exports.createOrder = asyncHandler(async (req, res) => {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new ApiError(500, 'Razorpay is not configured');
  }
  const donorName = req.body.donor_name || req.user?.name;
  const donorEmail = req.body.donor_email || req.user?.email;
  const amount = Number(req.body.amount);
  if (!amount || amount < 1) throw new ApiError(400, 'Donation amount must be at least 1');
  if (!donorName || !donorEmail) throw new ApiError(400, 'Donor name and email are required');

  const localReceipt = `donation_${Date.now()}`;
  const order = await createRazorpayOrder({ amount, receipt: localReceipt });
  const donation = await Donation.create({
    user: req.user?._id,
    donor_name: donorName,
    donor_email: donorEmail,
    donor_phone: req.body.donor_phone || req.user?.phone,
    amount,
    currency: env.razorpay.currency,
    razorpay_order_id: order.id,
    purpose: req.body.purpose || 'Temple Donation',
    metadata: req.body.metadata
  });

  await Transaction.create({
    donation: donation._id,
    provider_order_id: order.id,
    event: 'order.created',
    status: 'created',
    amount,
    currency: env.razorpay.currency,
    payload: order
  });

  res.status(201).json({
    key_id: env.razorpay.keyId,
    razorpayKey: env.razorpay.keyId,
    order_id: order.id,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    donation_id: donation.id,
    donor_name: donorName,
    donor_email: donorEmail,
    donor_phone: donation.donor_phone
  });
});

async function completeVerifiedPayment(paymentPayload) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentPayload;
  const donation = await Donation.findOne({ razorpay_order_id });
  if (!donation) throw new ApiError(404, 'Donation order not found');
  if (donation.status === 'paid') {
    const receipt = await Receipt.findOne({ donation: donation._id });
    return { message: 'Donation Successful', donation, receipt };
  }
  if (!verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature })) {
    donation.status = 'failed';
    donation.failure_reason = 'Invalid payment signature';
    await donation.save();
    throw new ApiError(400, 'Payment verification failed');
  }

  const duplicatePayment = await Donation.findOne({
    razorpay_payment_id,
    _id: { $ne: donation._id }
  });
  if (duplicatePayment) {
    throw new ApiError(409, 'Payment has already been used for another donation');
  }

  const payment = await fetchRazorpayPayment(razorpay_payment_id);
  const expectedAmount = Math.round(Number(donation.amount) * 100);
  if (payment.order_id !== donation.razorpay_order_id) {
    throw new ApiError(400, 'Payment order mismatch');
  }
  if (payment.amount !== expectedAmount || payment.currency !== donation.currency) {
    throw new ApiError(400, 'Payment amount verification failed');
  }
  if (!['captured', 'authorized'].includes(payment.status)) {
    throw new ApiError(400, `Payment is not successful: ${payment.status}`);
  }

  donation.razorpay_payment_id = razorpay_payment_id;
  donation.razorpay_signature = razorpay_signature;
  donation.status = 'paid';
  donation.paid_at = new Date();
  const now = new Date();

const datePart =
  now.getFullYear().toString() +
  String(now.getMonth() + 1).padStart(2, '0') +
  String(now.getDate()).padStart(2, '0');

const randomPart = Math.floor(1000 + Math.random() * 9000);

donation.receipt_number = `BJMP-${datePart}-${randomPart}`;
  await donation.save();

  await Transaction.create({
    donation: donation._id,
    provider_order_id: razorpay_order_id,
    provider_payment_id: razorpay_payment_id,
    event: 'payment.verified',
    status: 'paid',
    amount: donation.amount,
    currency: donation.currency,
    payload: paymentPayload
  });

  const receipt = await createReceiptForDonation(donation);
  emailReceipt(receipt).catch(async () => {
    receipt.email_status = 'failed';
    await receipt.save();
  });

  return { message: 'Donation Successful', donation, receipt };
}

exports.checkout = asyncHandler(async (req, res) => {
  const donation = await Donation.findOne({ id: req.params.id });
  if (!donation) throw new ApiError(404, 'Donation order not found');
  if (donation.status === 'paid') throw new ApiError(400, 'Donation is already paid');

  const returnUrl = req.query.return_url || 'frontend://donation-result';
  const safeReturnUrl = JSON.stringify(returnUrl);
  const options = {
    key: env.razorpay.keyId,
    amount: Math.round(Number(donation.amount) * 100),
    currency: donation.currency,
    name: 'Shri Digamber Bada Jain Mandir Parham',
    description: donation.purpose || 'Temple Donation',
    order_id: donation.razorpay_order_id,
    image: `${env.websiteUrl.replace(/\/$/, '')}/favicon.ico`,
    prefill: {
      name: donation.donor_name,
      email: donation.donor_email,
      contact: donation.donor_phone || ''
    },
    notes: { donation_id: donation.id },
    theme: { color: '#FF9933' }
  };

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Donation Payment</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
      body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif; background: #fff7ed; color: #222; }
      .box { text-align: center; max-width: 360px; padding: 28px; }
      .title { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
      .text { color: #666; line-height: 1.45; }
      .btn { margin-top: 22px; border: 0; border-radius: 10px; padding: 13px 18px; color: #fff; background: #FF9933; font-size: 16px; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="title">Secure Donation Payment</div>
      <div class="text">Razorpay is opening. Complete payment to generate your verified digital receipt.</div>
      <button class="btn" onclick="openCheckout()">Pay Now</button>
    </div>
    <script>
      var returnUrl = ${safeReturnUrl};
      function finish(params) {
        var sep = returnUrl.indexOf('?') === -1 ? '?' : '&';
        window.location.href = returnUrl + sep + new URLSearchParams(params).toString();
      }
      async function verify(payment) {
        try {
          var response = await fetch('/api/donations/verify-browser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payment)
          });
          var data = await response.json();
          if (!response.ok) throw new Error(data.detail || data.message || 'Payment verification failed');
          finish({ status: 'success', receipt_id: data.receipt && data.receipt.id ? data.receipt.id : '', payment_id: payment.razorpay_payment_id });
        } catch (error) {
          finish({ status: 'failed', reason: error.message || 'Payment verification failed' });
        }
      }
      var options = ${JSON.stringify(options)};
      options.handler = verify;
      options.modal = {
        ondismiss: function() {
          finish({ status: 'cancelled' });
        }
      };
      function openCheckout() {
        var checkout = new Razorpay(options);
        checkout.on('payment.failed', function(response) {
          finish({ status: 'failed', reason: response.error && response.error.description ? response.error.description : 'Payment failed' });
        });
        checkout.open();
      }
      window.onload = openCheckout;
    </script>
  </body>
</html>`);
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const result = await completeVerifiedPayment(req.body);
  res.json(result);
});

exports.verifyBrowserPayment = asyncHandler(async (req, res) => {
  const result = await completeVerifiedPayment(req.body);
  res.json(result);
});

exports.history = asyncHandler(async (req, res) => {
  const query = req.user.is_admin ? {} : { user: req.user._id };
  if (req.query.status) query.status = req.query.status;
  if (!req.user.is_admin && !req.query.status) query.status = 'paid';
  if (req.query.search) {
    query.$or = [
      { donor_name: new RegExp(req.query.search, 'i') },
      { donor_email: new RegExp(req.query.search, 'i') },
      { razorpay_payment_id: new RegExp(req.query.search, 'i') }
    ];
  }
  const donations = await Donation.find(query).populate('receipt').sort('-created_at').limit(200);
  res.json(donations);
});

exports.adminHistory = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.search) {
    query.$or = [
      { donor_name: new RegExp(req.query.search, 'i') },
      { donor_email: new RegExp(req.query.search, 'i') },
      { donor_phone: new RegExp(req.query.search, 'i') },
      { razorpay_payment_id: new RegExp(req.query.search, 'i') }
    ];
  }
  const donations = await Donation.find(query).populate('receipt').sort('-created_at').limit(500);
  res.json(donations);
});

exports.analytics = asyncHandler(async (req, res) => {
  const [summary] = await Donation.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalDonations: { $sum: 1 } } }
  ]);
  const recent = await Donation.find({ status: 'paid' }).sort('-created_at').limit(10);
  res.json({ totalAmount: summary?.totalAmount || 0, totalDonations: summary?.totalDonations || 0, recent });
});

exports.downloadReceipt = asyncHandler(async (req, res) => {
  const pdf = await getReceiptPdf(req.params.id, req.user);
  if (!pdf) throw new ApiError(404, 'Receipt not found');
  const receipt = await Receipt.findOne({ id: req.params.id });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${receipt?.receipt_number || req.params.id}.pdf"`);
  res.send(pdf);
});

exports.resendReceipt = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findOne({ id: req.params.id });
  if (!receipt) throw new ApiError(404, 'Receipt not found');
  if (!req.user.is_admin) {
    const donation = await Donation.findById(receipt.donation);
    if (!donation || String(donation.user) !== String(req.user._id)) throw new ApiError(404, 'Receipt not found');
  }
  await emailReceipt(receipt);
  res.json({ message: 'Receipt emailed successfully' });
});
