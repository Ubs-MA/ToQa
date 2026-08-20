const router = require("express").Router();
const controller = require("../controllers/order.controller");
const { authenticate } = require("../middlewares/auth.middleware");
router.use(authenticate);
router.get("/", controller.listMine);
router.get("/:orderId", controller.getMine);
router.patch("/:orderId/cancel", controller.cancel);
module.exports = router;
