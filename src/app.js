const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* ================================
   🌐 API ROUTES
================================ */

// Global product + shop order (bitta routerda)
app.use("/api", require("./routes/globalProduct.routes"));

module.exports = app;
