import { apiRequest } from './client.js';

export const createOrder = (payload) =>
  apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const trackOrder = (orderNumber) => apiRequest(`/orders/track/${orderNumber}`);
