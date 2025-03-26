const axios = require("axios");
const Delivery = require("../models/Delivery");
const DeliveryPersonnel = require("../models/DeliveryPersonnel");
require("dotenv").config();

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

// ✅ Assign a Driver to an Order & Create a Delivery Entry
const assignDriver = async (req, res) => {
  try {
    const { orderId, driverId } = req.body;
    console.log(`🔍 Assigning driver ${driverId} to order ${orderId}`);

    // ✅ Get Authorization token from request header
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res.status(401).json({ message: "Unauthorized - Missing Token" });
    }

    // ✅ Fetch order details from Order Service
    let orderData;
    try {
      const orderResponse = await axios.get(
        `${ORDER_SERVICE_URL}/api/orders/${orderId}`,
        { headers: { Authorization: authToken } }
      );
      orderData = orderResponse.data;
      console.log("✅ Order details fetched:", orderData);
    } catch (error) {
      console.error(
        "❌ Error fetching order:",
        error.response?.data || error.message
      );
      return res.status(500).json({ message: "Error fetching order" });
    }

    // ✅ Fetch driver details from Auth Service to confirm role
    let driver;
    try {
      const driverResponse = await axios.get(
        `${AUTH_SERVICE_URL}/api/auth/users/${driverId}`,
        { headers: { Authorization: authToken } }
      );
      driver = driverResponse.data;
      console.log("✅ Driver details fetched:", driver);
    } catch (error) {
      console.error(
        "❌ Error fetching driver:",
        error.response?.data || error.message
      );
      return res.status(500).json({ message: "Error fetching driver" });
    }

    // ✅ Check if the user is a valid delivery driver
    if (!driver || driver.role !== "delivery_personnel") {
      console.error("❌ Invalid driver role:", driver.role);
      return res
        .status(400)
        .json({ message: "Invalid driver or driver not found" });
    }

    // ✅ Create a new Delivery record in the database
    const newDelivery = new Delivery({
      order: orderData._id,
      customer: orderData.customer,
      driver: driver._id,
      status: "Assigned",
      deliveryTime: null,
    });

    await newDelivery.save();
    console.log("✅ Delivery successfully created:", newDelivery);

    res.status(201).json({
      message: "Driver assigned and delivery created",
      delivery: newDelivery,
    });
  } catch (error) {
    console.error("❌ Full Error Log:", error);
    res.status(500).json({ message: "Error processing delivery" });
  }
};

// ✅ Get All Deliveries for a Specific User (Customer or Driver)
const getUserDeliveries = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // ✅ If the user is a customer, fetch their orders
    let deliveries;
    if (userRole === "customer") {
      deliveries = await Delivery.find({ customer: userId });
    } else if (userRole === "delivery_personnel") {
      deliveries = await Delivery.find({ driver: userId });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get delivery personnel registrations for the user
    const registrations = await DeliveryPersonnel.find({ user: userId });

    res.json({
      deliveries,
      registrations
    });
  } catch (error) {
    console.error("❌ Error fetching deliveries:", error);
    res.status(500).json({ message: "Error fetching deliveries" });
  }
};

// ✅ Get Delivery by ID (For Tracking)
const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ _id: req.params.id });

    if (!delivery)
      return res.status(404).json({ message: "Delivery not found" });

    res.json(delivery);
  } catch (error) {
    console.error("❌ Error fetching delivery:", error);
    res.status(500).json({ message: "Error fetching delivery" });
  }
};

// ✅ Update Delivery Status (Only by Assigned Driver)
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // ✅ Ensure only assigned drivers can update delivery status
    if (userRole !== "delivery_personnel") {
      return res.status(403).json({
        message: "Access denied - Only drivers can update delivery status",
      });
    }

    const updatedDelivery = await Delivery.findOneAndUpdate(
      { _id: req.params.id, driver: userId },
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

// ✅ Delete a Delivery (Admin Only)
const deleteDelivery = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const deletedDelivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!deletedDelivery)
      return res.status(404).json({ message: "Delivery not found" });

    res.json({ message: "Delivery deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting delivery:", error);
    res.status(500).json({ message: "Error deleting delivery" });
  }
};

module.exports = {
  assignDriver,
  getUserDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  deleteDelivery,
};
