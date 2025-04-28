const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");

dotenv.config();
const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
