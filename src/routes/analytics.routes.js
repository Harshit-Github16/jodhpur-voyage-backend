import { Router } from 'express';
import {
  getDashboardMetrics,
  getRevenueTrend,
  getPopularityBreakdown
} from '../controllers/analytics.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import { ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

router.use(protect, authorizeRoles(...ADMIN_ROLES));

router.get('/dashboard', getDashboardMetrics);
router.get('/revenue', getRevenueTrend);
router.get('/popularity', getPopularityBreakdown);

export default router;
