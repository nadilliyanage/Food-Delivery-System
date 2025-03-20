require("dotenv").config();

module.exports = {
  authService: process.env.AUTH_SERVICE_URL,
  //   orderService: process.env.ORDER_SERVICE_URL || "http://localhost:5002",
  //   restaurantService:
  //     process.env.RESTAURANT_SERVICE_URL || "http://localhost:5003",
  //   deliveryService: process.env.DELIVERY_SERVICE_URL || "http://localhost:5004",
};
