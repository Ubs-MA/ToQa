const { connectDB, disconnectDB } = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const ROLES = require("../constants/roles");
const { hashPassword } = require("../utils/password");
const logger = require("../config/logger");

const seed = async () => {
  await connectDB();
  const email = process.env.ADMIN_SEED_EMAIL || "admin@toqa.local";
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!password || password.length < 8) throw new Error("Set ADMIN_SEED_PASSWORD to at least 8 characters before seeding");

  await User.findOneAndUpdate(
    { email },
    { name: "ToQa Admin", email, password: await hashPassword(password), role: ROLES.ADMIN, isActive: true },
    { upsert: true, runValidators: true }
  );

  const category = await Category.findOneAndUpdate(
    { slug: "abayas" },
    { name: "Abayas", slug: "abayas", description: "Elegant everyday and occasion abayas", isActive: true },
    { upsert: true, new: true, runValidators: true }
  );

  const product = await Product.findOneAndUpdate(
    { slug: "classic-black-abaya" },
    {
      name: "Classic Black Abaya",
      slug: "classic-black-abaya",
      description: "A flowing black abaya with a clean silhouette and comfortable everyday fabric.",
      category: category._id,
      images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80"],
      basePrice: 1450,
      isActive: true,
    },
    { upsert: true, new: true, runValidators: true }
  );

  for (const [size, stock] of [["S", 8], ["M", 12], ["L", 5], ["XL", 2]]) {
    await ProductVariant.findOneAndUpdate(
      { product: product._id, size, color: "Black" },
      { product: product._id, size, color: "Black", sku: `ABA-BLK-${size}`, price: 1450, stock, isActive: true },
      { upsert: true, runValidators: true }
    );
  }
  logger.info("Seed complete", { adminEmail: email });
  await disconnectDB();
};

seed().catch(async (error) => {
  logger.error("Seed failed", { message: error.message, stack: error.stack });
  await disconnectDB().catch(() => {});
  process.exit(1);
});
