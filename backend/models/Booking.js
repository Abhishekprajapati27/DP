const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['Sofa Cleaning', 'Carpet Cleaning', 'Curtain Cleaning', 'Car Interior Cleaning', 'Mattress Cleaning', 'Other']
  },
  itemQuantity: {
    type: Number,
    required: true,
    default: 1,
  },
  serviceOption: {
    type: String,
    required: true,
    enum: ['home', 'dropoff'],
    default: 'home'
  },
  address: {
    type: String,
    required: false,
  },
  preferredDate: {
    type: Date,
    required: true,
  },
  preferredTime: {
    type: String,
    required: true,
  },
  specialRequests: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'completed', 'cancelled']
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

module.exports = mongoose.model('Booking', bookingSchema);
