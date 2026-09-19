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
      required: [true, 'Role is required'],
      trim: true
    }, // e.g., "Founder & Chief Explorer", "North India & Himalayan Travel Expert"
    expertise: {
      type: String,
      trim: true,
      default: ''
    }, // e.g., "Rajasthan, Banaras, Ladakh, Spiti"
    bio: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      trim: true,
      default: ''
    },
    order: {
      type: Number,
      default: 0,
      index: true
    },
    experienceYears: {
      type: Number,
      min: 0,
      default: 0
    },
    socials: {
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
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

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
export default Team;
