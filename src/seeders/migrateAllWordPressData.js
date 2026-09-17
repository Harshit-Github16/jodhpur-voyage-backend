import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Post from '../models/Post.js';
import Blog from '../models/Blog.js';
import Commentaire from '../models/Commentaire.js';

dotenv.config();

const BASE_WP_URL = process.env.WP_BASE_URL || 'https://www.jodhpurvoyage.com/wp-json/wp/v2';
const WP_SITE_URL = 'https://www.jodhpurvoyage.com';

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/xml, text/html, */*'
};

/**
 * Robust fetch with exponential backoff retry
 */
export const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 500) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...options, headers: { ...REQUEST_HEADERS, ...(options.headers || {}) } });
      if (res.ok || res.status === 404 || res.status === 400) {
        return res;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, backoff * Math.pow(2, i)));
    }
  }
};

/**
 * Clean & decode basic HTML entities from title/strings
 */
export const decodeHtml = (str = '') => {
  if (!str) return '';
  return str
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, "...")
    .trim();
};

/**
 * Clean plain text for excerpt
 */
export const cleanExcerpt = (str = '') => {
  if (!str) return '';
  return decodeHtml(str.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim());
};

/**
 * Calculate read time based on word count
 */
export const calculateReadTime = (html = '') => {
  const text = html.replace(/<[^>]*>?/gm, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

/**
 * Fetch all categories from WordPress with pagination headers (x-wp-total, x-wp-totalpages)
 */
export const fetchAllCategories = async () => {
  const categoryMap = new Map();
  let page = 1;
  let hasMore = true;

  console.log('📂 Fetching all WordPress categories from REST API...');
  while (hasMore) {
    try {
      const res = await fetch(`${BASE_WP_URL}/categories?per_page=100&page=${page}`, {
        headers: REQUEST_HEADERS
      });
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
 * Fetch all tags from WordPress with pagination headers
 */
export const fetchAllTags = async () => {
  const tagMap = new Map();
  let page = 1;
  let hasMore = true;

  console.log('🏷️  Fetching all WordPress tags from REST API...');
  while (hasMore) {
    try {
      const res = await fetch(`${BASE_WP_URL}/tags?per_page=100&page=${page}`, {
        headers: REQUEST_HEADERS
      });
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
 * Helper to fetch sitemap URLs
 */
const fetchSitemapUrls = async (sitemapUrl) => {
  try {
    const res = await fetchWithRetry(sitemapUrl);
    if (!res.ok) return [];
    const text = await res.text();
    const locs = [];
    const re = /<loc>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/loc>/gi;
    let match;
    while ((match = re.exec(text)) !== null) {
      const url = match[1].trim();
      if (url && !locs.includes(url)) {
        locs.push(url);
      }
    }
    return locs;
  } catch (err) {
    console.error(`❌ Failed to fetch sitemap ${sitemapUrl}:`, err.message);
    return [];
  }
};

/**
 * =========================================================================
 * 1. MIGRATE WORDPRESS POSTS (/wp-json/wp/v2/posts) -> MongoDB Post Model
 * =========================================================================
 */
export const migrateWordPressPosts = async () => {
  await connectDB();
  const stats = {
    module: 'Posts',
    totalReportedByWP: 0,
    totalFetched: 0,
    insertedCount: 0,
    updatedCount: 0,
    failedCount: 0,
    missingWpIds: [],
    errors: [],
    startTime: new Date().toISOString(),
    endTime: null
  };

  console.log('\n======================================================');
  console.log('📌 STARTING WORDPRESS POSTS MIGRATION (/wp-json/wp/v2/posts)');
  console.log('======================================================\n');

  const [categoryMap, tagMap] = await Promise.all([
    fetchAllCategories(),
    fetchAllTags()
  ]);

  let page = 1;
  let hasMore = true;
  let totalWpPages = 1;

  while (hasMore) {
    console.log(`📥 Fetching WordPress posts page ${page}...`);
    let posts = [];
    try {
      const res = await fetchWithRetry(`${BASE_WP_URL}/posts?per_page=100&page=${page}&_embed=1`);

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
        stats.totalReportedByWP = parseInt(totalPostsHeader, 10);
        console.log(`📊 WordPress reports total ${stats.totalReportedByWP} posts across ${totalWpPages} page(s).`);
      }

      posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) {
        break;
      }
    } catch (fetchErr) {
      console.error(`❌ Failed to fetch posts page ${page}:`, fetchErr.message);
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

        const postData = {
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
          originalUrl: post.link || `${WP_SITE_URL}/${slug}/`,
          publishedAt: new Date(post.date_gmt || post.date || Date.now()),
          modifiedAt: new Date(post.modified_gmt || post.modified || Date.now())
        };

        const existing = await Post.findOne({
          $or: [{ wordpressId: post.id }, { slug }]
        });

        if (existing) {
          await Post.updateOne({ _id: existing._id }, { $set: postData });
          stats.updatedCount++;
        } else {
          await Post.create(postData);
          stats.insertedCount++;
        }
      } catch (postErr) {
        console.error(`❌ Error processing post ID ${post.id}:`, postErr.message);
        stats.failedCount++;
        stats.errors.push(`Post ID ${post.id}: ${postErr.message}`);
        stats.missingWpIds.push(post.id);
      }
    }

    if (page >= totalWpPages) {
      hasMore = false;
    } else {
      page++;
    }
  }

  stats.endTime = new Date().toISOString();
  console.log(`✅ Posts Migration Complete: Inserted=${stats.insertedCount}, Updated=${stats.updatedCount}, Total=${stats.totalFetched}`);
  return stats;
};

/**
 * =========================================================================
 * 2. MIGRATE WORDPRESS BLOGS (/blog/*) -> MongoDB Blog Model
 * =========================================================================
 */
export const migrateWordPressBlogs = async () => {
  await connectDB();
  const stats = {
    module: 'Blogs',
    totalReportedByWP: 0,
    totalFetched: 0,
    insertedCount: 0,
    updatedCount: 0,
    failedCount: 0,
    errors: [],
    startTime: new Date().toISOString(),
    endTime: null
  };

  console.log('\n======================================================');
  console.log('✍️  STARTING WORDPRESS BLOGS MIGRATION (/blog/*)');
  console.log('======================================================\n');

  const sitemapUrl = `${WP_SITE_URL}/blog-sitemap.xml`;
  const blogUrls = await fetchSitemapUrls(sitemapUrl);
  stats.totalReportedByWP = blogUrls.length;
  console.log(`🌐 Found ${blogUrls.length} blogs in ${sitemapUrl}`);

  // Process in batches of 10 for high speed and low server load
  const BATCH_SIZE = 10;
  for (let i = 0; i < blogUrls.length; i += BATCH_SIZE) {
    const chunk = blogUrls.slice(i, i + BATCH_SIZE);
    console.log(`⏳ Processing Blogs batch ${i + 1} to ${Math.min(i + BATCH_SIZE, blogUrls.length)} of ${blogUrls.length}...`);

    await Promise.all(
      chunk.map(async (url) => {
        try {
          const res = await fetchWithRetry(url, {}, 4, 600);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const html = await res.text();

          // Extract slug from URL: e.g. https://www.jodhpurvoyage.com/blog/voyage-a-jaisalmer/ -> voyage-a-jaisalmer
          const urlMatch = url.match(/\/blog\/([^/]+)\/?$/i);
          const slug = urlMatch ? urlMatch[1] : url.split('/').filter(Boolean).pop();

          // Extract title
          const titleMatch =
            html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
            html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
            html.match(/<title>([^<]*)<\/title>/i);

          let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : slug;
          title = decodeHtml(title).replace(/ - jodhpurvoyage.*$/i, '').replace(/ - .*Voyage.*$/i, '').trim();

          // Extract date
          const dateMatch =
            html.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/i) ||
            html.match(/<time[^>]*datetime="([^"]+)"/i);
          const publishedAt = dateMatch ? new Date(dateMatch[1]) : new Date();

          const modDateMatch = html.match(/<meta[^>]*property="article:modified_time"[^>]*content="([^"]+)"/i);
          const modifiedAt = modDateMatch ? new Date(modDateMatch[1]) : publishedAt;

          // Extract description / excerpt
          const descMatch =
            html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i) ||
            html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
          const excerpt = cleanExcerpt(descMatch ? descMatch[1] : '');

          // Extract content
          const contentMatch =
            html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<!-- \.entry-content -->/i) ||
            html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
            html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);

          const content = contentMatch ? contentMatch[1].trim() : `<p>${excerpt}</p>`;

          // Extract cover image
          const ogImg = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
          const contentImg = content.match(/<img[^>]+src=["']([^"']+)["']/i);
          const coverImage =
            ogImg?.[1] ||
            contentImg?.[1] ||
            'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200';

          // Extract category
          const catMatch =
            html.match(/<a[^>]*rel="category[^"]*"[^>]*>([\s\S]*?)<\/a>/i) ||
            html.match(/<meta[^>]*property="article:section"[^>]*content="([^"]+)"/i);
          const primaryCategory = catMatch ? decodeHtml(catMatch[1].replace(/<[^>]+>/g, '').trim()) : 'Travel Guide';

          const blogData = {
            title,
            slug,
            excerpt: excerpt || cleanExcerpt(content).slice(0, 160),
            content,
            coverImage,
            category: primaryCategory,
            categories: [{ name: primaryCategory, slug: primaryCategory.toLowerCase().replace(/\s+/g, '-') }],
            tags: ['India', 'Travel', primaryCategory],
            tagsDetails: [{ name: primaryCategory, slug: primaryCategory.toLowerCase().replace(/\s+/g, '-') }],
            author: {
              name: 'Jodhpur Voyage',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              role: 'Travel Specialist'
            },
            readTime: calculateReadTime(content),
            status: 'Published',
            originalUrl: url,
            publishedAt,
            modifiedAt
          };

          const existing = await Blog.findOne({
            $or: [{ slug }, { originalUrl: url }]
          });

          if (existing) {
            await Blog.updateOne({ _id: existing._id }, { $set: blogData });
            stats.updatedCount++;
          } else {
            await Blog.create(blogData);
            stats.insertedCount++;
          }
          stats.totalFetched++;
        } catch (err) {
          console.error(`❌ Error migrating blog ${url}:`, err.message);
          stats.failedCount++;
          stats.errors.push(`${url}: ${err.message}`);
        }
      })
    );
  }

  stats.endTime = new Date().toISOString();
  console.log(`✅ Blogs Migration Complete: Inserted=${stats.insertedCount}, Updated=${stats.updatedCount}, Total=${stats.totalFetched}`);
  return stats;
};

