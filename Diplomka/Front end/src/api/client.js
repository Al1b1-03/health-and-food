const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const request = async (endpoint, options = {}) => {
  const base = API_BASE.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        data?.error ||
        (typeof data?.message === 'string' ? data.message : null) ||
        `Ошибка запроса (${response.status})`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Не удалось подключиться к серверу. Проверьте, что бэкенд запущен на http://localhost:3001'
      );
    }
    throw err;
  }
};
