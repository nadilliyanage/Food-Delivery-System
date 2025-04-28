const express = require("express");
const {
  getUserOrders,
  getOrderById,
  placeOrder,
  updateOrder,
  cancelOrder,
  getOrders,
  getRestaurantOrders,
  getOutForDeliveryOrders,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/middleware");

const router = express.Router();

// Get all orders (admin only)
router.get("/all", authMiddleware, getOrders);

// Get user's orders
router.get("/", authMiddleware, getUserOrders);

// Get specific order
router.get("/:id", authMiddleware, getOrderById);

// Place new order
router.post("/", authMiddleware, placeOrder);

// Update order status
router.patch("/:id", authMiddleware, updateOrder);

// Cancel order
router.delete("/:id", authMiddleware, cancelOrder);

//  Delivery Personnel Route: Fetch Order by ID
router.get("/:id/delivery", authMiddleware, getOrderById);

// Get restaurant orders
router.get("/restaurant/:restaurantId", authMiddleware, getRestaurantOrders);

// Get orders that are out for delivery
router.get("/delivery/out-for-delivery", getOutForDeliveryOrders);

module.exports = router;
