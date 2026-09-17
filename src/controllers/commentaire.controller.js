import Commentaire from '../models/Commentaire.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';
import cleanUpdates from '../utils/cleanUpdates.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const getCommentaires = asyncHandler(async (req, res) => {
  const { search, status = 'Published', rating, featured, page, limit } = req.query;
  const filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (rating) {
    filter.rating = Number(rating);
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { 'author.name': { $regex: search, $options: 'i' } },
      { tourName: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const isAll = !limit || limit === 'all' || limit === '0';
  const limitNum = isAll ? 0 : parseInt(limit, 10) || 0;
  const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

  const query = Commentaire.find(filter).sort({ publishedAt: -1, createdAt: -1 });
  if (limitNum > 0) {
    query.skip(skip).limit(limitNum);
  }

  const [items, total] = await Promise.all([
    query.lean(),
    Commentaire.countDocuments(filter)
  ]);

  const formatted = items.map((c) => ({
    id: c._id,
    wordpressId: c.wordpressId,
    title: c.title,
    slug: c.slug,
    content: c.content,
    excerpt: c.excerpt,
    rating: c.rating || 5,
    tourName: c.tourName || '',
    coverImage: c.coverImage,
    author: c.author,
    featured: c.featured,
    status: c.status,
    originalUrl: c.originalUrl,
    publishedAt: c.publishedAt,
    modifiedAt: c.modifiedAt,
    createdAt: c.createdAt
  }));

  return res.status(STATUS_CODES.OK).json({
    success: true,
    count: formatted.length,
    total,
    page: pageNum,
    totalPages: limitNum > 0 ? Math.ceil(total / limitNum) || 1 : 1,
    data: formatted
  });
});

export const getCommentaireByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() };

  const item = await Commentaire.findOne(query).lean();

  if (!item) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Commentaire not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        id: item._id,
        wordpressId: item.wordpressId,
        title: item.title,
        slug: item.slug,
        content: item.content,
        excerpt: item.excerpt,
        rating: item.rating || 5,
        tourName: item.tourName || '',
        coverImage: item.coverImage,
        author: item.author,
        featured: item.featured,
        status: item.status,
        originalUrl: item.originalUrl,
        publishedAt: item.publishedAt,
        modifiedAt: item.modifiedAt,
        createdAt: item.createdAt
      },
      'Commentaire retrieved successfully'
    )
  );
});

export const createCommentaire = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (!data.slug) {
    data.slug = slugify(data.title);
  }

  let slug = data.slug;
  let counter = 1;
  while (await Commentaire.findOne({ slug })) {
    slug = `${data.slug}-${counter++}`;
  }
  data.slug = slug;

  const item = await Commentaire.create(data);

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, item, 'Commentaire created successfully')
  );
});

export const updateCommentaire = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = cleanUpdates(req.body);

  if (updates.title && !updates.slug) {
    updates.slug = slugify(updates.title);
  }

  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: id }
    : { slug: id.toLowerCase() };

  const item = await Commentaire.findOneAndUpdate(query, updates, {
    new: true,
    runValidators: true
  });

  if (!item) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Commentaire not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, item, 'Commentaire updated successfully')
  );
});

export const deleteCommentaire = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: id }
    : { slug: id.toLowerCase() };

  const item = await Commentaire.findOneAndDelete(query);

  if (!item) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Commentaire not found');
  }

  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Commentaire deleted successfully',
    deletedId: id
  });
});

export const syncWordPressCommentaires = asyncHandler(async (req, res) => {
  const { migrateWordPressCommentaires } = await import('../seeders/migrateAllWordPressData.js');
  const stats = await migrateWordPressCommentaires();

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      stats,
      `WordPress commentaires migration completed. Total: ${stats.totalFetched}, Inserted: ${stats.insertedCount}, Updated: ${stats.updatedCount}, Failed: ${stats.failedCount}`
    )
  );
});
