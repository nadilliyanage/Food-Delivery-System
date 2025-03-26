const express = require("express");
const {
  assignDriver,
  getUserDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  deleteDelivery,
} = require("../controllers/deliveryController");
const {
  registerDeliveryPersonnel,
  getPendingRegistrations,
  getApprovedRegistrations,
  getRejectedRegistrations,
  updateRegistrationStatus
} = require("../controllers/deliveryPersonnelController");
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

// ✅ Delivery Personnel Registration Routes
router.post("/register", authMiddleware, registerDeliveryPersonnel);
router.get("/admin/pending-registrations", authMiddleware, isAdmin, getPendingRegistrations);
router.get("/admin/approved-registrations", authMiddleware, isAdmin, getApprovedRegistrations);
router.get("/admin/rejected-registrations", authMiddleware, isAdmin, getRejectedRegistrations);
router.put("/admin/registration-status", authMiddleware, isAdmin, updateRegistrationStatus);

// ✅ Delivery Routes
router.post("/", authMiddleware, assignDriver);
router.get("/", authMiddleware, getUserDeliveries);
router.get("/:id", authMiddleware, getDeliveryById);
router.put("/:id", authMiddleware, updateDeliveryStatus);
router.delete("/:id", authMiddleware, deleteDelivery);

module.exports = router;
