import { request } from './client.js';

export const workoutsApi = {
  list: () => request('/workouts'),

  admin: {
    list: () => request('/admin/workouts'),
    create: (data) =>
      request('/admin/workouts', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          shortDesc: data.shortDesc,
          fullDescription: data.fullDescription,
          duration: data.duration,
          calories: data.calories,
          difficulty: data.difficulty,
          imageUrl: data.imageUrl,
          exercises: data.exercises ?? [],
        }),
      }),
    update: (id, data) =>
      request(`/admin/workouts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: data.title,
          shortDesc: data.shortDesc,
          fullDescription: data.fullDescription,
          duration: data.duration,
          calories: data.calories,
          difficulty: data.difficulty,
          imageUrl: data.imageUrl,
          exercises: data.exercises,
        }),
      }),
    delete: (id) =>
      request(`/admin/workouts/${id}`, {
        method: 'DELETE',
      }),
  },
};
