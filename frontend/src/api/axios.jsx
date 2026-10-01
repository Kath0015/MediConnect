import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? window.location.origin : 'http://localhost:8000');

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');

  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }

    return Promise.reject(error);
  },
);

export default api;
