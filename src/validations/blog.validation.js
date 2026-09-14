import { z } from 'zod';

const authorSchema = z.object({
  name: z.string().min(2, 'Author name is required'),
  avatar: z.string().url().optional(),
  role: z.string().optional()
});

export const createBlogSchema = z.object({
  title: z.string().min(5, 'Title is required').max(200),
  slug: z.string().optional(),
  excerpt: z.string().min(10, 'Excerpt is required'),
  content: z.string().min(20, 'Content is required'),
  coverImage: z.string().url('Cover image must be a valid URL'),
  category: z.string().min(2, 'Category is required'),
  tags: z.array(z.string()).optional(),
  author: authorSchema.optional(),
  readTime: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(['Published', 'Draft']).optional()
});

export const updateBlogSchema = createBlogSchema.partial();
