const nodemailer = require('nodemailer');

const cleanStr = (s) => String(s || '').replace(/^["']|["']$/g, '').trim();

const createTransporter = () => {
  const host = cleanStr(process.env.SMTP_HOST);
  const port = parseInt(cleanStr(process.env.SMTP_PORT) || '465', 10);
  const secure = cleanStr(process.env.SMTP_SECURE) === 'true' || port === 465;
  const user = cleanStr(process.env.SMTP_USER);
  const pass = cleanStr(process.env.SMTP_PASS);

  if (user && pass) {
    // If Gmail is used, service: 'gmail' is much more reliable on cloud hosting (Render/Heroku)
    if (!host || host.includes('gmail') || user.endsWith('@gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  throw new Error('SMTP configuration is missing on Render. Please set SMTP_USER and SMTP_PASS in the Render Environment tab.');
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  const from = cleanStr(process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL);

  if (!from) {
    throw new Error('Sender email is not configured. Set SMTP_USER or EMAIL_FROM in Render Environment Variables.');
  }

  const info = await transporter.sendMail({
    from: `"DP Sofa Dry Cleaning" <${from}>`,
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
