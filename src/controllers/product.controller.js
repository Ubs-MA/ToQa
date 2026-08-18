const Product = require('../models/product');

// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).populate('category');
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false,message: 'Failed to fetch products', error: error.message });
    }
};

// Get a single product by ID

const getProductById = async (req, res) => {
    try {
        const{ id }= req.params;
        const product = await Product.findById(id).populate('category');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch product', error: error.message });
    }
};

// Create a new product

const createProduct = async (req, res) => {
    try {
        const { name, slug, description, category, image, basePrice } = req.body;
        const product = await Product.create({ name, slug, description, category, image, basePrice });
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
    }
};

// updateProduct

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true ,runValidators: true})
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
    }
};


// deleteProduct

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
