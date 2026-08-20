const app = require("./app");
const env = require("./config/env");
const logger = require("./config/logger");
const {
  connectDB,
  disconnectDB,
} = require("./config/db");

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(env.port, () => {
    logger.info("Server started", {
      port: env.port,
      environment: env.nodeEnv,
    });
  });
};

const shutdown = async (signal) => {
  logger.info("Server shutdown started", { signal });

  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }

  await disconnectDB();
  process.exit(0);
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled promise rejection", {
    message: error.message,
    stack: error.stack,
  });

  shutdown("unhandledRejection");
});

startServer().catch((error) => {
  logger.error("Server failed to start", {
    message: error.message,
    stack: error.stack,
  });

  process.exit(1);
});