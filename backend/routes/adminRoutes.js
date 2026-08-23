const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/login', adminController.login);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/register', adminController.register);

// Protected routes
router.get('/', authMiddleware, adminController.getAllAdmins);
router.get('/:id', authMiddleware, adminController.getAdminById);
router.put('/:id', authMiddleware, adminController.updateAdmin);
router.delete('/:id', authMiddleware, adminController.deleteAdmin);

module.exports = router;
