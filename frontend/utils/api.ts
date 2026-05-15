import axios from 'axios';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

const normalizeApiBaseUrl = (url: string) => {
  const trimmedUrl = url.trim().replace(/\/$/, '');
  return /\/api$/i.test(trimmedUrl) ? trimmedUrl : `${trimmedUrl}/api`;
};

const configuredApiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  extra.EXPO_PUBLIC_API_BASE_URL ||
  extra.API_BASE_URL ||
  extra.EXPO_PUBLIC_BACKEND_URL ||
  'http://localhost:5000/api';

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiBaseUrl);
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/i, '');

const getExpoHostApiBaseUrl = () => {
  const constants = Constants as any;
  const hostUri =
    Constants.expoConfig?.hostUri ||
    constants.manifest?.debuggerHost ||
    constants.manifest2?.extra?.expoClient?.hostUri;
  const host = hostUri?.split(':')[0];

  return host ? `http://${host}:5000/api` : null;
};

const getAndroidEmulatorApiBaseUrl = () => {
  try {
    const { hostname, protocol } = new URL(API_BASE_URL);
    if (protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(hostname)) {
      return 'http://10.0.2.2:5000/api';
    }
  } catch {
    return null;
  }
  return null;
};

const API_BASE_URL_CANDIDATES = Array.from(
  new Set(
    [API_BASE_URL, getExpoHostApiBaseUrl(), getAndroidEmulatorApiBaseUrl()]
      .filter(Boolean)
      .map((url) => normalizeApiBaseUrl(url as string))
  )
);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
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
    if (!config || config.__retry || !error.response) {
      const triedBaseUrls = config?.__triedBaseUrls || [config?.baseURL || API_BASE_URL];
      const nextBaseUrl = API_BASE_URL_CANDIDATES.find((baseUrl) => !triedBaseUrls.includes(baseUrl));
      if (config && !error.response && nextBaseUrl) {
        config.__triedBaseUrls = [...triedBaseUrls, nextBaseUrl];
        config.baseURL = nextBaseUrl;
        return api(config);
      }
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
