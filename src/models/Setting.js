import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Jodhpur Voyage' },
    siteTagline: { type: String, default: 'Curated Heritage & Experiential Tours' },
    supportEmail: { type: String, default: 'contact@jodhpurvoyage.com' },
    supportPhone: { type: String, default: '+91 98290 12345' },
    address: { type: String, default: 'Clock Tower Square, Old City, Jodhpur, Rajasthan 342001' },
    socialLinks: {
      instagram: { type: String, default: 'https://instagram.com/jodhpurvoyage' },
      facebook: { type: String, default: 'https://facebook.com/jodhpurvoyage' },
      youtube: { type: String, default: 'https://youtube.com/@jodhpurvoyage' }
    },
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    bookingConfirmationEmail: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false }
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

// Helper static to get or initialize single settings document
settingSchema.statics.getSettings = async function () {
  let setting = await this.findOne();
  if (!setting) {
    setting = await this.create({});
  }
  return setting;
};

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
export default Setting;
