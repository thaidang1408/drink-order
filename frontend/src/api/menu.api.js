import { apiRequest } from './client.js';

export const fetchStoreMenu = (slug) => apiRequest(`/store/${slug}/menu`);
