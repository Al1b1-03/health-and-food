import { request } from './client.js';

export const ordersApi = {
  list: () => request('/admin/orders'),
};
