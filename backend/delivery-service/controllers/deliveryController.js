const axios = require("axios");
const Delivery = require("../models/Delivery");
require("dotenv").config();

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

// ✅ Get All Deliveries for a User
const getUserDeliveries = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🔍 Fetching deliveries for user: ${userId}`);

    const deliveries = await Delivery.find({ customer: userId });

    const deliveriesWithDetails = await Promise.all(
      deliveries.map(async (delivery) => {
        try {
          const orderResponse = await axios.get(
            `${ORDER_SERVICE_URL}/api/orders/${delivery.order}`
          );
          return {
            ...delivery.toObject(),
            orderDetails: orderResponse.data,
          };
        } catch (error) {
          console.error("❌ Error fetching order details:", error.message);
          return delivery;
        }
      })
    );

    res.json(deliveriesWithDetails);
  } catch (error) {
    console.error("❌ Error fetching user deliveries:", error);
    res.status(500).json({ message: "Error fetching deliveries" });
  }
};

// ✅ Assign a Driver to a Delivery
const assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    const updatedDelivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { driver: driverId, status: "Assigned" },
      { new: true }
    );

    if (!updatedDelivery)
      return res.status(404).json({ message: "Delivery not found" });

    res.json(updatedDelivery);
  } catch (error) {
    console.error("❌ Error assigning driver:", error);
    res.status(500).json({ message: "Error assigning driver" });
  }
};

// ✅ Update Delivery Status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedDelivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { status, deliveryTime: status === "Delivered" ? new Date() : null },
      { new: true }
    );

    if (!updatedDelivery)
      return res.status(404).json({ message: "Delivery not found" });

    res.json(updatedDelivery);
  } catch (error) {
    console.error("❌ Error updating delivery status:", error);
    res.status(500).json({ message: "Error updating delivery status" });
  }
};

// ✅ Track Delivery Status
const trackDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      _id: req.params.id,
      customer: req.user.id,
    });

    if (!delivery)
      return res.status(404).json({ message: "Delivery not found" });

    res.json({ status: delivery.status, deliveryTime: delivery.deliveryTime });
  } catch (error) {
    console.error("❌ Error tracking delivery:", error);
    res.status(500).json({ message: "Error tracking delivery" });
  }
};

module.exports = {
  getUserDeliveries,
  assignDriver,
  updateDeliveryStatus,
  trackDelivery,
};
