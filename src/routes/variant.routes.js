const express= require("express");

const{     
    getVariants,
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant,
    updateStock
} = require("../controllers/variant.controller");

const router=express.Router();
router.get("/",getVariants);
router.get("/:id",getVariantById);
router.post("/",createVariant);
router.put("/:id",updateVariant);
router.delete("/:id",deleteVariant);
router.patch("/:id/stock",updateStock);

module.exports=router;

