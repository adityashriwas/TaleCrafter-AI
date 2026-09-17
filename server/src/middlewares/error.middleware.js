import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, _next) => {
  const isOperational = err instanceof ApiError;
  const statusCode = isOperational ? err.statusCode : 500;
  const exposeMessage = isOperational || process.env.NODE_ENV !== 'production';

  logger.error(err.message || 'Unhandled server error', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    ...(process.env.NODE_ENV !== 'production' && err.stack
      ? { stack: err.stack }
      : {}),
  });

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: exposeMessage ? err.message : 'Internal server error',
    errors: isOperational ? err.error : [],
    requestId: req.requestId,
  });
};
