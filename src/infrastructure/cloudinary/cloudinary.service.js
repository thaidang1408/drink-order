import { v2 as cloudinary } from 'cloudinary';
import env from '../../config/env.js';
import { BadRequestError } from '../../shared/errors/index.js';

let configured = false;

const ensureConfigured = () => {
  if (!env.isCloudinaryConfigured) {
    throw new BadRequestError(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET',
      'CLOUDINARY_NOT_CONFIGURED',
    );
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
    });
    configured = true;
  }
};

export const uploadImage = async (fileBuffer, { storeId, folder = 'products' }) => {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinary.folder}/${storeId}/${folder}`,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      },
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteImage = async (publicId) => {
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId);
};
