import City from '../models/City.js';
import DestinationCategory from '../models/DestinationCategory.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const getCities = asyncHandler(async (req, res) => {
  const { categoryId, search, status, featured, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (status && status !== 'All') {
    filter.status = status;
  } else if (!status) {
    filter.status = 'Published';
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { state: { $regex: search, $options: 'i' } },
      { tagline: { $regex: search, $options: 'i' } },
      { keywords: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [cities, total] = await Promise.all([
    City.find(filter)
      .sort({ featured: -1, packagesCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    City.countDocuments(filter)
  ]);

  const formatted = cities.map((c) => ({
    id: c._id,
    name: c.name,
    slug: c.slug,
    categoryId: c.categoryId,
    categoryName: c.categoryName,
    state: c.state,
    tagline: c.tagline,
    heroTitle: c.heroTitle,
    metaTitle: c.metaTitle,
    metaDescription: c.metaDescription,
    keywords: c.keywords,
    bannerImage: c.bannerImage,
    gallery: c.gallery || [],
    highlights: c.highlights || [],
    faqs: c.faqs || [],
    packagesCount: c.packagesCount || 0,
    featured: c.featured,
    status: c.status,
    createdAt: c.createdAt
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

export const getCityByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() };

  const city = await City.findOne(query).lean();
  if (!city) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'City / Destination not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        id: city._id,
        name: city.name,
        slug: city.slug,
        categoryId: city.categoryId,
        categoryName: city.categoryName,
        state: city.state,
        tagline: city.tagline,
        heroTitle: city.heroTitle,
        metaTitle: city.metaTitle,
        metaDescription: city.metaDescription,
        keywords: city.keywords,
        bannerImage: city.bannerImage,
        gallery: city.gallery || [],
        highlights: city.highlights || [],
        faqs: city.faqs || [],
        packagesCount: city.packagesCount || 0,
        featured: city.featured,
        status: city.status,
        createdAt: city.createdAt
      },
      'City details retrieved successfully'
    )
  );
});

export const createCity = asyncHandler(async (req, res) => {
  const {
    name,
    categoryId,
    state = 'Rajasthan',
    tagline,
    heroTitle,
    metaTitle,
    metaDescription,
    keywords,
    bannerImage,
    gallery,
    highlights,
    faqs,
    featured,
    status
  } = req.body;

  const slug = req.body.slug || slugify(name);

  const existing = await City.findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    throw new ApiError(STATUS_CODES.CONFLICT, 'City with this name or slug already exists');
  }

  const category = await DestinationCategory.findById(categoryId);
  if (!category) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Valid Destination Category required');
  }

  const city = await City.create({
    name,
    slug,
    categoryId,
    categoryName: category.name,
    state,
    tagline: tagline || '',
    heroTitle: heroTitle || '',
    metaTitle: metaTitle || '',
    metaDescription: metaDescription || '',
    keywords: keywords || '',
    bannerImage,
    gallery: gallery || [],
    highlights: highlights || [],
    faqs: faqs || [],
    featured: featured || false,
    status: status || 'Published'
  });

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, city, 'City created successfully')
  );
});

export const updateCity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.name && !updates.slug) {
    updates.slug = slugify(updates.name);
  }

  if (updates.categoryId) {
    const category = await DestinationCategory.findById(updates.categoryId);
    if (category) {
      updates.categoryName = category.name;
    }
  }

  const city = await City.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });

  if (!city) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'City not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, city, 'City updated successfully')
  );
});

export const deleteCity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const city = await City.findByIdAndDelete(id);

  if (!city) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'City not found');
  }

  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'City removed successfully',
    deletedId: id
  });
});
