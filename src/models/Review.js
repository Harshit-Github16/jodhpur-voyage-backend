import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      index: true
    },
    tourTitle: {
      type: String
    },
    packageTitle: {
      type: String
    },
    tourDate: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    authorName: {
      type: String,
      default: 'Traveler',
      trim: true
    },
    customerName: {
      type: String,
      trim: true
    },
    authorAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    customerAvatar: {
      type: String
    },
    authorLocation: {
      type: String,
      default: 'India'
    },
    customerLocation: {
      type: String
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
      default: 5
    },
    title: {
      type: String,
      default: 'Amazing experience in Rajasthan!'
    },
    comment: {
      type: String,
      required: [true, 'Comment is required']
    },
    photos: [{
      type: String
    }],
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Approved',
      index: true
    },
    featured: {
      type: Boolean,
      default: false
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

// Static method to recalculate average rating for Tour
reviewSchema.statics.calculateTourRating = async function (tourId) {
  if (!tourId) return;

  const stats = await this.aggregate([
    {
      $match: { tourId: new mongoose.Types.ObjectId(tourId), status: 'Approved' }
    },
    {
      $group: {
        _id: '$tourId',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  const Tour = mongoose.model('Tour');
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewsCount: stats[0].nRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      rating: 5.0,
      reviewsCount: 0
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calculateTourRating(this.tourId);
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
