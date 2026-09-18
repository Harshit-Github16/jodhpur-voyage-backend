import { Router } from 'express';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import cityRoutes from './city.routes.js';
import tourRoutes from './tour.routes.js';
import bookingRoutes from './booking.routes.js';
import enquiryRoutes from './enquiry.routes.js';
import reviewRoutes from './review.routes.js';
import blogRoutes from './blog.routes.js';
import postRoutes from './post.routes.js';
import commentaireRoutes from './commentaire.routes.js';
import customerRoutes from './customer.routes.js';
import teamRoutes from './team.routes.js';
import contentRoutes from './content.routes.js';
import settingRoutes from './setting.routes.js';
import analyticsRoutes from './analytics.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Jodhpur Voyage API Server'
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/destination-categories', categoryRoutes);
router.use('/cities', cityRoutes);
router.use('/tours', tourRoutes);
router.use('/bookings', bookingRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/reviews', reviewRoutes);
router.use('/blogs', blogRoutes);
router.use('/posts', postRoutes);
router.use('/commentaires', commentaireRoutes);
router.use('/', customerRoutes); // /customers and /users/staff
router.use('/team', teamRoutes);
router.use('/content', contentRoutes);
router.use('/settings', settingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/upload', uploadRoutes);

export default router;
