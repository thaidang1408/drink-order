import prisma from '../../infrastructure/database/prisma.client.js';

class CategoryRepository {
  async findByStoreId(storeId) {
    return prisma.category.findMany({
      where: { storeId },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async create(storeId, data) {
    return prisma.category.create({
      data: { ...data, storeId },
    });
  }

  async update(categoryId, storeId, data) {
    return prisma.category.update({
      where: { id: categoryId, storeId },
      data,
    });
  }

  async delete(categoryId, storeId) {
    return prisma.category.delete({
      where: { id: categoryId, storeId },
    });
  }
}

export default new CategoryRepository();
