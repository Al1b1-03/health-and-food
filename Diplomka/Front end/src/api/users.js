import { request } from './client.js';

export const usersApi = {
  list: () => request('/admin/users'),

  ban: (id) =>
    request(`/admin/users/${id}/ban`, {
      method: 'PATCH',
    }),

  delete: (id) =>
    request(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
};
