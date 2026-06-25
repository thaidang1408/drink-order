import { apiRequest } from './client.js';

const base = (storeId) => `/admin/stores/${storeId}`;

export const fetchStats = (storeId) => apiRequest(`${base(storeId)}/stats`);

export const fetchOrders = (storeId) => apiRequest(`${base(storeId)}/orders`);

export const updateOrderStatus = (storeId, orderId, status) =>
  apiRequest(`${base(storeId)}/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const fetchCategories = (storeId) => apiRequest(`${base(storeId)}/categories`);

export const createCategory = (storeId, data) =>
  apiRequest(`${base(storeId)}/categories`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateCategory = (storeId, categoryId, data) =>
  apiRequest(`${base(storeId)}/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteCategory = (storeId, categoryId) =>
  apiRequest(`${base(storeId)}/categories/${categoryId}`, {
    method: 'DELETE',
  });

export const fetchProducts = (storeId) => apiRequest(`${base(storeId)}/products`);

export const createProduct = (storeId, data) =>
  apiRequest(`${base(storeId)}/products`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProduct = (storeId, productId, data) =>
  apiRequest(`${base(storeId)}/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteProduct = (storeId, productId) =>
  apiRequest(`${base(storeId)}/products/${productId}`, {
    method: 'DELETE',
  });

export const fetchOptionGroups = (storeId) => apiRequest(`${base(storeId)}/option-groups`);

export const createOptionGroup = (storeId, data) =>
  apiRequest(`${base(storeId)}/option-groups`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateOptionGroup = (storeId, groupId, data) =>
  apiRequest(`${base(storeId)}/option-groups/${groupId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteOptionGroup = (storeId, groupId) =>
  apiRequest(`${base(storeId)}/option-groups/${groupId}`, {
    method: 'DELETE',
  });

export const createOption = (storeId, groupId, data) =>
  apiRequest(`${base(storeId)}/option-groups/${groupId}/options`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateOption = (storeId, groupId, optionId, data) =>
  apiRequest(`${base(storeId)}/option-groups/${groupId}/options/${optionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteOption = (storeId, groupId, optionId) =>
  apiRequest(`${base(storeId)}/option-groups/${groupId}/options/${optionId}`, {
    method: 'DELETE',
  });

export const fetchStoreSettings = (storeId) => apiRequest(`${base(storeId)}/settings`);

export const updateStoreSettings = (storeId, data) =>
  apiRequest(`${base(storeId)}/settings`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const fetchPaymentSettings = (storeId) =>
  apiRequest(`${base(storeId)}/payment-settings`);

export const updatePaymentSettings = (storeId, data) =>
  apiRequest(`${base(storeId)}/payment-settings`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
