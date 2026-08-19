const express = require("express");

const app = express();

app.use(express.json());
app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.originalUrl);
    next();
});

const cartRoutes = require("./routes/cart.routes");

const variantRoutes = require("./routes/variant.routes");

const productRoutes = require("./routes/product.routes");


app.use("/api/cart", cartRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/products", productRoutes);



app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is running",
    });
});

module.exports = app;