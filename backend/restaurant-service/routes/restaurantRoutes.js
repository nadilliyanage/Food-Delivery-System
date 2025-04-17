const express = require("express");
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getUserRestaurants,
  getMenuItems,
  addMenuItem,
  deleteMenuItem,
  registerRestaurant,
  getPendingRegistrations,
  updateRegistrationStatus,
  getApprovedRegistrations,
  getRejectedRegistrations,
  getRestaurantsByCategory,
} = require("../controllers/restaurantController");
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

// Public routes
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);
router.get("/category/:category", getRestaurantsByCategory);

// Restaurant registration
router.post("/register", authMiddleware, registerRestaurant);

// Restaurant owner routes
router.get("/user/restaurants", authMiddleware, getUserRestaurants);
router.post("/", authMiddleware, createRestaurant);
router.patch("/:id", authMiddleware, updateRestaurant);
router.delete("/:id", authMiddleware, deleteRestaurant);

// Menu routes
router.get("/:id/menu", getMenuItems);
router.post("/:id/menu", authMiddleware, addMenuItem);
router.delete("/:id/menu/:menuItemId", authMiddleware, deleteMenuItem);

// Admin routes
router.get("/admin/pending-registrations", isAdmin, getPendingRegistrations);
router.get("/admin/approved-registrations", isAdmin, getApprovedRegistrations);
router.get("/admin/rejected-registrations", isAdmin, getRejectedRegistrations);
router.patch("/admin/registration-status", isAdmin, updateRegistrationStatus);

module.exports = router;
