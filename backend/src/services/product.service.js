const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");

const searchProducts = async (queryParams) => {
    const {
        search,
        category,
        minPrice,
        maxPrice,
        size,
        color,
        available,
        page = 1,
        limit = 10,
    } = queryParams;

    const productFilter = {
        isActive: true,
    };

    // Search by product name
    if (search) {
        productFilter.name = {
            $regex: search,
            $options: "i",
        };
    }

    // Category filter
    if (category) {
        productFilter.category = category;
    }

    // Get products first
    let products = await Product.find(productFilter);

    // Filter by variants
    const variantFilter = {};

    if (minPrice !== undefined || maxPrice !== undefined) {
        variantFilter.price = {};

        if (minPrice !== undefined) {
            variantFilter.price.$gte = Number(minPrice);
        }

        if (maxPrice !== undefined) {
            variantFilter.price.$lte = Number(maxPrice);
        }
    }

    if (size) {
        variantFilter.size = size;
    }

    if (color) {
        variantFilter.color = color;
    }

    if (available === "true") {
        variantFilter.stock = { $gt: 0 };
    }

    if (available === "false") {
        variantFilter.stock = 0;
    }

    // If variant filters exist
    if (Object.keys(variantFilter).length > 0) {
        const variants = await ProductVariant.find(variantFilter);

        const productIds = variants.map((variant) => variant.product);

        products = products.filter((product) =>
            productIds.some(
                (id) => id.toString() === product._id.toString()
            )
        );
    }

    // Pagination
    const total = products.length;

    const skip = (Number(page) - 1) * Number(limit);

    const paginatedProducts = products.slice(
        skip,
        skip + Number(limit)
    );

    return {
        products: paginatedProducts,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
    };
};

module.exports = {
    searchProducts,
};




