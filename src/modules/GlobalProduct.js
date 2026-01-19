// models/GlobalProduct.js
const mongoose = require("mongoose");

const globalProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // 🔥 eng muhim
    },

    birlik: {
      type: String,
      default: "dona",
    },

    category: {
      type: String,
      default: "Umumiy",
    },

    qty: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GlobalProduct", globalProductSchema);
