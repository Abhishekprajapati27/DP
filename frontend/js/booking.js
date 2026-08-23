document.addEventListener('DOMContentLoaded', () => {
  // GSAP animations
  if (typeof gsap !== 'undefined') {
    gsap.from('.hero h1', { opacity: 0, y: 80, duration: 1 });
    gsap.from('.hero p', { opacity: 0, y: 80, duration: 1.3 });
    gsap.from('form', { opacity: 0, y: 100, duration: 1.2 });
  }

  const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : window.location.origin;

  const form = document.getElementById('bookingForm');
  const successBox = document.getElementById('successBox');
  const errorBox = document.getElementById('errorBox');
  const errorMessage = document.getElementById('errorMessage');
  const submitBtn = form?.querySelector('button[type="submit"]');

  // --- Home Service Toggle ---
  const addressGroup = document.getElementById('addressGroup');
  const serviceOptionRadios = document.querySelectorAll('input[name="serviceOption"]');

  function toggleAddressField() {
    const selected = document.querySelector('input[name="serviceOption"]:checked');
    if (selected && selected.value === 'home') {
      addressGroup.style.display = 'block';
    } else {
      addressGroup.style.display = 'none';
    }
  }

  // Listen for radio changes
  serviceOptionRadios.forEach(radio => {
    radio.addEventListener('change', toggleAddressField);
  });

  // Set initial state
  toggleAddressField();

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide previous messages
    if (successBox) successBox.style.display = 'none';
    if (errorBox) errorBox.style.display = 'none';

    // Disable button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    const serviceOption = document.querySelector('input[name="serviceOption"]:checked')?.value || 'home';

    // Collect form data
    const payload = {
      name: document.getElementById('name')?.value.trim() || '',
      phone: document.getElementById('phone')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || '',
      serviceType: document.getElementById('serviceType')?.value || '',
      itemQuantity: parseInt(document.getElementById('itemQuantity')?.value) || 1,
      serviceOption: serviceOption,
      address: serviceOption === 'home' ? (document.getElementById('address')?.value.trim() || '') : '',
      preferredDate: document.getElementById('preferredDate')?.value || '',
      preferredTime: document.getElementById('preferredTime')?.value || '',
      specialRequests: document.getElementById('specialRequests')?.value.trim() || ''
    };

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Booking submission failed');
      }

      // Show success
      if (successBox) {
        successBox.style.display = 'block';
        if (typeof gsap !== 'undefined') {
          gsap.from(successBox, { opacity: 0, scale: 0.8, duration: 0.6 });
        }

        // Build "Chat with Owner" WhatsApp link with booking details pre-filled
        const chatLink = document.getElementById('chatOwnerLink');
        if (chatLink) {
          const bookingSummary = [
            `Hello! I just booked a service:`,
            ``,
            `👤 Name: ${payload.name || 'N/A'}`,
            `📞 Phone: ${payload.phone || 'N/A'}`,
            `🧺 Service: ${payload.serviceType || 'N/A'}`,
            `🔢 Quantity: ${payload.itemQuantity || 'N/A'}`,
            `📍 Option: ${payload.serviceOption || 'N/A'}`,
            payload.serviceOption === 'home' ? `🏠 Address: ${payload.address || 'N/A'}` : null,
            `📅 Date: ${payload.preferredDate || 'N/A'}`,
            `⏰ Time: ${payload.preferredTime || 'N/A'}`,
            `📝 Special Requests: ${payload.specialRequests || 'None'}`
          ].filter(Boolean).join('\n');

          chatLink.href = `https://wa.me/918168944458?text=${encodeURIComponent(bookingSummary)}`;
        }
      }

      form.reset();

      // Reset address field visibility
      toggleAddressField();

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });

    } catch (err) {
      // Show error
      if (errorBox) {
        errorBox.style.display = 'block';
        if (errorMessage) errorMessage.textContent = err.message || 'Something went wrong. Please try again.';
        if (typeof gsap !== 'undefined') {
          gsap.from(errorBox, { opacity: 0, scale: 0.8, duration: 0.6 });
        }
      }

    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Booking';
      }
    }
  });
});

