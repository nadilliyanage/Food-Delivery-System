const express = require("express");
const {
  sendNotification,
  getUserNotifications,
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, sendNotification);
router.get("/", authMiddleware, getUserNotifications);

module.exports = router;
