document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminEmailInput = document.getElementById('adminEmail');
    const adminPasswordInput = document.getElementById('adminPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginMessage = document.getElementById('loginMessage');

    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetEmailInput = document.getElementById('resetEmail');
    const forgotMessage = document.getElementById('forgotMessage');

    // API Base URL — localhost:5000 in dev, same origin in production
    const API_ORIGIN = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : window.location.origin;
    const API_URL = `${API_ORIGIN}/api/admin`;

    // Toggle password visibility
    if (togglePasswordBtn && adminPasswordInput) {
        togglePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isPassword = adminPasswordInput.type === 'password';
            adminPasswordInput.type = isPassword ? 'text' : 'password';
            togglePasswordBtn.textContent = isPassword ? '🔐' : '👁';
        });
    }

    // Handle admin login
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = adminLoginForm.querySelector('button[type="submit"]');
            if (!submitButton) return;

            // Get form values
            const email = adminEmailInput?.value.trim() || '';
            const password = adminPasswordInput?.value || '';

            if (!email || !password) {
                showMessage(loginMessage, 'Please fill in all fields', 'error');
                return;
            }

            // Disable button and show loading state
            submitButton.disabled = true;
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Signing in...';

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // Save token to localStorage
                if (data.token) {
                    localStorage.setItem('adminToken', data.token);
                    localStorage.setItem('adminUser', JSON.stringify(data.admin));
                }

                // Show success message
                showMessage(
                    loginMessage,
                    `Welcome back, ${data.admin?.name || 'Admin'}!`,
                    'success'
                );

                // Redirect to admin dashboard after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1500);

            } catch (error) {
                showMessage(
                    loginMessage,
                    error.message || 'Unable to sign in. Please check your credentials.',
                    'error'
                );
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    // Handle forgot password
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', () => {
            if (forgotPasswordForm) {
                forgotPasswordForm.classList.toggle('hidden');
                if (!forgotPasswordForm.classList.contains('hidden')) {
                    resetEmailInput?.focus();
                }
            }
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = resetEmailInput?.value.trim() || '';
            if (!email) {
                showMessage(forgotMessage, 'Please enter your email address', 'error');
                return;
            }

            const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
            if (!submitButton) return;

            submitButton.disabled = true;
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';

            try {
                const response = await fetch(`${API_URL}/forgot-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to send reset email');
                }

                showMessage(
                    forgotMessage,
                    data.message || 'Reset instructions have been sent to your email.',
                    'success'
                );

                if (resetEmailInput) resetEmailInput.value = '';

            } catch (error) {
                showMessage(
                    forgotMessage,
                    error.message || 'Unable to process your request. Please try again.',
                    'error'
                );
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    /**
     * Display a message to the user
     */
    function showMessage(element, message, type = 'error') {
        if (!element) return;

        element.textContent = message;
        element.className = `form-message ${type}`;

        // Auto-clear message after 8 seconds
        setTimeout(() => {
            element.textContent = '';
            element.className = 'form-message';
        }, 8000);
    }

    /**
     * Check if admin is already logged in or token is provided
     */
    function checkAdminStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
            localStorage.setItem('adminToken', urlToken);
            localStorage.setItem('adminUser', JSON.stringify({ email: 'Admin', role: 'admin' }));
            window.location.href = 'admin-dashboard.html';
            return;
        }

        const token = localStorage.getItem('adminToken');
        if (token) {
            // Admin is already logged in, redirect to dashboard
            window.location.href = 'admin-dashboard.html';
        }
    }

    // Run on page load
    checkAdminStatus();
});
