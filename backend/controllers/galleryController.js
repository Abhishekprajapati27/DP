const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

// Create gallery item
exports.createGalleryItem = async (req, res) => {
  try {
    const { title, description, category, featured } = req.body;
    const uploadedBy = req.user.id;

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/gallery/${req.file.filename}`;
    }

    const galleryItem = new Gallery({
      title,
      description,
      imageUrl,
      category,
      featured: featured || false,
      uploadedBy
    });

    await galleryItem.save();
    await galleryItem.populate('uploadedBy', 'name email');

    res.status(201).json({
      message: 'Gallery item created successfully',
      galleryItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all gallery items
exports.getAllGalleryItems = async (req, res) => {
  try {
    const { category, featured } = req.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    const items = await Gallery.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get gallery item by ID
exports.getGalleryItemById = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update gallery item
exports.updateGalleryItem = async (req, res) => {
  try {
    const { title, description, category, featured } = req.body;
    const updateData = { title, description, category, featured, updatedAt: Date.now() };

    // Handle image update
    if (req.file) {
      const item = await Gallery.findById(req.params.id);
      if (item && item.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', item.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.imageUrl = `/uploads/gallery/${req.file.filename}`;
    }

    const item = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('uploadedBy', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    res.json({
      message: 'Gallery item updated successfully',
      item
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete gallery item
exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete image file
    if (item.imageUrl) {
      const imagePath = path.join(__dirname, '..', item.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured gallery items
exports.getFeaturedItems = async (req, res) => {
  try {
    const items = await Gallery.find({ featured: true })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
