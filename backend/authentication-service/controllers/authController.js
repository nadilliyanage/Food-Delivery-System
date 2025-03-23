const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Ensure `role` is provided
    if (
      !role ||
      !["customer", "restaurant_admin", "delivery_personnel"].includes(role)
    ) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user with timestamps
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

module.exports = { register, login };
