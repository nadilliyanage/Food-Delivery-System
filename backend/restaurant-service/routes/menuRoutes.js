const express = require("express");
const {
  getAllMenus,
  getMenusByRestaurant,
  getMenuById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllMenus);
router.get("/restaurant/:restaurantId", getMenusByRestaurant);
router.get("/:id", getMenuById);
router.post("/:restaurantId", authMiddleware, addMenuItem);
router.put("/:id", authMiddleware, updateMenuItem);
router.delete("/:id", authMiddleware, deleteMenuItem);

module.exports = router;
