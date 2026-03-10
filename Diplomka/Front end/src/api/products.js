import { request } from './client.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_ORIGIN = API_BASE.startsWith('http') ? API_BASE.replace(/\/api\/?$/, '') : 'http://localhost:3001';

/** Абсолютный URL бэкенда (без /api) для загрузки картинок. */
export const getApiOrigin = () =>
  (typeof window !== 'undefined' && window.location.port === '5173')
    ? window.location.origin.replace(/:\d+$/, ':3001')
    : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

/** URL картинки. Возвращает абсолютный URL: статика бэкенда /uploads/products/... */
export const getImageUrl = (imageUrl, imageFullUrl = null) => {
  const origin = getApiOrigin();
  const path = imageFullUrl || imageUrl;
  if (!path) return null;
  if (typeof path === 'string' && path.startsWith('http')) return path;
  let normalized = path.startsWith('/') ? path : `/${path}`;
  // /api/uploads/products/xxx или /uploads/products/xxx → статика /uploads/products/xxx
  if (normalized.startsWith('/api/uploads/products/')) {
    normalized = normalized.slice(4); // убираем /api
  } else if (!normalized.startsWith('/uploads/products/')) {
    normalized = normalized.startsWith('/') ? normalized : `/${normalized}`;
  }
  return `${origin}${normalized}`;
};

export const productsApi = {
  list: () => request('/admin/products'),

  create: (data) =>
    request('/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        calories: data.calories ?? 0,
        protein: data.protein ?? 0,
        fat: data.fat ?? 0,
        carbs: data.carbs ?? 0,
        price: data.price ?? 0,
        imageUrl: data.imageUrl || undefined,
        category: data.category || 'dishes',
        sortOrder: data.sortOrder ?? 0,
      }),
    }),

  update: (id, data) =>
    request(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        price: data.price,
        imageUrl: data.imageUrl,
        category: data.category,
        sortOrder: data.sortOrder,
      }),
    }),

  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const url = `${API_BASE}/admin/products/${id}/image`;
    const token = localStorage.getItem('token');
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
    return data;
  },

  delete: (id) =>
    request(`/admin/products/${id}`, {
      method: 'DELETE',
    }),
};
