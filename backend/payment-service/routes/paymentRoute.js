const express = require("express");
const {
  createPayment,
  checkPaymentStatus,
  refundPayment,
} = require("../controllers/paymentController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

//create payment
router.post("/", authMiddleware, createPayment);

//check payment status
router.get("/:orderId", authMiddleware, checkPaymentStatus);

//refund payment
router.post("/:orderId/refund", authMiddleware, refundPayment);

module.exports = router;