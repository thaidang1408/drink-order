import { ConflictError, NotFoundError } from '../../shared/errors/index.js';
import {
  serializeProductWithOptions,
  serializeStore,
  serializeStoreForMenu,
  serializeStorePayment,
  serializeStoreSettings,
} from '../../shared/utils/index.js';
import {
  generateStoreQRBuffer,
  generateStoreQRDataUrl,
} from '../../infrastructure/qr/index.js';
import storeRepository from './store.repository.js';

class StoreService {
  constructor(repository) {
    this.repository = repository;
  }

  async getMenuBySlug(slug) {
    const store = await this.repository.findBySlugWithMenu(slug);

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    const categories = store.categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        sortOrder: category.sortOrder,
        products: category.products.map(serializeProductWithOptions),
      }))
      .filter((category) => category.products.length > 0);

    const bestSellers = categories
      .flatMap((category) => category.products)
      .filter((product) => product.isBestSeller);

    return {
      store: serializeStoreForMenu(store),
      categories,
      bestSellers,
    };
  }

  async getStoreSettings(storeId) {
    const store = await this.repository.findById(storeId);

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    return serializeStoreSettings(store);
  }

  async updateStoreSettings(storeId, data) {
    const store = await this.repository.findById(storeId);

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    const slugTaken = await this.repository.findBySlugExcludingId(data.slug, storeId);

    if (slugTaken) {
      throw new ConflictError('Slug đã được sử dụng bởi quán khác');
    }

    const updated = await this.repository.updateProfile(storeId, {
      name: data.name,
      slug: data.slug,
      description: data.description === '' ? null : data.description,
      logo: data.logo === '' ? null : data.logo,
      tableCount: data.tableCount,
    });

    return serializeStoreSettings(updated);
  }

  async getPaymentSettings(storeId) {
    const store = await this.repository.findById(storeId);

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    return serializeStorePayment(store);
  }

  async updatePaymentSettings(storeId, data) {
    const store = await this.repository.updateSettings(storeId, {
      bankQrImage: data.bankQrImage === '' ? null : data.bankQrImage,
      bankName: data.bankName === '' ? null : data.bankName,
      bankAccountNo: data.bankAccountNo === '' ? null : data.bankAccountNo,
      bankAccountName: data.bankAccountName === '' ? null : data.bankAccountName,
    });

    return serializeStorePayment(store);
  }

  async getQRBySlug(slug, table) {
    const store = await this.repository.findBySlug(slug);

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    const qr = await generateStoreQRDataUrl(slug, table);

    return {
      store: serializeStore(store),
      table: table?.trim() || null,
      menuUrl: qr.menuUrl,
      dataUrl: qr.dataUrl,
    };
  }

  async getQRDownloadBySlug(slug, table) {
    const store = await this.repository.findBySlug(slug);

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    return generateStoreQRBuffer(slug, table);
  }

  async getQRByStoreId(storeId, table) {
    const store = await this.repository.findById(storeId);

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    const qr = await generateStoreQRDataUrl(store.slug, table);

    return {
      store: serializeStore(store),
      table: table?.trim() || null,
      menuUrl: qr.menuUrl,
      dataUrl: qr.dataUrl,
    };
  }

  async getQRDownloadByStoreId(storeId, table) {
    const store = await this.repository.findById(storeId);

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    return generateStoreQRBuffer(store.slug, table);
  }

  async getAllTableQRs(storeId) {
    const store = await this.repository.findById(storeId);

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    const targets = [{ table: null, label: 'QR chung' }];

    for (let i = 1; i <= (store.tableCount || 0); i += 1) {
      targets.push({ table: String(i), label: `Bàn ${i}` });
    }

    const items = await Promise.all(
      targets.map(async ({ table, label }) => {
        const qr = await generateStoreQRDataUrl(store.slug, table);

        return {
          table,
          label,
          menuUrl: qr.menuUrl,
          dataUrl: qr.dataUrl,
        };
      }),
    );

    return {
      store: serializeStore(store),
      tableCount: store.tableCount ?? 0,
      items,
    };
  }
}

export default new StoreService(storeRepository);
