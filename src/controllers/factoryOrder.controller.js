const ShopOrder = require("../modules/ShopOrder");
const axios = require("axios");

/* =========================
   FACTORY: CONFIRM ORDER
========================= */
exports.confirmFactoryOrder = async (req, res) => {
  try {
    const { id } = req.params;

    /* =========================
       0️⃣ ENV TEKSHIRUV
    ========================= */
    const LOCAL_API = process.env.LOCAL_API_URL;
    if (!LOCAL_API) {
      return res.status(500).json({
        ok: false,
        message: "LOCAL_API_URL .env da sozlanmagan",
      });
    }

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
    let localResponse;
    try {
      localResponse = await axios.post(
        `${LOCAL_API}/api/main-warehouse/minus`,
        {
          items: order.items.map((i) => ({
            kategoriya_nomi: i.product_name,
            miqdor: i.qty,
          })),
          reason: `Shop zakas #${order.order_no}`,
        },
        {
          timeout: 10000, // 10s
        },
      );
    } catch (apiErr) {
      console.error(
        "❌ LOCAL API ERROR:",
        apiErr.response?.data || apiErr.message,
      );

      return res.status(502).json({
        ok: false,
        message: "Zavod ombori bilan aloqa xatosi",
        error: apiErr.response?.data || apiErr.message,
      });
    }

    /* =========================
       3️⃣ LOCAL API NATIJANI TEKSHIRISH
    ========================= */
    if (!localResponse.data || localResponse.data.success !== true) {
      return res.status(400).json({
        ok: false,
        message: "Zavod omboridan minus qilib bo‘lmadi",
        detail: localResponse.data,
      });
    }

    /* =========================
       4️⃣ HAMMASI OK → STATUSNI O‘ZGARTIRAMIZ
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
    console.error("confirmFactoryOrder FATAL ERROR:", err);

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
