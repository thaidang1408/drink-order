import http from 'http';
import env from './config/env.js';
import createApp from './app.js';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/index.js';
import { initSocketServer, closeSocketServer } from './infrastructure/socket/index.js';

let isShuttingDown = false;

const startServer = async () => {
  try {
    await connectDatabase();
    console.log('[Database] Connected to MySQL via Prisma');

    const app = createApp();
    const httpServer = http.createServer(app);

    initSocketServer(httpServer);
    console.log('[Socket.IO] Server initialized');

    const gracefulShutdown = async (signal) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);

      await closeSocketServer();

      if (typeof httpServer.closeAllConnections === 'function') {
        httpServer.closeAllConnections();
      }

      httpServer.close(async () => {
        await disconnectDatabase();
        console.log('[Database] Disconnected');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout');
        process.exit(1);
      }, 5000);
    };

    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          `[Server] Port ${env.port} is already in use. Run "npm run port:free" or restart with "npm run dev".`,
        );
        process.exit(1);
      }

      console.error('[Server] HTTP server error:', error);
      process.exit(1);
    });

    httpServer.listen(env.port, env.host, () => {
      console.log(`[Server] Running on http://${env.host}:${env.port}`);
      console.log(`[Server] Environment: ${env.nodeEnv}`);
      console.log(`[Server] API: http://${env.host}:${env.port}/api/v1`);
    });

    process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.once('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
};

startServer();
