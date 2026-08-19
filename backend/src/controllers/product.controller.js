const productService = require("../services/product.service");

const searchProducts = async (req, res) => {
    try {
        const result = await productService.searchProducts(req.query);

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    searchProducts,
};