import { Router } from 'express';
import {
  getPosts,
  getPostByIdOrSlug,
  createPost,
  updatePost,
  deletePost,
  syncWordPressPosts
} from '../controllers/post.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createPostSchema, updatePostSchema } from '../validations/post.validation.js';
import { ROLES, STAFF_ROLES, ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

router.post('/sync-wordpress', protect, authorizeRoles(...ADMIN_ROLES), syncWordPressPosts);

router
  .route('/')
  .get(getPosts)
  .post(protect, authorizeRoles(...STAFF_ROLES), validate(createPostSchema), createPost);

router
  .route('/:idOrSlug')
  .get(getPostByIdOrSlug);

router
  .route('/:id')
  .put(protect, authorizeRoles(...STAFF_ROLES), validate(updatePostSchema), updatePost)
  .patch(protect, authorizeRoles(...STAFF_ROLES), validate(updatePostSchema), updatePost)
  .delete(protect, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), deletePost);

export default router;