/**
 * =========================================================================
 * 3. MIGRATE WORDPRESS COMMENTAIRES (/commentaire/*) -> MongoDB Commentaire
 * =========================================================================
 */
export const migrateWordPressCommentaires = async () => {
  await connectDB();
  const stats = {
    module: 'Commentaires',
    totalReportedByWP: 0,
    totalFetched: 0,
    insertedCount: 0,
    updatedCount: 0,
    failedCount: 0,
    errors: [],
    startTime: new Date().toISOString(),
    endTime: null
  };

  console.log('\n======================================================');
  console.log('💬 STARTING WORDPRESS COMMENTAIRES MIGRATION (/commentaire/*)');
  console.log('======================================================\n');

  const sitemapUrl = `${WP_SITE_URL}/commentaire-sitemap.xml`;
  const commUrls = await fetchSitemapUrls(sitemapUrl);
  stats.totalReportedByWP = commUrls.length;
  console.log(`🌐 Found ${commUrls.length} commentaires in ${sitemapUrl}`);

  const BATCH_SIZE = 10;
  for (let i = 0; i < commUrls.length; i += BATCH_SIZE) {
    const chunk = commUrls.slice(i, i + BATCH_SIZE);
    console.log(`⏳ Processing Commentaires batch ${i + 1} to ${Math.min(i + BATCH_SIZE, commUrls.length)} of ${commUrls.length}...`);

    await Promise.all(
      chunk.map(async (url) => {
        try {
          const res = await fetchWithRetry(url, {}, 4, 600);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const html = await res.text();

          const urlMatch = url.match(/\/commentaire\/([^/]+)\/?$/i);
          const slug = urlMatch ? urlMatch[1] : url.split('/').filter(Boolean).pop();

          // Extract title
          const titleMatch =
            html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
            html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
            html.match(/<title>([^<]*)<\/title>/i);

          let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : slug;
          title = decodeHtml(title).replace(/ - jodhpurvoyage.*$/i, '').replace(/ - .*Voyage.*$/i, '').trim();

          // Extract date
          const dateMatch =
            html.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/i) ||
            html.match(/<time[^>]*datetime="([^"]+)"/i);
          const publishedAt = dateMatch ? new Date(dateMatch[1]) : new Date();

          // Extract description / content
          const descMatch =
            html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i) ||
            html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
          const excerpt = cleanExcerpt(descMatch ? descMatch[1] : '');

          const contentMatch =
            html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<!-- \.entry-content -->/i) ||
            html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

          const content = contentMatch ? contentMatch[1].trim() : `<p>${excerpt}</p>`;

          // Extract cover image
          const ogImg = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
          const coverImage = ogImg?.[1] || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200';

          // Extract client author name from text if available
          let authorName = 'Client Jodhpur Voyage';
          const authorInText = excerpt.match(/(?:famille|monsieur|madame|m\.|mme)\s+([A-Za-zÀ-ÿ]+)/i);
          if (authorInText) {
            authorName = `${authorInText[0]}`;
          }

          const commData = {
            title,
            slug,
            excerpt: excerpt || cleanExcerpt(content).slice(0, 160),
            content,
            rating: 5,
            tourName: title,
            coverImage,
            author: {
              name: authorName,
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              location: 'France'
            },
            featured: false,
            status: 'Published',
            originalUrl: url,
            publishedAt,
            modifiedAt: publishedAt
          };

          const existing = await Commentaire.findOne({
            $or: [{ slug }, { originalUrl: url }]
          });

          if (existing) {
            await Commentaire.updateOne({ _id: existing._id }, { $set: commData });
            stats.updatedCount++;
          } else {
            await Commentaire.create(commData);
            stats.insertedCount++;
          }
          stats.totalFetched++;
        } catch (err) {
          console.error(`❌ Error migrating commentaire ${url}:`, err.message);
          stats.failedCount++;
          stats.errors.push(`${url}: ${err.message}`);
        }
      })
    );
  }

  stats.endTime = new Date().toISOString();
  console.log(`✅ Commentaires Migration Complete: Inserted=${stats.insertedCount}, Updated=${stats.updatedCount}, Total=${stats.totalFetched}`);
  return stats;
};

