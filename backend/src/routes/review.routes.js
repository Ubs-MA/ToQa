const router = require("express").Router();
const controller = require("../controllers/review.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { updateReviewValidator } = require("../validators/review.validator");
router.use(authenticate);
router.patch("/:reviewId", updateReviewValidator, validate, controller.update);
router.delete("/:reviewId", controller.remove);
module.exports = router;
