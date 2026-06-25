import { asyncHandler } from '../../shared/middlewares/index.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../shared/utils/index.js';
import productService from './product.service.js';

class ProductController {
  constructor(service) {
    this.service = service;
  }

  healthCheck = asyncHandler(async (_req, res) => {
    sendSuccess(res, { module: 'product', status: 'ok' });
  });

  list = asyncHandler(async (req, res) => {
    const products = await this.service.listByStore(req.params.storeId);
    sendSuccess(res, products);
  });

  create = asyncHandler(async (req, res) => {
    const product = await this.service.create(req.params.storeId, req.body);
    sendCreated(res, product);
  });

  update = asyncHandler(async (req, res) => {
    const product = await this.service.update(
      req.params.storeId,
      req.params.productId,
      req.body,
    );
    sendSuccess(res, product);
  });

  remove = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.storeId, req.params.productId);
    sendNoContent(res);
  });
}

export default new ProductController(productService);
