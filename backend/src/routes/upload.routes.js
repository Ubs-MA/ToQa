const router = require("express").Router();
const controller = require("../controllers/upload.controller");
const upload = require("../middlewares/upload.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const ROLES = require("../constants/roles");
router.post("/product-image", authenticate, authorize(ROLES.ADMIN), upload.single("image"), controller.productImage);
module.exports = router;
