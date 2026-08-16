import axios from 'axios';
import { getStoredAuth, saveStoredAuth, clearStoredAuth } from '../utils/storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAccessToken = () => getStoredAuth()?.accessToken || null;
const getRefreshToken = () => getStoredAuth()?.refreshToken || null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

const getErrorMessage = (error) => {
  const backendMessage = error?.response?.data?.error;
  const code = error?.response?.data?.code;
  if (backendMessage && code) {
    return `${backendMessage} (${code})`;
  }
  return backendMessage || error?.message || 'Something went wrong.';
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const isAuthRequest = /\/auth\/(login|register|refresh)/.test(originalRequest.url || '');

    if (error?.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearStoredAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`, {
            refreshToken,
          })
          .then((response) => {
            const nextAuth = {
              ...(getStoredAuth() || {}),
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken || refreshToken,
              role: response.data.role || getStoredAuth()?.role,
              organization: getStoredAuth()?.organization || {
                id: response.data.organizationId,
                name: getStoredAuth()?.organization?.name || 'Current Organization',
              },
            };
            saveStoredAuth(nextAuth);
            return nextAuth;
          })
          .catch(() => {
            clearStoredAuth();
            window.location.href = '/login';
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const refreshed = await refreshPromise;
      if (!refreshed) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${refreshed.accessToken}`,
      };

      return api(originalRequest);
    }

    if (error?.response?.status === 403) {
      error.userMessage = "You don't have permission to perform this action.";
    } else if (error?.response?.status === 404) {
      error.userMessage = 'The requested resource could not be found.';
    } else if (error?.response?.status === 409) {
      error.userMessage = 'This action conflicts with the current state.';
    } else if (error?.response?.status === 422) {
      error.userMessage = 'The request data is invalid.';
    } else if (error?.response?.status === 429) {
      error.userMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error?.response?.status >= 500) {
      error.userMessage = 'The server encountered an error. Please try again later.';
    } else {
      error.userMessage = getErrorMessage(error);
    }

    return Promise.reject(error);
  },
);

export default api;
