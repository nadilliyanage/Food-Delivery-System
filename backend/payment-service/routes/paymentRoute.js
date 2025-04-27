const express = require("express");
const {
  createPayment,
  checkPaymentStatus,
  refundPayment,
  handleStripeWebhook,
} = require("../controllers/paymentController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const bodyParser = require('body-parser');

// Webhook endpoint - must be before bodyParser.json() middleware
router.post('/webhook', 
  bodyParser.raw({ type: 'application/json' }), 
  handleStripeWebhook
);

// Regular API endpoints
router.use(bodyParser.json());

//create payment
router.post("/", authMiddleware, createPayment);

//check payment status
router.get("/:orderId", authMiddleware, checkPaymentStatus);

//refund payment
router.post("/:orderId/refund", authMiddleware, refundPayment);

module.exports = router;