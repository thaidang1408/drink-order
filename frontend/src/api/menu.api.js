const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export const fetchStoreMenu = async (slug) => {
  const response = await fetch(`${API_BASE}/store/${slug}/menu`, {
    headers: { Accept: 'application/json' },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Không thể tải thực đơn');
  }

  return payload;
};
