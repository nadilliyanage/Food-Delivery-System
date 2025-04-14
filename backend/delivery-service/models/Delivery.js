const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  status: {
    type: String,
    enum: ["Pending", "Assigned", "Out for Delivery", "On the Way", "Delivered", "Cancelled"],
    default: "Pending",
  },
  deliveryTime: { type: Date, default: null },
});

module.exports = mongoose.model("Delivery", deliverySchema);
