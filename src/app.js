const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/global-products", require("./routes/globalProduct.routes"));

module.exports = app;
