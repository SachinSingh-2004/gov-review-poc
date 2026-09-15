import axios from 'axios';

const getBaseUrl = () => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv.VITE_API_URL) {
    return metaEnv.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://gov-review-backend.onrender.com/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
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
