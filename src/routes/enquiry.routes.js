import { Router } from 'express';
import {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry
} from '../controllers/enquiry.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createEnquirySchema,
  updateEnquiryStatusSchema
} from '../validations/enquiry.validation.js';
import { ROLES, STAFF_ROLES } from '../constants/roles.js';
import { sensitiveLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.post('/', sensitiveLimiter, validate(createEnquirySchema), createEnquiry);
router.get('/', protect, authorizeRoles(...STAFF_ROLES), getEnquiries);
router.get('/:id', protect, authorizeRoles(...STAFF_ROLES), getEnquiryById);
router.patch('/:id/status', protect, authorizeRoles(...STAFF_ROLES), validate(updateEnquiryStatusSchema), updateEnquiryStatus);
router.put('/:id/status', protect, authorizeRoles(...STAFF_ROLES), validate(updateEnquiryStatusSchema), updateEnquiryStatus);
router.delete('/:id', protect, authorizeRoles(...STAFF_ROLES), deleteEnquiry);

export default router;


