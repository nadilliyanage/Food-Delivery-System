const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const services = require("../config/services");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Proxy to Authentication Service
router.use(
  "/api/auth",
  createProxyMiddleware({ target: services.authService, changeOrigin: true })
);

// // Proxy to Order Service (Protected)
// router.use(
//   "/api/orders",
//   authMiddleware,
//   createProxyMiddleware({ target: services.orderService, changeOrigin: true })
// );

// Proxy to Restaurant Service (Protected)
router.use(
  "/api/restaurants",
  authMiddleware,
  createProxyMiddleware({
    target: services.restaurantService,
    changeOrigin: true,
  })
);

// Proxy to Menu Service (Protected)
router.use(
  "/api/menu",
  authMiddleware,
  createProxyMiddleware({
    target: services.restaurantService,
    changeOrigin: true,
  })
);
// // Proxy to Delivery Service (Protected)
// router.use(
//   "/api/delivery",
//   authMiddleware,
//   createProxyMiddleware({
//     target: services.deliveryService,
//     changeOrigin: true,
//   })
// );

module.exports = router;
