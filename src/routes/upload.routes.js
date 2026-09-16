import { Router } from 'express';
import { uploadSingle, uploadMultiple } from '../controllers/upload.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { uploadSingleImage, uploadMultipleImages } from '../middlewares/upload.middleware.js';

const router = Router();

// Allow authenticated staff as well as guests (for reviews/enquiry photos)
router.use(optionalAuth);

// Single image upload routes
router.post('/', uploadSingleImage('image'), uploadSingle);
router.post('/single', uploadSingleImage('image'), uploadSingle);
router.post('/image', uploadSingleImage('image'), uploadSingle);
router.post('/file', uploadSingleImage('image'), uploadSingle);

// Multiple image upload routes
router.post('/multiple', uploadMultipleImages('images', 10), uploadMultiple);
router.post('/images', uploadMultipleImages('images', 10), uploadMultiple);

export default router;


