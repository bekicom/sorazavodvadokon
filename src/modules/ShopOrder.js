const mongoose = require("mongoose");
const Counter = require("./Counter");

/* =========================
   ZAKAS ITEM
========================= */
const shopOrderItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

/* =========================
   MAIN SCHEMA
========================= */
const shopOrderSchema = new mongoose.Schema(
  {
    shop_name: {
      type: String,
      required: true,
      uppercase: true,
      enum: ["NAVOIY", "TORAQORGON", "DOSTLIK", "CHUST", "BOSHQA"],
    },

    order_no: {
      type: Number,
      unique: true,
      index: true,
    },

    items: {
      type: [shopOrderItemSchema],
      required: true,
      validate: [(v) => v.length > 0, "items bo‘sh bo‘lmasin"],
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["NEW", "CONFIRMED", "REJECTED", "DONE"],
      default: "NEW",
      index: true,
    },

    factory_note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

/* =========================
   AUTO ORDER NO (TO‘G‘RI)
========================= */
shopOrderSchema.pre("save", async function (next) {
  if (this.order_no) return next();

  const counter = await Counter.findOneAndUpdate(
    { name: "shop_order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  this.order_no = counter.seq;
  next();
});

module.exports =
  mongoose.models.ShopOrder || mongoose.model("ShopOrder", shopOrderSchema);
