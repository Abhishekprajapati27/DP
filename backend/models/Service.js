const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Decoration', 'Catering', 'Photography', 'Music', 'Venue', 'Other']
  },
  imageUrl: {
    type: String,
    required: false,
  },
  features: [{
    type: String,
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  available: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Service', serviceSchema);
