const axios = require("axios");
const Order = require("../models/Order");
require("dotenv").config();

// Load API Gateway service URLs from environment variables
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL;
const DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL;
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;

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

// Send customer notification
const sendCustomerNotification = async (order, token) => {
  try {
    // Get customer details from auth service
    const customerResponse = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/users/${order.customer}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const customer = customerResponse.data;
    console.log("Customer details:", customer);

    // Format phone number
    let phoneNumber = customer.phone;
    console.log("Original phone number:", phoneNumber);

    // Remove any spaces or dashes
    phoneNumber = phoneNumber.replace(/[\s-]/g, "");

    // Format for Sri Lankan numbers
    if (phoneNumber.startsWith("94")) {
      // Already in correct format
    } else if (phoneNumber.startsWith("0")) {
      phoneNumber = "94" + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith("94")) {
      phoneNumber = "94" + phoneNumber;
    }

    console.log("Formatted phone number:", phoneNumber);

    // Send notifications to customer
    const notifications = [
      {
        type: "email",
        email: customer.email,
        subject: "Order Confirmation",
        message: `Your order #${order._id} has been placed successfully. Total amount: $${order.totalPrice}. Status: ${order.status}`,
      },
      {
        type: "sms",
        phone: phoneNumber,
        message: `Order #${order._id} placed successfully. Amount: $${order.totalPrice}. Status: ${order.status}`,
      },
      {
        type: "whatsapp",
        phone: phoneNumber,
        message: `Order #${order._id}:${order.status}`,
      },
    ];

    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications`,
      {
        userId: order.customer,
        notifications,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(`📧 Notifications sent to customer for order: ${order._id}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending customer notifications:", error.message);
    return false;
  }
};

// ✅ Place a New Order (Fetch Restaurant First)
const placeOrder = async (req, res) => {
  try {
    const {
      restaurant,
      items,
      totalPrice,
      paymentMethod,
      cardDetails,
      deliveryAddress,
    } = req.body;

    // Validate required fields
    if (!restaurant || !items || !totalPrice || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate payment method
    if (paymentMethod === "card" && !cardDetails) {
      return res
        .status(400)
        .json({ message: "Card details required for card payment" });
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
      ...(paymentMethod === "card" && { cardDetails }),
    });

    await newOrder.save();

    // Send notifications to customer
    await sendCustomerNotification(newOrder, req.headers.authorization);

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

    console.log("🔍 Starting order status update...");
    console.log("Order ID:", id);
    console.log("New status:", status);
    console.log("User role:", role);

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      console.error("❌ Order not found:", id);
      return res.status(404).json({ message: "Order not found" });
    }

    // Authorization checks based on role and status
    if (role === "restaurant_admin") {
      // Restaurant admin can update to "Preparing" or "Out for Delivery"
      if (["Preparing", "Confirmed", "Out for Delivery"].includes(status)) {
        order.status = status;
        await order.save();

        // Send notification to customer about status update
        try {
          console.log("📧 Sending status update notification to customer...");

          // Verify notification service URL is set
          if (!process.env.NOTIFICATION_SERVICE_URL) {
            console.error(
              "❌ NOTIFICATION_SERVICE_URL is not set in environment variables"
            );
            return res.status(200).json(order); // Continue with order update even if notification fails
          }

          // Get customer details from auth service
          const customerResponse = await axios.get(
            `${process.env.AUTH_SERVICE_URL}/api/auth/users/${order.customer}`,
            {
              headers: { Authorization: req.headers.authorization },
            }
          );

          const customer = customerResponse.data;
          console.log("Customer details:", customer);

          const notifications = [
            {
              type: "email",
              email: customer.email,
              subject: "Order Status Update",
              message: `Your order #${order._id} status has been updated to: ${status}`,
            },
            {
              type: "sms",
              phone: customer.phone,
              message: `Order #${order._id} status updated to: ${status}`,
            },
            {
              type: "whatsapp",
              phone: customer.phone,
              message: `Order #${order._id}:${status}`,
            },
          ];

          await axios.post(
            `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`,
            {
              userId: order.customer,
              notifications,
            },
            {
              headers: { Authorization: req.headers.authorization },
            }
          );

          console.log("✅ Status update notifications sent successfully");
        } catch (error) {
          console.error("❌ Error sending status update notifications:", error);
          console.error("Error details:", {
            message: error.message,
            url: process.env.NOTIFICATION_SERVICE_URL,
            customerId: order.customer,
          });
          // Don't fail the order update if notification fails
        }

        return res.status(200).json(order);
      } else {
        console.error("❌ Invalid status update for restaurant admin:", status);
        return res.status(403).json({
          message:
            "Restaurant admin can only update orders to Preparing or Out for Delivery",
        });
      }
    } else if (role === "admin") {
      // Admin can update to any status
      order.status = status;
      await order.save();

      // Send notification to customer about status update
      try {
        console.log("📧 Sending status update notification to customer...");

        // Verify notification service URL is set
        if (!process.env.NOTIFICATION_SERVICE_URL) {
          console.error(
            "❌ NOTIFICATION_SERVICE_URL is not set in environment variables"
          );
          return res.status(200).json(order); // Continue with order update even if notification fails
        }

        // Get customer details from auth service
        const customerResponse = await axios.get(
          `${process.env.AUTH_SERVICE_URL}/api/auth/users/${order.customer}`,
          {
            headers: { Authorization: req.headers.authorization },
          }
        );

        const customer = customerResponse.data;
        console.log("Customer details:", customer);

        const notifications = [
          {
            type: "email",
            email: customer.email,
            subject: "Order Status Update",
            message: `Your order #${order._id} status has been updated to: ${status}`,
          },
          {
            type: "sms",
            phone: customer.phone,
            message: `Order #${order._id} status updated to: ${status}`,
          },
          {
            type: "whatsapp",
            phone: customer.phone,
            message: `Order #${order._id}:${status}`,
          },
        ];

        await axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`,
          {
            userId: order.customer,
            notifications,
          },
          {
            headers: { Authorization: req.headers.authorization },
          }
        );

        console.log("✅ Status update notifications sent successfully");
      } catch (error) {
        console.error("❌ Error sending status update notifications:", error);
        console.error("Error details:", {
          message: error.message,
          url: process.env.NOTIFICATION_SERVICE_URL,
          customerId: order.customer,
        });
        // Don't fail the order update if notification fails
      }

      return res.status(200).json(order);
    } else {
      console.error("❌ Unauthorized role for status update:", role);
      return res
        .status(403)
        .json({ message: "Unauthorized to update order status" });
    }
  } catch (error) {
    console.error("❌ Error updating order:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error updating order",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
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
            headers: { Authorization: `Bearer ${req.headers.authorization}` },
          }
        );

        if (restaurantResponse.data.owner !== req.user.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      } catch (error) {
        console.error("Error verifying restaurant ownership:", error);
        return res
          .status(500)
          .json({ message: "Error verifying restaurant ownership" });
      }
    }

    // Fetch orders for the restaurant
    const orders = await Order.find({ restaurant: restaurantId }).sort({
      createdAt: -1,
    }); // Sort by newest first

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
