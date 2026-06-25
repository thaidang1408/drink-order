import { BadRequestError } from '../../shared/errors/index.js';
import { uploadImage as cloudinaryUpload } from '../../infrastructure/cloudinary/cloudinary.service.js';
import { asyncHandler } from '../../shared/middlewares/index.js';
import { sendSuccess } from '../../shared/utils/index.js';

class UploadController {
  upload = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new BadRequestError('No image file provided');
    }

    const result = await cloudinaryUpload(req.file.buffer, {
      storeId: req.params.storeId,
      folder: req.body.folder || 'products',
    });

    sendSuccess(res, result);
  });
}

export default new UploadController();
