import { asyncHandler } from '../../shared/middlewares/index.js';
import { sendCreated, sendSuccess } from '../../shared/utils/index.js';
import orderService from './order.service.js';

class OrderController {
  constructor(service) {
    this.service = service;
  }

  healthCheck = asyncHandler(async (_req, res) => {
    sendSuccess(res, { module: 'order', status: 'ok' });
  });

  create = asyncHandler(async (req, res) => {
    const order = await this.service.createOrder(req.body);
    sendCreated(res, order);
  });

  track = asyncHandler(async (req, res) => {
    const result = await this.service.trackOrder(req.params.orderNumber);
    sendSuccess(res, result);
  });

  listByStore = asyncHandler(async (req, res) => {
    const orders = await this.service.getOrdersByStore(req.params.storeId);
    sendSuccess(res, orders);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const order = await this.service.updateOrderStatus(
      req.params.storeId,
      req.params.orderId,
      req.body.status,
    );
    sendSuccess(res, order);
  });

  getStats = asyncHandler(async (req, res) => {
    const stats = await this.service.getStoreStats(req.params.storeId);
    sendSuccess(res, stats);
  });
}

export default new OrderController(orderService);
