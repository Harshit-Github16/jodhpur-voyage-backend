import { Router } from 'express';
import {
  getTours,
  getTourByIdOrSlug,
  createTour,
  updateTour,
  deleteTour
} from '../controllers/tour.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createTourSchema, updateTourSchema } from '../validations/tour.validation.js';
import { ROLES, ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

router
  .route('/')
  .get(getTours)
  .post(protect, authorizeRoles(...ADMIN_ROLES), validate(createTourSchema), createTour);

router
  .route('/:idOrSlug')
  .get(getTourByIdOrSlug);

router
  .route('/:id')
  .put(protect, authorizeRoles(...ADMIN_ROLES), validate(updateTourSchema), updateTour)
  .delete(protect, authorizeRoles(ROLES.SUPER_ADMIN), deleteTour);

export default router;
