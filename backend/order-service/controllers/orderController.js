const axios = require("axios");
const Order = require("../models/Order");
require("dotenv").config();

// Load API Gateway service URLs from environment variables
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL;

// ✅ Get All Orders (For Admins and Restaurant Owners)
const getOrders = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    console.log(`🔍 Fetching all orders for role: ${userRole}`);

    let orders;

    if (userRole === "admin") {
      // ✅ Admins can see all orders
      orders = await Order.find();
    } else if (userRole === "restaurant_admin") {
      // ✅ Restaurant owners can only see orders for their restaurant
      orders = await Order.find({ restaurant: userId });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// ✅ Get All Orders for the Logged-in User
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ customer: userId });

    // Fetch restaurant and menu data from Restaurant Service
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          const restaurantResponse = await axios.get(
            `${RESTAURANT_SERVICE_URL}/api/restaurants/${order.restaurant}`
          );
          const detailedItems = await Promise.all(
            order.items.map(async (item) => {
              const menuResponse = await axios.get(
                `${RESTAURANT_SERVICE_URL}/api/menu/${item.menuItem}`
              );
              return {
                menuItem: menuResponse.data,
                quantity: item.quantity,
              };
            })
          );

          return {
            ...order.toObject(),
            restaurant: restaurantResponse.data,
            items: detailedItems,
          };
        } catch (error) {
          console.error(
            "❌ Error fetching restaurant/menu details:",
            error.message
          );
          return order;
        }
      })
    );

    res.json(ordersWithDetails);
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// ✅ Get a Specific Order by ID
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // ✅ Allow Admins and Delivery Personnel to Fetch Any Order
    const order = await Order.findOne({
      _id: req.params.id,
      ...(userRole === "customer" && { customer: userId }),
      ...(userRole === "delivery_personnel" && {
        status: { $in: ["Assigned", "Out for Delivery"] },
      }),
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    let restaurantDetails = null;
    try {
      const restaurantResponse = await axios.get(
        `${RESTAURANT_SERVICE_URL}/api/restaurants/${order.restaurant}`
      );
      restaurantDetails = restaurantResponse.data;
    } catch (error) {
      console.error("❌ Error fetching restaurant:", error.message);
    }

    const detailedItems = await Promise.all(
      order.items.map(async (item) => {
        try {
          const menuResponse = await axios.get(
            `${RESTAURANT_SERVICE_URL}/api/menu/${item.menuItem}`
          );
          return {
            menuItem: menuResponse.data,
            quantity: item.quantity,
          };
        } catch (error) {
          console.error(
            `❌ Error fetching menu item ${item.menuItem}:`,
            error.message
          );
          return { menuItem: null, quantity: item.quantity };
        }
      })
    );

    res.json({
      ...order.toObject(),
      restaurant: restaurantDetails,
      items: detailedItems,
    });
  } catch (error) {
    console.error("❌ Error fetching order:", error.message);
    res.status(500).json({ message: "Error fetching order" });
  }
};

// ✅ Place a New Order (Fetch Restaurant First)
const placeOrder = async (req, res) => {
  try {
    const { restaurant, items, totalPrice, paymentMethod, cardDetails, deliveryAddress } = req.body;

    // Validate required fields
    if (!restaurant || !items || !totalPrice || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate payment method
    if (paymentMethod === "card" && !cardDetails) {
      return res.status(400).json({ message: "Card details required for card payment" });
    }

    // ✅ Ensure restaurant exists before placing an order
    const restaurantResponse = await axios.get(
      `${RESTAURANT_SERVICE_URL}/api/restaurants/${restaurant}`
    );
    if (!restaurantResponse.data)
      return res.status(404).json({ message: "Restaurant not found" });

    const newOrder = new Order({
      customer: req.user.id,
      restaurant,
      items,
      totalPrice,
      deliveryAddress,
      paymentMethod,
      ...(paymentMethod === "card" && { cardDetails })
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("❌ Error placing order:", error);
    res.status(500).json({ message: "Error placing order" });
  }
};

// ✅ Update an Order (Only if Status is `Pending`)
const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id, status: "Pending" },
      req.body,
      { new: true }
    );

    if (!updatedOrder)
      return res
        .status(404)
        .json({ message: "Order not found or cannot be modified" });

    res.json(updatedOrder);
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({ message: "Error updating order" });
  }
};

// ✅ Cancel an Order (Only if Status is `Pending`)
const cancelOrder = async (req, res) => {
  try {
    const cancelledOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id, status: "Pending" },
      { status: "Cancelled" },
      { new: true }
    );

    if (!cancelledOrder)
      return res
        .status(404)
        .json({ message: "Order not found or cannot be cancelled" });

    res.json(cancelledOrder);
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order" });
  }
};

// ✅ Track Order Status
const trackOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ status: order.status });
  } catch (error) {
    console.error("❌ Error tracking order:", error);
    res.status(500).json({ message: "Error tracking order" });
  }
};

module.exports = {
  getUserOrders,
  getOrderById,
  placeOrder,
  updateOrder,
  cancelOrder,
  trackOrderStatus,
  getOrders,
};
