const mongoose = require("mongoose");
const env = require("./env");
const logger = require("./logger");

const connectDB = async () => {
  const connection = await mongoose.connect(env.mongodbUri);

  logger.info("MongoDB connected", {
    host: connection.connection.host,
    database: connection.connection.name,
  });

  return connection;
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};

module.exports = {
  connectDB,
  disconnectDB,
};