import { Router } from 'express';
import { uploadSingle, uploadMultiple } from '../controllers/upload.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import { uploadSingleImage, uploadMultipleImages } from '../middlewares/upload.middleware.js';
import { STAFF_ROLES } from '../constants/roles.js';

const router = Router();

router.use(protect, authorizeRoles(...STAFF_ROLES));

router.post('/single', uploadSingleImage('image'), uploadSingle);
router.post('/multiple', uploadMultipleImages('images', 10), uploadMultiple);

export default router;
