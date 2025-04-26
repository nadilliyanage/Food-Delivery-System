const isAdmin = (req, res, next) => {
  console.log("Checking admin role. User object:", req.user);
  console.log("User role:", req.user?.role);

  if (req.user && req.user.role === "admin") {
    console.log("Admin access granted");
    next();
  } else {
    console.error("Admin access denied. User role:", req.user?.role);
    res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }
};

module.exports = { isAdmin };
