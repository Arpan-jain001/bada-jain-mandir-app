const { Resend } = require('resend');
const env = require('../config/env');
const logger = require('../utils/logger');

let resendClient = null;

function getResendClient() {
  if (!resendClient && env.email.apiKey) {
    resendClient = new Resend(env.email.apiKey);
  }
  return resendClient;
}

async function sendMail({ to, subject, text, html, attachments }) {
  const client = getResendClient();
  
  if (!client) {
    logger.warn(`Resend API is not configured; skipped email to ${to}`);
    return { skipped: true };
  }

  try {
    // Build attachments array if provided
    const resendAttachments = [];
    if (attachments && Array.isArray(attachments)) {
      for (const attachment of attachments) {
        if (attachment.content) {
          // Convert Buffer to base64 if needed
          const content = Buffer.isBuffer(attachment.content) 
            ? attachment.content.toString('base64')
            : attachment.content;
          
          resendAttachments.push({
            filename: attachment.filename,
            content: content,
            contentType: attachment.contentType || 'application/octet-stream'
          });
        }
      }
    }

    // Send email via Resend API
    const response = await client.emails.send({
      from: env.email.from,
      to,
      subject,
      html: html || text, // Resend requires either html or plain text
      text: text || undefined,
      attachments: resendAttachments.length > 0 ? resendAttachments : undefined
    });

    // Log success
    logger.info(`Email sent successfully to ${to} via Resend (ID: ${response.id})`);

    return {
      id: response.id,
      from: env.email.from,
      to,
      subject,
      messageId: response.id
    };
  } catch (error) {
    logger.error(`Failed to send email to ${to} via Resend:`, {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    });
    throw error;
  }
}

module.exports = { sendMail };
