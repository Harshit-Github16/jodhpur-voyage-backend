import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const destinationCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    tagline: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required']
    },
    order: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
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

destinationCategorySchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

const DestinationCategory = mongoose.model('DestinationCategory', destinationCategorySchema);
export default DestinationCategory;
