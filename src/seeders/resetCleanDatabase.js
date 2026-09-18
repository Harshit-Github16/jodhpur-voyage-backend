import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import DestinationCategory from '../models/DestinationCategory.js';
import City from '../models/City.js';
import Tour from '../models/Tour.js';
import Booking from '../models/Booking.js';
import Enquiry from '../models/Enquiry.js';
import Review from '../models/Review.js';
import Blog from '../models/Blog.js';
import Team from '../models/Team.js';
import Setting from '../models/Setting.js';
import WhoWeAreContent from '../models/WhoWeAreContent.js';
import { ROLES } from '../constants/roles.js';

dotenv.config();

export const resetCleanDatabase = async () => {
  try {
    console.log('🔄 Connecting to Database...');
    await connectDB();

    console.log('🧹 Clearing all seed data from collections (Tours, Cities, Categories, Bookings, Enquiries, Reviews, Team, Users)...');
    await Promise.all([
      User.deleteMany({}),
      DestinationCategory.deleteMany({}),
      City.deleteMany({}),
      Tour.deleteMany({}),
      Booking.deleteMany({}),
      Enquiry.deleteMany({}),
      Review.deleteMany({}),
      Team.deleteMany({}),
      WhoWeAreContent.deleteMany({})
    ]);

    console.log('👤 Creating requested Super Admin User (admin@jodhpur.com / 12345678)...');
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@jodhpur.com',
      password: '12345678',
      role: ROLES.SUPER_ADMIN,
      phone: '+91 98290 12345',
      permissions: ['all'],
      status: 'Active'
    });

    console.log('📄 Ensuring clean Who We Are Content...');
    await WhoWeAreContent.getOrInitContent();

    console.log('⚙️ Ensuring clean Site Settings...');
    await Setting.deleteMany({});
    await Setting.create({
      siteName: 'Jodhpur Voyage',
      siteTagline: 'Curated Heritage & Experiential Tours',
      supportEmail: 'contact@jodhpurvoyage.com',
      supportPhone: '+91 98290 12345',
      address: 'Clock Tower Square, Old City, Jodhpur, Rajasthan 342001',
      socialLinks: {
        instagram: 'https://instagram.com/jodhpurvoyage',
        facebook: 'https://facebook.com/jodhpurvoyage',
        youtube: 'https://youtube.com/@jodhpurvoyage'
      },
      currency: 'INR',
      currencySymbol: '₹',
      bookingConfirmationEmail: true,
      maintenanceMode: false
    });

    const totalBlogs = await Blog.countDocuments();
    console.log(`📚 Preserved ${totalBlogs} live WordPress blogs in database.`);

    console.log('\n========================================');
    console.log('✅ Clean Database Setup Completed!');
    console.log('========================================');
    console.log('🔑 Super Admin Credentials:');
    console.log('   Email:    admin@jodhpur.com');
    console.log('   Password: 12345678');
    console.log(`📝 Live Blogs Count: ${totalBlogs}`);
    console.log('========================================\n');

    return { superAdmin, totalBlogs };
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
};

if (process.argv[1]?.endsWith('resetCleanDatabase.js')) {
  resetCleanDatabase()
    .then(() => {
      console.log('🎉 Reset process completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default resetCleanDatabase;
