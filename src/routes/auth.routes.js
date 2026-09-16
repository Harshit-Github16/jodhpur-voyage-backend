import { Router } from 'express';
import {
  login,
  register,
  getMe,
  refreshToken,
  logout,
  updateProfile,
  changePassword
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validations/auth.validation.js';
import { sensitiveLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.post('/login', sensitiveLimiter, validate(loginSchema), login);
router.post('/register', sensitiveLimiter, validate(registerSchema), register);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.patch('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);
router.patch('/change-password', protect, validate(changePasswordSchema), changePassword);

export default router;

