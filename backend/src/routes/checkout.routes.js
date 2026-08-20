const router = require("express").Router();
const controller = require("../controllers/order.controller");
const { optionalAuthenticate } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { checkoutValidator } = require("../validators/order.validator");
router.post("/", optionalAuthenticate, checkoutValidator, validate, controller.checkout);
module.exports = router;
