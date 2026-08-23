const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (email forwarding only)
router.post('/', bookingController.createBooking);


module.exports = router;
