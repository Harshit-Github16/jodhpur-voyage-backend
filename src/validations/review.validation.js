import { z } from 'zod';

export const createReviewSchema = z.object({
  tourId: z.string().optional(),
  tourTitle: z.string().optional(),
  authorName: z.string().min(2, 'Name is required'),
  authorAvatar: z.string().url().optional(),
  authorLocation: z.string().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().min(2, 'Review title is required'),
  comment: z.string().min(5, 'Review comment is required'),
  photos: z.array(z.string().url()).optional()
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(['Approved', 'Pending', 'Rejected']),
  featured: z.boolean().optional()
});
