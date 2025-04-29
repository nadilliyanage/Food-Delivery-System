const axios = require("axios");
const Order = require("../models/Order");
require("dotenv").config();

// Load API Gateway service URLs from environment variables
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL;
const DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL;
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;

//  Get All Orders (For Admins and Restaurant Owners)
const getOrders = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    console.log(`🔍 Fetching all orders for role: ${userRole}`);

    let orders;

    if (userRole === "admin") {
      //  Admins can see all orders
      orders = await Order.find();
    } else if (userRole === "restaurant_admin") {
      //  Restaurant owners can only see orders for their restaurant
      orders = await Order.find({ restaurant: userId });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

//  Get All Orders for the Logged-in User
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
            "Error fetching restaurant/menu details:",
            error.message
          );
          return order;
        }
      })
    );

    res.json(ordersWithDetails);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

//  Get a Specific Order by ID
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    //  Allow Admins and Delivery Personnel to Fetch Any Order
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
      console.error("Error fetching restaurant:", error.message);
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
            `Error fetching menu item ${item.menuItem}:`,
            error.message
          );
          return { menuItem: null, quantity: item.quantity };
        }
      })
    );

    // Ensure we have the required location data
    if (!restaurantDetails?.location?.coordinates) {
      console.error("Restaurant location not found");
      return res.status(404).json({ message: "Restaurant location not found" });
    }

    if (!order.deliveryAddress?.longitude || !order.deliveryAddress?.latitude) {
      console.error("Delivery address not found");
      return res.status(404).json({ message: "Delivery address not found" });
    }

    res.json({
      ...order.toObject(),
      restaurant: restaurantDetails,
      items: detailedItems,
    });
  } catch (error) {
    console.error("Error fetching order:", error.message);
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
    console.error("Error sending customer notifications:", error.message);
    return false;
  }
};

