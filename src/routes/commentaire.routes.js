import { Router } from 'express';
import {
  getCommentaires,
  getCommentaireByIdOrSlug,
  createCommentaire,
  updateCommentaire,
  deleteCommentaire,
  syncWordPressCommentaires
} from '../controllers/commentaire.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createCommentaireSchema, updateCommentaireSchema } from '../validations/commentaire.validation.js';
import { ROLES, STAFF_ROLES, ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

router.post('/sync-wordpress', protect, authorizeRoles(...ADMIN_ROLES), syncWordPressCommentaires);

router
  .route('/')
  .get(getCommentaires)
  .post(protect, authorizeRoles(...STAFF_ROLES), validate(createCommentaireSchema), createCommentaire);

router
  .route('/:idOrSlug')
  .get(getCommentaireByIdOrSlug);

router
  .route('/:id')
  .put(protect, authorizeRoles(...STAFF_ROLES), validate(updateCommentaireSchema), updateCommentaire)
  .patch(protect, authorizeRoles(...STAFF_ROLES), validate(updateCommentaireSchema), updateCommentaire)
  .delete(protect, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteCommentaire);

export default router;
