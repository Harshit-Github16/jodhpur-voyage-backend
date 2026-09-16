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


export const uploadSingleImage = (fieldName = 'image') => upload.single(fieldName);
export const uploadMultipleImages = (fieldName = 'images', maxCount = 10) =>
  upload.array(fieldName, maxCount);
