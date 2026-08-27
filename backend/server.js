require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const galleryNoDbRoutes = require('./routes/galleryNoDbRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fs = require('fs');

// Serve frontend static files & uploads
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/gallery-no-db', galleryNoDbRoutes);
app.use('/api/gallery', galleryNoDbRoutes);
app.use('/api/admin', adminRoutes);

// Clean routes for frontend pages (e.g. /booking, /services, /contact, etc.)
app.get('/:page', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  const pageParam = req.params.page;
  const fileName = pageParam.endsWith('.html') ? pageParam : `${pageParam}.html`;
  const filePath = path.join(frontendPath, fileName);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  next();
});

// Fallback to index.html for root or client-side navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const fallbackPort = port + 1;
      console.warn(`Port ${port} is already in use. Trying ${fallbackPort}...`);
      startServer(fallbackPort);
      return;
    }

    console.error('Server startup error:', error);
    process.exit(1);
  });
};

startServer(PORT);
