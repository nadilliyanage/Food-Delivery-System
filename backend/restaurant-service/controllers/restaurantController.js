const Restaurant = require("../models/Restaurant");
const Menu = require("../models/Menu");
const axios = require("axios");

// Get All Restaurants
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      isActive: true,
      registrationStatus: "approved",
    });
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};

// Get Restaurants Owned by Logged-in User
const getUserRestaurants = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's restaurants with all details, sorted by most recent first
    const restaurants = await Restaurant.find({ owner: userId })
      .sort({ createdAt: -1 })
      .populate("menu"); // Populate the menu items

    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Error getting user restaurants:", error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};

// Get Restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "menu"
    );
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};

// Create a Restaurant
const createRestaurant = async (req, res) => {
  try {
    const { name, location } = req.body;
    const newRestaurant = new Restaurant({
      name,
      location,
      owner: req.user.id,
    });
    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(500).json({ message: "Error creating restaurant" });
  }
};

// Update a Restaurant
const updateRestaurant = async (req, res) => {
  try {
    const { isActive } = req.body;
    console.log("Update request received:", req.body);

    // If isActive is being updated, only update that field
    if (typeof isActive === "boolean") {
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
      );

      if (!updatedRestaurant) {
        console.log("Restaurant not found for isActive update");
        return res.status(404).json({ message: "Restaurant not found" });
      }

      console.log("Restaurant isActive updated successfully");
      return res.json(updatedRestaurant);
    }

    // For other updates, validate the data first
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      console.log("Restaurant not found for full update");
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if user owns the restaurant
    if (restaurant.owner.toString() !== req.user.id) {
      console.log("Unauthorized update attempt");
      return res
        .status(403)
        .json({ message: "Not authorized to update this restaurant" });
    }

    // Update the restaurant with validated data
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    console.log("Restaurant updated successfully:", updatedRestaurant);
    res.json(updatedRestaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({
      message: "Error updating restaurant",
      error: error.message,
    });
  }
};

// Delete a Restaurant
const deleteRestaurant = async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting restaurant" });
  }
};

// Get Menu Items for a Restaurant
const getMenuItems = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItems = await Menu.find({ restaurant: req.params.id });
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: "Error fetching menu items" });
  }
};

// Add Menu Item to Restaurant
const addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if user owns the restaurant
    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to add menu items to this restaurant",
      });
    }

    const { name, description, price, category, imageUrl } = req.body;
    const menuItem = new Menu({
      restaurant: req.params.id,
      name,
      description,
      price,
      category,
      imageUrl,
    });

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ message: "Error adding menu item" });
  }
};

// Delete Menu Item from Restaurant
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if user owns the restaurant
    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete menu items from this restaurant",
      });
    }

    await Menu.findByIdAndDelete(req.params.menuItemId);
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ message: "Error deleting menu item" });
  }
};

// Register a new restaurant
const registerRestaurant = async (req, res) => {
  try {
    console.log("Registration request received:", req.body);
    const userId = req.user.id; // From auth middleware
    console.log("User ID from token:", userId);

    // Verify user exists by making a request to auth service
    try {
      console.log("Verifying user with auth service...");
      const userResponse = await axios.get(
        `http://localhost:3001/api/auth/users/${userId}`,
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );

      if (!userResponse.data) {
        console.log("User not found in auth service");
        return res.status(404).json({ message: "User not found" });
      }
      console.log("User verified successfully");
    } catch (error) {
      console.error(
        "Error verifying user:",
        error.response?.data || error.message
      );
      return res.status(500).json({
        message: "Error verifying user",
        error: error.response?.data || error.message,
      });
    }

    // Check if user has a pending restaurant registration
    console.log("Checking for existing restaurant registration...");
    const existingRestaurant = await Restaurant.findOne({
      owner: userId,
      registrationStatus: "pending",
    });

    if (existingRestaurant) {
      console.log("User already has a pending restaurant registration");
      return res.status(400).json({
        message: "You already have a pending restaurant registration",
      });
    }
    console.log("No pending registration found");

    console.log("Creating new restaurant...");
    const restaurant = new Restaurant({
      ...req.body,
      owner: userId,
      registrationStatus: "pending",
    });

    console.log("Saving restaurant to database...");
    await restaurant.save();
    console.log("Restaurant saved successfully");

    res.status(201).json({
      message: "Restaurant registration submitted successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Error registering restaurant:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    res.status(500).json({
      message: "Error registering restaurant",
      error: error.message,
      details: error.response?.data || error.stack,
    });
  }
};

