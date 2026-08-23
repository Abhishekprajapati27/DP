const Service = require('../models/Service');

// Create service
exports.createService = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, features, available } = req.body;

    const service = new Service({
      name,
      description,
      price,
      category,
      imageUrl,
      features: features || [],
      available: available !== false
    });

    await service.save();

    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const { category, available } = req.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (available !== undefined) {
      filter.available = available === 'true';
    }

    const services = await Service.find(filter).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get services by category
exports.getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const services = await Service.find({ category, available: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update service rating
exports.updateServiceRating = async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { rating, updatedAt: Date.now() },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({
      message: 'Service rating updated successfully',
      service
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
