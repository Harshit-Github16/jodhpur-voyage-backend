import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour'
    },
    tourTitle: {
      type: String
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City'
    },
    travelDate: {
      type: Date
    },
    guestsCount: {
      type: Number,
      default: 1
    },
    message: {
      type: String,
      required: [true, 'Message is required']
    },
    type: {
      type: String,
      enum: ['General Contact', 'Custom Tour', 'Package Booking Enquiry'],
      default: 'General Contact'
    },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Contacted', 'Converted', 'Closed'],
      default: 'New',
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: [noteSchema]
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

const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);
export default Enquiry;
