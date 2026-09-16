import { Router } from 'express';
import {
  getCategories,
  getCategoryByIdOrSlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema
} from '../validations/category.validation.js';
import { ROLES, ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

router
  .route('/')
  .get(getCategories)
  .post(protect, authorizeRoles(...ADMIN_ROLES), validate(createCategorySchema), createCategory);

router
  .route('/:idOrSlug')
  .get(getCategoryByIdOrSlug);

router
  .route('/:id')
  .put(protect, authorizeRoles(...ADMIN_ROLES), validate(updateCategorySchema), updateCategory)
  .patch(protect, authorizeRoles(...ADMIN_ROLES), validate(updateCategorySchema), updateCategory)
  .delete(protect, authorizeRoles(...ADMIN_ROLES), deleteCategory);

export default router;


