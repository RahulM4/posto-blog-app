const logger = console;
const { failure } = require('../utils/response');

const notFound = (req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    logger.error(err);
  }
  return failure(res, statusCode, err.message || 'Internal Server Error', err.errors);
};

module.exports = {
  notFound,
  errorHandler
};
