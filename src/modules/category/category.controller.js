import { asyncHandler } from '../../shared/middlewares/index.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../shared/utils/index.js';
import categoryService from './category.service.js';

class CategoryController {
  constructor(service) {
    this.service = service;
  }

  healthCheck = asyncHandler(async (_req, res) => {
    sendSuccess(res, { module: 'category', status: 'ok' });
  });

  list = asyncHandler(async (req, res) => {
    const categories = await this.service.listByStore(req.params.storeId);
    sendSuccess(res, categories);
  });

  create = asyncHandler(async (req, res) => {
    const category = await this.service.create(req.params.storeId, req.body);
    sendCreated(res, category);
  });

  update = asyncHandler(async (req, res) => {
    const category = await this.service.update(
      req.params.storeId,
      req.params.categoryId,
      req.body,
    );
    sendSuccess(res, category);
  });

  remove = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.storeId, req.params.categoryId);
    sendNoContent(res);
  });
}

export default new CategoryController(categoryService);
