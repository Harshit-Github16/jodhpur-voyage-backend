import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';
import cleanUpdates from '../utils/cleanUpdates.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const getPosts = asyncHandler(async (req, res) => {
  const { category, tag, search, status = 'Published', featured, page, limit } = req.query;
  const filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (tag) {
    filter.tags = tag;
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const isAll = !limit || limit === 'all' || limit === '0';
  const limitNum = isAll ? 0 : parseInt(limit, 10) || 0;
  const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

  const query = Post.find(filter).sort({ publishedAt: -1, createdAt: -1 });
  if (limitNum > 0) {
    query.skip(skip).limit(limitNum);
  }

  const [posts, total] = await Promise.all([
    query.lean(),
    Post.countDocuments(filter)
  ]);

  const formatted = posts.map((b) => ({
    id: b._id,
    wordpressId: b.wordpressId,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    content: b.content || '',
    coverImage: b.coverImage,
    category: b.category,
    categories: b.categories || [],
    tags: b.tags || [],
    tagsDetails: b.tagsDetails || [],
    author: b.author,
    readTime: b.readTime,
    views: b.views || 0,
    featured: b.featured,
    status: b.status,
    originalUrl: b.originalUrl,
    publishedAt: b.publishedAt,
    modifiedAt: b.modifiedAt,
    createdAt: b.createdAt
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

export const getPostByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() };

  const post = await Post.findOneAndUpdate(query, { $inc: { views: 1 } }, { new: true }).lean();

  if (!post) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Post not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        id: post._id,
        wordpressId: post.wordpressId,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        category: post.category,
        categories: post.categories || [],
        tags: post.tags || [],
        tagsDetails: post.tagsDetails || [],
        author: post.author,
        readTime: post.readTime,
        views: post.views,
        featured: post.featured,
        status: post.status,
        originalUrl: post.originalUrl,
        publishedAt: post.publishedAt,
        modifiedAt: post.modifiedAt,
        createdAt: post.createdAt
      },
      'Post retrieved successfully'
    )
  );
});

export const createPost = asyncHandler(async (req, res) => {
  const postData = { ...req.body };

  if (!postData.slug) {
    postData.slug = slugify(postData.title);
  }

  let slug = postData.slug;
  let counter = 1;
  while (await Post.findOne({ slug })) {
    slug = `${postData.slug}-${counter++}`;
  }
  postData.slug = slug;

  if (!postData.author) {
    postData.author = {
      name: req.user?.name || 'Jodhpur Voyage',
      avatar: req.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'Travel Specialist'
    };
  }

  const post = await Post.create(postData);

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, post, 'Post published successfully')
  );
});

export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = cleanUpdates(req.body);

  if (updates.title && !updates.slug) {
    updates.slug = slugify(updates.title);
  }

  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: id }
    : { slug: id.toLowerCase() };

  const post = await Post.findOneAndUpdate(query, updates, {
    new: true,
    runValidators: true
  });

  if (!post) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Post not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, post, 'Post updated successfully')
  );
});

export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: id }
    : { slug: id.toLowerCase() };

  const post = await Post.findOneAndDelete(query);

  if (!post) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Post not found');
  }

  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Post deleted successfully',
    deletedId: id
  });
});

export const syncWordPressPosts = asyncHandler(async (req, res) => {
  const { migrateWordPressPosts } = await import('../seeders/migrateAllWordPressData.js');
  const stats = await migrateWordPressPosts();

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      stats,
      `WordPress posts migration completed. Fetched: ${stats.totalFetched}, Inserted: ${stats.insertedCount}, Updated: ${stats.updatedCount}, Failed: ${stats.failedCount}`
    )
  );
});
