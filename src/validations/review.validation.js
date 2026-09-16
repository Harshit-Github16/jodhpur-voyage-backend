import { z } from 'zod';

export const createReviewSchema = z
  .object({
    tourId: z.string().optional(),
    tourTitle: z.string().optional(),
    packageTitle: z.string().optional(),
    packageName: z.string().optional(),
    authorName: z.string().optional(),
    customerName: z.string().optional(),
    name: z.string().optional(),
    authorAvatar: z.string().optional(),
    customerAvatar: z.string().optional(),
    avatar: z.string().optional(),
    authorLocation: z.string().optional(),
    customerLocation: z.string().optional(),
    location: z.string().optional(),
    tourDate: z.string().optional(),
    travelDate: z.string().optional(),
    rating: z.preprocess(
      (val) => (val !== undefined && val !== '' ? Number(val) : 5),
      z.number().min(1).max(5).default(5)
    ),
    title: z.string().optional().default('Amazing experience in Rajasthan!'),
    comment: z.string().min(1, 'Review comment is required'),
    photos: z.array(z.string()).optional().default([]),
    status: z.enum(['Approved', 'Pending', 'Rejected']).optional().default('Approved'),
    featured: z.preprocess(
      (val) => val === true || val === 'true',
      z.boolean().optional().default(false)
    )
  })
  .transform((val) => {
    const authorName = val.authorName || val.customerName || val.name || 'Traveler';
    const authorAvatar =
      val.authorAvatar ||
      val.customerAvatar ||
      val.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    const authorLocation = val.authorLocation || val.customerLocation || val.location || 'India';
    const tourTitle = val.tourTitle || val.packageTitle || val.packageName || 'Rajasthan Tour';
    const tourDate = val.tourDate || val.travelDate || '';

    return {
      ...val,
      authorName,
      customerName: authorName,
      authorAvatar,
      customerAvatar: authorAvatar,
      authorLocation,
      customerLocation: authorLocation,
      tourTitle,
      packageTitle: tourTitle,
      tourDate
    };
  });

export const updateReviewStatusSchema = z.object({
  status: z.enum(['Approved', 'Pending', 'Rejected']).optional(),
  featured: z.boolean().optional()
});

