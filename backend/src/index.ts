import app from './app';
import { env } from './config/env';
import prisma from './config/database';
import { startWeatherCheckCron } from './jobs/weatherCheckCron';
import { logInfo } from './utils/logger';

const PORT = env.PORT;

// Store cron task reference for graceful shutdown
let weatherCronTask: ReturnType<typeof startWeatherCheckCron> | null = null;

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  
  // Start weather check cron job
  weatherCronTask = startWeatherCheckCron();
  logInfo('Weather monitoring cron job initialized');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (weatherCronTask) {
    weatherCronTask.stop();
    logInfo('Weather check cron job stopped');
  }
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  if (weatherCronTask) {
    weatherCronTask.stop();
    logInfo('Weather check cron job stopped');
  }
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

