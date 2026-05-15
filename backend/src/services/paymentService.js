const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const env = require('../config/env');

async function createRazorpayOrder({ amount, receipt }) {
  return razorpay.orders.create({
    amount: Math.round(Number(amount) * 100),
    currency: env.razorpay.currency,
    receipt,
    payment_capture: 1
  });
}

function verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac('sha256', env.razorpay.keySecret).update(payload).digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(String(razorpay_signature || ''));
  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

async function fetchRazorpayPayment(paymentId) {
  return razorpay.payments.fetch(paymentId);
}

module.exports = { createRazorpayOrder, fetchRazorpayPayment, verifyPaymentSignature };
