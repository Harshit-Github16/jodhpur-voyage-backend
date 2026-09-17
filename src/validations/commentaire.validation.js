import { z } from 'zod';

const authorSchema = z.object({
  name: z.string().optional().default('Client Jodhpur Voyage'),
  avatar: z.string().optional().default('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
  location: z.string().optional().default('France')
});

export const createCommentaireSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(250),
    slug: z.string().optional(),
    content: z.string().optional(),
    excerpt: z.string().optional(),
    description: z.string().optional(),
    rating: z.union([z.number(), z.string()]).optional().default(5),
    tourName: z.string().optional().default(''),
    coverImage: z.string().optional(),
    author: z.union([authorSchema, z.string()]).optional(),
    featured: z.boolean().optional().default(false),
    status: z.enum(['Published', 'Draft', 'Active', 'Inactive']).optional().default('Published')
  })
  .transform((val) => {
    const rawContent = val.content || val.description || val.title;
    const rawExcerpt = val.excerpt || val.description || (rawContent.length > 150 ? rawContent.substring(0, 150) + '...' : rawContent);
    const parsedRating = typeof val.rating === 'string' ? parseFloat(val.rating) || 5 : val.rating || 5;
    const parsedStatus = val.status === 'Draft' || val.status === 'Inactive' ? 'Draft' : 'Published';

    let parsedAuthor = {
      name: 'Client Jodhpur Voyage',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      location: 'France'
    };
    if (typeof val.author === 'string' && val.author) {
      parsedAuthor.name = val.author;
    } else if (val.author && typeof val.author === 'object') {
      parsedAuthor = { ...parsedAuthor, ...val.author };
    }

    return {
      ...val,
      content: rawContent,
      excerpt: rawExcerpt,
      rating: Math.min(5, Math.max(1, parsedRating)),
      status: parsedStatus,
      author: parsedAuthor
    };
  });

export const updateCommentaireSchema = z
  .object({
    title: z.string().min(1).max(250).optional(),
    slug: z.string().optional(),
    content: z.string().optional(),
    excerpt: z.string().optional(),
    description: z.string().optional(),
    rating: z.union([z.number(), z.string()]).optional(),
    tourName: z.string().optional(),
    coverImage: z.string().optional(),
    author: z.union([authorSchema, z.string()]).optional(),
    featured: z.boolean().optional(),
    status: z.enum(['Published', 'Draft', 'Active', 'Inactive']).optional()
  })
  .transform((val) => {
    const res = { ...val };
    if (val.description && !val.content) res.content = val.description;
    if (val.rating !== undefined) {
      const parsedRating = typeof val.rating === 'string' ? parseFloat(val.rating) || 5 : val.rating;
      res.rating = Math.min(5, Math.max(1, parsedRating));
    }
    if (val.status) {
      res.status = val.status === 'Draft' || val.status === 'Inactive' ? 'Draft' : 'Published';
    }
    return res;
  });
