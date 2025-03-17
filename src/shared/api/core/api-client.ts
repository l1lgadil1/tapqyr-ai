import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from './api-error';
import { getToken, setToken, removeToken } from './token-storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(config?: AxiosRequestConfig) {
    this.instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      ...config,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Handle 401 Unauthorized error (token expired)
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          getToken() // Only try to refresh if we have a token
        ) {
          if (this.isRefreshing) {
            // If already refreshing, add request to queue
            return new Promise<AxiosResponse>((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.instance(originalRequest));
              });
            });
          }

          // Start refreshing process
          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Try to refresh the token
            const response = await axios.post<RefreshTokenResponse>(
              `${API_URL}/auth/refresh-token`,
              {},
              { withCredentials: true }
            );

            const { accessToken } = response.data;
            setToken(accessToken);

            // Execute all pending requests with new token
            this.refreshSubscribers.forEach((callback) => callback(accessToken));
            this.refreshSubscribers = [];

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.instance(originalRequest);
          } catch (refreshError) {
            // If refresh fails, clear token and reject
            removeToken();
            this.refreshSubscribers = [];
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Transform error to ApiError
        const apiError = new ApiError(
          error.message || 'An unexpected error occurred',
          error.response?.status,
          error.response?.data
        );

        return Promise.reject(apiError);
      }
    );
  }

  // Generic request method
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.request<T>(config);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.message || 'An unexpected error occurred',
          error.response?.status,
          error.response?.data
        );
      }
      
      throw new ApiError('An unexpected error occurred');
    }
  }

  // Convenience methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

// Export a default instance
export const apiClient = new ApiClient(); 