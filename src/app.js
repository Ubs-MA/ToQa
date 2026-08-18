const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = require("./config/db");
connectDB();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const categoryRoutes = require("./routes/category.routes");
app.use("/api/v1/categories", categoryRoutes);

const productRoutes = require("./routes/product.routes");
app.use("/api/v1/products", productRoutes);

const variantRoutes = require("./routes/variant.routes");
app.use("/api/v1/variants", variantRoutes);

const variantColorRoutes = require("./routes/variantcolor.routes");
app.use("/api/v1/variantcolors", variantColorRoutes);

const variantSizeRoutes = require("./routes/variantsize.routes");
app.use("/api/v1/variantsizes", variantSizeRoutes);