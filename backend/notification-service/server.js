const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/notifications", notificationRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Notification Service running on port ${process.env.PORT}`);
});
