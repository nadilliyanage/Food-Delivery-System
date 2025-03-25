const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register a New User
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const newUser = req.body;

    // Ensure `role` is valid
    if (
      !role ||
      !["customer", "restaurant_admin", "delivery_personnel", "admin"].includes(role)
    ) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Email already registered:", email); // Log if email exists
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user with timestamps
    const result = await User.create({ ...newUser, password: hashedPassword });
    await result.save();

    // Generate JWT token for the newly registered user
    const token = jwt.sign(
      { id: result._id, role: result.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send response with token
    res.status(201).json({
      message: "User registered successfully",
      user: result, // Log the saved user in the response
      token, // ✅ Send token on successful registration
    });
  } catch (error) {
    console.error("❌ Error registering user:", error); // Log the error in case of failure
    res.status(500).json({ message: "Error registering user" });
  }
};


// ✅ Login User and Generate JWT Token
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// ✅ Get User by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

// ✅ Get User by Email
const getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email || req.query.email;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

// ✅ Get All Users (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// ✅ Update User
const updateUser = async (req, res) => {
  try {
    const { name, email, role, address, phone, photoUrl } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, address, phone, photoUrl },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// ✅ Delete User
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

const setToken = async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  res.send({ token });
}

module.exports = {
  register,
  login, setToken,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  deleteUser,
  setToken,
};