/**
 * =========================================================================
 * 4. RECONCILIATION REPORT & ALL MIGRATION RUNNER
 * =========================================================================
 */
export const generateReconciliationReport = async () => {
  await connectDB();
  const [postCount, blogCount, commCount] = await Promise.all([
    Post.countDocuments(),
    Blog.countDocuments(),
    Commentaire.countDocuments()
  ]);

  const postCategories = await Post.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const blogCategories = await Blog.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  console.log('\n======================================================');
  console.log('📊 WORDPRESS <-> MONGODB RECONCILIATION REPORT');
  console.log('======================================================');
  console.log(`📌 Posts in DB:         ${postCount}`);
  console.log(`✍️  Blogs in DB:         ${blogCount}`);
  console.log(`💬 Commentaires in DB:  ${commCount}`);
  console.log('------------------------------------------------------');
  console.log('📂 Post Categories in DB:');
  postCategories.forEach((c) => console.log(`   - ${c._id || 'Uncategorized'}: ${c.count}`));
  console.log('------------------------------------------------------');
  console.log('📂 Blog Categories in DB:');
  blogCategories.forEach((c) => console.log(`   - ${c._id || 'Uncategorized'}: ${c.count}`));
  console.log('======================================================\n');

  return {
    postCount,
    blogCount,
    commCount,
    postCategories,
    blogCategories
  };
};

