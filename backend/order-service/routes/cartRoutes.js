const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const auth = require("../middleware/middleware");

// All routes require authentication
router.use(auth);

// Get all carts for user
router.get("/", cartController.getCart);

// Add item to cart
router.post("/add", cartController.addToCart);

// Update cart item quantity
router.patch("/update", cartController.updateCartItem);

// Remove item from cart
router.delete(
  "/remove/:restaurantId/:menuItemId",
  cartController.removeFromCart
);

// Clear specific restaurant cart
router.delete("/clear/:restaurantId", cartController.clearCart);

module.exports = router;
