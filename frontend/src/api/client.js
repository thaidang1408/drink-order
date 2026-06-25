import { useAuthStore } from '../stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  constructor(error) {
    super(error?.message || 'Request failed');
    this.code = error?.code || 'UNKNOWN_ERROR';
    this.details = error?.details || null;
  }
}

export const handleUnauthorized = () => {
  useAuthStore.getState().logout();

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    window.location.replace('/admin/login');
  }
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
};

export const apiRequest = async (path, options = {}) => {
  const token = useAuthStore.getState().token;

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) {
    return { success: true, data: null };
  }

  const payload = await parseResponseBody(response);

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError(payload?.error || { message: 'Phiên đăng nhập đã hết hạn' });
  }

  if (!response.ok) {
    throw new ApiError(payload?.error || { message: 'Request failed' });
  }

  return payload;
};
