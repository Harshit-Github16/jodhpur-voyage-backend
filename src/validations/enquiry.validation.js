import { z } from 'zod';

export const createEnquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  tourId: z.string().optional(),
  tourTitle: z.string().optional(),
  cityId: z.string().optional(),
  travelDate: z.string().or(z.date()).optional(),
  guestsCount: z.number().int().min(1).default(1),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  type: z.enum(['General Contact', 'Custom Tour', 'Package Booking Enquiry']).default('General Contact')
});

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(['New', 'In Progress', 'Contacted', 'Converted', 'Closed']),
  assignedTo: z.string().optional(),
  note: z.string().optional()
});
