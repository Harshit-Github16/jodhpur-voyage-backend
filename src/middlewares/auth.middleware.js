import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

// Mandatory authentication middleware
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Authentication token required. Please log in.');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'supersecretaccesskey_9481948172381293_jodhpurvoyage'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'User belonging to this token no longer exists.');
    }

    if (user.status === 'Blocked') {
      throw new ApiError(STATUS_CODES.FORBIDDEN, 'Your account has been deactivated. Please contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Token expired. Please refresh your token.');
    }
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Invalid authentication token.');
  }
});

// Optional authentication middleware (for routes accessible by both guests and logged-in users)
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'supersecretaccesskey_9481948172381293_jodhpurvoyage'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.status === 'Active') {
        req.user = user;
      }
    } catch (err) {
      // Ignore token errors for optional auth
    }
  }

  next();
});

// Role-Based Access Control (RBAC) middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(STATUS_CODES.UNAUTHORIZED, 'User not authenticated.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          STATUS_CODES.FORBIDDEN,
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};

// Permission-based access control
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(STATUS_CODES.UNAUTHORIZED, 'User not authenticated.'));
    }

    if (
      req.user.role === 'Super Admin' ||
      (req.user.permissions && (req.user.permissions.includes('all') || req.user.permissions.includes(permission)))
    ) {
      return next();
    }

    return next(
      new ApiError(
        STATUS_CODES.FORBIDDEN,
        `Forbidden: Missing required permission '${permission}'.`
      )
    );
  };
};
