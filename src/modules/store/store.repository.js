import prisma from '../../infrastructure/database/prisma.client.js';

class StoreRepository {
  async findBySlugWithMenu(slug) {
    return prisma.store.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        bankQrImage: true,
        bankName: true,
        bankAccountNo: true,
        bankAccountName: true,
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            sortOrder: true,
            products: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                image: true,
                sortOrder: true,
                categoryId: true,
                hasOptions: true,
                isBestSeller: true,
                optionAssignments: {
                  include: {
                    group: {
                      include: {
                        options: {
                          where: { isActive: true },
                          orderBy: { sortOrder: 'asc' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findBySlug(slug) {
    return prisma.store.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        bankQrImage: true,
        bankName: true,
        bankAccountNo: true,
        bankAccountName: true,
      },
    });
  }

  async findById(id) {
    return prisma.store.findFirst({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        bankQrImage: true,
        bankName: true,
        bankAccountNo: true,
        bankAccountName: true,
        tableCount: true,
      },
    });
  }

  async findBySlugExcludingId(slug, excludeId) {
    return prisma.store.findFirst({
      where: {
        slug,
        id: { not: excludeId },
      },
      select: { id: true },
    });
  }

  async updateProfile(storeId, data) {
    return prisma.store.update({
      where: { id: storeId },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        tableCount: true,
        bankQrImage: true,
        bankName: true,
        bankAccountNo: true,
        bankAccountName: true,
      },
    });
  }

  async updateSettings(storeId, data) {
    return prisma.store.update({
      where: { id: storeId },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        bankQrImage: true,
        bankName: true,
        bankAccountNo: true,
        bankAccountName: true,
      },
    });
  }
}

export default new StoreRepository();
