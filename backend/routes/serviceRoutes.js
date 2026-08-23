const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.get('/category/:category', serviceController.getServicesByCategory);

// Protected routes
router.post('/', authMiddleware, serviceController.createService);
router.put('/:id', authMiddleware, serviceController.updateService);
router.delete('/:id', authMiddleware, serviceController.deleteService);
router.patch('/:id/rating', authMiddleware, serviceController.updateServiceRating);

module.exports = router;
