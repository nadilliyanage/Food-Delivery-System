const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "Pending",
      "Confirmed",
      "Preparing",
      "Delivery Accepted",
      "Out for Delivery",
      "On the Way",
      "Delivered",
      "Cancelled",
      "Delivery Rejected"
    ],
    default: "Pending",
  },
  deliveryAddress: {
    street: { type: String },
    city: { type: String },
    instructions: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  paymentMethod: {
    type: String,
    enum: ["card", "cash"],
    required: true
  },
  cardDetails: {
    number: String,
    expiry: String,
    cvc: String,
    name: String
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
