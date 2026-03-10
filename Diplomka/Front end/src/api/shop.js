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
  if (normalized.startsWith('/api/uploads/products/')) {
    normalized = normalized.slice(4);
  } else if (!normalized.startsWith('/uploads/products/')) {
    normalized = normalized.startsWith('/') ? normalized : `/${normalized}`;
  }
  return `${origin}${normalized}`;
};

export const shopApi = {
  getProducts: () => request('/products'),

  getCart: () => request('/cart'),

  addToCart: (productId, quantity = 1) =>
    request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  updateCartItem: (itemId, quantity) =>
    request(`/cart/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (itemId) =>
    request(`/cart/${itemId}`, {
      method: 'DELETE',
    }),

  checkout: (cardNumber, address) =>
    request('/cart/checkout', {
      method: 'POST',
      body: JSON.stringify({ cardNumber, address }),
    }),
};
