import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

dotenv.config();

const { validateEnvironment } = await import('./config/env.js');
const env = validateEnvironment();
const { default: app } = await import('./app.js');

const server = app.listen(env.PORT, () => {
  logger.info('TaleCrafter API started', {
    port: env.PORT,
    environment: env.NODE_ENV,
  });
});

const shutdown = signal => {
  logger.info('Shutting down TaleCrafter API', { signal });
  server.close(error => {
    if (error) {
      logger.error('Graceful shutdown failed', { message: error.message });
      process.exit(1);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
