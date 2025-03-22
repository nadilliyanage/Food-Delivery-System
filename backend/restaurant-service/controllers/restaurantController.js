const Restaurant = require("../models/Restaurant");
const Menu = require("../models/Menu");

// Get All Restaurants
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};

// Get Restaurants Owned by Logged-in User
const getUserRestaurants = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token
    const restaurants = await Restaurant.find({ owner: userId }).populate(
      "menu"
    );
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching user restaurants:", error);
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
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRestaurant)
      return res.status(404).json({ message: "Restaurant not found" });
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ message: "Error updating restaurant" });
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

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getUserRestaurants,
};
