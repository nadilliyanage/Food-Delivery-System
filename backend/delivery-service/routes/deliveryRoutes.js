const express = require("express");
const {
  assignDriver,
  getUserDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  deleteDelivery,
  getDeliveryLocation,
  simulateDeliveryMovement,
} = require("../controllers/deliveryController");
const {
  registerDeliveryPersonnel,
  getPendingRegistrations,
  getApprovedRegistrations,
  getRejectedRegistrations,
  updateRegistrationStatus,
  getProfile,
  updateProfile,
  getUserRegistrations,
} = require("../controllers/deliveryPersonnelController");
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

// Delivery Personnel Registration
router.post("/register", authMiddleware, registerDeliveryPersonnel);

// Get user's delivery personnel registrations
router.get(
  "/user/delivery-personnel-registrations",
  authMiddleware,
  getUserRegistrations
);

// Delivery Personnel routes
router.get(
  "/admin/pending-registrations",
  [authMiddleware, isAdmin],
  getPendingRegistrations
);
router.get(
  "/admin/approved-registrations",
  [authMiddleware, isAdmin],
  getApprovedRegistrations
);
router.get(
  "/admin/rejected-registrations",
  [authMiddleware, isAdmin],
  getRejectedRegistrations
);
router.patch(
  "/admin/registration-status",
  [authMiddleware, isAdmin],
  updateRegistrationStatus
);

// Delivery routes (must come after specific routes)
router.get("/:id", authMiddleware, getDeliveryById);
router.get("/user/deliveries", authMiddleware, getUserDeliveries);
router.post("/assign-driver", authMiddleware, assignDriver);
router.patch("/:id/status", authMiddleware, updateDeliveryStatus);
router.delete("/:id", authMiddleware, deleteDelivery);

// New route for getting delivery location
router.get("/order/:orderId/location", authMiddleware, getDeliveryLocation);

// New route for simulating delivery movement
router.post(
  "/order/:orderId/simulate",
  authMiddleware,
  simulateDeliveryMovement
);

module.exports = router;
