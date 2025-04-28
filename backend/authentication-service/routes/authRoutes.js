const express = require("express");
const {
  register,
  login,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

//  Public Routes
router.post("/register", register);
router.post("/login", login);

//  Protected Routes
router.get("/users/:id", authMiddleware, getUserById);
router.get("/user/:email", getUserByEmail);
router.get("/users", authMiddleware, getAllUsers);
router.patch("/users/:id", authMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, deleteUser);

module.exports = router;
