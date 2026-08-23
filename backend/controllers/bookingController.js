const { sendEmail } = require('../utils/email');

// Escape HTML to prevent injection in emails
const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');

// Build the booking details HTML block (reused for owner + customer emails)
const buildBookingHtml = (b) => {
  const formattedDate = b.preferredDate
    ? new Date(b.preferredDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : b.preferredDate || 'N/A';

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;padding:20px;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
        <div style="background:#b8860b;padding:16px 24px;">
          <h2 style="margin:0;color:#ffffff;font-size:20px;">🧺 Dry Cleaning Booking</h2>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#555;width:140px;"><strong>Name</strong></td><td style="padding:8px 0;">${escapeHtml(b.name) || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#555;"><strong>Phone</strong></td><td style="padding:8px 0;">${escapeHtml(b.phone) || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#555;"><strong>Email</strong></td><td style="padding:8px 0;">${escapeHtml(b.email) || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#555;"><strong>Service</strong></td><td style="padding:8px 0;">${escapeHtml(b.serviceType) || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#555;"><strong>Quantity</strong></td><td style="padding:8px 0;">${escapeHtml(b.itemQuantity) || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#555;"><strong>Service Option</strong></td><td style="padding:8px 0;">${escapeHtml(b.serviceOption) || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#555;"><strong>Address</strong></td><td style="padding:8px 0;">${escapeHtml(b.address) || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#555;"><strong>Preferred Date</strong></td><td style="padding:8px 0;">${escapeHtml(formattedDate)}</td></tr>
            <tr><td style="padding:8px 0;color:#555;"><strong>Preferred Time</strong></td><td style="padding:8px 0;">${escapeHtml(b.preferredTime) || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;color:#555;vertical-align:top;"><strong>Special Requests</strong></td><td style="padding:8px 0;">${escapeHtml(b.specialRequests).replace(/\n/g, '<br>') || 'N/A'}</td></tr>
          </table>
        </div>
        <div style="background:#fafafa;padding:12px 24px;border-top:1px solid #e0e0e0;color:#888;font-size:12px;">
          Sent from the Dry Cleaning booking form.
        </div>
      </div>
    </div>`;
};

// Build plain-text booking details
const buildBookingText = (b) => {
  const formattedDate = b.preferredDate
    ? new Date(b.preferredDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : b.preferredDate || 'N/A';

  return [
    `Name: ${b.name || 'N/A'}`,
    `Phone: ${b.phone || 'N/A'}`,
    `Email: ${b.email || 'N/A'}`,
    `Service: ${b.serviceType || 'N/A'}`,
    `Quantity: ${b.itemQuantity || 'N/A'}`,
    `Service Option: ${b.serviceOption || 'N/A'}`,
    `Address: ${b.address || 'N/A'}`,
    `Preferred Date: ${formattedDate}`,
    `Preferred Time: ${b.preferredTime || 'N/A'}`,
    `Special Requests: ${b.specialRequests || 'N/A'}`
  ].join('\n');
};

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const { name, phone, email, serviceType, itemQuantity, serviceOption, address, preferredDate, preferredTime, specialRequests } = req.body;

    const booking = {
      name, phone, email, serviceType, itemQuantity, serviceOption,
      address, preferredDate, preferredTime, specialRequests
    };

    const ownerEmail = process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL;
    if (!ownerEmail) {
      return res.status(500).json({ message: 'Owner email is not configured. Set OWNER_EMAIL or ADMIN_EMAIL.' });
    }

    const emailSubject = `🧺 New Dry Cleaning Booking from ${name || email || 'customer'}`;
    const emailText = buildBookingText(booking);
    const emailHtml = buildBookingHtml(booking);

    // 1) Notify owner via email
    await sendEmail({
      to: ownerEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    // 2) Send confirmation copy to the customer (if an email was provided)
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: `Booking Confirmation - ${serviceType || 'Dry Cleaning'}`,
          text: `Thank you ${name || ''} for your booking!\n\n${emailText}\n\nWe will contact you shortly to confirm.`,
          html: `<p>Thank you <strong>${escapeHtml(name) || ''}</strong> for your booking!</p>${emailHtml}<p style="font-family:Arial,font-size:13px;color:#666;">We will contact you shortly to confirm your booking.</p>`
        });
      } catch (err) {
        // Customer copy is optional — don't fail the booking if it fails
        console.warn('Failed to send customer confirmation email:', err.message);
      }
    }

    res.status(201).json({
      message: 'Booking request sent successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DB removed: no booking storage
exports.getAllBookings = async (req, res) => {
  return res.status(410).json({ message: 'Booking storage is disabled. Booking requests are forwarded to owner only.' });
};


// Booking storage disabled
exports.getBookingById = async (req, res) => {
  return res.status(410).json({ message: 'Booking storage is disabled. Booking requests are forwarded to owner only.' });
};


// Booking storage disabled
exports.updateBooking = async (req, res) => {
  return res.status(410).json({ message: 'Booking storage is disabled. Booking requests are forwarded to owner only.' });
};


// Booking storage disabled
exports.deleteBooking = async (req, res) => {
  return res.status(410).json({ message: 'Booking storage is disabled. Booking requests are forwarded to owner only.' });
};


// Booking storage disabled
exports.updateBookingStatus = async (req, res) => {
  return res.status(410).json({ message: 'Booking storage is disabled. Booking requests are forwarded to owner only.' });
};

