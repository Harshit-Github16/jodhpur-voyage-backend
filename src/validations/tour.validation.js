import { z } from 'zod';

const itineraryItemSchema = z.object({
  day: z.number().int().min(1),
  title: z.string().min(1, 'Itinerary title is required'),
  desc: z.string().min(1, 'Itinerary description is required'),
  meals: z.string().optional(),
  stay: z.string().optional()
});

const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1)
});

export const createTourSchema = z.object({
  title: z.string().min(3, 'Tour title is required').max(200),
  slug: z.string().optional(),
  cityId: z.string().min(1, 'City ID is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  originalPrice: z.number().min(0).optional(),
  duration: z.string().min(1, 'Duration is required'),
  groupSize: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  image: z.string().url('Image must be a valid URL'),
  gallery: z.array(z.string().url()).optional(),
  overview: z.string().min(10, 'Overview must be at least 10 characters'),
  highlights: z.array(z.string()).optional(),
  itinerary: z.array(itineraryItemSchema).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  faqs: z.array(faqItemSchema).optional(),
  badge: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(['Active', 'Draft', 'Inactive']).optional()
});

export const updateTourSchema = createTourSchema.partial();
