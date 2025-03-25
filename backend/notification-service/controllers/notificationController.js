const Notification = require("../models/Notification");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
require("dotenv").config();

// ✅ Setup Email Transporter (Nodemailer)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Setup Twilio Client (SMS)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ✅ Send Email Notification
const sendEmail = async (email, message) => {
  if (!email) return false;

  try {
    let info = await transporter.sendMail({
      from: `"Food Delivery" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Order Notification",
      text: message,
    });

    console.log(`📧 Email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return false;
  }
};

// ✅ Send SMS Notification
const sendSMS = async (phone, message) => {
  if (!phone) return false;

  try {
    let smsResponse = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    console.log(`📱 SMS sent to ${phone}: ${smsResponse.sid}`);
    return true;
  } catch (error) {
    console.error("❌ SMS sending failed:", error.message);
    return false;
  }
};

// ✅ Send Notification API
const sendNotification = async (req, res) => {
  try {
    const { userId, type, message, email, phone } = req.body;

    if (!userId || !type || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let success = false;
    if (type === "email") success = await sendEmail(email, message);
    if (type === "sms") success = await sendSMS(phone, message);

    const notification = new Notification({
      userId,
      type,
      message,
      status: success ? "Sent" : "Failed",
    });

    await notification.save();
    res.status(201).json({
      message: `Notification ${success ? "sent" : "failed"}`,
      notification,
    });
  } catch (error) {
    console.error("❌ Error processing notification:", error);
    res.status(500).json({ message: "Error sending notification" });
  }
};

// ✅ Get Notifications for a User
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    res.json(notifications);
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

module.exports = { sendNotification, getUserNotifications };
