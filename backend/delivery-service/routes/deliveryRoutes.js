const express = require("express");
const {
  getUserDeliveries,
  assignDriver,
  updateDeliveryStatus,
  trackDelivery,
} = require("../controllers/deliveryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getUserDeliveries);
router.put("/:id/assign", authMiddleware, assignDriver);
router.put("/:id/status", authMiddleware, updateDeliveryStatus);
router.get("/:id/track", authMiddleware, trackDelivery);

module.exports = router;
