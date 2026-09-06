import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const personaRole = localStorage.getItem('persona_role') || 'ADMIN';
  config.headers['X-Persona-Role'] = personaRole;

  return config;
});
