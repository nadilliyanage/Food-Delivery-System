const Notification = require("../models/Notification");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
require("dotenv").config();
const mongoose = require("mongoose");

// Setup Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Setup Twilio Client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send Email Notification
const sendEmail = async (email, subject, message) => {
  if (!email) return false;

  try {
    const info = await transporter.sendMail({
      from: `"EatEase" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: message,
      html: `<p>${message}</p>`,
    });

    console.log(`Email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    return false;
  }
};

// Send SMS Notification
const sendSMS = async (phone, message) => {
  if (!phone) return false;

  try {
    // Format phone number
    let smsNumber = phone;
    smsNumber = smsNumber.replace(/[\s-]/g, "");

    if (smsNumber.startsWith("94")) {
      smsNumber = "+" + smsNumber;
    } else if (smsNumber.startsWith("0")) {
      smsNumber = "+94" + smsNumber.substring(1);
    } else if (!smsNumber.startsWith("+")) {
      smsNumber = "+94" + smsNumber;
    }

    const smsResponse = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: smsNumber,
    });

    console.log(`SMS sent to ${smsNumber}: ${smsResponse.sid}`);
    return true;
  } catch (error) {
    console.error("SMS sending failed:", error.message);
    return false;
  }
};

// Send WhatsApp Notification
const sendWhatsApp = async (phone, message) => {
  if (!phone) return false;

  try {
    // Format phone number
    let whatsappNumber = phone;
    whatsappNumber = whatsappNumber.replace(/[\s-]/g, "");

    if (whatsappNumber.startsWith("94")) {
      whatsappNumber = "+" + whatsappNumber;
    } else if (whatsappNumber.startsWith("0")) {
      whatsappNumber = "+94" + whatsappNumber.substring(1);
    } else if (!whatsappNumber.startsWith("+")) {
      whatsappNumber = "+94" + whatsappNumber;
    }

    if (!whatsappNumber.startsWith("whatsapp:")) {
      whatsappNumber = "whatsapp:" + whatsappNumber;
    }

    const whatsappResponse = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      body: message,
      to: whatsappNumber,
    });

    console.log(
      `WhatsApp message sent to ${whatsappNumber}: ${whatsappResponse.sid}`
    );
    return true;
  } catch (error) {
    console.error("WhatsApp sending failed:", error.message);
    return false;
  }
};

// Send Multiple Notifications
const sendMultipleNotifications = async (notifications) => {
  console.log("Starting multiple notifications...");
  const results = [];

  for (const notification of notifications) {
    const { type, email, phone, subject, message } = notification;
    console.log(`Processing ${type} notification...`);

    try {
      let success = false;
      let error = null;

      if (type === "email" && email) {
        console.log("Sending email to:", email);
        success = await sendEmail(
          email,
          subject || "Order Notification",
          message
        );
        console.log("Email result:", success);
      } else if (type === "sms" && phone) {
        console.log("Sending SMS to:", phone);
        success = await sendSMS(phone, message);
        console.log("SMS result:", success);
      } else if (type === "whatsapp" && phone) {
        console.log("Sending WhatsApp to:", phone);
        success = await sendWhatsApp(phone, message);
        console.log("WhatsApp result:", success);
      } else {
        error = `Invalid notification type or missing required fields for ${type}`;
        console.error(error);
      }

      results.push({ success, error });
    } catch (error) {
      console.error(`Error sending ${type} notification:`, error.message);
      console.error("Error stack:", error.stack);
      results.push({ success: false, error: error.message });
    }
  }

  console.log("All notifications processed:", results);
  return results;
};

// Send Notification
const sendNotification = async (req, res) => {
  try {
    console.log("Starting notification process...");
    console.log("Request body:", req.body);

    const { userId, notifications } = req.body;

    // Validate request format
    if (!userId || !notifications || !Array.isArray(notifications)) {
      console.error("Invalid request format:", {
        hasUserId: !!userId,
        hasNotifications: !!notifications,
        isArray: Array.isArray(notifications),
      });
      return res.status(400).json({
        message: "Invalid request format",
        details: {
          hasUserId: !!userId,
          hasNotifications: !!notifications,
          isArray: Array.isArray(notifications),
        },
      });
    }

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid user ID format:", userId);
      return res.status(400).json({
        message: "Invalid user ID format",
        details: { userId },
      });
    }

    // Validate each notification
    for (const notification of notifications) {
      if (!notification.type || !notification.message) {
        console.error("Invalid notification format:", notification);
        return res.status(400).json({
          message: "Invalid notification format",
          details: { notification },
        });
      }

      if (notification.type === "email" && !notification.email) {
        console.error("Email notification missing email address");
        return res.status(400).json({
          message: "Email notification missing email address",
          details: { notification },
        });
      }

      if (
        (notification.type === "sms" || notification.type === "whatsapp") &&
        !notification.phone
      ) {
        console.error("Phone notification missing phone number");
        return res.status(400).json({
          message: "Phone notification missing phone number",
          details: { notification },
        });
      }
    }

    // Send notifications
    console.log("Sending notifications...");
    const results = await sendMultipleNotifications(notifications);
    console.log("Notification results:", results);

    // Save notification records
    console.log("Saving notification records...");
    const notificationRecords = notifications.map((notification, index) => ({
      userId: new mongoose.Types.ObjectId(userId),
      type: notification.type,
      message: notification.message,
      status: results[index].success ? "Sent" : "Failed",
    }));

    await Notification.insertMany(notificationRecords);
    console.log("Notification records saved");

    res.status(201).json({
      message: "Notifications sent successfully",
      results,
    });
  } catch (error) {
    console.error("Error in sendNotification:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error sending notifications",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

//  Get Notifications for a User
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort(
      { createdAt: -1 }
    );
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Mark Notification as Read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Find the notification and verify it belongs to the user
    const notification = await Notification.findOne({
      _id: notificationId,
      userId: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized",
      });
    }

    // Update the notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

// Mark All Notifications as Read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { userId: userId, isRead: false },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    // Fetch the updated notifications
    const updatedNotifications = await Notification.find({ userId: userId });

    res.json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
      notifications: updatedNotifications,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking all notifications as read",
      error: error.message,
    });
  }
};

// Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Find the notification and verify it belongs to the user
    const notification = await Notification.findOne({
      _id: notificationId,
      userId: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized",
      });
    }

    // Delete the notification
    await Notification.findByIdAndDelete(notificationId);

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
