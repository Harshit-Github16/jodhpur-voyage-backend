import Booking from '../models/Booking.js';
import Tour from '../models/Tour.js';
import City from '../models/City.js';
import User from '../models/User.js';
import Enquiry from '../models/Enquiry.js';
import Review from '../models/Review.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { STATUS_CODES } from '../constants/statusCodes.js';
import { ROLES } from '../constants/roles.js';

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const [
    totalBookings,
    totalCustomers,
    activePackages,
    totalCities,
    pendingEnquiries,
    revenueAgg,
    recentBookings,
    recentEnquiries,
    reviewsAgg
  ] = await Promise.all([
    Booking.countDocuments(),
    User.countDocuments({ role: ROLES.CUSTOMER }),
    Tour.countDocuments({ status: 'Active' }),
    City.countDocuments({ status: 'Published' }),
    Enquiry.countDocuments({ status: { $in: ['New', 'In Progress'] } }),
    Booking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Booking.find().sort({ createdAt: -1 }).limit(5).lean(),
    Enquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
    Review.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ])
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
  const averageRating = reviewsAgg[0]?.avg ? Math.round(reviewsAgg[0].avg * 100) / 100 : 0;

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        totalRevenue,
        revenueGrowth: totalRevenue > 0 ? '+0%' : '0%',
        totalBookings,
        bookingsGrowth: totalBookings > 0 ? '+0%' : '0%',
        totalCustomers,
        activePackages,
        totalCities,
        pendingEnquiries,
        averageRating,
        recentBookings: recentBookings.map((b) => ({
          id: b._id,
          bookingNumber: b.bookingNumber,
          customerName: b.customerName,
          tourTitle: b.tourTitle,
          totalAmount: b.totalAmount,
          status: b.status,
          createdAt: b.createdAt
        })),
        recentEnquiries: recentEnquiries.map((e) => ({
          id: e._id,
          name: e.name,
          email: e.email,
          type: e.type,
          status: e.status,
          createdAt: e.createdAt
        }))
      },
      'Dashboard analytics retrieved'
    )
  );
});

export const getRevenueTrend = asyncHandler(async (req, res) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const last6Months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      name: months[d.getMonth()]
    });
  }

  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const bookingsAgg = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        paymentStatus: 'Paid'
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 }
      }
    }
  ]);

  const aggMap = new Map();
  bookingsAgg.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    aggMap.set(key, item);
  });

  const trend = last6Months.map((m) => {
    const key = `${m.year}-${m.monthIndex + 1}`;
    const entry = aggMap.get(key);
    return {
      month: m.name,
      revenue: entry ? entry.revenue : 0,
      bookings: entry ? entry.bookings : 0
    };
  });

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, trend, 'Revenue trend retrieved')
  );
});

export const getPopularityBreakdown = asyncHandler(async (req, res) => {
  const categoryAgg = await Tour.aggregate([
    { $match: { status: 'Active' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalBookings: { $sum: '$totalBookings' }
      }
    }
  ]);

  const totalBookingsAll = categoryAgg.reduce((acc, c) => acc + (c.totalBookings || 0), 0) || 0;

  const data = categoryAgg.map((cat) => {
    const percentage = totalBookingsAll > 0 ? Math.round(((cat.totalBookings || 0) / totalBookingsAll) * 100) : 0;
    return {
      category: cat._id,
      percentage,
      count: cat.count,
      revenue: (cat.totalBookings || 0) * 24500
    };
  });

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, data, 'Category popularity breakdown retrieved')
  );
});

