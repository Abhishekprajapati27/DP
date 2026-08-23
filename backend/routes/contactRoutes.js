const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (email forwarding only)
router.post('/', contactController.createContact);

module.exports = router;

