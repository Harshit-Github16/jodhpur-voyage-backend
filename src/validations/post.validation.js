import { z } from 'zod';

const authorSchema = z.object({
  name: z.string().optional().default('Jodhpur Voyage'),
  avatar: z.string().optional().default('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
  role: z.string().optional().default('Travel Specialist')
});

export const createPostSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(250),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    body: z.string().optional(),
    coverImage: z.string().optional(),
    image: z.string().optional(),
    banner: z.string().optional(),
    category: z.string().optional().default('Travel Guide'),
    categories: z.array(z.any()).optional().default([]),
    tags: z.union([z.array(z.string()), z.string()]).optional().default([]),
    tagsDetails: z.array(z.any()).optional().default([]),
    author: z.union([authorSchema, z.string()]).optional(),
    readTime: z.string().optional().default('5 min read'),
    featured: z.boolean().optional().default(false),
    status: z.enum(['Published', 'Draft', 'Active', 'Inactive']).optional().default('Published')
  })
  .transform((val) => {
    const rawContent =
      val.content ||
      val.body ||
      val.description ||
      val.summary ||
      val.title ||
      '';
    const rawExcerpt =
      val.excerpt ||
      val.summary ||
      val.description ||
      (rawContent.length > 150 ? rawContent.substring(0, 150) + '...' : rawContent);
    const rawCover =
      val.coverImage ||
      val.image ||
      val.banner ||
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200';
    const parsedTags = Array.isArray(val.tags)
      ? val.tags
      : typeof val.tags === 'string' && val.tags
      ? val.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    const parsedStatus = val.status === 'Draft' || val.status === 'Inactive' ? 'Draft' : 'Published';

    let parsedAuthor = {
      name: 'Jodhpur Voyage',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'Travel Specialist'
    };
    if (typeof val.author === 'string' && val.author) {
      parsedAuthor.name = val.author;
    } else if (val.author && typeof val.author === 'object') {
      parsedAuthor = { ...parsedAuthor, ...val.author };
    }

    return {
      ...val,
      excerpt: rawExcerpt,
      content: rawContent,
      coverImage: rawCover,
      tags: parsedTags,
      status: parsedStatus,
      author: parsedAuthor
    };
  });

export const updatePostSchema = z
  .object({
    title: z.string().min(1).max(250).optional(),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    body: z.string().optional(),
    coverImage: z.string().optional(),
    image: z.string().optional(),
    banner: z.string().optional(),
    category: z.string().optional(),
    categories: z.array(z.any()).optional(),
    tags: z.union([z.array(z.string()), z.string()]).optional(),
    tagsDetails: z.array(z.any()).optional(),
    author: z.union([authorSchema, z.string()]).optional(),
    readTime: z.string().optional(),
    featured: z.boolean().optional(),
    status: z.enum(['Published', 'Draft', 'Active', 'Inactive']).optional()
  })
  .transform((val) => {
    const res = { ...val };
    if (val.body && !val.content) res.content = val.body;
    if (!res.content && val.description) res.content = val.description;
    if (!res.excerpt && (val.summary || val.description)) res.excerpt = val.summary || val.description;
    if (!res.coverImage && (val.image || val.banner)) res.coverImage = val.image || val.banner;
    if (val.tags !== undefined) {
      res.tags = Array.isArray(val.tags)
        ? val.tags
        : typeof val.tags === 'string' && val.tags
        ? val.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
    }
    if (val.status) {
      res.status = val.status === 'Draft' || val.status === 'Inactive' ? 'Draft' : 'Published';
    }
    return res;
  });
