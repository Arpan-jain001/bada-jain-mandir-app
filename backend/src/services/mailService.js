const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

function getTransport() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass }
  });
}

async function sendMail({ to, subject, text, html, attachments }) {
  const transport = getTransport();
  if (!transport) {
    logger.warn(`SMTP is not configured; skipped email to ${to}`);
    return { skipped: true };
  }

  return transport.sendMail({
    from: env.smtp.from || env.smtp.user,
    to,
    subject,
    text,
    html,
    attachments
  });
}

module.exports = { sendMail };
