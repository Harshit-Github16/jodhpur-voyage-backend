import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      index: true
    }, // e.g. "BK-2026-9041"
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Tour ID is required'],
      index: true
    },
    tourTitle: {
      type: String,
      required: [true, 'Tour title is required']
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true
    },
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required']
    },
    guests: {
      adults: {
        type: Number,
        default: 1,
        min: 1
      },
      children: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Confirmed',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
      default: 'Paid',
      index: true
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay'
    },
    paymentDetails: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String }
    },
    specialRequests: {
      type: String,
      default: ''
    },
    cancellationReason: {
      type: String,
      default: ''
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

bookingSchema.pre('validate', function (next) {
  if (!this.bookingNumber) {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.bookingNumber = `BK-${year}-${random}`;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
