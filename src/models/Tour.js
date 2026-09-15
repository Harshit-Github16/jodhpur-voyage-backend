import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const itinerarySchema = new mongoose.Schema(
  {
    day: { type: Number, default: 1 },
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    meals: { type: String, default: '' },
    stay: { type: String, default: '' }
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true }
  },
  { _id: false }
);

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tour title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: false,
      index: true
    },
    cityName: {
      type: String,
      default: 'Jodhpur'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true
    }, // e.g., 'Royal Heritage', 'Desert Safari', 'Culture & Food'
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
      index: true
    },
    originalPrice: {
      type: Number,
      min: 0
    },
    duration: {
      type: String,
      default: '1 Day'
    }, // e.g. "3 Days / 2 Nights"
    groupSize: {
      type: String,
      default: 'Max 12 People'
    },
    location: {
      type: String,
      default: 'Jodhpur, Rajasthan'
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'
    },
    gallery: [{
      type: String
    }],
    overview: {
      type: String,
      default: ''
    },
    highlights: [{
      type: String
    }],
    itinerary: [itinerarySchema],
    inclusions: [{
      type: String
    }],
    exclusions: [{
      type: String
    }],
    faqs: [faqSchema],
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
      index: true
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    badge: {
      type: String,
      default: ''
    }, // e.g. "Bestseller", "Featured", "Trending"
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Inactive'],
      default: 'Active',
      index: true
    },
    totalBookings: {
      type: Number,
      default: 0
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

tourSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title);
  }
  next();
});

tourSchema.index({ title: 'text', location: 'text', overview: 'text' });
tourSchema.index({ price: 1, rating: -1 });
tourSchema.index({ status: 1, category: 1 });

const Tour = mongoose.model('Tour', tourSchema);
export default Tour;
