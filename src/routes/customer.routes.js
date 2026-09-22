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

// Customer list & delete
router.get('/customers', protect, authorizeRoles(...ADMIN_ROLES), getCustomers);
router.delete('/customers/:id', protect, authorizeRoles(...ADMIN_ROLES), deleteStaff);

// Staff management
router.get('/staff', protect, authorizeRoles(...ADMIN_ROLES), getStaffList);
router.post('/staff', protect, authorizeRoles(...ADMIN_ROLES), validate(createStaffSchema), createStaff);
router.get('/users/staff', protect, authorizeRoles(...ADMIN_ROLES), getStaffList);
router.post('/users/staff', protect, authorizeRoles(...ADMIN_ROLES), validate(createStaffSchema), createStaff);
router.patch('/users/:id/status', protect, authorizeRoles(...ADMIN_ROLES), toggleUserStatus);
router.put('/users/:id/status', protect, authorizeRoles(...ADMIN_ROLES), toggleUserStatus);
router.delete('/users/:id', protect, authorizeRoles(...ADMIN_ROLES), deleteStaff);

export default router;


