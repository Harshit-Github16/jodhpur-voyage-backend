import { Router } from 'express';
import {
  getBlogs,
  getBlogByIdOrSlug,
  createBlog,
  updateBlog,
  deleteBlog,
  syncWordPress
} from '../controllers/blog.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createBlogSchema, updateBlogSchema } from '../validations/blog.validation.js';
import { ROLES, STAFF_ROLES, ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

router.post('/sync-wordpress', protect, authorizeRoles(...ADMIN_ROLES), syncWordPress);

router
  .route('/')
  .get(getBlogs)
  .post(protect, authorizeRoles(...STAFF_ROLES), validate(createBlogSchema), createBlog);

router
  .route('/:idOrSlug')
  .get(getBlogByIdOrSlug);

router
  .route('/:id')
  .put(protect, authorizeRoles(...STAFF_ROLES), validate(updateBlogSchema), updateBlog)
  .patch(protect, authorizeRoles(...STAFF_ROLES), validate(updateBlogSchema), updateBlog)
  .delete(protect, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteBlog);

export default router;


