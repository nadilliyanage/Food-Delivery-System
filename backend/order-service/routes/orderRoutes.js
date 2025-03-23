const express = require("express");
const {
  getUserOrders,
  getOrderById,
  placeOrder,
  updateOrder,
  cancelOrder,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/middleware");

const router = express.Router();

router.get("/", authMiddleware, getUserOrders);
router.get("/:id", authMiddleware, getOrderById);
router.post("/", authMiddleware, placeOrder);
router.put("/:id", authMiddleware, updateOrder);
router.delete("/:id", authMiddleware, cancelOrder);

// ✅ Delivery Personnel Route: Fetch Order by ID
router.get("/:id/delivery", authMiddleware, getOrderById);

module.exports = router;
