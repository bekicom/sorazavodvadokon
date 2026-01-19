const mongoose = require("mongoose");

const globalProductSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true, unique: true, trim: true },
    qty: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GlobalProduct", globalProductSchema);
