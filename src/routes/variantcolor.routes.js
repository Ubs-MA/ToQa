const express= require("express");

const{
    getAllVariantColors,
    getVariantColorById,
    createVariantColor,
    updateVariantColor,
    deleteVariantColor
} = require('../controllers/variantcolor.controller');

const router = express.Router();

router.get('/', getAllVariantColors);
router.get('/:id', getVariantColorById);
router.post('/', createVariantColor);
router.put('/:id', updateVariantColor);
router.delete('/:id', deleteVariantColor);

module.exports = router;