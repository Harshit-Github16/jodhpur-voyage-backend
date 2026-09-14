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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true
    },
    authorAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    authorLocation: {
      type: String,
      default: 'India'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: [true, 'Review title is required']
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

const Review = mongoose.model('Review', reviewSchema);
export default Review;
