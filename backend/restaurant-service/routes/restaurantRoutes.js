const express = require("express");
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getUserRestaurants,
  getMenuItems,
  registerRestaurant,
  getPendingRegistrations,
  updateRegistrationStatus,
  getApprovedRegistrations,
  getRejectedRegistrations
} = require("../controllers/restaurantController");
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

// Public routes
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);

// Protected routes (require authentication)
router.use(authMiddleware);

// Restaurant registration
router.post("/register", registerRestaurant);

// Restaurant owner routes
router.get("/user/restaurants", getUserRestaurants);
router.post("/", createRestaurant);
router.put("/:id", updateRestaurant);
router.delete("/:id", deleteRestaurant);
router.get("/:id/menu", getMenuItems);

// Admin routes
router.get("/admin/pending-registrations", isAdmin, getPendingRegistrations);
router.get("/admin/approved-registrations", isAdmin, getApprovedRegistrations);
router.get("/admin/rejected-registrations", isAdmin, getRejectedRegistrations);
router.put("/admin/registration-status", isAdmin, updateRegistrationStatus);

module.exports = router;
