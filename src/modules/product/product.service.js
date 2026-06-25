import { BadRequestError } from '../../shared/errors/index.js';
import { serializeProduct } from '../../shared/utils/index.js';
import optionGroupService from '../option-group/option-group.service.js';
import productRepository from './product.repository.js';

class ProductService {
  constructor(repository) {
    this.repository = repository;
  }

  formatProduct(product) {
    return {
      ...serializeProduct(product),
      categoryName: product.category?.name ?? null,
      isActive: product.isActive,
      optionGroupIds: product.optionAssignments?.map((a) => a.groupId) ?? [],
    };
  }

  async validateCategory(storeId, categoryId) {
    if (!categoryId) return;

    const category = await this.repository.categoryBelongsToStore(categoryId, storeId);

    if (!category) {
      throw new BadRequestError('Category does not belong to this store');
    }
  }

  async applyOptionSettings(storeId, productId, { hasOptions, optionGroupIds }) {
    if (!hasOptions) {
      await this.repository.syncOptionAssignments(productId, []);
      await this.repository.update(productId, storeId, { hasOptions: false });
      return;
    }

    if (!optionGroupIds?.length) {
      throw new BadRequestError('Select at least one option group when options are enabled');
    }

    await optionGroupService.validateGroupIds(storeId, optionGroupIds);
    await this.repository.syncOptionAssignments(productId, optionGroupIds);
    await this.repository.update(productId, storeId, { hasOptions: true });
  }

  async listByStore(storeId) {
    const products = await this.repository.findByStoreId(storeId);
    return products.map((product) => this.formatProduct(product));
  }

  async create(storeId, data) {
    await this.validateCategory(storeId, data.categoryId);

    const { optionGroupIds, hasOptions, ...productData } = data;

    const product = await this.repository.create(storeId, {
      name: productData.name,
      description: productData.description || null,
      price: productData.price,
      image: productData.image || null,
      categoryId: productData.categoryId,
      sortOrder: productData.sortOrder ?? 0,
      isActive: productData.isActive ?? true,
      isBestSeller: productData.isBestSeller ?? false,
      hasOptions: false,
    });

    if (hasOptions || optionGroupIds?.length) {
      await this.applyOptionSettings(storeId, product.id, {
        hasOptions: hasOptions ?? true,
        optionGroupIds: optionGroupIds ?? [],
      });
    }

    const created = await this.repository.findById(product.id, storeId);
    return this.formatProduct(created ?? product);
  }

  async update(storeId, productId, data) {
    if (data.categoryId) {
      await this.validateCategory(storeId, data.categoryId);
    }

    const { optionGroupIds, hasOptions, ...productData } = data;

    await this.repository.update(productId, storeId, {
      ...productData,
      image: productData.image === '' ? null : productData.image,
    });

    if (hasOptions !== undefined || optionGroupIds !== undefined) {
      const current = await this.repository.findById(productId, storeId);

      await this.applyOptionSettings(storeId, productId, {
        hasOptions: hasOptions ?? current?.hasOptions ?? false,
        optionGroupIds:
          optionGroupIds ?? current?.optionAssignments?.map((a) => a.groupId) ?? [],
      });
    }

    const updated = await this.repository.findById(productId, storeId);
    return this.formatProduct(updated);
  }

  async delete(storeId, productId) {
    await this.repository.delete(productId, storeId);
  }
}

export default new ProductService(productRepository);
