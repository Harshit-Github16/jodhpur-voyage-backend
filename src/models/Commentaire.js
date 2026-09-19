import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Client Jodhpur Voyage' },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    location: { type: String, default: 'France' }
  },
  { _id: false }
);

const commentaireSchema = new mongoose.Schema(
  {
    wordpressId: {
      type: Number,
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
    content: {
      type: String,
      default: ''
    },
    excerpt: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    tourName: {
      type: String,
      default: ''
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200'
    },
    author: {
      type: authorSchema,
      default: () => ({
        name: 'Client Jodhpur Voyage',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        location: 'France'
      })
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

commentaireSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title);
  }
  next();
});

commentaireSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

const Commentaire = mongoose.models.Commentaire || mongoose.model('Commentaire', commentaireSchema);
export default Commentaire;
