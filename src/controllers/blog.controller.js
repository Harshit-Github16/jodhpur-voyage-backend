import Blog from '../models/Blog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import slugify from '../utils/slugify.js';
import cleanUpdates from '../utils/cleanUpdates.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const getBlogs = asyncHandler(async (req, res) => {
  const { category, tag, search, status = 'Published', featured, page = 1, limit = 10 } = req.query;
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
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [blogs, total] = await Promise.all([
    Blog.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Blog.countDocuments(filter)
  ]);

  const formatted = blogs.map((b) => ({
    id: b._id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    coverImage: b.coverImage,
    category: b.category,
    tags: b.tags || [],
    author: b.author,
    readTime: b.readTime,
    views: b.views || 0,
    featured: b.featured,
    status: b.status,
    publishedAt: b.publishedAt,
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

export const getBlogByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() };

  // Increment views count atomically
  const blog = await Blog.findOneAndUpdate(query, { $inc: { views: 1 } }, { new: true }).lean();

  if (!blog) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Blog article not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        coverImage: blog.coverImage,
        category: blog.category,
        tags: blog.tags || [],
        author: blog.author,
        readTime: blog.readTime,
        views: blog.views,
        featured: blog.featured,
        status: blog.status,
        publishedAt: blog.publishedAt,
        createdAt: blog.createdAt
      },
      'Blog retrieved successfully'
    )
  );
});

export const createBlog = asyncHandler(async (req, res) => {
  const blogData = { ...req.body };

  if (!blogData.slug) {
    blogData.slug = slugify(blogData.title);
  }

  // Ensure unique slug
  let slug = blogData.slug;
  let counter = 1;
  while (await Blog.findOne({ slug })) {
    slug = `${blogData.slug}-${counter++}`;
  }
  blogData.slug = slug;

  if (!blogData.author) {
    blogData.author = {
      name: req.user?.name || 'Harshit Sharma',
      avatar: req.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'Travel Specialist'
    };
  }

  const blog = await Blog.create(blogData);

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, blog, 'Blog post published successfully')
  );
});

export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = cleanUpdates(req.body);

  if (updates.title && !updates.slug) {
    updates.slug = slugify(updates.title);
  }

  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: id }
    : { slug: id.toLowerCase() };

  const blog = await Blog.findOneAndUpdate(query, updates, {
    new: true,
    runValidators: true
  });

  if (!blog) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Blog not found');
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, blog, 'Blog updated successfully')
  );
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: id }
    : { slug: id.toLowerCase() };

  const blog = await Blog.findOneAndDelete(query);

  if (!blog) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Blog not found');
  }

  return res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Blog deleted successfully',
    deletedId: id
  });
});

