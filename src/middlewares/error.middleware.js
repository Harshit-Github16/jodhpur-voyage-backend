import ApiError from '../utils/ApiError.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const notFound = (req, res, next) => {
  const error = new ApiError(
    STATUS_CODES.NOT_FOUND,
    `Route not found - ${req.method} ${req.originalUrl}`
  );
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(STATUS_CODES.NOT_FOUND, message);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = new ApiError(STATUS_CODES.CONFLICT, message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((val) => val.message);
    const message = `Validation error: ${errors.join(', ')}`;
    error = new ApiError(STATUS_CODES.BAD_REQUEST, message, errors);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(STATUS_CODES.UNAUTHORIZED, 'Invalid token. Please authenticate again.');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(STATUS_CODES.UNAUTHORIZED, 'Token expired. Please login again.');
  }

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Vary', 'Origin');

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && error.errors.length > 0 ? { errors: error.errors } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  };

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
