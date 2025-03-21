require("dotenv").config();

module.exports = {
  authService: process.env.AUTH_SERVICE_URL,
  restaurantService: process.env.RESTAURANT_SERVICE_URL,
  restaurantMenuService: process.env.RESTAURANT_SERVICE_MENU_URL,
};
