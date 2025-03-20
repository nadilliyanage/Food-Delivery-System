const express = require("express");
const { addMenuItem, getMenuItems } = require("../controllers/menuController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addMenuItem);
router.get("/:restaurantId", getMenuItems);

module.exports = router;
