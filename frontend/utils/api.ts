import axios from 'axios';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};
const DEFAULT_API_BASE_URL = 'https://bada-jain-mandir-app-1357.onrender.com/api';

const normalizeApiBaseUrl = (url: string) => {
  const trimmedUrl = url.trim().replace(/\/$/, '');
  return /\/api$/i.test(trimmedUrl) ? trimmedUrl : `${trimmedUrl}/api`;
};

const configuredApiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  extra.EXPO_PUBLIC_API_BASE_URL ||
  DEFAULT_API_BASE_URL;

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiBaseUrl);
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/i, '');

const API_BASE_URL_CANDIDATES = Array.from(
  new Set([API_BASE_URL].map((url) => normalizeApiBaseUrl(url)))
);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (config.url?.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) {
      return Promise.reject(error);
    }

    if (!error.response) {
      console.warn('API network error', {
        baseURL: config.baseURL || API_BASE_URL,
        url: config.url,
        method: config.method,
        message: error.message,
      });

      const triedBaseUrls = config?.__triedBaseUrls || [config?.baseURL || API_BASE_URL];
      const nextBaseUrl = API_BASE_URL_CANDIDATES.find((baseUrl) => !triedBaseUrls.includes(baseUrl));
      if (nextBaseUrl) {
        config.__triedBaseUrls = [...triedBaseUrls, nextBaseUrl];
        config.baseURL = nextBaseUrl;
        return api(config);
      }

      if (!config.__networkRetry) {
        config.__networkRetry = true;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return api(config);
      }

      error.message = `Unable to reach server. Please check your internet connection and try again. (${API_BASE_URL})`;
      return Promise.reject(error);
    }

    if (config.__retry) {
      return Promise.reject(error);
    }

    if (error.response.status >= 500) {
      config.__retry = true;
      await new Promise((resolve) => setTimeout(resolve, 700));
      return api(config);
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
