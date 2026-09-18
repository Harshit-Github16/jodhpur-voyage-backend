import { z } from 'zod';

const cardSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Card title is required').max(120, 'Card title max 120 characters').default(''),
  image: z.string().optional().default(''),
  link: z.string().max(300, 'Link max 300 characters').optional().default('')
});

const itemSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(160, 'Title max 160 characters').optional().default(''),
  text: z.string().max(600, 'Text max 600 characters').optional().default('')
});

const highlightSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(120, 'Highlight title max 120 characters').optional().default(''),
  text: z.string().max(200, 'Highlight text max 200 characters').optional().default('')
});

export const overviewSchema = z.object({
  eyebrow: z.string().max(200).optional().default(''),
  title: z.string().max(200).optional().default(''),
  body: z.string().max(50000).optional().default(''),
  image: z.string().optional().default('')
});

export const landingSchema = z.object({
  heading: z.string().max(300).optional().default(''),
  cards: z.array(cardSchema).optional().default([])
});

export const whoAreWeSchema = z.object({
  hero: z.object({
    eyebrow: z.string().max(200).optional().default(''),
    title: z.string().max(200).optional().default(''),
    subtitle: z.string().max(500).optional().default(''),
    backgroundImage: z.string().optional().default('')
  }).optional().default({}),
  identity: z.object({
    eyebrow: z.string().max(200).optional().default(''),
    title: z.string().max(200).optional().default(''),
    body: z.string().max(50000).optional().default(''),
    image: z.string().optional().default('')
  }).optional().default({}),
  founder: z.object({
    eyebrow: z.string().max(200).optional().default(''),
    title: z.string().max(200).optional().default(''),
    name: z.string().max(120).optional().default(''),
    role: z.string().max(200).optional().default(''),
    photo: z.string().optional().default(''),
    quote: z.string().max(2000).optional().default(''),
    body: z.string().max(50000).optional().default('')
  }).optional().default({}),
  pillars: z.object({
    eyebrow: z.string().max(200).optional().default(''),
    title: z.string().max(200).optional().default(''),
    subtitle: z.string().max(500).optional().default(''),
    items: z.array(itemSchema).optional().default([])
  }).optional().default({})
});

export const teamPageSchema = z.object({
  hero: z.object({
    eyebrow: z.string().max(200).optional().default(''),
    title: z.string().max(200).optional().default(''),
    subtitle: z.string().max(500).optional().default(''),
    backgroundImage: z.string().optional().default('')
  }).optional().default({}),
  intro: z.object({
    eyebrow: z.string().max(200).optional().default(''),
    title: z.string().max(200).optional().default(''),
    body: z.string().max(50000).optional().default(''),
    highlights: z.array(highlightSchema).optional().default([])
  }).optional().default({})
});

export const updateWhoWeAreContentSchema = z.object({
  overview: overviewSchema.optional(),
  landing: landingSchema.optional(),
  whoAreWe: whoAreWeSchema.optional(),
  teamPage: teamPageSchema.optional()
});

export const patchSectionParamSchema = z.object({
  section: z.enum(['overview', 'landing', 'whoAreWe', 'teamPage'], {
    errorMap: () => ({ message: "Section must be one of: 'overview', 'landing', 'whoAreWe', 'teamPage'" })
  })
});
