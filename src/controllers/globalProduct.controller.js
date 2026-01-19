const GlobalProduct = require("../modules/GlobalProduct");

/* 📥 GLOBAL KIRIM */
exports.addProductQty = async (req, res) => {
  try {
    const { product_name, qty } = req.body;

    if (!product_name || !qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "product_name va qty majburiy",
      });
    }

    const product = await GlobalProduct.findOneAndUpdate(
      { product_name },
      { $inc: { qty } },
      { upsert: true, new: true },
    );

    res.json({
      success: true,
      message: "Global omborga qo‘shildi",
      data: product,
    });
  } catch (err) {
    console.error("addProductQty error:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

/* 📋 GLOBAL MAHSULOTLAR */
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
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

/* 📤 GLOBAL CHIQIM */
exports.minusProductQty = async (req, res) => {
  try {
    const { product_name, qty } = req.body;

    if (!product_name || !qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "product_name va qty majburiy",
      });
    }

    const product = await GlobalProduct.findOne({ product_name });
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
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

