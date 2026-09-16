import { uploadToCloudinary } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const uploadSingle = asyncHandler(async (req, res) => {
  let fileBuffer = req.file?.buffer;
  let filename = req.file?.originalname;

  // Check if image is passed as base64 string or URL in body
  const base64OrUrl =
    req.body?.image ||
    req.body?.file ||
    req.body?.avatar ||
    req.body?.photo ||
    req.body?.data ||
    req.body?.url;

  if (!fileBuffer && !base64OrUrl) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Please upload an image file or provide a base64 image string');
  }

  const payload = fileBuffer || base64OrUrl;
  const result = await uploadToCloudinary(payload, 'jodhpur_voyage/media', filename);

  const formattedData = {
    url: result.secure_url || result.url,
    secure_url: result.secure_url || result.url,
    image: result.secure_url || result.url,
    public_id: result.public_id,
    format: result.format || 'webp',
    bytes: result.bytes || req.file?.size || 0
  };

  return res.status(STATUS_CODES.OK).json({
    success: true,
    statusCode: STATUS_CODES.OK,
    message: 'Image uploaded successfully',
    url: formattedData.url, // For frontends that read res.data.url directly
    data: formattedData
  });
});

export const uploadMultiple = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const bodyImages = Array.isArray(req.body?.images)
    ? req.body.images
    : Array.isArray(req.body?.files)
    ? req.body.files
    : [];

  if (files.length === 0 && bodyImages.length === 0) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Please upload at least one image file');
  }

  let uploadPromises = [];

  if (files.length > 0) {
    uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, 'jodhpur_voyage/media', file.originalname)
    );
  } else {
    uploadPromises = bodyImages.map((img) =>
      uploadToCloudinary(img, 'jodhpur_voyage/media')
    );
  }

  const results = await Promise.all(uploadPromises);

  const data = results.map((result, idx) => ({
    url: result.secure_url || result.url,
    secure_url: result.secure_url || result.url,
    public_id: result.public_id,
    format: result.format || 'webp',
    bytes: result.bytes || files[idx]?.size || 0
  }));

  return res.status(STATUS_CODES.OK).json({
    success: true,
    statusCode: STATUS_CODES.OK,
    message: `${data.length} images uploaded successfully`,
    urls: data.map((d) => d.url),
    data
  });
});

