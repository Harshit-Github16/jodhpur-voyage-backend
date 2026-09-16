import DestinationCategory from '../models/DestinationCategory.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';
import cleanUpdates from '../utils/cleanUpdates.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const getCategories = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  } else if (!status) {
    filter.status = 'Active';
  }

  const categories = await DestinationCategory.find(filter)
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const formatted = categories.map((cat) => ({
    id: cat._id,
    name: cat.name,
    slug: cat.slug,
    tagline: cat.tagline,
    description: cat.description,
    coverImage: cat.coverImage,
    order: cat.order,
    status: cat.status,
    createdAt: cat.createdAt
  }));

  return res.status(STATUS_CODES.OK).json({
    success: true,
    count: formatted.length,
    data: formatted
  });
});

export const getCategoryByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() };

  const category = await DestinationCategory.findOne(query).lean();
  if (!category) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Destination category not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        id: category._id,
        name: category.name,
        slug: category.slug,
        tagline: category.tagline,
        description: category.description,
        coverImage: category.coverImage,
        order: category.order,
        status: category.status,
        createdAt: category.createdAt
      },
      'Category retrieved successfully'
    )
  );
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, tagline, description, coverImage, order, status } = req.body;
  const slug = req.body.slug || slugify(name);

  const existing = await DestinationCategory.findOne({
    $or: [{ name }, { slug }]
  });

  if (existing) {
    throw new ApiError(
      STATUS_CODES.CONFLICT,
      'A category with this name or slug already exists'
    );
  }

  const category = await DestinationCategory.create({
    name,
    slug,
    tagline,
    description,
    coverImage,
    order: order || 0,
    status: status || 'Active'
  });

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(
      STATUS_CODES.CREATED,
      {
        id: category._id,
        name: category.name,
        slug: category.slug,
        tagline: category.tagline,
        description: category.description,
        coverImage: category.coverImage,
        order: category.order,
        status: category.status
      },
      'Category created successfully'
    )
  );
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = cleanUpdates(req.body);

  if (updates.name && !updates.slug) {
    updates.slug = slugify(updates.name);
  }

  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: id }
    : { slug: id.toLowerCase() };

  const category = await DestinationCategory.findOneAndUpdate(query, updates, {
    new: true,
    runValidators: true
  });

  if (!category) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Destination category not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, category, 'Category updated successfully')
  );
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: id }
    : { slug: id.toLowerCase() };

  const category = await DestinationCategory.findOneAndDelete(query);

  if (!category) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Destination category not found');
  }

  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Category removed successfully',
    deletedId: id
  });
});

