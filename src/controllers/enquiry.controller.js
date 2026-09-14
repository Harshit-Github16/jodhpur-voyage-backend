import Enquiry from '../models/Enquiry.js';
import Tour from '../models/Tour.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { STATUS_CODES } from '../constants/statusCodes.js';
import { sendEnquiryNotificationEmail } from '../services/email.service.js';

export const createEnquiry = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    tourId,
    cityId,
    travelDate,
    guestsCount,
    message,
    type
  } = req.body;

  let tourTitle = req.body.tourTitle;
  if (tourId && !tourTitle) {
    const tour = await Tour.findById(tourId);
    if (tour) tourTitle = tour.title;
  }

  const enquiry = await Enquiry.create({
    name,
    email: email.toLowerCase(),
    phone,
    tourId: tourId || undefined,
    tourTitle,
    cityId: cityId || undefined,
    travelDate: travelDate ? new Date(travelDate) : undefined,
    guestsCount: guestsCount || 1,
    message,
    type: type || 'General Contact',
    status: 'New'
  });

  // Trigger admin email notification
  sendEnquiryNotificationEmail(enquiry);

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(
      STATUS_CODES.CREATED,
      { id: enquiry._id, status: enquiry.status },
      'Enquiry submitted successfully. Our travel concierge will reach out within 2 hours.'
    )
  );
});

export const getEnquiries = asyncHandler(async (req, res) => {
  const { status, search, type, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (type && type !== 'All') {
    filter.type = type;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { tourTitle: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('assignedTo', 'name email')
      .lean(),
    Enquiry.countDocuments(filter)
  ]);

  const formatted = enquiries.map((e) => ({
    id: e._id,
    name: e.name,
    email: e.email,
    phone: e.phone,
    tourId: e.tourId,
    tourTitle: e.tourTitle,
    cityId: e.cityId,
    travelDate: e.travelDate,
    guestsCount: e.guestsCount,
    message: e.message,
    type: e.type,
    status: e.status,
    assignedTo: e.assignedTo,
    notes: e.notes || [],
    createdAt: e.createdAt
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

export const getEnquiryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const enquiry = await Enquiry.findById(id).populate('assignedTo', 'name email').lean();

  if (!enquiry) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Enquiry not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, enquiry, 'Enquiry retrieved')
  );
});

export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo, note } = req.body;

  const enquiry = await Enquiry.findById(id);
  if (!enquiry) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Enquiry not found');
  }

  if (status) enquiry.status = status;
  if (assignedTo) enquiry.assignedTo = assignedTo;

  if (note) {
    enquiry.notes.push({
      note,
      createdBy: req.user?._id,
      createdByName: req.user?.name || 'Admin',
      createdAt: new Date()
    });
  }

  await enquiry.save();

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, enquiry, 'Enquiry updated successfully')
  );
});

export const deleteEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const enquiry = await Enquiry.findByIdAndDelete(id);

  if (!enquiry) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Enquiry not found');
  }

  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Enquiry deleted successfully',
    deletedId: id
  });
});
