import Booking from '../models/Booking.js';
import Tour from '../models/Tour.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { STATUS_CODES } from '../constants/statusCodes.js';
import { sendBookingConfirmationEmail } from '../services/email.service.js';

export const createBooking = asyncHandler(async (req, res) => {
  const {
    tourId,
    customerName,
    customerEmail,
    customerPhone,
    travelDate,
    guests,
    totalAmount,
    paymentMethod = 'Razorpay',
    specialRequests
  } = req.body;

  const tour = await Tour.findById(tourId);
  if (!tour) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Selected tour package does not exist');
  }

  const booking = await Booking.create({
    tourId: tour._id,
    tourTitle: tour.title,
    userId: req.user?._id || undefined,
    customerName,
    customerEmail: customerEmail.toLowerCase(),
    customerPhone,
    travelDate: new Date(travelDate),
    guests: guests || { adults: 1, children: 0 },
    totalAmount,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod,
    specialRequests: specialRequests || ''
  });

  // Increment total bookings for the tour
  await Tour.findByIdAndUpdate(tourId, { $inc: { totalBookings: 1 } });

  // Send confirmation email asynchronously
  sendBookingConfirmationEmail(booking);

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(
      STATUS_CODES.CREATED,
      {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        totalAmount: booking.totalAmount,
        travelDate: booking.travelDate,
        createdAt: booking.createdAt
      },
      'Booking created successfully'
    )
  );
});

export const getBookings = asyncHandler(async (req, res) => {
  const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (paymentStatus && paymentStatus !== 'All') {
    filter.paymentStatus = paymentStatus;
  }

  if (search) {
    filter.$or = [
      { customerName: { $regex: search, $options: 'i' } },
      { customerEmail: { $regex: search, $options: 'i' } },
      { customerPhone: { $regex: search, $options: 'i' } },
      { bookingNumber: { $regex: search, $options: 'i' } },
      { tourTitle: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [bookings, total] = await Promise.all([
    Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Booking.countDocuments(filter)
  ]);

  const formatted = bookings.map((b) => ({
    id: b._id,
    bookingNumber: b.bookingNumber,
    tourId: b.tourId,
    tourTitle: b.tourTitle,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    travelDate: b.travelDate,
    guests: b.guests,
    totalAmount: b.totalAmount,
    status: b.status,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod,
    createdAt: b.createdAt
  }));

  return res.status(STATUS_CODES.OK).json({
    success: true,
    count: formatted.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data: formatted
  });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userEmail = req.user.email;

  const bookings = await Booking.find({
    $or: [{ userId }, { customerEmail: userEmail }]
  })
    .sort({ createdAt: -1 })
    .lean();

  const formatted = bookings.map((b) => ({
    id: b._id,
    bookingNumber: b.bookingNumber,
    tourId: b.tourId,
    tourTitle: b.tourTitle,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    travelDate: b.travelDate,
    guests: b.guests,
    totalAmount: b.totalAmount,
    status: b.status,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod,
    createdAt: b.createdAt
  }));

  return res.status(STATUS_CODES.OK).json({
    success: true,
    count: formatted.length,
    data: formatted
  });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id).lean();

  if (!booking) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Booking record not found');
  }

  // Authorization check for customers viewing own booking
  if (
    req.user.role === 'Customer' &&
    booking.customerEmail !== req.user.email &&
    String(booking.userId) !== String(req.user._id)
  ) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied to this booking details');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, booking, 'Booking details retrieved')
  );
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  const updates = {};
  if (status) updates.status = status;
  if (paymentStatus) updates.paymentStatus = paymentStatus;

  const booking = await Booking.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });

  if (!booking) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Booking not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      { id: booking._id, status: booking.status, paymentStatus: booking.paymentStatus },
      `Booking status updated to ${booking.status}`
    )
  );
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Booking not found');
  }

  // Authorization check
  if (
    req.user.role === 'Customer' &&
    booking.customerEmail !== req.user.email &&
    String(booking.userId) !== String(req.user._id)
  ) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Unauthorized to cancel this booking');
  }

  booking.status = 'Cancelled';
  booking.paymentStatus = 'Refunded';
  booking.cancellationReason = reason || 'Cancelled by user/admin request';
  await booking.save();

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        cancellationReason: booking.cancellationReason
      },
      'Booking cancelled successfully'
    )
  );
});

export const deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findByIdAndDelete(id);

  if (!booking) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Booking record not found');
  }

  // Decrement total bookings if it had a tour
  if (booking.tourId) {
    await Tour.findByIdAndUpdate(booking.tourId, { $inc: { totalBookings: -1 } });
  }

  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Booking deleted successfully',
    deletedId: id
  });
});

