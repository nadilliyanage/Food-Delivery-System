const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "restaurant_admin", "delivery_personnel", "admin"],
      required: true,
    },
    address: { type: String },
    phone: { type: String },
    photoUrl: { type: String },
    latitude: { type: Number },  // Add latitude for storing user's location
    longitude: { type: Number }, // Add longitude for storing user's location
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
