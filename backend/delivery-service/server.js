const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const deliveryRoutes = require("./routes/deliveryRoutes");

dotenv.config();
const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.use("/api/deliveries", deliveryRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Delivery Service running on port ${PORT}`));
