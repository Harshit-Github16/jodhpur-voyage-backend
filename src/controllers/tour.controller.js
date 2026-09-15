import mongoose from 'mongoose';
import Tour from '../models/Tour.js';
import City from '../models/City.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const getTours = asyncHandler(async (req, res) => {
  const {
    category,
    cityId,
    search,
    minPrice,
    maxPrice,
    duration,
    status,
    featured,
    sort = 'newest',
    page = 1,
    limit = 12
  } = req.query;

  const filter = {};

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (cityId) {
    filter.cityId = cityId;
  }

  if (status && status !== 'All') {
    filter.status = status;
  } else if (!status) {
    filter.status = 'Active';
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  if (duration) {
    filter.duration = { $regex: duration, $options: 'i' };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { overview: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { cityName: { $regex: search, $options: 'i' } }
    ];
  }

  let sortCriteria = { createdAt: -1 };
  if (sort === 'price_asc') sortCriteria = { price: 1 };
  else if (sort === 'price_desc') sortCriteria = { price: -1 };
  else if (sort === 'rating') sortCriteria = { rating: -1, reviewsCount: -1 };
  else if (sort === 'popular') sortCriteria = { totalBookings: -1, rating: -1 };

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const skip = (pageNum - 1) * limitNum;

  const [tours, total] = await Promise.all([
    Tour.find(filter).sort(sortCriteria).skip(skip).limit(limitNum).lean(),
    Tour.countDocuments(filter)
  ]);

  const formatted = tours.map((t) => ({
    id: t._id,
    title: t.title,
    slug: t.slug,
    cityId: t.cityId,
    cityName: t.cityName,
    category: t.category,
    price: t.price,
    originalPrice: t.originalPrice,
    duration: t.duration,
    groupSize: t.groupSize,
    location: t.location,
    image: t.image,
    gallery: t.gallery || [],
    overview: t.overview,
    highlights: t.highlights || [],
    itinerary: t.itinerary || [],
    inclusions: t.inclusions || [],
    exclusions: t.exclusions || [],
    faqs: t.faqs || [],
    rating: t.rating,
    reviewsCount: t.reviewsCount,
    badge: t.badge,
    featured: t.featured,
    status: t.status,
    totalBookings: t.totalBookings || 0,
    createdAt: t.createdAt
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

export const getTourByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() };

  const tour = await Tour.findOne(query).lean();
  if (!tour) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Tour package not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        id: tour._id,
        title: tour.title,
        slug: tour.slug,
        cityId: tour.cityId,
        cityName: tour.cityName,
        category: tour.category,
        price: tour.price,
        originalPrice: tour.originalPrice,
        duration: tour.duration,
        groupSize: tour.groupSize,
        location: tour.location,
        image: tour.image,
        gallery: tour.gallery || [],
        overview: tour.overview,
        highlights: tour.highlights || [],
        itinerary: tour.itinerary || [],
        inclusions: tour.inclusions || [],
        exclusions: tour.exclusions || [],
        faqs: tour.faqs || [],
        rating: tour.rating,
        reviewsCount: tour.reviewsCount,
        badge: tour.badge,
        featured: tour.featured,
        status: tour.status,
        totalBookings: tour.totalBookings || 0,
        createdAt: tour.createdAt
      },
      'Tour package retrieved successfully'
    )
  );
});

export const createTour = asyncHandler(async (req, res) => {
  const tourData = { ...req.body };
  if (!tourData.slug) {
    tourData.slug = slugify(tourData.title);
  }

  // Ensure unique slug
  let slug = tourData.slug;
  let counter = 1;
  while (await Tour.findOne({ slug })) {
    slug = `${tourData.slug}-${counter++}`;
  }
  tourData.slug = slug;

  // Ensure overview is populated from description if needed
  if (!tourData.overview && tourData.description) {
    tourData.overview = tourData.description;
  }

  // City Resolution: Try ObjectId, then slug, then name, then fallback
  let city = null;
  if (tourData.cityId && mongoose.Types.ObjectId.isValid(tourData.cityId)) {
    city = await City.findById(tourData.cityId);
  }

  if (!city && tourData.cityId) {
    const cleanSlug = tourData.cityId.replace(/^city-/, '').toLowerCase();
    city = await City.findOne({
      $or: [
        { slug: cleanSlug },
        { slug: tourData.cityId.toLowerCase() },
        { name: new RegExp(`^${tourData.cityName || cleanSlug}$`, 'i') }
      ]
    });
  }

  if (!city && tourData.cityName) {
    city = await City.findOne({ name: new RegExp(`^${tourData.cityName}$`, 'i') });
  }

  if (!city) {
    city = await City.findOne();
  }

  if (city) {
    tourData.cityId = city._id;
    tourData.cityName = city.name;
  }

  const tour = await Tour.create(tourData);

  if (city) {
    await City.findByIdAndUpdate(city._id, { $inc: { packagesCount: 1 } });
  }

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, tour, 'Tour created successfully')
  );
});

export const updateTour = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.title && !updates.slug) {
    updates.slug = slugify(updates.title);
  }

  if (updates.cityId) {
    let city = null;
    if (mongoose.Types.ObjectId.isValid(updates.cityId)) {
      city = await City.findById(updates.cityId);
    }
    if (!city) {
      const cleanSlug = updates.cityId.replace(/^city-/, '').toLowerCase();
      city = await City.findOne({
        $or: [
          { slug: cleanSlug },
          { slug: updates.cityId.toLowerCase() },
          { name: new RegExp(`^${updates.cityName || cleanSlug}$`, 'i') }
        ]
      });
    }
    if (city) {
      updates.cityId = city._id;
      updates.cityName = city.name;
    }
  }

  const tour = await Tour.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Tour package not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, tour, 'Tour updated successfully')
  );
});

export const deleteTour = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndDelete(id);

  if (!tour) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Tour package not found');
  }

  // Decrement city packages count
  if (tour.cityId) {
    await City.findByIdAndUpdate(tour.cityId, { $inc: { packagesCount: -1 } });
  }

  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Tour deleted successfully',
    deletedId: id
  });
});
