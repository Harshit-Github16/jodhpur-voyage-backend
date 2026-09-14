import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { STATUS_CODES } from '../constants/statusCodes.js';
import { ROLES } from '../constants/roles.js';

// Helper to set refresh token cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(STATUS_CODES.CONFLICT, 'User with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: ROLES.CUSTOMER
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(
      STATUS_CODES.CREATED,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar
        },
        token: accessToken,
        accessToken: accessToken
      },
      'Registration successful'
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Invalid email or password');
  }

  if (user.status === 'Blocked') {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Your account has been deactivated. Please contact support.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Invalid email or password');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          permissions: user.permissions || []
        },
        token: accessToken,
        accessToken: accessToken
      },
      'Login successful'
    )
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'User not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        permissions: user.permissions || [],
        createdAt: user.createdAt
      },
      'Current user profile retrieved'
    )
  );
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Refresh token required');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey_9481948172381293_refresh_jodhpur'
    );

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Invalid or expired refresh token');
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(
        STATUS_CODES.OK,
        {
          token: newAccessToken
        },
        'Token refreshed successfully'
      )
    );
  } catch (error) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Invalid or expired refresh token');
  }
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, null, 'Logged out successfully')
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'User not found');
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save({ validateBeforeSave: false });

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      },
      'Profile updated successfully'
    )
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Incorrect current password');
  }

  user.password = newPassword;
  await user.save();

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, null, 'Password updated successfully')
  );
});
