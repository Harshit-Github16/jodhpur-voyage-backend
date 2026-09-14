import User from '../models/User.js';
import Booking from '../models/Booking.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { STATUS_CODES } from '../constants/statusCodes.js';
import { ROLES, STAFF_ROLES } from '../constants/roles.js';

export const getCustomers = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;

  const filter = { role: ROLES.CUSTOMER };
  if (status && status !== 'All') {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    User.countDocuments(filter)
  ]);

  // Aggregate bookings metrics for customers
  const customerEmails = users.map((u) => u.email);
  const bookingsAgg = await Booking.aggregate([
    { $match: { customerEmail: { $in: customerEmails } } },
    {
      $group: {
        _id: '$customerEmail',
        totalBookings: { $sum: 1 },
        totalSpent: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$totalAmount', 0] }
        },
        lastBookingDate: { $max: '$createdAt' }
      }
    }
  ]);

  const bookingMap = new Map();
  bookingsAgg.forEach((b) => bookingMap.set(b._id, b));

  const formatted = users.map((u) => {
    const stats = bookingMap.get(u.email) || {
      totalBookings: 0,
      totalSpent: 0,
      lastBookingDate: null
    };

    return {
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      avatar: u.avatar,
      status: u.status,
      totalBookings: stats.totalBookings,
      totalSpent: stats.totalSpent,
      lastBookingDate: stats.lastBookingDate,
      createdAt: u.createdAt
    };
  });

  return res.status(STATUS_CODES.OK).json({
    success: true,
    count: formatted.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data: formatted
  });
});

export const getStaffList = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: { $in: STAFF_ROLES } })
    .sort({ role: 1, createdAt: -1 })
    .lean();

  const formatted = staff.map((s) => ({
    id: s._id,
    name: s.name,
    email: s.email,
    role: s.role,
    phone: s.phone,
    avatar: s.avatar,
    status: s.status,
    permissions: s.permissions || [],
    lastLogin: s.lastLogin,
    createdAt: s.createdAt
  }));

  return res.status(STATUS_CODES.OK).json({
    success: true,
    count: formatted.length,
    data: formatted
  });
});

export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role, permissions, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(STATUS_CODES.CONFLICT, 'User with this email already exists');
  }

  const staff = await User.create({
    name,
    email,
    password,
    role: role || ROLES.ADMIN,
    permissions: permissions || ['all'],
    phone: phone || '',
    status: 'Active'
  });

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(
      STATUS_CODES.CREATED,
      {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        permissions: staff.permissions,
        status: staff.status
      },
      'Staff member created successfully'
    )
  );
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Active' or 'Blocked'

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'User not found');
  }

  if (user.role === ROLES.SUPER_ADMIN && req.user._id.toString() !== user._id.toString()) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Cannot modify Super Admin status');
  }

  user.status = status || (user.status === 'Active' ? 'Blocked' : 'Active');
  await user.save({ validateBeforeSave: false });

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      { id: user._id, status: user.status },
      `User status updated to ${user.status}`
    )
  );
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'User not found');
  }

  if (user.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Super Admin accounts cannot be deleted');
  }

  await User.findByIdAndDelete(id);

  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Staff member removed successfully',
    deletedId: id
  });
});
