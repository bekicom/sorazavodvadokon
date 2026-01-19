const ShopOrder = require("../modules/ShopOrder");

/* =========================
   FACTORY: CONFIRM ORDER
   (GLOBAL = STATUS ONLY)
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
       2️⃣ FAQAT STATUS O‘ZGARTIRAMIZ
       (OMBOR BILAN ISH YO‘Q)
    ========================= */
    order.status = "CONFIRMED";
    await order.save();

    return res.json({
      ok: true,
      message: "Zakas tasdiqlandi (ombor local tomonda ishlanadi) ✅",
      data: {
        order_id: order._id,
        order_no: order.order_no,
        status: order.status,
      },
    });
  } catch (err) {
    console.error("confirmFactoryOrder ERROR:", err);

    return res.status(500).json({
      ok: false,
      message: "Server xatosi",
      error: err.message,
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
