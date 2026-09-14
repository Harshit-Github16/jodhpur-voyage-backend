import { Router } from 'express';
import {
  getCustomers,
  getStaffList,
  createStaff,
  toggleUserStatus,
  deleteStaff
} from '../controllers/customer.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createStaffSchema } from '../validations/auth.validation.js';
import { ROLES, ADMIN_ROLES } from '../constants/roles.js';

const router = Router();

// Customer list
router.get('/customers', protect, authorizeRoles(...ADMIN_ROLES), getCustomers);

// Staff management
router.get('/users/staff', protect, authorizeRoles(ROLES.SUPER_ADMIN), getStaffList);
router.post('/users/staff', protect, authorizeRoles(ROLES.SUPER_ADMIN), validate(createStaffSchema), createStaff);
router.patch('/users/:id/status', protect, authorizeRoles(ROLES.SUPER_ADMIN), toggleUserStatus);
router.delete('/users/:id', protect, authorizeRoles(ROLES.SUPER_ADMIN), deleteStaff);

export default router;
