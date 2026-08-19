const express = require("express");
const authController = require("../controllers/auth.controller");
const protect = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { authLimiter } = require("../middlewares/rateLimit.middleware");
const { registerValidator, loginValidator } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", authLimiter, registerValidator, validate, authController.register);
router.post("/login", authLimiter, loginValidator, validate, authController.login);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.me);

module.exports = router;
