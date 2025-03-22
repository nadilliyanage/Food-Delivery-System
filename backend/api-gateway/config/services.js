require("dotenv").config();

module.exports = {
  authService: `${process.env.AUTH_SERVICE_URL}/api/auth`,
  restaurantService: `${process.env.RESTAURANT_SERVICE_URL}/api/restaurants`,
  restaurantMenuService: `${process.env.RESTAURANT_SERVICE_URL}/api/menu`,
  orderService: `${process.env.ORDER_SERVICE_URL}/api/orders`,
};
