import { request } from './client.js';

export const entriesApi = {
  create: (data) =>
    request('/entries', {
      method: 'POST',
      body: JSON.stringify({
        productName: data.productName,
        calories: parseInt(data.calories, 10) || 0,
        protein: parseFloat(data.protein) || 0,
        fat: parseFloat(data.fat) || 0,
        carbs: parseFloat(data.carbs) || 0,
        entryDate: data.entryDate,
      }),
    }),

  getList: (params = {}) => {
    const search = new URLSearchParams();
    if (params.dateFrom) search.set('dateFrom', params.dateFrom);
    if (params.dateTo) search.set('dateTo', params.dateTo);
    const query = search.toString();
    return request(`/entries${query ? `?${query}` : ''}`);
  },

  delete: (id) =>
    request(`/entries/${id}`, {
      method: 'DELETE',
    }),

  getStats: (date) => {
    const params = date ? `?date=${date}` : '';
    return request(`/entries/stats${params}`);
  },
};
