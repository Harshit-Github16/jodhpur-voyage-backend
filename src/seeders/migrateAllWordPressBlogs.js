import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Blog from '../models/Blog.js';

dotenv.config();

const BASE_WP_URL = process.env.WP_BASE_URL || 'https://www.jodhpurvoyage.com/wp-json/wp/v2';

/**
 * Clean & decode basic HTML entities from title
 */
const decodeHtml = (str = '') => {
  return str
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
};

/**
 * Clean text for excerpt
 */
const cleanExcerpt = (str = '') => {
  return decodeHtml(str.replace(/<[^>]*>?/gm, '').replace(/\n+/g, ' ').trim());
};

/**
 * Calculate read time based on word count
 */
const calculateReadTime = (html = '') => {
  const text = html.replace(/<[^>]*>?/gm, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

/**
 * Fetch all categories from WordPress with pagination
 */
export const fetchAllCategories = async () => {
  const categoryMap = new Map();
  let page = 1;
  let hasMore = true;

  console.log('📂 Fetching all WordPress categories...');
  while (hasMore) {
    try {
      const res = await fetch(`${BASE_WP_URL}/categories?per_page=100&page=${page}`);
      if (!res.ok) {
        hasMore = false;
        break;
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        hasMore = false;
        break;
      }

      data.forEach((cat) => {
        categoryMap.set(cat.id, {
          id: cat.id,
          name: decodeHtml(cat.name),
          slug: cat.slug
        });
      });

      const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
      if (page >= totalPages) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (err) {
      console.warn(`⚠️ Warning fetching categories page ${page}:`, err.message);
      hasMore = false;
    }
  }

  console.log(`✅ Loaded ${categoryMap.size} categories.`);
  return categoryMap;
};

/**
 * Fetch all tags from WordPress with pagination
 */
export const fetchAllTags = async () => {
  const tagMap = new Map();
  let page = 1;
  let hasMore = true;

  console.log('🏷️  Fetching all WordPress tags...');
  while (hasMore) {
    try {
      const res = await fetch(`${BASE_WP_URL}/tags?per_page=100&page=${page}`);
      if (!res.ok) {
        hasMore = false;
        break;
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        hasMore = false;
        break;
      }

      data.forEach((tag) => {
        tagMap.set(tag.id, {
          id: tag.id,
          name: decodeHtml(tag.name),
          slug: tag.slug
        });
      });

      const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
      if (page >= totalPages) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (err) {
      console.warn(`⚠️ Warning fetching tags page ${page}:`, err.message);
      hasMore = false;
    }
  }

  console.log(`✅ Loaded ${tagMap.size} tags.`);
  return tagMap;
};

/**
 * Main migration function
 */
export const migrateAllWordPressBlogs = async () => {
  const stats = {
    totalFetched: 0,
    insertedCount: 0,
    updatedCount: 0,
    failedCount: 0,
    errors: [],
    startTime: new Date().toISOString(),
    endTime: null
  };

  console.log('\n======================================================');
  console.log('🚀 STARTING COMPREHENSIVE WORDPRESS BLOG MIGRATION');
  console.log(`🌐 Base URL: ${BASE_WP_URL}`);
  console.log('======================================================\n');

  // 1. Fetch categories and tags
  const [categoryMap, tagMap] = await Promise.all([
    fetchAllCategories(),
    fetchAllTags()
  ]);

  let page = 1;
  let hasMore = true;
  let totalWpPages = 1;

  while (hasMore) {
    console.log(`\n📥 Fetching WordPress posts page ${page}...`);
    let posts = [];
    try {
      const res = await fetch(`${BASE_WP_URL}/posts?per_page=100&page=${page}&_embed=1`);
      
      if (!res.ok) {
        if (res.status === 400 || res.status === 404) {
          console.log(`ℹ️ Reached end of posts at page ${page}.`);
        } else {
          console.error(`❌ HTTP error ${res.status} on page ${page}`);
        }
        break;
      }

      const totalPagesHeader = res.headers.get('x-wp-totalpages');
      const totalPostsHeader = res.headers.get('x-wp-total');
      if (totalPagesHeader) totalWpPages = parseInt(totalPagesHeader, 10);
      if (totalPostsHeader && page === 1) {
        console.log(`📊 WordPress reports total ${totalPostsHeader} posts across ${totalWpPages} page(s).`);
      }

      posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) {
        break;
      }
    } catch (fetchErr) {
      console.error(`❌ Failed to fetch page ${page}:`, fetchErr.message);
      stats.failedCount++;
      stats.errors.push(`Page ${page} fetch failure: ${fetchErr.message}`);
      break;
    }

    console.log(`📦 Processing ${posts.length} posts from page ${page}...`);
    stats.totalFetched += posts.length;

    for (const post of posts) {
      try {
        const title = decodeHtml(post.title?.rendered || 'Untitled Post');
        const slug = post.slug || `post-${post.id}`;
        const rawContent = post.content?.rendered || '';
        const rawExcerpt = post.excerpt?.rendered || '';
        const cleanExp = cleanExcerpt(rawExcerpt) || cleanExcerpt(rawContent).slice(0, 160);

        // Resolve featured image
        let coverImage = 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200';
        if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
          coverImage = post._embedded['wp:featuredmedia'][0].source_url;
        } else {
          // Extract first <img> src from content
          const imgMatch = rawContent.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch && imgMatch[1]) {
            coverImage = imgMatch[1];
          }
        }

        // Resolve categories
        const resolvedCategories = (post.categories || [])
          .map((catId) => categoryMap.get(catId))
          .filter(Boolean);

        const primaryCategory = resolvedCategories[0]?.name || 'Travel Guide';

        // Resolve tags
        const resolvedTagsDetails = (post.tags || [])
          .map((tagId) => tagMap.get(tagId))
          .filter(Boolean);

        const tagNames = resolvedTagsDetails.map((t) => t.name);

        // Resolve author
        const embeddedAuthor = post._embedded?.author?.[0];
        const authorName = embeddedAuthor?.name || 'Jodhpur Voyage';
        const authorAvatar =
          embeddedAuthor?.avatar_urls?.['96'] ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

        const blogData = {
          wordpressId: post.id,
          title,
          slug,
          excerpt: cleanExp,
          content: rawContent,
          coverImage,
          category: primaryCategory,
          categories: resolvedCategories,
          tags: tagNames,
          tagsDetails: resolvedTagsDetails,
          author: {
            name: authorName,
            avatar: authorAvatar,
            role: 'Travel Specialist'
          },
          readTime: calculateReadTime(rawContent),
          status: post.status === 'publish' ? 'Published' : 'Draft',
          originalUrl: post.link || `https://www.jodhpurvoyage.com/${slug}/`,
          publishedAt: new Date(post.date_gmt || post.date || Date.now()),
          modifiedAt: new Date(post.modified_gmt || post.modified || Date.now())
        };

        // Unique upsert based on wordpressId OR slug
        const existing = await Blog.findOne({
          $or: [{ wordpressId: post.id }, { slug }]
        });

        if (existing) {
          await Blog.updateOne({ _id: existing._id }, { $set: blogData });
          stats.updatedCount++;
        } else {
          await Blog.create(blogData);
          stats.insertedCount++;
        }
      } catch (postErr) {
        console.error(`❌ Error processing post ID ${post.id} ("${post.slug}"):`, postErr.message);
        stats.failedCount++;
        stats.errors.push(`Post ID ${post.id} (${post.slug}): ${postErr.message}`);
      }
    }

    if (page >= totalWpPages) {
      hasMore = false;
    } else {
      page++;
    }
  }

  stats.endTime = new Date().toISOString();

  console.log('\n======================================================');
  console.log('🎉 WORDPRESS BLOG MIGRATION COMPLETED');
  console.log(`📊 Total Fetched:  ${stats.totalFetched}`);
  console.log(`➕ Inserted:       ${stats.insertedCount}`);
  console.log(`🔄 Updated:        ${stats.updatedCount}`);
  console.log(`❌ Failed:         ${stats.failedCount}`);
  if (stats.errors.length > 0) {
    console.log(`⚠️ Errors:         ${stats.errors.length}`);
  }
  console.log('======================================================\n');

  return stats;
};

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('migrateAllWordPressBlogs.js')) {
  (async () => {
    try {
      await connectDB();
      const stats = await migrateAllWordPressBlogs();
      console.log('Migration Result Summary:', JSON.stringify(stats, null, 2));
      process.exit(0);
    } catch (err) {
      console.error('💥 Migration failed:', err);
      process.exit(1);
    }
  })();
}
