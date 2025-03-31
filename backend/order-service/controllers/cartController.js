const Cart = require('../models/Cart');
const axios = require('axios');

// Get all carts for a user
exports.getCart = async (req, res) => {
  try {
    const carts = await Cart.find({ userId: req.user.id });
    res.json(carts);
  } catch (error) {
    console.error('Cart Error:', error);
    res.status(500).json({ message: 'Error fetching carts', error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity = 1, restaurantId } = req.body;
    
    // Get menu item from restaurant service
    const menuItemResponse = await axios.get(`${process.env.RESTAURANT_SERVICE_URL}/api/menu/${menuItemId}`);
    const menuItem = menuItemResponse.data;
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Get restaurant information
    const restaurantResponse = await axios.get(`${process.env.RESTAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`);
    const restaurant = restaurantResponse.data;

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Find or create cart for this restaurant
    let cart = await Cart.findOne({ 
      userId: req.user.id,
      restaurantId: restaurantId
    });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        restaurantId: restaurantId,
        restaurantName: restaurant.name,
        restaurantImage: restaurant.imageUrl,
        deliveryLocation: req.user.address || 'Padukka',
        items: [],
        totalAmount: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === menuItemId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        menuItemId,
        quantity,
        price: menuItem.price,
        name: menuItem.name,
        imageUrl: menuItem.imageUrl
      });
    }

    // Update total amount
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Add to Cart Error:', error);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Menu item or restaurant not found' });
    }
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { menuItemId, quantity, restaurantId } = req.body;
    
    const cart = await Cart.findOne({ 
      userId: req.user.id,
      restaurantId: restaurantId
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === menuItemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity < 1) {
      cart.items.splice(itemIndex, 1);
      
      // If cart is empty after removing item, delete the cart
      if (cart.items.length === 0) {
        await Cart.deleteOne({ _id: cart._id });
        return res.json({ message: 'Cart deleted' });
      }
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Update Cart Error:', error);
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { menuItemId, restaurantId } = req.params;
    
    const cart = await Cart.findOne({ 
      userId: req.user.id,
      restaurantId: restaurantId
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.menuItemId.toString() !== menuItemId
    );

    // If cart is empty after removing item, delete the cart
    if (cart.items.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
      return res.json({ message: 'Cart deleted' });
    }

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Remove from Cart Error:', error);
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

// Clear cart for a specific restaurant
exports.clearCart = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    await Cart.deleteOne({ 
      userId: req.user.id,
      restaurantId: restaurantId
    });

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear Cart Error:', error);
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
}; 