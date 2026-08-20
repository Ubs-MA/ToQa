const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const env = require("./config/env");
const ApiResponse = require("./utils/ApiResponse");
const requestLogger = require("./middlewares/requestLogger.middleware");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");
const swaggerDocument = require("./docs/swagger");

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
    exposedHeaders: ["x-session-id"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);
app.use(cookieParser());
app.use(requestLogger);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/v1/health", (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        service: "toqa-backend",
        environment: env.nodeEnv,
        timestamp: new Date().toISOString(),
      },
      "API is healthy"
    )
  );
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/users", require("./routes/user.routes"));
app.use("/api/v1/categories", require("./routes/category.routes"));
app.use("/api/v1/products", require("./routes/product.routes"));
app.use("/api/v1/cart", require("./routes/cart.routes"));
app.use("/api/v1/checkout", require("./routes/checkout.routes"));
app.use("/api/v1/orders", require("./routes/order.routes"));
app.use("/api/v1/wishlist", require("./routes/wishlist.routes"));
app.use("/api/v1/reviews", require("./routes/review.routes"));
app.use("/api/v1/coupons", require("./routes/coupon.routes"));
app.use("/api/v1/uploads", require("./routes/upload.routes"));
app.use("/api/v1/admin", require("./routes/admin.routes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
