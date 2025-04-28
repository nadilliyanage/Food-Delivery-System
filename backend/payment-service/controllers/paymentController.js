const axios = require("axios");
const Payment = require("../models/Payment");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;
const DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL;

// const createPayment = async (req, res) => {
//   try {
//     const { orderId } = req.body;
//     const userId = req.user.id;

//     //  Get Authorization Token from Header
//     const authToken = req.headers.authorization;

//     // 1. Get cart total from order-service
//     let cartTotal = 0;
//     try {
//       const cartResponse = await axios.get(
//         `${ORDER_SERVICE_URL}/api/cart/`,
//         {
//           headers: {
//             Authorization: authToken,
//           },
//         }
//       );

//       if (cartResponse.data && cartResponse.data.length > 0) {
//         // Sum all cart totals (in case user has carts from multiple restaurants)
//         cartTotal = cartResponse.data.reduce(
//           (total, cart) => total + cart.totalAmount,
//           0
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching cart total:", error.message);
//       return res.status(500).json({ message: "Error fetching cart information" });
//     }

//     // // 2. Get delivery fee from delivery-service
//     // let deliveryFee = 0;
//     // try {
//     //   const deliveryResponse = await axios.get(
//     //     `${DELIVERY_SERVICE_URL}/api/deliveries/order/${orderId}`,
//     //     {
//     //       headers: {
//     //         Authorization: authToken,
//     //       },
//     //     }
//     //   );

//     //   if (deliveryResponse.data && deliveryResponse.data.deliveryFee) {
//     //     deliveryFee = deliveryResponse.data.deliveryFee;
//     //   } else {
//     //     // Default delivery fee if not specified
//     //     deliveryFee = 5.00;
//     //   }
//     // } catch (error) {
//     //   console.error("Error fetching delivery fee, using default:", error.message);
//     //   // Use default delivery fee if error occurs
//     //   deliveryFee = 5.00;
//     // }

//     const deliveryFee = 150.00;

//     // Calculate total amount (cart total + delivery fee)
//     const totalAmount = cartTotal + deliveryFee;
//     const amountInCents = Math.round(totalAmount * 100); // Convert to cents

//     //  Create Payment Intent in Stripe
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amountInCents,
//       currency: "lkr",
//       metadata: {
//         orderId: orderId,
//         deliveryFee: deliveryFee.toFixed(2),
//         cartTotal: cartTotal.toFixed(2),
//       },
//     });

//     //  Save Payment in Database
//     const payment = new Payment({
//       orderId,
//       customer: userId,
//       amount: totalAmount, // Store total amount (cart + delivery)
//       cartAmount: cartTotal, // Store cart amount separately
//       deliveryFee: deliveryFee, // Store delivery fee separately
//       originalOrderAmount: totalAmount, // Add this required field
//       status: "pending",
//       stripePaymentIntentId: paymentIntent.id,
//     });

//     await payment.save();

//     res.status(201).json({
//       message: "Payment initiated",
//       clientSecret: paymentIntent.client_secret,
//       totalAmount: totalAmount.toFixed(2),
//       cartAmount: cartTotal.toFixed(2),
//       deliveryFee: deliveryFee.toFixed(2),
//     });
//   } catch (error) {
//     console.error("Error creating payment:", error);
//     res.status(500).json({ message: "Payment processing failed" });
//   }
// };

const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;
    const authToken = req.headers.authorization;

    // Validate required fields
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    // 1. Get cart total from order-service
    let cartTotal = 0;
    try {
      const cartResponse = await axios.get(`${ORDER_SERVICE_URL}/api/cart/`, {
        headers: { Authorization: authToken },
      });

      if (cartResponse.data && cartResponse.data.length > 0) {
        cartTotal = cartResponse.data.reduce(
          (total, cart) => total + cart.totalAmount,
          0
        );
      }
    } catch (error) {
      console.error("Error fetching cart total:", error.message);
      return res
        .status(500)
        .json({ message: "Error fetching cart information" });
    }

    const deliveryFee = 150.0; // Fixed delivery fee in LKR
    const totalAmount = cartTotal + deliveryFee;
    const amountInCents = Math.round(totalAmount * 100); // Convert to cents

    // Create Payment Intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "lkr", // Ensure currency is LKR
      metadata: {
        orderId: orderId,
        customerId: userId,
        deliveryFee: deliveryFee.toFixed(2),
        cartTotal: cartTotal.toFixed(2),
      },
      description: `Payment for order ${orderId}`,
    });

    // Save Payment in Database
    const payment = new Payment({
      orderId,
      customer: userId,
      amount: totalAmount,
      cartAmount: cartTotal,
      deliveryFee: deliveryFee,
      originalOrderAmount: totalAmount,
      currency: "LKR", // Explicitly set currency
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
    });

    await payment.save();

    res.status(201).json({
      message: "Payment initiated",
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      totalAmount: totalAmount.toFixed(2),
      cartAmount: cartTotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      message: "Payment processing failed",
      error: error.message,
    });
  }
};

// Add webhook handler for Stripe events
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_SECRET_KEY
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    case "payment_intent.payment_failed":
      const paymentFailed = event.data.object;
      await handlePaymentFailure(paymentFailed);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

const handlePaymentSuccess = async (paymentIntent) => {
  try {
    // Update payment status in database
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: "completed" },
      { new: true }
    );

    if (payment) {
      // Update order status to confirmed
      await axios.patch(
        `${ORDER_SERVICE_URL}/api/orders/${payment.orderId}`,
        { status: "Confirmed" },
        { headers: { Authorization: `Bearer ${process.env.JWT_SECRET}` } }
      );
    }
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
};

const handlePaymentFailure = async (paymentIntent) => {
  try {
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: "failed" }
    );
  } catch (error) {
    console.error("Error handling payment failure:", error);
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
    console.error("Error checking payment status:", error);
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
    console.error("Error refunding payment:", error);
    res.status(500).json({ message: "Refund processing failed" });
  }
};

module.exports = {
  createPayment,
  checkPaymentStatus,
  refundPayment,
  handleStripeWebhook,
};
