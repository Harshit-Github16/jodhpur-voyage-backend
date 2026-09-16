import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Blog from '../models/Blog.js';

dotenv.config();

// Helper to decode basic HTML entities
const decodeHtmlEntities = (str = '') => {
  return str
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&hellip;/g, '...')
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags for clean plain text
    .trim();
};

// Helper to extract first image from HTML content if featured media is missing
const extractFirstImage = (html = '') => {
  const match = html.match(/<img[^>]+src="([^">]+)"/i);
  return match ? match[1] : null;
};

// Helper to calculate estimated read time
const calculateReadTime = (content = '') => {
  const text = content.replace(/<[^>]*>?/gm, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
};

export const syncWordPressBlogs = async () => {
  try {
    console.log('🔄 Connecting to Database...');
    await connectDB();

    console.log('🌐 Fetching live blogs from WordPress API...');
    const url = 'https://www.jodhpurvoyage.com/wp-json/wp/v2/posts?_embed&per_page=100&page=1';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch WordPress posts: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();
    console.log(`📦 Received ${posts.length} posts from WordPress.`);

    if (!Array.isArray(posts) || posts.length === 0) {
      console.log('⚠️ No posts found to sync.');
      return;
    }

    const formattedBlogs = posts.map((post, index) => {
      const rawTitle = post.title?.rendered || 'Untitled Post';
      const cleanTitle = decodeHtmlEntities(rawTitle);

      const rawContent = post.content?.rendered || '';
      const rawExcerpt = post.excerpt?.rendered ? decodeHtmlEntities(post.excerpt.rendered) : '';

      // Cover image resolution
      const featuredMediaUrl =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.large?.source_url ||
        post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.full?.source_url;

      const fallbackImage = extractFirstImage(rawContent) || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200';
      const coverImage = featuredMediaUrl || fallbackImage;

      // Category resolution
      const categories = post._embedded?.['wp:term']?.[0] || [];
      const categoryName = categories.length > 0 ? decodeHtmlEntities(categories[0].name) : 'Travel Guide';

      // Tags resolution
      const tagsArray = post._embedded?.['wp:term']?.[1] || [];
      const tags = tagsArray.map((t) => decodeHtmlEntities(t.name)).filter(Boolean);

      // Author resolution
      const authorObj = post._embedded?.['author']?.[0];
      const author = {
        name: authorObj?.name || 'Harshit Sharma',
        avatar:
          authorObj?.avatar_urls?.['96'] ||
          authorObj?.avatar_urls?.['48'] ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'Travel Specialist'
      };

      const publishedAt = post.date ? new Date(post.date) : new Date();

      return {
        title: cleanTitle,
        slug: post.slug || `blog-${post.id}`,
        excerpt: rawExcerpt || cleanTitle,
        content: rawContent,
        coverImage,
        category: categoryName,
        tags,
        author,
        readTime: calculateReadTime(rawContent),
        views: Math.floor(Math.random() * 250) + 50,
        featured: index < 5, // Top 5 featured
        status: post.status === 'publish' ? 'Published' : 'Draft',
        publishedAt,
        createdAt: publishedAt
      };
    });

    console.log('🗑️ Removing old blogs from MongoDB...');
    await Blog.deleteMany({});

    console.log(`💾 Inserting ${formattedBlogs.length} new blogs into MongoDB...`);
    const inserted = await Blog.insertMany(formattedBlogs);
    console.log(`✅ Successfully synced ${inserted.length} live WordPress blogs to MongoDB!`);

    return inserted;
  } catch (error) {
    console.error('❌ Error syncing WordPress blogs:', error);
    throw error;
  }
};

// If run directly via CLI
if (process.argv[1]?.endsWith('syncLiveBlogs.js')) {
  syncWordPressBlogs()
    .then(() => {
      console.log('🎉 Blog sync process completed!');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default syncWordPressBlogs;
