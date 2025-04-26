const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  name: { type: String, required: true },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  menu: [{ type: mongoose.Schema.Types.ObjectId, ref: "Menu" }],
  registrationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
  },
  bankDetails: {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    branchCode: { type: String, required: true },
    branchName: { type: String, required: true },
  },
  businessHours: {
    monday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
    },
    tuesday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
    },
    wednesday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
    },
    thursday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
    },
    friday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
    },
    saturday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
    },
    sunday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add geospatial index for location-based queries
restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);
