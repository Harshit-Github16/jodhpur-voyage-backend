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

const postSchema = new mongoose.Schema(
  {
    wordpressId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true
    },
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
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200'
    },
    category: {
      type: String,
      default: 'Travel Guide'
    },
    categories: [
      {
        id: { type: Number },
        name: { type: String },
        slug: { type: String }
      }
    ],
    tags: [
      {
        type: String
      }
    ],
    tagsDetails: [
      {
        id: { type: Number },
        name: { type: String },
        slug: { type: String }
      }
    ],
    author: {
      type: authorSchema,
      default: () => ({
        name: 'Jodhpur Voyage',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'Travel Specialist'
      })
    },
    readTime: {
      type: String,
      default: '5 min read'
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
      enum: ['Published', 'Draft', 'publish', 'draft'],
      default: 'Published',
      index: true
    },
    originalUrl: {
      type: String,
      default: ''
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    modifiedAt: {
      type: Date
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

postSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title);
  }
  next();
});

postSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

const Post = mongoose.model('Post', postSchema);
export default Post;