// Get all pending restaurant registrations (admin only)
const getPendingRegistrations = async (req, res) => {
  try {
    const pendingRestaurants = await Restaurant.find({
      registrationStatus: "pending",
    });
    res.json(pendingRestaurants);
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    res.status(500).json({
      message: "Error fetching pending registrations",
      error: error.message,
    });
  }
};

// Update restaurant registration status (admin only)
const updateRegistrationStatus = async (req, res) => {
  try {
    const { restaurantId, status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.registrationStatus = status;
    await restaurant.save();

    // If approved, update user role to restaurant_admin
    if (status === "approved") {
      try {
        await axios.patch(
          `http://localhost:3000/api/auth/users/${restaurant.owner}`,
          { role: "restaurant_admin" },
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );
      } catch (error) {
        console.error("Error updating user role:", error);
        // Continue even if role update fails
      }
    }

    // If rejected or moving back to pending, check for other approved restaurants before changing role
    if (status === "rejected" || status === "pending") {
      try {
        // Check if user has any other approved restaurants
        const otherApprovedRestaurants = await Restaurant.find({
          owner: restaurant.owner,
          _id: { $ne: restaurant._id },
          registrationStatus: "approved",
        });

        // Only change role to customer if there are no other approved restaurants
        if (otherApprovedRestaurants.length === 0) {
          await axios.patch(
            `http://localhost:3000/api/auth/users/${restaurant.owner}`,
            { role: "customer" },
            {
              headers: {
                Authorization: req.headers.authorization,
              },
            }
          );
        }
      } catch (error) {
        console.error("Error updating user role:", error);
        // Continue even if role update fails
      }
    }

    res.json({
      message: "Registration status updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Error updating registration status:", error);
    res.status(500).json({
      message: "Error updating registration status",
      error: error.message,
    });
  }
};

// Get all approved restaurant registrations (admin only)
const getApprovedRegistrations = async (req, res) => {
  try {
    const approvedRestaurants = await Restaurant.find({
      registrationStatus: "approved",
    });
    res.json(approvedRestaurants);
  } catch (error) {
    console.error("Error fetching approved registrations:", error);
    res.status(500).json({
      message: "Error fetching approved registrations",
      error: error.message,
    });
  }
};

// Get all rejected restaurant registrations (admin only)
const getRejectedRegistrations = async (req, res) => {
  try {
    const rejectedRestaurants = await Restaurant.find({
      registrationStatus: "rejected",
    });
    res.json(rejectedRestaurants);
  } catch (error) {
    console.error("Error fetching rejected registrations:", error);
    res.status(500).json({
      message: "Error fetching rejected registrations",
      error: error.message,
    });
  }
};

const getRestaurantsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // If category is 'All', return all restaurants
    if (category === "All") {
      const restaurants = await Restaurant.find({});
      return res.status(200).json(restaurants);
    }

    // Find all menu items in the specified category
    const menuItems = await Menu.find({
      category: category,
      isAvailable: true,
    }).populate("restaurant");

    // Get unique restaurants from the menu items
    const restaurants = menuItems.reduce((acc, menuItem) => {
      if (
        menuItem.restaurant &&
        !acc.some(
          (r) => r._id.toString() === menuItem.restaurant._id.toString()
        )
      ) {
        acc.push(menuItem.restaurant);
      }
      return acc;
    }, []);

    if (restaurants.length === 0) {
      return res.status(200).json([]); // Return empty array instead of 404
    }

    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Error in getRestaurantsByCategory:", error);
    res.status(500).json({
      message: "Error fetching restaurants by category",
      error: error.message,
    });
  }
};

module.exports = {
  getRestaurants,
  getUserRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMenuItems,
  addMenuItem,
  deleteMenuItem,
  registerRestaurant,
  getPendingRegistrations,
  updateRegistrationStatus,
  getApprovedRegistrations,
  getRejectedRegistrations,
  getRestaurantsByCategory,
};
