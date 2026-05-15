const logger = require('../utils/logger');
const env = require('../config/env');

function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || error.status || 500;
  if (statusCode >= 500) logger.error(error);

  res.status(statusCode).json({
    detail: error.message || 'Internal server error',
    details: error.details,
    stack: env.nodeEnv === 'production' ? undefined : error.stack
  });
}

module.exports = { notFound, errorHandler };
