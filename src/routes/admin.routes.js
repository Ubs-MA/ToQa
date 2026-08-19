const express = require("express");
const adminController = require("../controllers/admin.controller");
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const { ROLES } = require("../constants/roles");
const {
  listUsersValidator,
  userIdParamValidator,
  updateUserStatusValidator,
} = require("../validators/admin.validator");

const router = express.Router();

// Note: this file scopes to /api/v1/admin/users — mounted accordingly in app.js.
// Other admin sub-resources (e.g. dashboards) belong in their own routers.
router.use(protect, authorize(ROLES.ADMIN));

router.get("/", listUsersValidator, validate, adminController.listUsers);
router.get("/:userId", userIdParamValidator, validate, adminController.getUser);
router.patch(
  "/:userId/status",
  updateUserStatusValidator,
  validate,
  adminController.updateUserStatus
);

module.exports = router;
