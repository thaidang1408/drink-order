import prisma from '../../infrastructure/database/prisma.client.js';

class ProductRepository {
  async findByStoreId(storeId) {
    return prisma.product.findMany({
      where: { storeId },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: {
        category: { select: { id: true, name: true } },
        optionAssignments: { select: { groupId: true } },
      },
    });
  }

  async findById(productId, storeId) {
    return prisma.product.findFirst({
      where: { id: productId, storeId },
      include: {
        category: { select: { id: true, name: true } },
        optionAssignments: { select: { groupId: true } },
      },
    });
  }

  async syncOptionAssignments(productId, optionGroupIds = []) {
    await prisma.productOptionAssignment.deleteMany({
      where: { productId },
    });

    if (optionGroupIds.length === 0) return;

    await prisma.productOptionAssignment.createMany({
      data: optionGroupIds.map((groupId) => ({
        productId,
        groupId,
      })),
    });
  }

  async create(storeId, data) {
    return prisma.product.create({
      data: { ...data, storeId },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  async update(productId, storeId, data) {
    return prisma.product.update({
      where: { id: productId, storeId },
      data,
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  async delete(productId, storeId) {
    return prisma.product.delete({
      where: { id: productId, storeId },
    });
  }

  async categoryBelongsToStore(categoryId, storeId) {
    return prisma.category.findFirst({
      where: { id: categoryId, storeId },
    });
  }
}

export default new ProductRepository();
