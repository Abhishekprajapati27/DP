const nodemailer = require('nodemailer');

const cleanStr = (s) => String(s || '').replace(/^["']|["']$/g, '').trim();

const createTransporter = () => {
  const host = cleanStr(process.env.SMTP_HOST);
  const port = parseInt(cleanStr(process.env.SMTP_PORT) || '465', 10);
  const secure = cleanStr(process.env.SMTP_SECURE) === 'true' || port === 465;
  const user = cleanStr(process.env.SMTP_USER);
  // Google app passwords are 16 chars; strip spaces so both 'gkun lzod iopr hals' and 'gkunlzodioprhals' work
  const pass = cleanStr(process.env.SMTP_PASS).replace(/\s+/g, '');

  if (user && pass) {
    // If Gmail is used, service: 'gmail' is much more reliable on cloud hosting (Render/Heroku)
    if (!host || host.includes('gmail') || user.endsWith('@gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass
        },
        connectionTimeout: 12000,
        greetingTimeout: 12000,
        socketTimeout: 15000,
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
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 15000,
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
  // 1) If RESEND_API_KEY is configured, send via Resend HTTPS REST API (Port 443 - Never blocked on Render)
  const resendKey = cleanStr(process.env.RESEND_API_KEY);
  if (resendKey) {
    const fromAddress = cleanStr(process.env.RESEND_FROM) || 'DP Sofa Dry Cleaning <onboarding@resend.dev>';
    const recipientList = Array.isArray(to) ? to : [to];

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipientList,
        subject,
        text,
        html
      })
    });

    const resData = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(resData.message || 'Resend HTTP API failed to send email');
    }
    return resData;
  }

  // 2) Fallback to standard SMTP (works on local or hosts without SMTP port blocks)
  const transporter = createTransporter();
  const from = cleanStr(process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL);

  if (!from) {
    throw new Error('Sender email is not configured. Set SMTP_USER or RESEND_API_KEY in Render Environment Variables.');
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
