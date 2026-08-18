const express = require('express');

const{
    getAllVariantSizes,
    getVariantSizeById,
    createVariantSize,
    updateVariantSize,
    deleteVariantSize
} = require('../controllers/variantsize.controller');

router = express.Router();

router.get('/', getAllVariantSizes);
router.get('/:id', getVariantSizeById);
router.post('/', createVariantSize);
router.put('/:id', updateVariantSize);
router.delete('/:id', deleteVariantSize);

module.exports = router;