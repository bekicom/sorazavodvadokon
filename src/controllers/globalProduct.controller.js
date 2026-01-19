const GlobalProduct = require("../modules/GlobalProduct");

/* ================================
   🔧 NORMALIZER
================================ */
function normalizeProductInput(body) {
  const name =
    body.name ||
    body.product_name ||
    body.kategoriya_nomi ||
    body.mahsulot ||
    null;

  const qty = Number(body.qty ?? body.miqdor ?? 0);

  return {
    name: name ? String(name).trim() : null,
    qty,
    birlik: body.birlik || "dona",
    category: body.category || "Umumiy",
  };
}

/* ================================
   📥 GLOBAL KIRIM / UPDATE
================================ */
exports.addProductQty = async (req, res) => {
  try {
    const { name, qty, birlik, category } = normalizeProductInput(req.body);

    if (!name) {
      return res.status(400).json({
        success: false,
        message:
          "Product nomi topilmadi (name / product_name / kategoriya_nomi)",
      });
    }

    const product = await GlobalProduct.findOneAndUpdate(
      { name },
      {
        $setOnInsert: {
          name,
          birlik,
          category,
        },
        $inc: { qty },
      },
      {
        upsert: true,
        new: true,
      },
    );

    res.json({
      success: true,
      message: "Global product saqlandi / yangilandi ✅",
      data: product,
    });
  } catch (error) {
    console.error("addProductQty error:", error);
    res.status(500).json({
      success: false,
      message: "Global product error",
    });
  }
};

/* ================================
   📋 BARCHA GLOBAL PRODUCTLAR
================================ */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await GlobalProduct.find().sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("getAllProducts error:", err);
    res.status(500).json({
      success: false,
      message: "Server xatosi",
    });
  }
};

/* ================================
   📤 GLOBAL CHIQIM (MINUS)
================================ */
exports.minusProductQty = async (req, res) => {
  try {
    const { name, qty } = normalizeProductInput(req.body);

    if (!name || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product nomi va qty majburiy",
      });
    }

    const product = await GlobalProduct.findOne({ name });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Mahsulot topilmadi",
      });
    }

    if (product.qty < qty) {
      return res.status(400).json({
        success: false,
        message: `Yetarli emas. Qoldiq: ${product.qty}`,
      });
    }

    product.qty -= qty;
    await product.save();

    res.json({
      success: true,
      message: "Global ombordan minus qilindi",
      data: product,
    });
  } catch (err) {
    console.error("minusProductQty error:", err);
    res.status(500).json({
      success: false,
      message: "Server xatosi",
    });
  }
};

/* ================================
   🔁 FACTORY → GLOBAL SYNC
================================ */
exports.syncFromFactory = async (req, res) => {
  try {
    const { name, birlik, category } = normalizeProductInput(req.body);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product nomi topilmadi",
      });
    }

    const product = await GlobalProduct.findOneAndUpdate(
      { name },
      {
        $setOnInsert: {
          name,
          birlik,
          category,
        },
      },
      { upsert: true, new: true },
    );

    res.json({
      success: true,
      message: "Global product sync bo‘ldi ✅",
      data: product,
    });
  } catch (err) {
    console.error("syncFromFactory error:", err);
    res.status(500).json({
      success: false,
      message: "Global sync error",
    });
  }
};
