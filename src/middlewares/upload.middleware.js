import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

// Memory storage to process buffers directly for Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        STATUS_CODES.BAD_REQUEST,
        'Invalid file type. Only image files (JPEG, PNG, WEBP, GIF, AVIF) are allowed.'
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB (no practical limit)
  },
  fileFilter
});


export const uploadSingleImage = (fieldName = 'image') => (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      req.file = req.files.find((f) => f.fieldname === fieldName) || req.files[0];
    }
    next();
  });
};

export const uploadMultipleImages = (fieldName = 'images', maxCount = 10) => (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      const matched = req.files.filter((f) => f.fieldname === fieldName);
      req.files = matched.length > 0 ? matched.slice(0, maxCount) : req.files.slice(0, maxCount);
    }
    next();
  });
};

