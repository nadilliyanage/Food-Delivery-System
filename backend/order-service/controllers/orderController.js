const axios = require("axios");
const Order = require("../models/Order");
require("dotenv").config();

// Load API Gateway service URLs from environment variables
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL;
const DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL;

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
      _id: req.params.id
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

// Update order status
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { role, id: userId } = req.user;

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Authorization checks based on role and status
    if (role === "delivery_personnel") {
      // Delivery personnel can:
      // 1. Accept delivery (Out for Delivery -> Delivery Accepted)
      // 2. Reject delivery (Out for Delivery -> Delivery Rejected)
      // 3. Mark as delivered (Delivery Accepted -> Delivered)
      if (order.status === "Out for Delivery" && 
          (status === "Delivery Accepted" || status === "Delivery Rejected")) {
        order.status = status;
        await order.save();

        // If order is accepted, create a delivery record
        if (status === "Delivery Accepted") {
          try {
            if (!DELIVERY_SERVICE_URL) {
              console.error("DELIVERY_SERVICE_URL is not set in environment variables");
              return res.status(200).json(order); // Continue with order update even if delivery record fails
            }

            await axios.post(
              `${DELIVERY_SERVICE_URL}/api/deliveries`,
              {
                orderId: order._id,
                driverId: userId
              },
              {
                headers: { Authorization: req.headers.authorization }
              }
            );
          } catch (error) {
            console.error("Error creating delivery record:", error.message);
            // Don't fail the order update if delivery record creation fails
          }
        }

        return res.status(200).json(order);
      } else if (order.status === "Delivery Accepted" && status === "Delivered") {
        order.status = status;
        await order.save();
        return res.status(200).json(order);
      } else {
        return res.status(403).json({ 
          message: "Invalid status transition for delivery personnel" 
        });
      }
    } else if (role === "restaurant_admin") {
      // Restaurant admin can update to "Preparing" or "Out for Delivery"
      if (["Preparing", "Confirmed", "Out for Delivery"].includes(status)) {
        order.status = status;
        await order.save();
        return res.status(200).json(order);
      } else {
        return res.status(403).json({ 
          message: "Restaurant admin can only update orders to Preparing or Out for Delivery" 
        });
      }
    } else if (role === "admin") {
      // Admin can update to any status
      order.status = status;
      await order.save();
      return res.status(200).json(order);
    } else {
      return res.status(403).json({ message: "Unauthorized to update order status" });
    }
  } catch (error) {
    console.error("Error updating order:", error);
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

// Get orders for a specific restaurant
const getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userRole = req.user.role;

    // Check if user has permission to access these orders
    if (userRole !== "admin" && userRole !== "restaurant_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // If restaurant admin, verify they own this restaurant
    if (userRole === "restaurant_admin") {
      try {
        const restaurantResponse = await axios.get(
          `${RESTAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`,
          {
            headers: { Authorization: `Bearer ${req.headers.authorization}` }
          }
        );

        if (restaurantResponse.data.owner !== req.user.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      } catch (error) {
        console.error("Error verifying restaurant ownership:", error);
        return res.status(500).json({ message: "Error verifying restaurant ownership" });
      }
    }

    // Fetch orders for the restaurant
    const orders = await Order.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 }); // Sort by newest first

    // Fetch customer details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          // Fetch menu item details
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
            items: detailedItems,
          };
        } catch (error) {
          console.error("Error fetching order details:", error);
          return order;
        }
      })
    );

    res.json(ordersWithDetails);
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    res.status(500).json({ message: "Error fetching restaurant orders" });
  }
};

// Get orders that are out for delivery
const getOutForDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Out for Delivery" });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching out for delivery orders:", error);
    res.status(500).json({ message: "Error fetching out for delivery orders" });
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
  getRestaurantOrders,
  getOutForDeliveryOrders,
};
