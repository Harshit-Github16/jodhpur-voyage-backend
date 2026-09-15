import { z } from 'zod';

const itineraryItemSchema = z
  .object({
    day: z.number().int().min(1).optional().default(1),
    title: z.string().min(1, 'Itinerary title is required'),
    desc: z.string().optional(),
    description: z.string().optional(),
    meals: z.string().optional().default(''),
    stay: z.string().optional().default('')
  })
  .transform((val) => ({
    day: val.day || 1,
    title: val.title,
    desc: val.desc || val.description || val.title || 'Day activity details',
    meals: val.meals || '',
    stay: val.stay || ''
  }));

const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1)
});

export const createTourSchema = z
  .object({
    title: z.string().min(1, 'Tour title is required').max(200),
    slug: z.string().optional(),
    cityId: z.string().min(1, 'City ID is required'),
    cityName: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    categoryTag: z.string().optional(),
    price: z.preprocess((val) => Number(val), z.number().min(0, 'Price must be a positive number')),
    originalPrice: z.preprocess(
      (val) => (val !== undefined && val !== '' && val !== null ? Number(val) : undefined),
      z.number().min(0).optional()
    ),
    duration: z.string().optional(),
    durationDays: z.string().optional(),
    groupSize: z.string().optional(),
    maxGroupSize: z.union([z.number(), z.string()]).optional(),
    location: z.string().optional().default('Jodhpur, Rajasthan'),
    image: z.string().optional().default('https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'),
    gallery: z.array(z.string()).optional().default([]),
    overview: z.string().optional(),
    description: z.string().optional(),
    highlights: z.array(z.string()).optional().default([]),
    itinerary: z.array(itineraryItemSchema).optional().default([]),
    inclusions: z.array(z.string()).optional().default([]),
    exclusions: z.array(z.string()).optional().default([]),
    faqs: z.array(faqItemSchema).optional().default([]),
    badge: z.string().optional(),
    featured: z.boolean().optional().default(false),
    status: z.enum(['Active', 'Draft', 'Inactive']).optional().default('Active'),
    pdfUrl: z.string().optional(),
    seo: z.any().optional()
  })
  .transform((val) => ({
    ...val,
    overview: val.overview || val.description || val.title || 'Experience royal heritage and desert culture.',
    duration: val.duration || val.durationDays || '1 Day',
    groupSize: val.groupSize || (val.maxGroupSize ? `Max ${val.maxGroupSize} People` : 'Max 12 People')
  }));

export const updateTourSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().optional(),
  cityId: z.string().optional(),
  cityName: z.string().optional(),
  category: z.string().optional(),
  categoryTag: z.string().optional(),
  price: z.preprocess((val) => (val !== undefined ? Number(val) : undefined), z.number().min(0).optional()),
  originalPrice: z.preprocess(
    (val) => (val !== undefined && val !== '' && val !== null ? Number(val) : undefined),
    z.number().min(0).optional()
  ),
  duration: z.string().optional(),
  durationDays: z.string().optional(),
  groupSize: z.string().optional(),
  maxGroupSize: z.union([z.number(), z.string()]).optional(),
  location: z.string().optional(),
  image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  overview: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  itinerary: z.array(itineraryItemSchema).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  faqs: z.array(faqItemSchema).optional(),
  badge: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(['Active', 'Draft', 'Inactive']).optional(),
  pdfUrl: z.string().optional(),
  seo: z.any().optional()
}).transform((val) => ({
  ...val,
  overview: val.overview || val.description || undefined,
  duration: val.duration || val.durationDays || undefined,
  groupSize: val.groupSize || (val.maxGroupSize ? `Max ${val.maxGroupSize} People` : undefined)
}));

