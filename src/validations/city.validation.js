import { z } from 'zod';

const faqItemSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required')
});

export const createCitySchema = z
  .object({
    name: z.string().min(1, 'City name is required'),
    slug: z.string().optional(),
    categoryId: z.string().min(1, 'Category ID is required'),
    state: z.string().default('Rajasthan'),
    tagline: z.string().optional().default(''),
    heroTitle: z.string().optional().default(''),
    metaTitle: z.string().optional().default(''),
    metaDescription: z.string().optional().default(''),
    keywords: z.string().optional().default(''),
    bannerImage: z.string().optional(),
    image: z.string().optional(),
    gallery: z.array(z.string()).optional().default([]),
    highlights: z.array(z.string()).optional().default([]),
    faqs: z.array(faqItemSchema).optional().default([]),
    featured: z.boolean().optional().default(false),
    status: z.enum(['Published', 'Draft', 'Active', 'Inactive']).optional().default('Published')
  })
  .transform((val) => ({
    ...val,
    bannerImage: val.bannerImage || val.image || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1600',
    status: val.status === 'Draft' || val.status === 'Inactive' ? 'Draft' : 'Published'
  }));

export const updateCitySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  categoryId: z.string().optional(),
  state: z.string().optional(),
  tagline: z.string().optional(),
  heroTitle: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  bannerImage: z.string().optional(),
  image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  faqs: z.array(faqItemSchema).optional(),
  featured: z.boolean().optional(),
  status: z.enum(['Published', 'Draft', 'Active', 'Inactive']).optional()
}).transform((val) => {
  const res = { ...val };
  if (!res.bannerImage && val.image) res.bannerImage = val.image;
  if (val.status) {
    res.status = val.status === 'Draft' || val.status === 'Inactive' ? 'Draft' : 'Published';
  }
  return res;
});

