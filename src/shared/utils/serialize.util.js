import { toNumber } from './decimal.util.js';

export const serializeProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: toNumber(product.price),
  image: product.image,
  sortOrder: product.sortOrder,
  categoryId: product.categoryId,
  hasOptions: product.hasOptions ?? false,
  isBestSeller: product.isBestSeller ?? false,
  optionGroups: product.optionGroups ?? [],
});

export const serializeCategory = (category) => ({
  id: category.id,
  name: category.name,
  sortOrder: category.sortOrder,
  products: category.products?.map(serializeProduct) ?? [],
});

export const serializeStore = (store) => ({
  id: store.id,
  name: store.name,
  slug: store.slug,
  description: store.description,
  logo: store.logo,
});

export const serializeStoreSettings = (store) => ({
  ...serializeStore(store),
  tableCount: store.tableCount ?? 0,
});

export const serializeStorePayment = (store) => ({
  bankQrImage: store.bankQrImage ?? null,
  bankName: store.bankName ?? null,
  bankAccountNo: store.bankAccountNo ?? null,
  bankAccountName: store.bankAccountName ?? null,
});

export const serializeStoreForMenu = (store) => ({
  ...serializeStore(store),
  payment: serializeStorePayment(store),
});

export const serializeOrderItem = (item) => ({
  id: item.id,
  productId: item.productId,
  productName: item.product?.name ?? null,
  quantity: item.quantity,
  unitPrice: toNumber(item.unitPrice),
  subtotal: toNumber(item.subtotal),
  optionsLabel: item.optionsLabel ?? null,
  options: item.optionsJson ? JSON.parse(item.optionsJson).selections : [],
});

export const serializeOrder = (order) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  status: order.status,
  paymentMethod: order.paymentMethod,
  tableNumber: order.tableNumber,
  note: order.note,
  totalAmount: toNumber(order.totalAmount),
  storeId: order.storeId,
  createdAt: order.createdAt,
  items: order.items?.map(serializeOrderItem) ?? [],
});
