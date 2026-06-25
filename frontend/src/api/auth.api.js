import { apiRequest } from './client.js';

export const login = (credentials) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const fetchMe = () => apiRequest('/auth/me');
