import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Interceptor to inject active demo user header
api.interceptors.request.use((config) => {
  const activeUserId = localStorage.getItem('demo_user_id');
  if (activeUserId) {
    config.headers['X-Demo-User-ID'] = activeUserId;
  }
  return config;
});

export default api;
