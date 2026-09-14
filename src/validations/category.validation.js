import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required').max(100),
  slug: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().url('Cover image must be a valid URL'),
  order: z.number().int().optional(),
  status: z.enum(['Active', 'Inactive']).optional()
});

export const updateCategorySchema = createCategorySchema.partial();
