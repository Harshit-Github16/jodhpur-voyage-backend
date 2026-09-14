import Review from '../models/Review.js';
import Tour from '../models/Tour.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const getReviews = asyncHandler(async (req, res) => {
  const { tourId, featured, status = 'Approved', page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (tourId) {
    filter.tourId = tourId;
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Review.countDocuments(filter)
  ]);

  const formatted = reviews.map((r) => ({
    id: r._id,
    tourId: r.tourId,
    tourTitle: r.tourTitle,
    authorName: r.authorName,
    authorAvatar: r.authorAvatar,
    authorLocation: r.authorLocation,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    photos: r.photos || [],
    status: r.status,
    featured: r.featured,
    createdAt: r.createdAt
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

export const createReview = asyncHandler(async (req, res) => {
  const { tourId, authorName, authorAvatar, authorLocation, rating, title, comment, photos } = req.body;

  let tourTitle = req.body.tourTitle;
  if (tourId && !tourTitle) {
    const tour = await Tour.findById(tourId);
    if (tour) tourTitle = tour.title;
  }

  const review = await Review.create({
    tourId: tourId || undefined,
    tourTitle,
    userId: req.user?._id || undefined,
    authorName,
    authorAvatar: authorAvatar || req.user?.avatar || undefined,
    authorLocation: authorLocation || 'India',
    rating,
    title,
    comment,
    photos: photos || [],
    status: 'Approved' // Automatically approved or pending
  });

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, review, 'Review submitted successfully')
  );
});

export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, featured } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Review not found');
  }

  if (status) review.status = status;
  if (featured !== undefined) review.featured = featured;

  await review.save();

  if (review.tourId) {
    await Review.calculateTourRating(review.tourId);
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, review, 'Review status updated')
  );
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);

  if (!review) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Review not found');
  }

  if (review.tourId) {
    await Review.calculateTourRating(review.tourId);
  }

  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Review deleted successfully',
    deletedId: id
  });
});
