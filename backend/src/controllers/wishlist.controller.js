const wishlistService = require("../services/wishlist.service");

async function getWishlist(req, res, next) {
  try {
    const wishlist = await wishlistService.getWishlist(req.user._id);

    res.json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
}

async function addProduct(req, res, next) {
  try {
    const wishlist = await wishlistService.addProduct(
      req.user._id,
      req.params.productId
    );

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
}

async function removeProduct(req, res, next) {
  try {
    const wishlist = await wishlistService.removeProduct(
      req.user._id,
      req.params.productId
    );

    res.json({
      success: true,
      message: "Product removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
}

async function clearWishlist(req, res, next) {
  try {
    const wishlist = await wishlistService.clearWishlist(req.user._id);

    res.json({
      success: true,
      message: "Wishlist cleared",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
}

async function checkWishlist(req, res, next) {
  try {
    const wishlisted = await wishlistService.isProductWishlisted(
      req.user._id,
      req.params.productId
    );

    res.json({
      success: true,
      data: { wishlisted },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWishlist,
  addProduct,
  removeProduct,
  clearWishlist,
  checkWishlist,
};