export const migrateAllWordPressData = async () => {
  await connectDB();
  console.log('\n🚀 STARTING COMPLETE WORDPRESS DATA MIGRATION');
  console.log(`🌐 Base URL: ${BASE_WP_URL}`);
  console.log(`🌐 Site URL: ${WP_SITE_URL}\n`);

  const postsStats = await migrateWordPressPosts();
  const blogsStats = await migrateWordPressBlogs();
  const commsStats = await migrateWordPressCommentaires();
  const report = await generateReconciliationReport();

  return {
    postsStats,
    blogsStats,
    commsStats,
    report
  };
};

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('migrateAllWordPressData.js')) {
  (async () => {
    try {
      await connectDB();
      const arg = process.argv[2]?.toLowerCase();
      if (arg === 'posts') {
        await migrateWordPressPosts();
      } else if (arg === 'blogs') {
        await migrateWordPressBlogs();
      } else if (arg === 'comms' || arg === 'commentaires') {
        await migrateWordPressCommentaires();
      } else if (arg === 'report') {
        await generateReconciliationReport();
      } else {
        await migrateAllWordPressData();
      }
      console.log('Migration task finished successfully!');
      process.exit(0);
    } catch (err) {
      console.error('💥 Migration process failed:', err);
      process.exit(1);
    }
  })();
}
