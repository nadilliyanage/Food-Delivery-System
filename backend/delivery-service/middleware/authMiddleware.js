const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Access Denied - No Token Provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Received token:", token);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", verified);

    // Ensure the user object has the correct structure
    req.user = {
      id: verified.id,
      role: verified.role,
    };
    console.log("Set user object:", req.user);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = authMiddleware;
