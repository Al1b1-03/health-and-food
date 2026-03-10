import { request } from './client.js';

export const authApi = {
  register: (data) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        email: data.email,
        password: data.password,
      }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () => request('/auth/profile'),

  updateProfile: (data) =>
    request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        gender: data.gender || undefined,
        age: data.age || undefined,
        weight: data.weight || undefined,
        height: data.height || undefined,
        activityLevel: data.activityLevel || undefined,
        calorieNorm: data.calorieNorm || undefined,
        protein: data.protein || undefined,
        fat: data.fat || undefined,
        carbs: data.carbs || undefined,
        oldPassword: data.oldPassword || undefined,
        newPassword: data.newPassword || undefined,
      }),
    }),
};
