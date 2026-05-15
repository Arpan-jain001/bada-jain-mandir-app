import { api } from './api';

export const unwrapData = (response: any) => response?.data?.data || response?.data || response;

export const getResource = async <T>(path: string, fallbackPath?: string): Promise<T> => {
  try {
    return unwrapData(await api.get(path));
  } catch (error: any) {
    if (error?.response?.status === 404 && fallbackPath) {
      return unwrapData(await api.get(fallbackPath));
    }
    throw error;
  }
};

export const postResource = async <T>(path: string, body: any, config?: any, fallbackPath?: string): Promise<T> => {
  try {
    return unwrapData(await api.post(path, body, config));
  } catch (error: any) {
    if (error?.response?.status === 404 && fallbackPath) {
      return unwrapData(await api.post(fallbackPath, body, config));
    }
    throw error;
  }
};

export const putResource = async <T>(path: string, body: any, config?: any, fallbackPath?: string): Promise<T> => {
  try {
    return unwrapData(await api.put(path, body, config));
  } catch (error: any) {
    if (error?.response?.status === 404 && fallbackPath) {
      return unwrapData(await api.put(fallbackPath, body, config));
    }
    throw error;
  }
};

export const deleteResource = async <T>(path: string, fallbackPath?: string): Promise<T> => {
  try {
    return unwrapData(await api.delete(path));
  } catch (error: any) {
    if (error?.response?.status === 404 && fallbackPath) {
      return unwrapData(await api.delete(fallbackPath));
    }
    throw error;
  }
};
