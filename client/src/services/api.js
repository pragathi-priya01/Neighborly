import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: attach JWT token if available in localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const authData = localStorage.getItem('neighbourly_auth');
      if (authData) {
        const { state } = JSON.parse(authData);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 unauthenticated and format error messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customMessage = error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
    
    // Auto-logout if token is expired/invalid (except on public login/register attempts)
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      const authData = localStorage.getItem('neighbourly_auth');
      if (authData) {
        localStorage.removeItem('neighbourly_auth');
        window.dispatchEvent(new Event('neighbourly_logout'));
      }
    }

    return Promise.reject(new Error(customMessage));
  }
);

export default api;
