const mongoose = require("mongoose");

const deliveryPersonnelSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  registrationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['motorcycle', 'bicycle', 'car', 'scooter']
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  rating: {
    type: Number,
    default: 0
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for geospatial queries
deliveryPersonnelSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model("DeliveryPersonnel", deliveryPersonnelSchema); 