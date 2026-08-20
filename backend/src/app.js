const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const ApiResponse = require("./utils/ApiResponse");
const requestLogger = require("./middlewares/requestLogger.middleware");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
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

app.use(notFound);
app.use(errorHandler);

module.exports = app;