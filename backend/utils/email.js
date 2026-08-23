const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  throw new Error('SMTP configuration is required to send email. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL;

  if (!from) {
    throw new Error('Sender email is not configured. Set EMAIL_FROM, SMTP_USER, ADMIN_EMAIL, or OWNER_EMAIL.');
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  return info;
};

module.exports = {
  sendEmail
};
