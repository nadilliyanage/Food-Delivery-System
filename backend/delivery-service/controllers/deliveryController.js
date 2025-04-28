const axios = require("axios");
const Delivery = require("../models/Delivery");
const DeliveryPersonnel = require("../models/DeliveryPersonnel");
require("dotenv").config();

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

//  Assign a Driver to an Order & Create a Delivery Entry
const assignDriver = async (req, res) => {
  try {
    const { orderId, driverId } = req.body;
    const userId = req.user.id;

    console.log("🔍 Assigning driver:", { orderId, driverId, userId });

    // Check if user is authorized to assign drivers - user must have delivery_personnel role
    if (req.user.role !== "delivery_personnel" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Unauthorized, only delivery personnel can accept deliveries",
        userRole: req.user.role,
      });
    }

    // More flexible validation - allow driverId to be either the user ID or the delivery personnel ID
    // This allows the frontend to send either value
    if (driverId !== userId && req.user.role !== "admin") {
      // Check if the driver is registered as a delivery personnel
      const personnel = await DeliveryPersonnel.findOne({ user: userId });
      if (!personnel || personnel.registrationStatus !== "approved") {
        return res.status(403).json({
          message: "You must be an approved delivery person to accept orders",
          userId: userId,
          driverId: driverId,
        });
      }

      // Use the authenticated user's ID as the driver
      console.log(
        `Driver ID mismatch, using authenticated user ID (${userId}) instead of ${driverId}`
      );
    }

    // Check if delivery already exists for this order
    let delivery = await Delivery.findOne({ order: orderId });

    if (delivery) {
      // If delivery exists, update the driver
      delivery.driver = userId; // Always use the authenticated user's ID for security
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
        driver: userId, // Always use the authenticated user's ID for security
        customer: order.customer,
        status: "Assigned",
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

//  Get All Deliveries for a Specific User (Customer or Driver)
const getUserDeliveries = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    //  If the user is a customer, fetch their orders
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
    console.error("Error fetching deliveries:", error);
    res.status(500).json({ message: "Error fetching deliveries" });
  }
};

//  Get Delivery by ID (For Tracking)
const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ _id: req.params.id });

    if (!delivery)
      return res.status(404).json({ message: "Delivery not found" });

    res.json(delivery);
  } catch (error) {
    console.error("Error fetching delivery:", error);
    res.status(500).json({ message: "Error fetching delivery" });
  }
};

//  Update Delivery Status (Only by Assigned Driver)
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    //  Ensure only assigned drivers can update delivery status
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
      console.error("Error updating order status:", error);
      // Continue with the response even if order update fails
    }

    res.json(updatedDelivery);
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Error updating delivery status" });
  }
};

//  Delete a Delivery (Admin Only)
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
    console.error("Error deleting delivery:", error);
    res.status(500).json({ message: "Error deleting delivery" });
  }
};

// Get delivery location for an order
const getDeliveryLocation = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details to get restaurant and customer locations
    const orderResponse = await axios.get(
      `${ORDER_SERVICE_URL}/api/orders/${orderId}`,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );

    const order = orderResponse.data;
    const restaurantLocation = order.restaurant.location.coordinates;
    const customerLocation = [
      order.deliveryAddress.longitude,
      order.deliveryAddress.latitude,
    ];

    // Get route from TomTom Routing API
    const tomtomApiKey = "UMDEqLx44SlvYeLWgVXryA5GlW5tVW2B";
    const routeResponse = await axios.get(
      `https://api.tomtom.com/routing/1/calculateRoute/${restaurantLocation[1]},${restaurantLocation[0]}:${customerLocation[1]},${customerLocation[0]}/json?key=${tomtomApiKey}&routeType=fastest&traffic=true&travelMode=car&language=en-US`
    );

    if (!routeResponse.data.routes || !routeResponse.data.routes[0]) {
      throw new Error("Failed to get route from TomTom API");
    }

    // Get route points
    const routePoints = routeResponse.data.routes[0].legs[0].points;
    const numPoints = routePoints.length;

    // Calculate current position based on time with slower movement
    const time = Date.now();
    const cycleDuration = 500000;
    const progress = (time % cycleDuration) / cycleDuration;

    // Use a smoother easing function for more realistic movement
    const easedProgress =
      progress < 0.5
        ? 2 * progress * progress // Ease in
        : 1 - Math.pow(-2 * progress + 2, 2) / 2; // Ease out

    const currentPointIndex = Math.floor(easedProgress * numPoints);
    const currentPoint = routePoints[currentPointIndex];

    res.json({
      location: [currentPoint.longitude, currentPoint.latitude],
      status: "On the Way",
      isSimulated: true,
      route: routePoints.map((point) => [point.longitude, point.latitude]),
    });
  } catch (error) {
    console.error("Error in getDeliveryLocation:", error);
    res.status(500).json({ message: "Error fetching delivery location" });
  }
};

// Simulate delivery person movement along the route
const simulateDeliveryMovement = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find the delivery record
    const delivery = await Delivery.findOne({ order: orderId })
      .populate("driver")
      .lean();

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Verify the user is the assigned driver
    if (delivery.driver._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this delivery" });
    }

    // Get order details to get restaurant and customer locations
    const orderResponse = await axios.get(
      `${ORDER_SERVICE_URL}/api/orders/${orderId}`,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );

    const order = orderResponse.data;
    const restaurantLocation = order.restaurant.location.coordinates;
    const customerLocation = [
      order.deliveryAddress.longitude,
      order.deliveryAddress.latitude,
    ];

    // Get route from TomTom Routing API
    const tomtomApiKey = "UMDEqLx44SlvYeLWgVXryA5GlW5tVW2B"; // Your TomTom API key
    const routeResponse = await axios.get(
      `https://api.tomtom.com/routing/1/calculateRoute/${restaurantLocation[1]},${restaurantLocation[0]}:${customerLocation[1]},${customerLocation[0]}/json?key=${tomtomApiKey}&routeType=fastest&traffic=true&travelMode=car&language=en-US`
    );

    if (!routeResponse.data.routes || !routeResponse.data.routes[0]) {
      throw new Error("Failed to get route from TomTom API");
    }

    // Get route points
    const routePoints = routeResponse.data.routes[0].legs[0].points;
    const numPoints = routePoints.length;
    const stepSize = Math.max(1, Math.floor(numPoints / 10)); // Take 10 steps along the route

    // Update delivery personnel location with each point
    for (let i = 0; i < numPoints; i += stepSize) {
      const point = routePoints[i];
      await DeliveryPersonnel.findOneAndUpdate(
        { user: userId },
        {
          currentLocation: {
            type: "Point",
            coordinates: [point.longitude, point.latitude],
          },
        }
      );

      // Wait for 2 seconds before moving to next point
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Ensure we reach the final destination
    const finalPoint = routePoints[routePoints.length - 1];
    await DeliveryPersonnel.findOneAndUpdate(
      { user: userId },
      {
        currentLocation: {
          type: "Point",
          coordinates: [finalPoint.longitude, finalPoint.latitude],
        },
      }
    );

    res.json({ message: "Delivery simulation completed" });
  } catch (error) {
    console.error("Error simulating delivery movement:", error);
    res.status(500).json({ message: "Error simulating delivery movement" });
  }
};

module.exports = {
  assignDriver,
  getUserDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  deleteDelivery,
  getDeliveryLocation,
  simulateDeliveryMovement,
};
