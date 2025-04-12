import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const TOKEN_KEY = 'token';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookies
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to add failed requests to queue
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to retry failed requests with new token
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Add request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(axios(originalRequest));
        });
      });
    }

    try {
      isRefreshing = true;
      originalRequest._retry = true;

      // Attempt to refresh token
      const response = await api.post<{ accessToken: string; expiresIn: number }>('/auth/refresh-tokens');
      const { accessToken } = response.data;

      // Store new token
      localStorage.setItem(TOKEN_KEY, accessToken);

      // Update authorization header
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Process queued requests
      onRefreshed(accessToken);

      // Retry original request
      return axios(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear tokens and reject
      localStorage.removeItem(TOKEN_KEY);
      
      // Dispatch auth error event
      const authErrorEvent = new CustomEvent('auth-error', {
        detail: {
          message: 'Authentication required. Please log in again.',
          statusCode: 401
        }
      });
      window.dispatchEvent(authErrorEvent);
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Login user
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Store access token
    if (response.data.accessToken) {
      localStorage.setItem(TOKEN_KEY, response.data.accessToken);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register user
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Store access token
    if (response.data.accessToken) {
      localStorage.setItem(TOKEN_KEY, response.data.accessToken);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    
    await api.post('/auth/logout');
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<AuthResponse['user']> => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('Token not found');
    
    const response = await api.get<AuthResponse['user']>('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (data: PasswordResetRequest): Promise<void> => {
  try {
    await api.post('/auth/request-password-reset', data);
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('Token not found');
    
    await api.post('/auth/change-password', data);
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
}; 