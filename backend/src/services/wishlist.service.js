const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

async function getWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId }).populate("products");

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  return wishlist;
}

async function addProduct(userId, productId) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.isActive === false) {
    throw new Error("Product is inactive");
  }

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [productId],
    });
  } else {
    const alreadyAdded = wishlist.products.some(
      (id) => id.toString() === productId.toString()
    );

    if (alreadyAdded) {
      return wishlist.populate("products");
    }

    wishlist.products.push(productId);
    await wishlist.save();
  }

  return wishlist.populate("products");
}

async function removeProduct(userId, productId) {
  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new Error("Wishlist is empty");
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId.toString()
  );

  await wishlist.save();

  return wishlist.populate("products");
}

async function clearWishlist(userId) {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { products: [] },
    { new: true }
  );

  if (!wishlist) {
    return Wishlist.create({ user: userId, products: [] });
  }

  return wishlist;
}

async function isProductWishlisted(userId, productId) {
  const wishlist = await Wishlist.findOne({
    user: userId,
    products: productId,
  });

  return Boolean(wishlist);
}

module.exports = {
  getWishlist,
  addProduct,
  removeProduct,
  clearWishlist,
  isProductWishlisted,
};
