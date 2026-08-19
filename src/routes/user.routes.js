const express = require("express");
const userController = require("../controllers/user.controller");
const protect = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  updateProfileValidator,
  changePasswordValidator,
} = require("../validators/user.validator");

const router = express.Router();

router.use(protect);

router.get("/me", userController.getMe);
router.patch("/me", updateProfileValidator, validate, userController.updateMe);
router.patch(
  "/me/password",
  changePasswordValidator,
  validate,
  userController.updateMyPassword
);

module.exports = router;
