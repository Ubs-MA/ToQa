const mongoose = require("mongoose");
const env = require("./env");
const logger = require("./logger");

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const connectDB = async () => {
  let lastError;

  for (let attempt = 1; attempt <= env.mongodbConnectRetries; attempt += 1) {
    try {
      const connection = await mongoose.connect(env.mongodbUri, {
        serverSelectionTimeoutMS: env.mongodbServerSelectionTimeoutMs,
      });

      logger.info("MongoDB connected", {
        host: connection.connection.host,
        database: connection.connection.name,
      });

      return connection;
    } catch (error) {
      lastError = error;
      logger.warn("MongoDB connection attempt failed", {
        attempt,
        attempts: env.mongodbConnectRetries,
        message: error.message,
      });

      if (attempt < env.mongodbConnectRetries) {
        await sleep(env.mongodbConnectRetryDelayMs);
      }
    }
  }

  throw lastError;
};

const getDBStatus = () => ({
  readyState: mongoose.connection.readyState,
  state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
  host: mongoose.connection.host,
  database: mongoose.connection.name,
});

const isDBReady = () => mongoose.connection.readyState === 1;

const verifyDBConnection = async () => {
  if (!isDBReady()) return false;
  await mongoose.connection.db.admin().ping();
  return true;
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};

module.exports = {
  connectDB,
  disconnectDB,
  getDBStatus,
  isDBReady,
  verifyDBConnection,
};
