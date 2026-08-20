const getProductImageUrl = (req, file) => `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`;
module.exports = { getProductImageUrl };
