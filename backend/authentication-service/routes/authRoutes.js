const express = require("express");
const {
  register,
  login,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  setToken
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Public Routes
router.post("/register", register);
router.post("/login", login);
router.post("/set-token", setToken);

// ✅ Protected Routes
router.get("/users/:id", authMiddleware, getUserById);
router.get("/users", authMiddleware, getAllUsers);
router.put("/users/:id", authMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, deleteUser);
router.post("/set-token", setToken);

module.exports = router;
