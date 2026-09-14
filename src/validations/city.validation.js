import { z } from 'zod';

const faqItemSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required')
});

export const createCitySchema = z.object({
  name: z.string().min(2, 'City name is required'),
  slug: z.string().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  state: z.string().default('Rajasthan'),
  tagline: z.string().optional(),
  heroTitle: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  bannerImage: z.string().url('Banner image must be a valid URL'),
  gallery: z.array(z.string().url()).optional(),
  highlights: z.array(z.string()).optional(),
  faqs: z.array(faqItemSchema).optional(),
  featured: z.boolean().optional(),
  status: z.enum(['Published', 'Draft']).optional()
});

export const updateCitySchema = createCitySchema.partial();
