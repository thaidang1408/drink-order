import { BadRequestError, NotFoundError } from '../../shared/errors/index.js';
import {
  roundMoney,
  serializeOrder,
  serializeStorePayment,
  toNumber,
  resolveOrderItemOptions,
} from '../../shared/utils/index.js';
import {
  emitOrderCreated,
  emitOrderStatusUpdated,
  emitStatsUpdated,
} from '../../infrastructure/socket/index.js';
import storeRepository from '../store/store.repository.js';
import orderRepository from './order.repository.js';

class OrderService {
  constructor(repository, storeRepo) {
    this.repository = repository;
    this.storeRepository = storeRepo;
  }

  async broadcastStoreUpdates(storeId) {
    const stats = await this.getStoreStats(storeId);
    emitStatsUpdated(storeId, stats);
    return stats;
  }

  async createOrder({ storeSlug, tableNumber, note, paymentMethod, items }) {
    const store = await this.storeRepository.findBySlug(storeSlug);

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    const method = paymentMethod || 'CASH';

    if (method === 'BANK_TRANSFER' && !store.bankQrImage) {
      throw new BadRequestError('Store has not configured bank transfer QR yet');
    }

    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await this.repository.findActiveProductsByIds(store.id, productIds);

    if (products.length !== productIds.length) {
      throw new BadRequestError('One or more products are invalid or unavailable');
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      const { unitPrice, optionsLabel, optionsJson } = resolveOrderItemOptions(
        product,
        item.options || [],
      );
      const subtotal = roundMoney(unitPrice * item.quantity);

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        optionsLabel,
        optionsJson,
        productName: product.name,
      };
    });

    const totalAmount = roundMoney(
      orderItems.reduce((sum, item) => sum + item.subtotal, 0),
    );

    if (totalAmount <= 0) {
      throw new BadRequestError('Order total must be greater than zero');
    }

    const order = await this.repository.createWithItems({
      storeId: store.id,
      tableNumber,
      note,
      totalAmount,
      paymentMethod: method,
      items: orderItems,
    });

    const serializedOrder = serializeOrder(order);
    const payment =
      method === 'BANK_TRANSFER' ? serializeStorePayment(store) : null;

    emitOrderCreated(store.id, serializedOrder);
    await this.broadcastStoreUpdates(store.id);

    return { ...serializedOrder, payment };
  }

  async trackOrder(orderNumber) {
    const order = await this.repository.findByOrderNumber(orderNumber);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const payment =
      order.paymentMethod === 'BANK_TRANSFER'
        ? serializeStorePayment(order.store)
        : null;

    return {
      order: serializeOrder(order),
      store: {
        id: order.store.id,
        name: order.store.name,
        slug: order.store.slug,
      },
      payment,
    };
  }

  async getOrdersByStore(storeId) {
    const orders = await this.repository.findByStoreId(storeId);
    return orders.map(serializeOrder);
  }

  async updateOrderStatus(storeId, orderId, status) {
    const order = await this.repository.updateStatus(orderId, storeId, status);
    const serializedOrder = serializeOrder(order);

    emitOrderStatusUpdated(storeId, serializedOrder.orderNumber, serializedOrder);
    await this.broadcastStoreUpdates(storeId);

    return serializedOrder;
  }

  async getStoreStats(storeId) {
    const stats = await this.repository.getStats(storeId);

    return {
      completedOrders: stats.completedOrders,
      cancelledOrders: stats.cancelledOrders,
      inProgressOrders: stats.inProgressOrders,
      pendingOrders: stats.pendingOrders,
      todayCompleted: stats.todayCompleted,
      todayCancelled: stats.todayCancelled,
      todayInProgress: stats.todayInProgress,
      totalRevenue: toNumber(stats.totalRevenue),
      todayRevenue: toNumber(stats.todayRevenue),
    };
  }
}

export default new OrderService(orderRepository, storeRepository);
