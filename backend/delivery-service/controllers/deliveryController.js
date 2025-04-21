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
    const userId = req.user.id;

    console.log("🔍 Assigning driver:", { orderId, driverId, userId });

    // Check if user is authorized to assign drivers
    if (req.user.role !== "delivery_personnel" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Verify the driver is the same as the authenticated user
    if (driverId !== userId) {
      return res
        .status(403)
        .json({ message: "You can only assign yourself as the driver" });
    }

    // Check if delivery already exists for this order
    let delivery = await Delivery.findOne({ order: orderId });

    if (delivery) {
      // If delivery exists, update the driver
      delivery.driver = driverId;
      delivery.status = "On the Way";
      await delivery.save();
      return res.status(200).json({ delivery });
    }

    // Get order details from order service
    try {
      const orderResponse = await axios.get(
        `${ORDER_SERVICE_URL}/api/orders/${orderId}`,
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      const order = orderResponse.data;

      // Create new delivery record
      delivery = new Delivery({
        order: orderId,
        driver: driverId,
        customer: order.customer,
        status: "On the Way",
        deliveryTime: null,
      });

      await delivery.save();

      res.status(201).json({ delivery });
    } catch (error) {
      console.error("Error fetching order details:", error);
      return res.status(500).json({ message: "Error fetching order details" });
    }
  } catch (error) {
    console.error("Error assigning driver:", error);
    res.status(500).json({ message: "Error assigning driver" });
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
      registrations,
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

    // Update the order status as well
    try {
      const authToken = req.headers.authorization;
      await axios.patch(
        `${ORDER_SERVICE_URL}/api/orders/${updatedDelivery.order}`,
        { status },
        { headers: { Authorization: authToken } }
      );
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      // Continue with the response even if order update fails
    }

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

// Get delivery location for an order
const getDeliveryLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    console.log("🔍 Fetching delivery location for order:", orderId);
    console.log("👤 User ID:", userId);

    // Find the delivery record for this order
    const delivery = await Delivery.findOne({ order: orderId })
      .populate("driver")
      .lean();

    console.log("📦 Found delivery:", delivery);

    if (!delivery) {
      console.log("❌ Delivery not found");
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (!delivery.driver) {
      console.log("❌ No driver assigned to this delivery");
      return res
        .status(404)
        .json({ message: "No driver assigned to this delivery" });
    }

    // Check if the user is authorized to view this delivery
    const isCustomer = delivery.customer.toString() === userId;
    const isDriver = delivery.driver._id.toString() === userId;

    console.log("🔐 Authorization check:", { isCustomer, isDriver });

    if (!isCustomer && !isDriver) {
      console.log("❌ Unauthorized access");
      return res
        .status(403)
        .json({ message: "Not authorized to view this delivery" });
    }

    // Find the delivery personnel record for the driver
    const deliveryPersonnel = await DeliveryPersonnel.findOne({
      user: delivery.driver._id,
    }).select("currentLocation");

    if (!deliveryPersonnel) {
      console.log("❌ Delivery personnel record not found");
      return res
        .status(404)
        .json({ message: "Delivery personnel record not found" });
    }

    // Return the delivery person's location
    const location = deliveryPersonnel.currentLocation?.coordinates || null;
    console.log("📍 Delivery location:", location);

    res.json({
      location,
      status: delivery.status,
    });
  } catch (error) {
    console.error("❌ Error fetching delivery location:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      message: "Error fetching delivery location",
      error: error.message,
    });
  }
};

module.exports = {
  assignDriver,
  getUserDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  deleteDelivery,
  getDeliveryLocation,
};
