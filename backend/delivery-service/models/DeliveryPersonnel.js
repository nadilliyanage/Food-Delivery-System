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
  address: {
    type: String,
    required: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  workingHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '17:00'
    }
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
  preferredZones: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for geospatial queries
deliveryPersonnelSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model("DeliveryPersonnel", deliveryPersonnelSchema); 