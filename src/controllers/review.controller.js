import Review from '../models/Review.js';
import Tour from '../models/Tour.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import cleanUpdates from '../utils/cleanUpdates.js';
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
    tourTitle: r.tourTitle || r.packageTitle || '',
    packageTitle: r.packageTitle || r.tourTitle || '',
    tourDate: r.tourDate || '',
    authorName: r.authorName || r.customerName || 'Traveler',
    customerName: r.customerName || r.authorName || 'Traveler',
    authorAvatar: r.authorAvatar || r.customerAvatar || '',
    customerAvatar: r.customerAvatar || r.authorAvatar || '',
    authorLocation: r.authorLocation || r.customerLocation || 'India',
    customerLocation: r.customerLocation || r.authorLocation || 'India',
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
  const {
    tourId,
    authorName,
    customerName,
    authorAvatar,
    customerAvatar,
    authorLocation,
    customerLocation,
    tourDate,
    rating,
    title,
    comment,
    photos,
    status,
    featured
  } = req.body;

  let tourTitle = req.body.tourTitle || req.body.packageTitle || req.body.packageName;
  if (tourId && !tourTitle) {
    const tour = await Tour.findById(tourId);
    if (tour) tourTitle = tour.title;
  }

  const finalName = authorName || customerName || 'Traveler';
  const finalAvatar = authorAvatar || customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const finalLocation = authorLocation || customerLocation || 'India';

  const review = await Review.create({
    tourId: tourId || undefined,
    tourTitle: tourTitle || 'Rajasthan Heritage Tour',
    packageTitle: tourTitle || 'Rajasthan Heritage Tour',
    tourDate: tourDate || '',
    userId: req.user?._id || undefined,
    authorName: finalName,
    customerName: finalName,
    authorAvatar: finalAvatar,
    customerAvatar: finalAvatar,
    authorLocation: finalLocation,
    customerLocation: finalLocation,
    rating: Number(rating) || 5,
    title: title || 'Amazing experience in Rajasthan!',
    comment,
    photos: photos || [],
    status: status || 'Approved',
    featured: featured === true || featured === 'true'
  });

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, review, 'Review submitted successfully')
  );
});

export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = cleanUpdates(req.body);

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Review not found');
  }

  if (updates.status) review.status = updates.status;
  if (updates.featured !== undefined) review.featured = updates.featured === true || updates.featured === 'true';
  if (updates.title) review.title = updates.title;
  if (updates.comment) review.comment = updates.comment;
  if (updates.rating) review.rating = Number(updates.rating);

  await review.save();

  if (review.tourId) {
    await Review.calculateTourRating(review.tourId);
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, review, 'Review status updated successfully')
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

