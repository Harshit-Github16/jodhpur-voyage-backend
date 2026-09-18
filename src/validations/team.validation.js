import { z } from 'zod';

export const createTeamMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name max 120 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters').max(200, 'Role max 200 characters'),
  expertise: z.string().max(200, 'Expertise max 200 characters').optional().default(''),
  bio: z.string().max(3000, 'Bio max 3000 characters').optional().default(''),
  image: z.string().optional().default(''),
  experienceYears: z.number().int().min(0, 'Experience years must be non-negative').optional().default(0),
  order: z.number().int().min(0, 'Order must be non-negative').optional().default(0),
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
  socials: z.object({
    instagram: z.string().optional().default(''),
    twitter: z.string().optional().default(''),
    linkedin: z.string().optional().default('')
  }).optional().default({})
});

export const updateTeamMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name max 120 characters').optional(),
  role: z.string().min(2, 'Role must be at least 2 characters').max(200, 'Role max 200 characters').optional(),
  expertise: z.string().max(200, 'Expertise max 200 characters').optional(),
  bio: z.string().max(3000, 'Bio max 3000 characters').optional(),
  image: z.string().optional(),
  experienceYears: z.number().int().min(0, 'Experience years must be non-negative').optional(),
  order: z.number().int().min(0, 'Order must be non-negative').optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  socials: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional()
  }).optional()
});
