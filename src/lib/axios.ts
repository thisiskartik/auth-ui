import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getAuthConfig } from './config';
import { getAccessToken, removeAccessToken, setAccessToken } from './token';

let axiosInstance: AxiosInstance | null = null;

export function createAuthAxiosInstance(baseURL?: string): AxiosInstance {
  if (axiosInstance) {
    return axiosInstance;
  }

  const config = getAuthConfig();
  const instance = axios.create({
    baseURL: baseURL || config.authServerEndpoint,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add access token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401 errors
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401) {
        const errorData = error.response.data as { error?: string };
        
        if (errorData?.error === 'Invalid access_token' && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Call refresh endpoint via server action
            const refreshResponse = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
            });

            if (refreshResponse.ok) {
              const { access_token } = await refreshResponse.json();
              setAccessToken(access_token);
              
              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
              }
              return instance(originalRequest);
            } else {
              // Refresh failed, logout user
              removeAccessToken();
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              return Promise.reject(error);
            }
          } catch (refreshError) {
            removeAccessToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }
      }

      return Promise.reject(error);
    }
  );

  axiosInstance = instance;
  return instance;
}
