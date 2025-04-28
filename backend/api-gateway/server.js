const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const gatewayRoutes = require("./routes/gatewayRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/", gatewayRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
