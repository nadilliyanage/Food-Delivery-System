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
  updateRegistrationStatus,
  getProfile,
  updateProfile,
} = require("../controllers/deliveryPersonnelController");
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

// Protected routes (require authentication)
router.use(authMiddleware);

// Delivery Personnel Registration
router.post("/register", registerDeliveryPersonnel);

// Delivery Personnel routes
router.get("/user/deliveries", getUserDeliveries);
router.post("/", assignDriver);

// Profile routes (must come before /:id route)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin routes
router.get("/admin/pending-registrations", isAdmin, getPendingRegistrations);
router.get("/admin/approved-registrations", isAdmin, getApprovedRegistrations);
router.get("/admin/rejected-registrations", isAdmin, getRejectedRegistrations);
router.put("/admin/registration-status", isAdmin, updateRegistrationStatus);

// Delivery routes (must come after specific routes)
router.get("/:id", getDeliveryById);
router.put("/:id", updateDeliveryStatus);
router.delete("/:id", deleteDelivery);

module.exports = router;
