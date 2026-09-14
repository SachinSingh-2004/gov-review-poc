import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Inject user session & role token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gov_poc_token');
  const userId = localStorage.getItem('gov_poc_user_id');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    config.headers['X-Demo-User-ID'] = userId;
  }
  return config;
});

export default api;
