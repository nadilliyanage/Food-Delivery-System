const Restaurant = require("../models/Restaurant");
const Menu = require("../models/Menu");
const axios = require('axios');

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
    const userId = req.user.id;
    
    // Get user's restaurants, sorted by most recent first
    const restaurants = await Restaurant.find({ owner: userId })
      .sort({ createdAt: -1 })
      .select('name registrationStatus createdAt');
    
    res.status(200).json(restaurants);
  } catch (error) {
    console.error('Error getting user restaurants:', error);
    res.status(500).json({ message: 'Error fetching restaurants' });
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

// Get Menu Items for a Restaurant
const getMenuItems = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "menu"
    );
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant.menu);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu items" });
  }
};

// Register a new restaurant
const registerRestaurant = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const userId = req.user.id; // From auth middleware
    console.log('User ID from token:', userId);
    
    // Verify user exists by making a request to auth service
    try {
      console.log('Verifying user with auth service...');
      const userResponse = await axios.get(`http://localhost:3001/api/auth/users/${userId}`, {
        headers: {
          'Authorization': req.headers.authorization
        }
      });
      
      if (!userResponse.data) {
        console.log('User not found in auth service');
        return res.status(404).json({ message: 'User not found' });
      }
      console.log('User verified successfully');
    } catch (error) {
      console.error('Error verifying user:', error.response?.data || error.message);
      return res.status(500).json({ message: 'Error verifying user', error: error.response?.data || error.message });
    }

    // Check if user has a pending restaurant registration
    console.log('Checking for existing restaurant registration...');
    const existingRestaurant = await Restaurant.findOne({ 
      owner: userId,
      registrationStatus: 'pending'
    });
    
    if (existingRestaurant) {
      console.log('User already has a pending restaurant registration');
      return res.status(400).json({ message: 'You already have a pending restaurant registration' });
    }
    console.log('No pending registration found');

    console.log('Creating new restaurant...');
    const restaurant = new Restaurant({
      ...req.body,
      owner: userId,
      registrationStatus: 'pending'
    });

    console.log('Saving restaurant to database...');
    await restaurant.save();
    console.log('Restaurant saved successfully');
    
    res.status(201).json({ message: 'Restaurant registration submitted successfully', restaurant });
  } catch (error) {
    console.error('Error registering restaurant:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ 
      message: 'Error registering restaurant', 
      error: error.message,
      details: error.response?.data || error.stack
    });
  }
};

// Get all pending restaurant registrations (admin only)
const getPendingRegistrations = async (req, res) => {
  try {
    const pendingRestaurants = await Restaurant.find({ registrationStatus: 'pending' });
    res.json(pendingRestaurants);
  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    res.status(500).json({ message: 'Error fetching pending registrations', error: error.message });
  }
};

// Update restaurant registration status (admin only)
const updateRegistrationStatus = async (req, res) => {
  try {
    const { restaurantId, status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.registrationStatus = status;
    await restaurant.save();

    // If approved, update user role to restaurant_admin
    if (status === 'approved') {
      try {
        await axios.put(`http://localhost:3000/api/auth/users/${restaurant.owner}`, 
          { role: 'restaurant_admin' },
          {
            headers: {
              'Authorization': req.headers.authorization
            }
          }
        );
      } catch (error) {
        console.error('Error updating user role:', error);
        // Continue even if role update fails
      }
    }

    // If moving back to pending, check for other approved restaurants before changing role
    if (status === 'pending') {
      try {
        // Check if user has any other approved restaurants
        const otherApprovedRestaurants = await Restaurant.find({
          owner: restaurant.owner,
          _id: { $ne: restaurant._id },
          registrationStatus: 'approved'
        });

        // Only change role to customer if there are no other approved restaurants
        if (otherApprovedRestaurants.length === 0) {
          await axios.put(`http://localhost:3000/api/auth/users/${restaurant.owner}`, 
            { role: 'customer' },
            {
              headers: {
                'Authorization': req.headers.authorization
              }
            }
          );
        }
      } catch (error) {
        console.error('Error updating user role:', error);
        // Continue even if role update fails
      }
    }

    res.json({ message: 'Registration status updated successfully', restaurant });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ message: 'Error updating registration status', error: error.message });
  }
};

// Get all approved restaurant registrations (admin only)
const getApprovedRegistrations = async (req, res) => {
  try {
    const approvedRestaurants = await Restaurant.find({ registrationStatus: 'approved' });
    res.json(approvedRestaurants);
  } catch (error) {
    console.error('Error fetching approved registrations:', error);
    res.status(500).json({ message: 'Error fetching approved registrations', error: error.message });
  }
};

// Get all rejected restaurant registrations (admin only)
const getRejectedRegistrations = async (req, res) => {
  try {
    const rejectedRestaurants = await Restaurant.find({ registrationStatus: 'rejected' });
    res.json(rejectedRestaurants);
  } catch (error) {
    console.error('Error fetching rejected registrations:', error);
    res.status(500).json({ message: 'Error fetching rejected registrations', error: error.message });
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
  registerRestaurant,
  getPendingRegistrations,
  updateRegistrationStatus,
  getApprovedRegistrations,
  getRejectedRegistrations
};
