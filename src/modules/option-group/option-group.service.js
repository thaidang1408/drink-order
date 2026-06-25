import { BadRequestError, NotFoundError } from '../../shared/errors/index.js';
import { toNumber } from '../../shared/utils/index.js';
import optionGroupRepository from './option-group.repository.js';

const formatGroup = (group) => ({
  id: group.id,
  name: group.name,
  type: group.type,
  required: group.required,
  sortOrder: group.sortOrder,
  isActive: group.isActive,
  productCount: group._count?.assignments ?? 0,
  options: (group.options || []).map((option) => ({
    id: option.id,
    name: option.name,
    priceAdjust: toNumber(option.priceAdjust),
    isDefault: option.isDefault,
    sortOrder: option.sortOrder,
    isActive: option.isActive,
  })),
});

class OptionGroupService {
  constructor(repository) {
    this.repository = repository;
  }

  async getGroupOrThrow(storeId, groupId) {
    const group = await this.repository.findById(groupId, storeId);

    if (!group) {
      throw new NotFoundError('Option group not found');
    }

    return group;
  }

  async listByStore(storeId) {
    const groups = await this.repository.findByStoreId(storeId);
    return groups.map(formatGroup);
  }

  async create(storeId, data) {
    const group = await this.repository.create(storeId, {
      name: data.name,
      type: data.type ?? 'SINGLE',
      required: data.required ?? true,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    return formatGroup(group);
  }

  async update(storeId, groupId, data) {
    await this.getGroupOrThrow(storeId, groupId);

    const group = await this.repository.update(groupId, storeId, data);
    return formatGroup(group);
  }

  async delete(storeId, groupId) {
    await this.getGroupOrThrow(storeId, groupId);
    await this.repository.delete(groupId, storeId);
  }

  async createOption(storeId, groupId, data) {
    await this.getGroupOrThrow(storeId, groupId);

    const option = await this.repository.createOption(groupId, {
      name: data.name,
      priceAdjust: data.priceAdjust ?? 0,
      isDefault: data.isDefault ?? false,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    return {
      id: option.id,
      name: option.name,
      priceAdjust: toNumber(option.priceAdjust),
      isDefault: option.isDefault,
      sortOrder: option.sortOrder,
      isActive: option.isActive,
    };
  }

  async updateOption(storeId, groupId, optionId, data) {
    await this.getGroupOrThrow(storeId, groupId);

    const option = await this.repository.updateOption(optionId, groupId, data);

    return {
      id: option.id,
      name: option.name,
      priceAdjust: toNumber(option.priceAdjust),
      isDefault: option.isDefault,
      sortOrder: option.sortOrder,
      isActive: option.isActive,
    };
  }

  async deleteOption(storeId, groupId, optionId) {
    await this.getGroupOrThrow(storeId, groupId);
    await this.repository.deleteOption(optionId, groupId);
  }

  async validateGroupIds(storeId, groupIds) {
    if (!groupIds?.length) return;

    const count = await this.repository.countGroupsInStore(groupIds, storeId);

    if (count !== groupIds.length) {
      throw new BadRequestError('One or more option groups do not belong to this store');
    }
  }
}

export default new OptionGroupService(optionGroupRepository);
