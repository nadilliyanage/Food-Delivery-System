const express = require("express");
const {
  assignDriver,
  getUserDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  deleteDelivery,
} = require("../controllers/deliveryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Delivery Routes
router.post("/", authMiddleware, assignDriver);
router.get("/", authMiddleware, getUserDeliveries);
router.get("/:id", authMiddleware, getDeliveryById);
router.put("/:id", authMiddleware, updateDeliveryStatus);
router.delete("/:id", authMiddleware, deleteDelivery);

module.exports = router;
