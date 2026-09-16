import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  deleteBooking
} from '../controllers/booking.controller.js';
import { protect, authorizeRoles, optionalAuth } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema
} from '../validations/booking.validation.js';
import { ADMIN_ROLES } from '../constants/roles.js';
import { sensitiveLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.post('/', sensitiveLimiter, optionalAuth, validate(createBookingSchema), createBooking);
router.get('/', protect, authorizeRoles(...ADMIN_ROLES), getBookings);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, authorizeRoles(...ADMIN_ROLES), validate(updateBookingStatusSchema), updateBookingStatus);
router.put('/:id/status', protect, authorizeRoles(...ADMIN_ROLES), validate(updateBookingStatusSchema), updateBookingStatus);
router.post('/:id/cancel', protect, validate(cancelBookingSchema), cancelBooking);
router.delete('/:id', protect, authorizeRoles(...ADMIN_ROLES), deleteBooking);

export default router;


