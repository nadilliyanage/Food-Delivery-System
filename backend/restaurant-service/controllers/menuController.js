const Menu = require("../models/Menu");
const Restaurant = require("../models/Restaurant");

//  Get All Menu Items
const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(500).json({ message: "Error fetching menus" });
  }
};

//  Get Menu Items by Restaurant (Only if owned by the user)
const getMenusByRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      owner: req.user.id,
    });
    if (!restaurant)
      return res
        .status(404)
        .json({ message: "Restaurant not found or not authorized" });

    const menus = await Menu.find({ restaurant: req.params.restaurantId });
    res.json(menus);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: "Error fetching menu items" });
  }
};

//  Get a Single Menu Item by ID
const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu item not found" });
    res.json(menu);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({ message: "Error fetching menu item" });
  }
};

//  Add a Menu Item (Only if owned by the user)
const addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      owner: req.user.id,
    });
    if (!restaurant)
      return res
        .status(404)
        .json({ message: "Restaurant not found or not authorized" });

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
    console.error("Error adding menu item:", error);
    res.status(500).json({ message: "Error adding menu item" });
  }
};

//  Update a Menu Item (Only if owned by the user)
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
    console.error("Error updating menu item:", error);
    res.status(500).json({ message: "Error updating menu item" });
  }
};

//  Delete a Menu Item (Only if owned by the user)
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
    console.error("Error deleting menu item:", error);
    res.status(500).json({ message: "Error deleting menu item" });
  }
};

// Export the controller functions
module.exports = {
  getAllMenus,
  getMenusByRestaurant,
  getMenuById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
