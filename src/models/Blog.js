import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    role: { type: String, default: 'Travel Specialist' }
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    excerpt: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    }, // HTML or Markdown
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200'
    },
    category: {
      type: String,
      default: 'Travel Guide'
    }, // e.g. "Travel Guide", "Food & Culture", "Heritage"
    tags: [{
      type: String
    }],
    author: {
      type: authorSchema,
      default: () => ({
        name: 'Harshit Sharma',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'Travel Specialist'
      })
    },
    readTime: {
      type: String,
      default: '4 min read'
    },
    views: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Published', 'Draft'],
      default: 'Published',
      index: true
    },
    publishedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

blogSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title);
  }
  next();
});

blogSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
