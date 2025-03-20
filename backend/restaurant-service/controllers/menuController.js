const MenuItem = require("../models/MenuItem");

const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, restaurant } = req.body;
    const menuItem = new MenuItem({ name, description, price, restaurant });
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurant: req.params.restaurantId,
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { addMenuItem, getMenuItems };
