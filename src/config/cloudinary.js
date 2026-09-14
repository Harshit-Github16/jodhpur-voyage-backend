import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = (fileBuffer, folder = 'jodhpur_voyage', filename) => {
  return new Promise((resolve, reject) => {
    // If cloudinary is not configured with real credentials, return a mock/data URL for seamless local testing
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name' ||
      process.env.CLOUDINARY_CLOUD_NAME === 'demo'
    ) {
      const base64 = fileBuffer.toString('base64');
      const mockUrl = `https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200`;
      return resolve({
        secure_url: mockUrl,
        url: mockUrl,
        public_id: `${folder}/${filename || Date.now()}`,
        format: 'webp',
        bytes: fileBuffer.length
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
