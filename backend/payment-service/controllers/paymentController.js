const axios = require("axios");
const Payment = require("../models/Payment");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//create payment
const createPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    //verify order from order service
    const authToken = req.headers.authorization;
    const paymentResponse = await axios.get(
      `${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}`,
      {
        headers: {
          Authorization: authToken,
        },
      }
    );

    if (!paymentResponse.data.success) {
      return res.status(404).json({ error: "Invalid order" });
    }

    //create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });

    //save payment to database
    const payment = new Payment({
      orderId,
      customer: req.user.id,
      amount,
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
    });

    await payment.save();
    res
      .status(201)
      .json({
        message: "Payment initiated",
        clientSecret: paymentIntent.client_secret,
      });
  } catch (error) {
    console.error("❌ Error creating payment:", error);
    res.status(500).json({ message: "Payment processing failed" });
  }
};

//check payment status
const checkPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    res.status(500).json({ message: "Payment status check failed" });
  }
};

//refund payment
const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });

    if (!payment || payment.status !== "Completed") {
      return res.status(404).json({ error: "Payment not found" });
    }

    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });

    payment.status = "Refunded";
    await payment.save();
    res.json({ message: "Refund successful", payment });
  } catch (error) {
    console.error("❌ Error refunding payment:", error);
    res.status(500).json({ message: "Refund processing failed" });
  }
};

module.exports = {
  createPayment,
  checkPaymentStatus,
  refundPayment,
};
