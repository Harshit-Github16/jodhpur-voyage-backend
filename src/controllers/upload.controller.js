import { uploadToCloudinary } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Please upload an image file');
  }

  const result = await uploadToCloudinary(
    req.file.buffer,
    'jodhpur_voyage/media',
    req.file.originalname
  );

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        url: result.secure_url || result.url,
        public_id: result.public_id,
        format: result.format || 'webp',
        bytes: result.bytes || req.file.size
      },
      'Image uploaded successfully'
    )
  );
});

export const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Please upload at least one image file');
  }

  const uploadPromises = req.files.map((file) =>
    uploadToCloudinary(file.buffer, 'jodhpur_voyage/media', file.originalname)
  );

  const results = await Promise.all(uploadPromises);

  const data = results.map((result, idx) => ({
    url: result.secure_url || result.url,
    public_id: result.public_id,
    format: result.format || 'webp',
    bytes: result.bytes || req.files[idx].size
  }));

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, data, `${data.length} images uploaded successfully`)
  );
});
