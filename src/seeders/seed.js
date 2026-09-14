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
import { ROLES } from '../constants/roles.js';

import {
  seedCategories,
  seedCities,
  seedTours,
  seedBlogs,
  seedTeam,
  seedReviews,
  seedSettings
} from './seedData.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('⏳ Connecting to Database for Seeding...');
    await connectDB();

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      DestinationCategory.deleteMany(),
      City.deleteMany(),
      Tour.deleteMany(),
      Booking.deleteMany(),
      Enquiry.deleteMany(),
      Review.deleteMany(),
      Blog.deleteMany(),
      Team.deleteMany(),
      Setting.deleteMany()
    ]);

    console.log('👤 Seeding Admin and Staff users...');
    const superAdmin = await User.create({
      name: 'Harshit Sharma',
      email: 'admin@jodhpurvoyage.com',
      password: 'jodhpur@2025',
      role: ROLES.SUPER_ADMIN,
      phone: '+91 98290 12345',
      permissions: ['all'],
      status: 'Active'
    });

    const staffGuide = await User.create({
      name: 'Vikram Singh Rathore',
      email: 'vikram@jodhpurvoyage.com',
      password: 'guide@2025',
      role: ROLES.ADMIN,
      phone: '+91 98290 54321',
      permissions: ['tours', 'destinations', 'blogs', 'enquiries'],
      status: 'Active'
    });

    const customerUser = await User.create({
      name: 'Amit Sharma',
      email: 'amit.sharma@gmail.com',
      password: 'customer@2025',
      role: ROLES.CUSTOMER,
      phone: '+91 98112 33445',
      status: 'Active'
    });

    console.log('🗺️  Seeding Destination Categories...');
    const createdCategories = await DestinationCategory.insertMany(seedCategories);
    const northIndiaCat = createdCategories.find((c) => c.slug === 'north-india') || createdCategories[0];
    const desertCircuitsCat = createdCategories.find((c) => c.slug === 'desert-circuits') || createdCategories[1];

    console.log('🏙️  Seeding Cities & Destinations...');
    const citiesToCreate = seedCities.map((city) => {
      const cat = city.slug === 'jaisalmer' ? desertCircuitsCat : northIndiaCat;
      return {
        ...city,
        categoryId: cat._id,
        categoryName: cat.name
      };
    });
    const createdCities = await City.insertMany(citiesToCreate);
    const jodhpurCity = createdCities.find((c) => c.slug === 'jodhpur') || createdCities[0];
    const jaisalmerCity = createdCities.find((c) => c.slug === 'jaisalmer') || createdCities[1];
    const udaipurCity = createdCities.find((c) => c.slug === 'udaipur') || createdCities[2];

    console.log('🐪 Seeding Tour Packages...');
    const toursToCreate = seedTours.map((tour) => {
      let city = jodhpurCity;
      if (tour.slug.includes('jaisalmer')) city = jaisalmerCity;
      if (tour.slug.includes('udaipur')) city = udaipurCity;

      return {
        ...tour,
        cityId: city._id,
        cityName: city.name
      };
    });
    const createdTours = await Tour.insertMany(toursToCreate);

    console.log('📅 Seeding Sample Bookings...');
    const sampleBookings = [
      {
        bookingNumber: 'BK-2026-8812',
        userId: customerUser._id,
        tourId: createdTours[0]._id,
        tourTitle: createdTours[0].title,
        customerName: 'Amit Sharma',
        customerEmail: 'amit.sharma@gmail.com',
        customerPhone: '+91 98112 33445',
        travelDate: new Date('2026-10-15'),
        guests: { adults: 2, children: 1 },
        totalAmount: 34998,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        paymentMethod: 'Razorpay'
      },
      {
        bookingNumber: 'BK-2026-9041',
        tourId: createdTours[1]._id,
        tourTitle: createdTours[1].title,
        customerName: 'Rohit Mehta',
        customerEmail: 'rohit.mehta@example.com',
        customerPhone: '+91 97721 44556',
        travelDate: new Date('2026-11-05'),
        guests: { adults: 4, children: 0 },
        totalAmount: 9996,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        paymentMethod: 'Razorpay'
      }
    ];
    await Booking.insertMany(sampleBookings);

    console.log('💬 Seeding Sample Enquiries / Leads...');
    const sampleEnquiries = [
      {
        name: 'Dr. Ananya Sen',
        email: 'ananya.sen@gmail.com',
        phone: '+91 99887 66554',
        tourId: createdTours[0]._id,
        tourTitle: createdTours[0].title,
        cityId: jodhpurCity._id,
        travelDate: new Date('2026-11-20'),
        guestsCount: 4,
        type: 'Custom Tour',
        status: 'New',
        message: 'We require a private royal dinner at Mehrangarh Fort terrace and luxury tempo traveler.'
      },
      {
        name: 'Michael Vance',
        email: 'michael.vance@yahoo.com',
        phone: '+1 415 555 2671',
        type: 'Package Booking Enquiry',
        tourId: createdTours[2]._id,
        tourTitle: createdTours[2].title,
        guestsCount: 2,
        status: 'In Progress',
        assignedTo: staffGuide._id,
        message: 'Looking for 3 days desert glamping in Jaisalmer with private jeep dune safari.',
        notes: [
          {
            note: 'Sent luxury itinerary and quotation via email.',
            createdBy: staffGuide._id,
            createdByName: 'Vikram Singh Rathore',
            createdAt: new Date()
          }
        ]
      }
    ];
    await Enquiry.insertMany(sampleEnquiries);

    console.log('⭐ Seeding Reviews...');
    const reviewsToCreate = seedReviews.map((rev, idx) => ({
      ...rev,
      tourId: createdTours[idx % createdTours.length]._id,
      tourTitle: createdTours[idx % createdTours.length].title
    }));
    await Review.insertMany(reviewsToCreate);

    console.log('✍️  Seeding Blog Articles...');
    await Blog.insertMany(seedBlogs);

    console.log('👥 Seeding Team Members...');
    await Team.insertMany(seedTeam);

    console.log('⚙️  Seeding System Settings...');
    await Setting.create(seedSettings);

    console.log('\n========================================');
    console.log('🎉 Jodhpur Voyage Database Seeded Successfully!');
    console.log('========================================');
    console.log('🔑 Default Super Admin Credentials:');
    console.log('   Email:    admin@jodhpurvoyage.com');
    console.log('   Password: jodhpur@2025');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
