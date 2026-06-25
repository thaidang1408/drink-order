import prisma from '../../infrastructure/database/prisma.client.js';

class OptionGroupRepository {
  async findByStoreId(storeId) {
    return prisma.productOptionGroup.findMany({
      where: { storeId },
      orderBy: { sortOrder: 'asc' },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { assignments: true } },
      },
    });
  }

  async findById(groupId, storeId) {
    return prisma.productOptionGroup.findFirst({
      where: { id: groupId, storeId },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async create(storeId, data) {
    return prisma.productOptionGroup.create({
      data: { ...data, storeId },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { assignments: true } },
      },
    });
  }

  async update(groupId, storeId, data) {
    return prisma.productOptionGroup.update({
      where: { id: groupId, storeId },
      data,
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { assignments: true } },
      },
    });
  }

  async delete(groupId, storeId) {
    return prisma.productOptionGroup.delete({
      where: { id: groupId, storeId },
    });
  }

  async createOption(groupId, data) {
    return prisma.productOption.create({
      data: { ...data, groupId },
    });
  }

  async updateOption(optionId, groupId, data) {
    return prisma.productOption.update({
      where: { id: optionId, groupId },
      data,
    });
  }

  async deleteOption(optionId, groupId) {
    return prisma.productOption.delete({
      where: { id: optionId, groupId },
    });
  }

  async countGroupsInStore(groupIds, storeId) {
    return prisma.productOptionGroup.count({
      where: {
        id: { in: groupIds },
        storeId,
      },
    });
  }
}

export default new OptionGroupRepository();
