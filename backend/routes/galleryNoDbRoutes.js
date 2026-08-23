const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const galleryNoDbController = require('../controllers/galleryNoDbController');
const upload = require('../middleware/uploadMiddleware');

// Protected upload (no DB)
router.post('/upload-gallery-item', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), galleryNoDbController.uploadGalleryItem);

// Protected delete (no DB)
router.delete('/items/:id', authMiddleware, galleryNoDbController.deleteGalleryItem);

// Public read
router.get('/items', galleryNoDbController.getItems);

module.exports = router;

