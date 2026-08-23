document.addEventListener('DOMContentLoaded', () => {
  // Entrance GSAP animations
  if (typeof gsap !== 'undefined') {
    gsap.from('.navbar', { y: -50, duration: 0.8, opacity: 0 });
    gsap.from('.hero h1', { opacity: 0, y: 50, duration: 0.9 });
    gsap.from('.hero p', { opacity: 0, y: 50, duration: 1.1 });
    gsap.from('.contact-info', { opacity: 0, x: -30, duration: 0.8, delay: 0.2 });
    gsap.from('.contact-form', { opacity: 0, x: 30, duration: 0.8, delay: 0.2 });
  }

  const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : window.location.origin;

  const form = document.getElementById('contactForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const submitBtn = document.getElementById('submitBtn');
  const whatsappQuickBtn = document.getElementById('whatsappQuickBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide previous messages
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';

    // Collect values
    const name = document.getElementById('name')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';

    if (!name || !phone || !message) {
      if (errorMessage && errorText) {
        errorText.textContent = 'Please fill in all required fields (Name, Phone, and Message).';
        errorMessage.style.display = 'block';
      }
      return;
    }

    // Disable button & show spinner / loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.origText = submitBtn.textContent;
      submitBtn.textContent = 'Sending Message...';
    }

    const payload = {
      name,
      phone,
      email,
      message,
      subject: 'Website Contact Form Inquiry'
    };

    try {
      const res = await fetch(`${API_BASE}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message. Please try again.');
      }

      // Pre-fill WhatsApp button link with message details for instant follow-up
      if (whatsappQuickBtn) {
        const waText = `Hello DP Sofa Dry Cleaning, I sent a contact inquiry:\nName: ${name}\nPhone: ${phone}${email ? `\nEmail: ${email}` : ''}\nMessage: ${message}`;
        whatsappQuickBtn.href = `https://wa.me/918437472264?text=${encodeURIComponent(waText)}`;
      }

      // Show success message
      if (successMessage) {
        successMessage.style.display = 'block';
        if (typeof gsap !== 'undefined') {
          gsap.from(successMessage, { opacity: 0, y: 15, scale: 0.95, duration: 0.5 });
        }
      }

      // Reset form
      form.reset();

    } catch (err) {
      console.error('Contact form submission error:', err);
      if (errorMessage) {
        if (errorText) {
          errorText.textContent = err.message || 'Network error occurred. Please try again or reach out on WhatsApp.';
        }
        errorMessage.style.display = 'block';
        if (typeof gsap !== 'undefined') {
          gsap.from(errorMessage, { opacity: 0, y: 15, duration: 0.5 });
        }
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.origText || 'Send Message';
      }
    }
  });
});
