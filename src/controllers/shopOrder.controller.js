const mongoose = require("mongoose");
const ShopOrder = require("../modules/ShopOrder");
const GlobalProduct = require("../modules/GlobalProduct");

/* =========================
   CREATE SHOP ORDER
========================= */
exports.createShopOrder = async (req, res) => {
  try {
    const { shop_name, items, note } = req.body;

    /* =========================
       VALIDATION
    ========================= */
    if (!shop_name) {
      return res.status(400).json({
        ok: false,
        message: "shop_name majburiy",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "items bo‘sh bo‘lmasligi kerak",
      });
    }

    const orderItems = [];

    for (const it of items) {
      const { product_id, qty } = it;

      if (!mongoose.isValidObjectId(product_id)) {
        return res.status(400).json({
          ok: false,
          message: "product_id noto‘g‘ri",
        });
      }

      const q = Number(qty);
      if (!q || q <= 0) {
        return res.status(400).json({
          ok: false,
          message: "qty 0 dan katta bo‘lishi kerak",
        });
      }

      /* =========================
         PRODUCTNI GLOBAL'DAN OLAMIZ
      ========================= */
      const product = await GlobalProduct.findById(product_id).lean();
      if (!product) {
        return res.status(404).json({
          ok: false,
          message: "Global product topilmadi",
        });
      }

      orderItems.push({
        product_id: product._id,
        product_name: product.name,
        unit: product.birlik,
        qty: q,
      });
    }

    /* =========================
       CREATE ORDER
    ========================= */
    const order = await ShopOrder.create({
      shop_name: String(shop_name).toUpperCase(),
      items: orderItems,
      note: note || "",
      status: "NEW",
    });

    res.status(201).json({
      ok: true,
      message: "Zakas muvaffaqiyatli yuborildi",
      data: {
        _id: order._id,
        order_no: order.order_no,
        shop_name: order.shop_name,
        status: order.status,
        items: order.items,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("createShopOrder error:", err);
    res.status(500).json({
      ok: false,
      message: "Server xatosi",
    });
  }
};
