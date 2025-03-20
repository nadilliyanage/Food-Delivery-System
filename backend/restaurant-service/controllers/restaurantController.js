const Restaurant = require("../models/Restaurant");

const createRestaurant = async (req, res) => {
  try {
    const { name, location } = req.body;
    const restaurant = new Restaurant({ name, location, owner: req.user.id });
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { name, location, isOpen } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { name, location, isOpen },
      { new: true }
    );
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: "Restaurant deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  updateRestaurant,
  deleteRestaurant,
};
