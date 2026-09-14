import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router
  .route('/')
  .get(getSettings)
  .put(protect, authorizeRoles(ROLES.SUPER_ADMIN), updateSettings);

export default router;
