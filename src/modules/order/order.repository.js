import prisma from '../../infrastructure/database/prisma.client.js';
import { generateOrderCode } from '../../shared/utils/index.js';

class OrderRepository {
  async findActiveProductsByIds(storeId, productIds) {
    return prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId,
        isActive: true,
        category: { isActive: true },
      },
      include: {
        optionAssignments: {
          include: {
            group: {
              include: {
                options: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });
  }

  async createWithItems({ storeId, tableNumber, note, totalAmount, paymentMethod, items }) {
    return prisma.$transaction(async (tx) => {
      const orderNumber = generateOrderCode();

      const order = await tx.order.create({
        data: {
          orderNumber,
          storeId,
          tableNumber: tableNumber || null,
          note: note || null,
          totalAmount,
          paymentMethod: paymentMethod || 'CASH',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              optionsJson: item.optionsJson,
              optionsLabel: item.optionsLabel,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true },
              },
            },
          },
        },
      });

      return order;
    });
  }

  async findByStoreId(storeId) {
    return prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  async updateStatus(orderId, storeId, status) {
    return prisma.order.update({
      where: {
        id: orderId,
        storeId,
      },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  async findByOrderNumber(orderNumber) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            bankQrImage: true,
            bankName: true,
            bankAccountNo: true,
            bankAccountName: true,
          },
        },
      },
    });
  }

  async getStats(storeId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inProgressStatuses = ['CONFIRMED', 'PREPARING', 'READY'];

    const [
      completedOrders,
      cancelledOrders,
      inProgressOrders,
      pendingOrders,
      todayCompleted,
      todayCancelled,
      todayInProgress,
      revenueAgg,
      todayRevenueAgg,
    ] = await Promise.all([
      prisma.order.count({ where: { storeId, status: 'COMPLETED' } }),
      prisma.order.count({ where: { storeId, status: 'CANCELLED' } }),
      prisma.order.count({ where: { storeId, status: { in: inProgressStatuses } } }),
      prisma.order.count({ where: { storeId, status: 'PENDING' } }),
      prisma.order.count({
        where: { storeId, status: 'COMPLETED', createdAt: { gte: today } },
      }),
      prisma.order.count({
        where: { storeId, status: 'CANCELLED', createdAt: { gte: today } },
      }),
      prisma.order.count({
        where: {
          storeId,
          status: { in: ['PENDING', ...inProgressStatuses] },
          createdAt: { gte: today },
        },
      }),
      prisma.order.aggregate({
        where: { storeId, status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { storeId, status: 'COMPLETED', createdAt: { gte: today } },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      completedOrders,
      cancelledOrders,
      inProgressOrders,
      pendingOrders,
      todayCompleted,
      todayCancelled,
      todayInProgress,
      totalRevenue: revenueAgg._sum.totalAmount,
      todayRevenue: todayRevenueAgg._sum.totalAmount,
    };
  }
}

export default new OrderRepository();
