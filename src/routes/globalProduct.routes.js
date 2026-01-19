const router = require("express").Router();
const globalProductController = require("../controllers/globalProduct.controller");
const shopOrderController = require("../controllers/shopOrder.controller");
const factoryOrderController = require("../controllers/factoryOrder.controller");

// ➕ Mahsulot qo‘shish / qty oshirish
// faqat zavod ishlatadi
router.post("/in", globalProductController.addProductQty);
router.post("/out", globalProductController.minusProductQty);
router.post("/sync", globalProductController.syncFromFactory);
router.post("/shop/orders", shopOrderController.createShopOrder);
router.get("/shop/products", globalProductController.getProductsForShop);
router.get("/factory/orders", factoryOrderController.getFactoryOrders);
router.put(
  "/factory/orders/:id/confirm",
  factoryOrderController.confirmFactoryOrder,
);

router.get("/", globalProductController.getAllProducts);

module.exports = router;
