import { serializeCategory } from '../../shared/utils/index.js';
import categoryRepository from './category.repository.js';

class CategoryService {
  constructor(repository) {
    this.repository = repository;
  }

  async listByStore(storeId) {
    const categories = await this.repository.findByStoreId(storeId);

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      productCount: category._count.products,
    }));
  }

  async create(storeId, data) {
    const category = await this.repository.create(storeId, {
      name: data.name,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    return {
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      productCount: 0,
    };
  }

  async update(storeId, categoryId, data) {
    const category = await this.repository.update(categoryId, storeId, data);

    return {
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    };
  }

  async delete(storeId, categoryId) {
    await this.repository.delete(categoryId, storeId);
  }
}

export default new CategoryService(categoryRepository);
