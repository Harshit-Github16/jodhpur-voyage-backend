import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import { ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

router
  .route('/')
  .get(getSettings)
  .put(protect, authorizeRoles(...ADMIN_ROLES), updateSettings)
  .patch(protect, authorizeRoles(...ADMIN_ROLES), updateSettings);

export default router;

