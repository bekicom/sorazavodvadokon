const ShopOrder = require("../modules/ShopOrder");
const axios = require("axios");

/* =========================
   FACTORY: CONFIRM ORDER
========================= */
exports.confirmFactoryOrder = async (req, res) => {
  try {
    const { id } = req.params;

    /* =========================
       1️⃣ ORDERNI OLAMIZ
    ========================= */
    const order = await ShopOrder.findById(id);
    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Zakas topilmadi",
      });
    }

    if (order.status !== "NEW") {
      return res.status(400).json({
        ok: false,
        message: `Zakas NEW emas (${order.status})`,
      });
    }

    /* =========================
       2️⃣ LOCAL ZAVOD OMBORGA MINUS
    ========================= */
    const localResponse = await axios.post(
      "http://localhost:8060/api/main-warehouse/minus",
      {
        items: order.items.map((i) => ({
          kategoriya_nomi: i.product_name,
          miqdor: i.qty,
        })),
        reason: `Shop zakas #${order.order_no}`,
      },
    );

    // 🔎 LOCAL API javobini tekshiramiz
    if (!localResponse.data?.success) {
      return res.status(400).json({
        ok: false,
        message: "Zavod omboridan minus qilib bo‘lmadi",
        detail: localResponse.data,
      });
    }

    /* =========================
       3️⃣ HAMMASI OK → STATUSNI O‘ZGARTIRAMIZ
    ========================= */
    order.status = "CONFIRMED";
    await order.save();

    return res.json({
      ok: true,
      message: "Zakas tasdiqlandi va zavod omboridan chiqarildi ✅",
      data: {
        order_id: order._id,
        order_no: order.order_no,
        status: order.status,
      },
    });
  } catch (err) {
    console.error(
      "confirmFactoryOrder ERROR:",
      err.response?.data || err.message,
    );

    return res.status(500).json({
      ok: false,
      message: "Zavod ombori bilan aloqa xatosi",
      error: err.response?.data || err.message,
    });
  }
};

/* =========================
   FACTORY: GET ORDERS
========================= */
exports.getFactoryOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status.toUpperCase(); // NEW | CONFIRMED | DONE
    }

    const orders = await ShopOrder.find(filter).sort({ createdAt: -1 }).lean();

    res.json({
      ok: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error("getFactoryOrders error:", err);
    res.status(500).json({
      ok: false,
      message: "Server xatosi",
    });
  }
};
