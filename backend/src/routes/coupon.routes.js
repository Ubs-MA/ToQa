const router = require("express").Router();
const controller = require("../controllers/coupon.controller");
const validate = require("../middlewares/validate.middleware");
const { validateCouponValidator } = require("../validators/coupon.validator");
router.post("/validate", validateCouponValidator, validate, controller.validate);
module.exports = router;
