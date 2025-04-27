const express = require("express");
const {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, sendNotification);
router.get("/", authMiddleware, getUserNotifications);
router.patch("/:notificationId/read", authMiddleware, markNotificationAsRead);
router.patch("/mark-all-read", authMiddleware, markAllNotificationsAsRead);
router.delete("/:notificationId", authMiddleware, deleteNotification);

module.exports = router;
