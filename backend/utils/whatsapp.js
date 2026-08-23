const twilio = require('twilio');

const sendWhatsApp = async ({ to, body }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  if (!accountSid || !authToken) {
    // In development without Twilio config, log to console
    if (process.env.NODE_ENV !== 'production') {
      console.log('=== WhatsApp Notification (simulated) ===');
      console.log(`To: ${to}`);
      console.log(`Body:\n${body}`);
      console.log('=========================================');
      return { simulated: true, message: 'WhatsApp simulated (no Twilio config)' };
    }

    throw new Error('Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN.');
  }

  const client = twilio(accountSid, authToken);

  const message = await client.messages.create({
    from,
    to,
    body
  });

  return message;
};

module.exports = { sendWhatsApp };

