const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

const parseList = (value) => value
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const clientOrigins = parseList(
  process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
);

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  port: parsePositiveInteger(process.env.PORT, 5000),
  clientOrigin: clientOrigins[0],
  clientOrigins,
  mongodbUri: process.env.MONGODB_URI,
  mongodbConnectRetries: parsePositiveInteger(process.env.MONGODB_CONNECT_RETRIES, 10),
  mongodbConnectRetryDelayMs: parsePositiveInteger(process.env.MONGODB_CONNECT_RETRY_DELAY_MS, 3000),
  mongodbServerSelectionTimeoutMs: parsePositiveInteger(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 5000),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  lowStockThreshold: parsePositiveInteger(process.env.LOW_STOCK_THRESHOLD, 5),
  logLevel: process.env.LOG_LEVEL || "info",
});

const requiredVariables = [
  ["MONGODB_URI", env.mongodbUri],
  ["JWT_SECRET", env.jwtSecret],
];

const missingVariables = requiredVariables
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (env.nodeEnv !== "test" && missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(", ")}`,
  );
}

module.exports = env;
