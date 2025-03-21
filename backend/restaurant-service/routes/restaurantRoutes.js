const express = require("express");
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getUserRestaurants,
} = require("../controllers/restaurantController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/all", getRestaurants);
router.get("/", authMiddleware, getUserRestaurants);
router.get("/:id", getRestaurantById);
router.post("/", authMiddleware, createRestaurant);
router.put("/:id", authMiddleware, updateRestaurant);
router.delete("/:id", authMiddleware, deleteRestaurant);

module.exports = router;
