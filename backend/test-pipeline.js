require('dotenv').config();
const { sendEmail } = require('./utils/email');

async function run() {
  console.log('=== PIPELINE TEST ===');
  console.log('OWNER_EMAIL:', process.env.OWNER_EMAIL);
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS_SET:', !!process.env.SMTP_PASS);
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

  // Test booking data
  const booking = {
    name: 'Test Customer',
    phone: '+919876543210',
    email: 'test@example.com',
    serviceType: 'Sofa Cleaning',
    itemQuantity: 2,
    serviceOption: 'home',
    address: '123 Test Street, Mumbai',
    preferredDate: '2025-12-25',
    preferredTime: 'Morning (9 AM - 12 PM)',
    specialRequests: 'Please call before arriving'
  };

  const emailSubject = `🧺 New Dry Cleaning Booking from ${booking.name}`;
  const emailText = [
    `Name: ${booking.name}`,
    `Phone: ${booking.phone}`,
    `Email: ${booking.email}`,
    `Service: ${booking.serviceType}`,
    `Quantity: ${booking.itemQuantity}`,
    `Service Option: ${booking.serviceOption}`,
    `Address: ${booking.address}`,
    `Preferred Date: ${booking.preferredDate}`,
    `Preferred Time: ${booking.preferredTime}`,
    `Special Requests: ${booking.specialRequests}`
  ].join('\n');

  console.log('\n--- Sending owner notification email ---');
  console.log('To:', process.env.OWNER_EMAIL);
  try {
    const info = await sendEmail({
      to: process.env.OWNER_EMAIL,
      subject: emailSubject,
      text: emailText,
      html: `<p><strong>Name:</strong> ${booking.name}</p><p><strong>Phone:</strong> ${booking.phone}</p>`
    });
    console.log('SUCCESS! Email sent.');
    console.log('Message ID:', info.messageId || '(jsonTransport)');
    if (info.envelope) console.log('Envelope:', JSON.stringify(info.envelope));
    if (info.response) console.log('Response:', info.response);
    console.log('\n=== PIPELINE VERIFIED: booking details go to OWNER_EMAIL ===');
  } catch (err) {
    console.error('EMAIL FAILED:', err.message);
    console.log('\n=== PIPELINE CHECK: email delivery needs valid SMTP credentials ===');
  }
}

run();

