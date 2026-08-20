const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  port: parsePositiveInteger(process.env.PORT, 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI,
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

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(", ")}`,
  );
}

module.exports = env;
