require("./config/env");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const mongoSanitize = require("./utils/sanitize");

const env = require("./config/env");
const requestLogger = require("./middlewares/requestLogger.middleware");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adminUserRoutes = require("./routes/admin.routes");
const { mountSwagger } = require("./docs/swagger");

const app = express();

// ── Security & parsing middleware ──────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize); // strips $ and . from req.body/query/params to prevent NoSQL injection
app.use(hpp()); // guards against HTTP parameter pollution
app.use(requestLogger);
app.use(apiLimiter);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

app.use("/api/docs", ...mountSwagger());

// ── Feature routes ──────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);

// ── 404 + centralized error handling (must be last) ─────────
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
