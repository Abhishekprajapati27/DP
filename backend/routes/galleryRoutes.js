const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', galleryController.getAllGalleryItems);
router.get('/featured', galleryController.getFeaturedItems);
router.get('/:id', galleryController.getGalleryItemById);

// Protected routes
router.post('/', authMiddleware, upload.single('image'), galleryController.createGalleryItem);
router.put('/:id', authMiddleware, upload.single('image'), galleryController.updateGalleryItem);
router.delete('/:id', authMiddleware, galleryController.deleteGalleryItem);

module.exports = router;
