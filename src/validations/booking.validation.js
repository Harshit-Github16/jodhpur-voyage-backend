import { z } from 'zod';

export const createBookingSchema = z.object({
  tourId: z.string().min(1, 'Tour ID is required'),
  tourTitle: z.string().optional(),
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(6, 'Valid phone number is required'),
  travelDate: z.string().or(z.date()),
  guests: z.object({
    adults: z.number().int().min(1, 'At least 1 adult is required'),
    children: z.number().int().min(0).default(0)
  }),
  totalAmount: z.number().min(0, 'Total amount is required'),
  paymentMethod: z.string().default('Razorpay'),
  specialRequests: z.string().optional()
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled']),
  paymentStatus: z.enum(['Pending', 'Paid', 'Refunded', 'Failed']).optional()
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required')
});
