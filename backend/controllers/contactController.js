const { sendEmail } = require('../utils/email');

// Escape HTML to prevent injection in emails
const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');

// Build HTML email block for contact inquiry
const buildContactHtml = (c) => {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;padding:20px;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
        <div style="background:#2563eb;padding:16px 24px;">
          <h2 style="margin:0;color:#ffffff;font-size:20px;">💬 New Contact Inquiry</h2>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#555;width:120px;"><strong>Name</strong></td><td style="padding:8px 0;">${escapeHtml(c.name) || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#555;"><strong>Phone</strong></td><td style="padding:8px 0;">${escapeHtml(c.phone) || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#555;"><strong>Email</strong></td><td style="padding:8px 0;">${escapeHtml(c.email) || 'N/A'}</td></tr>
            ${c.subject ? `<tr><td style="padding:8px 0;color:#555;"><strong>Subject</strong></td><td style="padding:8px 0;">${escapeHtml(c.subject)}</td></tr>` : ''}
            <tr><td style="padding:8px 0;color:#555;vertical-align:top;"><strong>Message</strong></td><td style="padding:8px 0;">${escapeHtml(c.message).replace(/\n/g, '<br>') || 'N/A'}</td></tr>
          </table>
        </div>
        <div style="background:#fafafa;padding:12px 24px;border-top:1px solid #e0e0e0;color:#888;font-size:12px;">
          Sent from DP Sofa Dry Cleaning contact form.
        </div>
      </div>
    </div>`;
};

// Create new contact message
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name && !email && !phone && !message) {
      return res.status(400).json({ message: 'Please provide your details and message.' });
    }

    const ownerEmail = process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL;
    if (!ownerEmail) {
      return res.status(500).json({ message: 'Owner email is not configured. Set OWNER_EMAIL or ADMIN_EMAIL.' });
    }

    const emailSubject = `💬 New Contact Message from ${name || email || 'Website Visitor'}`;
    const emailBody = `Name: ${name || 'N/A'}\nEmail: ${email || 'N/A'}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'Contact Inquiry'}\n\nMessage:\n${message || 'N/A'}`;
    const emailHtml = buildContactHtml({ name, email, phone, subject, message });

    // 1) Send email to owner
    await sendEmail({
      to: ownerEmail,
      subject: emailSubject,
      text: emailBody,
      html: emailHtml
    });

    // 2) Send confirmation to customer if email is provided
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: 'We received your message - DP Sofa Dry Cleaning',
          text: `Hello ${name || ''},\n\nThank you for getting in touch with DP Sofa Dry Cleaning! We have received your message and our team will get back to you shortly.\n\nYour message:\n${message || ''}\n\nWarm regards,\nDP Sofa Dry Cleaning Team`,
          html: `<p>Hello <strong>${escapeHtml(name) || ''}</strong>,</p><p>Thank you for getting in touch with <strong>DP Sofa Dry Cleaning</strong>! We have received your message and our team will contact you shortly.</p>${emailHtml}<p style="font-family:Arial,sans-serif;font-size:12px;color:#666;">DP Sofa Dry Cleaning Team</p>`
        });
      } catch (custErr) {
        console.warn('Failed to send contact confirmation email to customer:', custErr.message);
      }
    }

    res.status(201).json({
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ message: error.message || 'Failed to send message' });
  }
};

// Contact storage disabled
exports.getAllContacts = async (req, res) => {
  return res.status(410).json({ message: 'Contact storage is disabled. Messages are forwarded to owner only.' });
};


// Contact storage disabled
exports.getContactById = async (req, res) => {
  return res.status(410).json({ message: 'Contact storage is disabled. Messages are forwarded to owner only.' });
};


// Contact storage disabled
exports.updateContact = async (req, res) => {
  return res.status(410).json({ message: 'Contact storage is disabled. Messages are forwarded to owner only.' });
};


// Contact storage disabled
exports.deleteContact = async (req, res) => {
  return res.status(410).json({ message: 'Contact storage is disabled. Messages are forwarded to owner only.' });
};


// Contact storage disabled
exports.markAsRead = async (req, res) => {
  return res.status(410).json({ message: 'Contact storage is disabled. Messages are forwarded to owner only.' });
};
