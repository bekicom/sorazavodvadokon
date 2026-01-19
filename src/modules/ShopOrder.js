const mongoose = require("mongoose");

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
      min: 0,
    },
    unit: {
      type: String, // dona | kg | litr
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
    /* 🔹 Qaysi dokon */
    shop_name: {
      type: String,
      required: true,
      uppercase: true,
      enum: ["NAVOIY", "TORAQORGON", "DOSTLIK", "CHUST", "BOSHQA"],
    },

    /* 🔹 Zakas raqami */
    order_no: {
      type: Number,
      unique: true,
      index: true,
    },

    /* 🔹 Mahsulotlar */
    items: {
      type: [shopOrderItemSchema],
      required: true,
      validate: [(v) => v.length > 0, "items bo‘sh bo‘lmasin"],
    },

    /* 🔹 Izoh */
    note: {
      type: String,
      trim: true,
      default: "",
    },

    /* 🔹 Holat */
    status: {
      type: String,
      enum: ["NEW", "CONFIRMED", "REJECTED", "DONE"],
      default: "NEW",
      index: true,
    },

    /* 🔹 Zavod izohi */
    factory_note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

/* =========================
   AUTO ORDER NO
========================= */
shopOrderSchema.pre("save", async function (next) {
  if (this.order_no) return

  const Counter = mongoose.model(
    "Counter",
    new mongoose.Schema({
      name: String,
      seq: Number,
    }),
  );

  const counter = await Counter.findOneAndUpdate(
    { name: "shop_order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  this.order_no = counter.seq;
});

module.exports = mongoose.model("ShopOrder", shopOrderSchema);
