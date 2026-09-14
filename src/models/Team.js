import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Role is required']
    }, // e.g., "Founder & Chief Explorer", "Lead Jodhpur Guide"
    bio: {
      type: String,
      required: [true, 'Bio is required']
    },
    image: {
      type: String,
      required: [true, 'Image URL is required']
    },
    order: {
      type: Number,
      default: 0
    },
    experienceYears: {
      type: Number,
      default: 5
    },
    socials: {
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' }
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

const Team = mongoose.model('Team', teamSchema);
export default Team;
