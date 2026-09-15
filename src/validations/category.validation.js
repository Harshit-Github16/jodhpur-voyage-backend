import { z } from 'zod';

export const createCategorySchema = z
  .object({
    name: z.string().min(1, 'Category name is required').max(100),
    slug: z.string().optional(),
    tagline: z.string().optional().default(''),
    description: z.string().optional().default(''),
    coverImage: z.string().optional(),
    image: z.string().optional(),
    order: z.preprocess((v) => (v !== undefined ? Number(v) : 0), z.number().int().optional().default(0)),
    status: z.enum(['Active', 'Inactive', 'Published', 'Draft']).optional().default('Active')
  })
  .transform((val) => ({
    ...val,
    coverImage: val.coverImage || val.image || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200',
    status: val.status === 'Inactive' || val.status === 'Draft' ? 'Inactive' : 'Active'
  }));

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  image: z.string().optional(),
  order: z.preprocess((v) => (v !== undefined ? Number(v) : undefined), z.number().int().optional()),
  status: z.enum(['Active', 'Inactive', 'Published', 'Draft']).optional()
}).transform((val) => {
  const res = { ...val };
  if (!res.coverImage && val.image) res.coverImage = val.image;
  if (val.status) {
    res.status = val.status === 'Inactive' || val.status === 'Draft' ? 'Inactive' : 'Active';
  }
  return res;
});

