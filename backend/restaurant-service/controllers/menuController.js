const Menu = require("../models/Menu");
const Restaurant = require("../models/Restaurant");

// Get All Menu Items
const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menus" });
  }
};

// Get Menu Items by Restaurant ID
const getMenusByRestaurant = async (req, res) => {
  try {
    const menus = await Menu.find({ restaurant: req.params.restaurantId });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu items" });
  }
};

// Get Menu Item by ID
const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu item not found" });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu item" });
  }
};

// Add Item to Menu
const addMenuItem = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    const newMenuItem = new Menu({
      restaurant: req.params.restaurantId,
      name,
      price,
      category,
      description,
    });
    await newMenuItem.save();

    await Restaurant.findByIdAndUpdate(req.params.restaurantId, {
      $push: { menu: newMenuItem._id },
    });

    res.status(201).json(newMenuItem);
  } catch (error) {
    res.status(500).json({ message: "Error adding menu item" });
  }
};

// Update a Menu Item
const updateMenuItem = async (req, res) => {
  try {
    const updatedMenuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMenuItem)
      return res.status(404).json({ message: "Menu item not found" });
    res.json(updatedMenuItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating menu item" });
  }
};

// Delete a Menu Item
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });

    await Restaurant.findByIdAndUpdate(menuItem.restaurant, {
      $pull: { menu: menuItem._id },
    });
    await Menu.findByIdAndDelete(req.params.id);

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting menu item" });
  }
};

module.exports = {
  getAllMenus,
  getMenusByRestaurant,
  getMenuById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
