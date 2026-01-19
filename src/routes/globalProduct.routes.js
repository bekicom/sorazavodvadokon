const router = require("express").Router();
const ctrl = require("../controllers/globalProduct.controller");
const globalProductController = require("../controllers/globalProduct.controller");

router.post("/in", ctrl.addProductQty); // zavod
router.post("/out", ctrl.minusProductQty); // do‘kon
router.get("/", ctrl.getAllProducts); // do‘kon

router.post("/sync", globalProductController.syncFromFactory);

module.exports = router;
