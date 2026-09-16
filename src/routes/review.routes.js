import { Router } from 'express';
import {
  getReviews,
  createReview,
  updateReviewStatus,
  deleteReview
} from '../controllers/review.controller.js';
import { protect, authorizeRoles, optionalAuth } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createReviewSchema,
  updateReviewStatusSchema
} from '../validations/review.validation.js';
import { ROLES, STAFF_ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', getReviews);
router.post('/', optionalAuth, validate(createReviewSchema), createReview);
router.patch('/:id/status', protect, authorizeRoles(...STAFF_ROLES), validate(updateReviewStatusSchema), updateReviewStatus);
router.put('/:id/status', protect, authorizeRoles(...STAFF_ROLES), validate(updateReviewStatusSchema), updateReviewStatus);
router.delete('/:id', protect, authorizeRoles(...STAFF_ROLES), deleteReview);

export default router;


