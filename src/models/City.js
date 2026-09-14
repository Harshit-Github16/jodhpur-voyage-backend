import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DestinationCategory',
      required: [true, 'Category ID is required'],
      index: true
    },
    categoryName: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      default: 'Rajasthan'
    },
    tagline: {
      type: String,
      default: ''
    },
    heroTitle: {
      type: String,
      default: ''
    },
    metaTitle: {
      type: String,
      default: ''
    },
    metaDescription: {
      type: String,
      default: ''
    },
    keywords: {
      type: String,
      default: ''
    },
    bannerImage: {
      type: String,
      required: [true, 'Banner image URL is required']
    },
    gallery: [{
      type: String
    }],
    highlights: [{
      type: String
    }],
    faqs: [faqSchema],
    packagesCount: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: ['Published', 'Draft'],
      default: 'Published',
      index: true
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

citySchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

// Text index for full-text search
citySchema.index({ name: 'text', state: 'text', tagline: 'text', keywords: 'text' });

const City = mongoose.model('City', citySchema);
export default City;
