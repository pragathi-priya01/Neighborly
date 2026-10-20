import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initializeSocket } from './sockets/socketHandler.js';
import { logger } from './utils/logger.js';
import { User } from './models/User.js';
import { bootstrapAdminAndCatalog } from './scripts/bootstrapAdminAndCatalog.js';

const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Ensure initial Administrator and Service Catalog are ready (non-destructive)
    await bootstrapAdminAndCatalog();

    // 3. Create HTTP & Socket Server
    const server = http.createServer(app);
    initializeSocket(server);

    // 4. Start Listening
    server.listen(env.PORT, () => {
      logger.info(`===================================================`);
      logger.info(` Neighbourly API Server running on port ${env.PORT}`);
      logger.info(` Environment: ${env.NODE_ENV}`);
      logger.info(` Health endpoint: http://localhost:${env.PORT}/api/health`);
      logger.info(`===================================================`);
    });

    // 5. Graceful Shutdown Handlers
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Closing server gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error({ err: error.message, stack: error.stack }, 'Fatal error during server startup');
    process.exit(1);
  }
};

startServer();
