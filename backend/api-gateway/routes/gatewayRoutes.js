const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const services = require("../config/services");

const router = express.Router();

// Function to Proxy Requests
const createServiceProxy = (serviceUrl) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    onProxyReq: (proxyReq, req) => {
      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }
    },
  });
};

// API Gateway Routes
router.use("/api/auth", createServiceProxy(services.authService));
router.use("/api/restaurants", createServiceProxy(services.restaurantService));
router.use("/api/menu", createServiceProxy(services.restaurantMenuService));
router.use("/api/orders", createServiceProxy(services.orderService));
router.use("/api/cart", createServiceProxy(services.cartService));
router.use("/api/deliveries", createServiceProxy(services.deliveryService));
router.use("/api/payment", createServiceProxy(services.paymentService));
router.use(
  "/api/notifications",
  createServiceProxy(services.notificationService)
);

module.exports = router;
