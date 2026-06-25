import { useAuthStore } from '../stores/authStore';
import { handleUnauthorized } from './client.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const parseAdminResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => null);

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Phiên đăng nhập đã hết hạn');
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || fallbackMessage);
  }

  return payload;
};

export const fetchStoreQR = (slug, table) => {
  const params = table ? `?table=${encodeURIComponent(table)}` : '';
  return fetch(`${API_BASE}/store/${slug}/qr${params}`).then(async (res) => {
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error?.message || 'Failed to load QR');
    return payload;
  });
};

export const fetchAdminQR = (storeId, table) => {
  const params = table ? `?table=${encodeURIComponent(table)}` : '';
  return fetch(`${API_BASE}/admin/stores/${storeId}/qr${params}`, {
    headers: {
      Authorization: `Bearer ${useAuthStore.getState().token}`,
    },
  }).then((res) => parseAdminResponse(res, 'Failed to load QR'));
};

export const fetchAdminQRBatch = (storeId) =>
  fetch(`${API_BASE}/admin/stores/${storeId}/qr/batch`, {
    headers: {
      Authorization: `Bearer ${useAuthStore.getState().token}`,
    },
  }).then((res) => parseAdminResponse(res, 'Failed to load QR batch'));

export const downloadAdminQR = async (storeId, { table, slug, label }) => {
  const params = table ? `?table=${encodeURIComponent(table)}` : '';
  const token = useAuthStore.getState().token;
  const response = await fetch(`${API_BASE}/admin/stores/${storeId}/qr/download${params}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Phiên đăng nhập đã hết hạn');
  }

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Không thể tải mã QR');
  }

  const blob = await response.blob();
  const suffix = table ? `-ban-${table}` : '';
  const filename = `qr-${slug}${suffix}.png`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const getStoreQRDownloadUrl = (slug, table) => {
  const params = table ? `?table=${encodeURIComponent(table)}` : '';
  return `${API_BASE}/store/${slug}/qr/download${params}`;
};

export const uploadImage = (storeId, file, folder = 'products') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const token = useAuthStore.getState().token;

  return fetch(`${API_BASE}/admin/stores/${storeId}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then(async (res) => {
    const payload = await res.json().catch(() => null);

    if (res.status === 401) {
      handleUnauthorized();
      throw new Error('Phiên đăng nhập đã hết hạn');
    }

    if (!res.ok) throw new Error(payload?.error?.message || 'Upload failed');
    return payload;
  });
};
