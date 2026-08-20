const router = require("express").Router();
const controller = require("../controllers/category.controller");
router.get("/", controller.list);
router.get("/:categoryId", controller.get);
module.exports = router;
