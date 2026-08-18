const express= require("express");
const{ getCategories ,getCategoryById ,createCategory , updateCategory,deleteCategory}= require("../controllers/category.controller");

const router= express.Router();

router.get("/", getCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.get("/:id", getCategoryById);
router.delete("/:id", deleteCategory);
module.exports= router;