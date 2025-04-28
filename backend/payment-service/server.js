const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const paymentRouter = require("./routes/paymentRoute");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/payment", paymentRouter);

app.listen(process.env.PORT, () =>
  console.log(`Payment Service running on port ${process.env.PORT}`)
);
