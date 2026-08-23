const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');

const cleanEnvStr = (str) => String(str || '').replace(/^["']|["']$/g, '').trim();

const getEnvAdmin = () => {
  const email = cleanEnvStr(process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL).toLowerCase();
  const password = cleanEnvStr(process.env.ADMIN_PASSWORD);
  if (!email || !password) return null;

  return {
    id: 'local-admin',
    name: cleanEnvStr(process.env.ADMIN_NAME) || 'Admin',
    email,
    password,
    role: cleanEnvStr(process.env.ADMIN_ROLE) || 'admin'
  };
};

const createToken = (admin) => jwt.sign(
  { id: admin.id, email: admin.email, role: admin.role },
  cleanEnvStr(process.env.JWT_SECRET) || 'secret-jwt-key',
  { expiresIn: '7d' }
);

// Login — environment-based
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const envAdmin = getEnvAdmin();
    if (!envAdmin) {
      return res.status(500).json({ message: 'Admin credentials not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD.' });
    }

    const cleanInputEmail = String(email).trim().toLowerCase();
    const cleanInputPass = String(password).trim();

    if (cleanInputEmail !== envAdmin.email || cleanInputPass !== envAdmin.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken(envAdmin);
    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: envAdmin.id,
        name: envAdmin.name,
        email: envAdmin.email,
        role: envAdmin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

// Forgot password — sends recovery email to registered admin
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your registered admin email address.' });
    }

    const envAdmin = getEnvAdmin();
    if (!envAdmin) {
      return res.status(500).json({ message: 'Admin credentials are not configured on the server.' });
    }

    const cleanInputEmail = String(email).trim().toLowerCase();

    if (cleanInputEmail !== envAdmin.email) {
      return res.status(404).json({ message: 'No admin account found matching this email address.' });
    }

    const token = createToken(envAdmin);
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const loginLink = `${protocol}://${host}/admin.html?token=${encodeURIComponent(token)}`;

    const emailSubject = '🔑 Admin Password Recovery - DP Sofa Dry Cleaning';
    const emailText = [
      `Hello ${envAdmin.name},`,
      '',
      'You requested password recovery for the DP Sofa Dry Cleaning Admin Portal.',
      '',
      `Admin Email: ${envAdmin.email}`,
      `Admin Password: ${envAdmin.password}`,
      '',
      'You can use the password above to sign in, or click this link to access the dashboard directly:',
      loginLink,
      '',
      'If you did not request this, please verify your server security.',
      'DP Sofa Dry Cleaning Team'
    ].join('\n');

    const emailHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#0f172a;padding:24px;color:#f8fafc;">
        <div style="max-width:550px;margin:auto;background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <div style="background:#2563eb;padding:20px;text-align:center;">
            <h2 style="margin:0;color:#ffffff;font-size:22px;">DP Sofa Dry Cleaning</h2>
            <p style="margin:5px 0 0 0;color:#bfdbfe;font-size:14px;">Admin Portal Password Recovery</p>
          </div>
          <div style="padding:24px;color:#e2e8f0;font-size:14px;line-height:1.6;">
            <p>Hello <strong>${envAdmin.name}</strong>,</p>
            <p>You requested password recovery for your Admin Portal account. Here are your credentials:</p>
            
            <div style="background:#0f172a;padding:16px;border-radius:8px;border:1px solid #334155;margin:20px 0;">
              <p style="margin:4px 0;"><strong>Email:</strong> <span style="color:#38bdf8;">${envAdmin.email}</span></p>
              <p style="margin:4px 0;"><strong>Password:</strong> <span style="color:#4ade80;font-size:16px;font-family:monospace;font-weight:bold;">${envAdmin.password}</span></p>
            </div>

            <p style="margin-top:20px;">Use these credentials on the admin login page to sign in.</p>
          </div>
          <div style="background:#0f172a;padding:14px;text-align:center;border-top:1px solid #334155;color:#94a3b8;font-size:12px;">
            If you did not request this, please disregard this email.
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: envAdmin.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    res.status(200).json({
      message: `Password details have been sent to ${envAdmin.email}. Please check your inbox.`
    });
  } catch (error) {
    console.error('Admin forgot-password error:', error);
    res.status(500).json({ message: error.message || 'Failed to process password recovery' });
  }
};

// Register — disabled without database
exports.register = async (req, res) => {
  return res.status(503).json({ message: 'Admin registration is disabled (no database).' });
};

// Get all admins — disabled without database
exports.getAllAdmins = async (req, res) => {
  return res.status(503).json({ message: 'Admin listing is disabled (no database).' });
};

// Get single admin — disabled without database
exports.getAdminById = async (req, res) => {
  return res.status(503).json({ message: 'Admin lookup is disabled (no database).' });
};

// Update admin — disabled without database
exports.updateAdmin = async (req, res) => {
  return res.status(503).json({ message: 'Admin update is disabled (no database).' });
};

// Delete admin — disabled without database
exports.deleteAdmin = async (req, res) => {
  return res.status(503).json({ message: 'Admin deletion is disabled (no database).' });
};
