require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

let server;

const start = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    logger.info(
      `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );

    logger.info(
      `API docs available at http://localhost:${PORT}/api-docs`
    );
  });
};

start();

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);

  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');

  if (server) {
    server.close(() => process.exit(0));
  }
});

module.exports = server;