//  Place a New Order (Fetch Restaurant First)
const placeOrder = async (req, res) => {
  try {
    console.log("🔍 Starting order placement...");
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
      console.error("Missing required fields:", {
        hasRestaurant: !!restaurant,
        hasItems: !!items,
        hasTotalPrice: !!totalPrice,
        hasPaymentMethod: !!paymentMethod,
      });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate payment method
    if (paymentMethod === "card" && !cardDetails) {
      console.error("Card payment missing card details");
      return res
        .status(400)
        .json({ message: "Card details required for card payment" });
    }

    //  Ensure restaurant exists before placing an order
    try {
      console.log("🔍 Verifying restaurant...");
      const restaurantResponse = await axios.get(
        `${RESTAURANT_SERVICE_URL}/api/restaurants/${restaurant}`
      );
      if (!restaurantResponse.data) {
        console.error("Restaurant not found:", restaurant);
        return res.status(404).json({ message: "Restaurant not found" });
      }
      console.log(" Restaurant verified");
    } catch (error) {
      console.error("Error verifying restaurant:", error);
      return res.status(500).json({ message: "Error verifying restaurant" });
    }

    // Get customer details from auth service
    let customer;
    try {
      console.log("🔍 Fetching customer details...");
      const customerResponse = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/auth/users/${req.user.id}`,
        {
          headers: { Authorization: req.headers.authorization },
        }
      );
      customer = customerResponse.data;
      console.log(" Customer details fetched:", customer);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      return res
        .status(500)
        .json({ message: "Error fetching customer details" });
    }

    // Process payment
    try {
      console.log("💳 Processing payment...");
      if (paymentMethod === "card") {
        // Add your payment processing logic here
        console.log(" Card payment processed");
      } else {
        console.log(" Cash payment selected");
      }
    } catch (error) {
      console.error("Payment processing failed:", error);
      return res.status(500).json({ message: "Payment processing failed" });
    }

    // Create new order
    const newOrder = new Order({
      customer: req.user.id,
      restaurant,
      items,
      totalPrice,
      deliveryAddress,
      paymentMethod,
      ...(paymentMethod === "card" && { cardDetails }),
    });

    try {
      console.log("💾 Saving order...");
      await newOrder.save();
      console.log(" Order saved successfully");
    } catch (error) {
      console.error("Error saving order:", error);
      return res.status(500).json({ message: "Error saving order" });
    }

    // Send notifications to customer
    try {
      console.log("📧 Sending order confirmation notifications...");

      if (!NOTIFICATION_SERVICE_URL) {
        console.error(
          "NOTIFICATION_SERVICE_URL is not set in environment variables"
        );
        return res.status(201).json(newOrder);
      }

      const notifications = [
        {
          type: "email",
          email: customer.email,
          subject: "Order Status - EatEase",
          message: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333333; margin-bottom: 20px;">Order Confirmation</h2>
                
                <p style="color: #666666; margin-bottom: 20px;">Dear ${customer.name},</p>
                
                <p style="color: #666666; margin-bottom: 20px;">Thank you for placing your order with us!</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                    <h3 style="color: #333333; margin-bottom: 15px;">Order Details</h3>
                    <p style="color: #666666; margin: 5px 0;"><strong>Order ID:</strong> #${newOrder._id}</p>
                    <p style="color: #666666; margin: 5px 0;"><strong>Total Amount:</strong> $${newOrder.totalPrice}</p>
                    <p style="color: #666666; margin: 5px 0;"><strong>Status:</strong> ${newOrder.status}</p>
                </div>
                
                <p style="color: #666666; margin-bottom: 20px;">We will notify you once your order is confirmed by the restaurant.</p>
                
                <p style="color: #666666; margin-bottom: 20px;">Thank you for choosing our service!</p>
                
                <div style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 20px;">
                    <p style="color: #999999; margin: 0;">Best regards,<br>EatEase Team</p>
                </div>
            </div>
        </div>`,
        },
        {
          type: "sms",
          phone: customer.phone,
          message: `Order Confirmation: Your order #${newOrder._id} has been placed successfully. Total: $${newOrder.totalPrice}. We'll notify you when the restaurant confirms. Thank you!`,
        },
        {
          type: "whatsapp",
          phone: customer.phone,
          message: `🍽️ *Order Confirmation*

Hello ${customer.name},

Your order has been placed successfully!

📋 *Order Details:*
Order ID: #${newOrder._id}
Total Amount: $${newOrder.totalPrice}
Status: *${newOrder.status}*

We'll notify you once the restaurant confirms your order.

Thank you for choosing our service! `,
        },
      ];

      await axios.post(
        `${NOTIFICATION_SERVICE_URL}/api/notifications`,
        {
          userId: newOrder.customer,
          notifications,
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      console.log(" Order confirmation notifications sent successfully");
    } catch (error) {
      console.error("Error sending order confirmation notifications:", error);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error placing order:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error placing order",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
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
      console.error("Order not found:", id);
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user has authorization to update orders
    if (!["admin", "restaurant_admin", "delivery_personnel"].includes(role)) {
      console.error("Unauthorized role for status update:", role);
      return res
        .status(403)
        .json({ message: "Unauthorized to update order status" });
    }

    // Create a delivery record if this is a delivery personnel marking an order as "On the Way"
    if (
      role === "delivery_personnel" &&
      status === "Delivery Accepted" &&
      order.status === "Out for Delivery"
    ) {
      try {
        if (!DELIVERY_SERVICE_URL) {
          console.error(
            "DELIVERY_SERVICE_URL is not set in environment variables"
          );
          return res.status(500).json({
            message: "Delivery service not configured",
            details: "DELIVERY_SERVICE_URL is not set",
          });
        }

        console.log("📝 Creating delivery record...");
        console.log("Order ID:", order._id);
        console.log("Driver ID:", userId);
        console.log("Delivery Service URL:", DELIVERY_SERVICE_URL);

        // Create delivery record with correct endpoint
        const deliveryResponse = await axios.post(
          `${DELIVERY_SERVICE_URL}/api/deliveries/assign-driver`,
          {
            orderId: order._id,
            driverId: userId,
          },
          {
            headers: { Authorization: req.headers.authorization },
          }
        );

        console.log(" Delivery record created:", deliveryResponse.data);
      } catch (error) {
        console.error("Error creating delivery record:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          stack: error.stack,
        });
        return res.status(500).json({
          message: "Error creating delivery record",
          details: error.response?.data || error.message,
        });
      }
    }

    // Update delivery status if this is a delivery personnel marking an order as "Delivered"
    if (
      role === "delivery_personnel" &&
      status === "Delivered" &&
      order.status === "On the Way"
    ) {
      try {
        // Find the delivery record
        const deliveryResponse = await axios.get(
          `${DELIVERY_SERVICE_URL}/api/deliveries/order/${order._id}`,
          {
            headers: { Authorization: req.headers.authorization },
          }
        );

        if (deliveryResponse.data) {
          // Update delivery status to "Delivered"
          await axios.patch(
            `${DELIVERY_SERVICE_URL}/api/deliveries/${deliveryResponse.data._id}`,
            { status: "Delivered" },
            {
              headers: { Authorization: req.headers.authorization },
            }
          );
        }
      } catch (error) {
        console.error("Error updating delivery record:", error);
      }
    }

    // Update the order status
    order.status = status;
    await order.save();

    // Send notification to customer about status update
    try {
      console.log("📧 Sending status update notification to customer...");

      if (!NOTIFICATION_SERVICE_URL) {
        console.error(
          "NOTIFICATION_SERVICE_URL is not set in environment variables"
        );
        return res.status(200).json(order);
      }

      const customerResponse = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/auth/users/${order.customer}`,
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      const customer = customerResponse.data;
      console.log("Customer details:", customer);

      const statusMessages = {
        Confirmed: "has been confirmed by the restaurant",
        Preparing: "is now being prepared",
        "Out for Delivery": "is on its way to you",
        "On the Way": "is now on its way to you",
        Delivered: "has been delivered successfully",
        Cancelled: "has been cancelled",
        Pending: "is now pending",
      };

      // Default message if status is not in the predefined list
      const statusMessage = statusMessages[status] || "has been updated";

      const notifications = [
        {
          type: "email",
          email: customer.email,
          subject: "Order Status Update - EatEase",
          message: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h2 style="color: #333333; margin-bottom: 20px;">Order Status Update</h2>
                  
                  <p style="color: #666666; margin-bottom: 20px;">Dear ${customer.name},</p>
                  
                  <p style="color: #666666; margin-bottom: 20px;">Your order status has been updated!</p>
                  
                  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                      <h3 style="color: #333333; margin-bottom: 15px;">Order Details</h3>
                      <p style="color: #666666; margin: 5px 0;"><strong>Order ID:</strong> #${order._id}</p>
                      <p style="color: #666666; margin: 5px 0;"><strong>New Status:</strong> ${status}</p>
                      <p style="color: #666666; margin: 5px 0;">Your order ${statusMessage}</p>
                  </div>
                  
                  <p style="color: #666666; margin-bottom: 20px;">We'll keep you updated on your order's progress.</p>
                  
                  <div style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 20px;">
                      <p style="color: #999999; margin: 0;">Best regards,<br>EatEase Team</p>
                  </div>
              </div>
          </div>`,
        },
        {
          type: "sms",
          phone: customer.phone,
          message: `Order Update: Your order #${order._id} ${statusMessage}. We'll notify you of any further updates.`,
        },
        {
          type: "whatsapp",
          phone: customer.phone,
          message: `📦 *Order Status Update*

Hello ${customer.name},

Your order status has been updated!

📋 *Order Details:*
Order ID: #${order._id}
Status: *${status}*
Your order ${statusMessage}

We'll keep you updated on your order's progress.

Thank you for choosing our service! `,
        },
      ];

      await axios.post(
        `${NOTIFICATION_SERVICE_URL}/api/notifications`,
        {
          userId: order.customer,
          notifications,
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      console.log(" Status update notifications sent successfully");
    } catch (error) {
      console.error("Error sending status update notifications:", error);
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error updating order",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

//  Cancel an Order (Only if Status is `Pending`)
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
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order" });
  }
};

//  Track Order Status
const trackOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ status: order.status });
  } catch (error) {
    console.error("Error tracking order:", error);
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
