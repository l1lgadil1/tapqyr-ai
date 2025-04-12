import axios from 'axios';
import { getToken } from '../../../shared/api/core/token-storage';

const API_BASE_URL = '/api';

// Define error interface
interface ApiError extends Error {
  statusCode?: number;
  data?: unknown;
}

// Create axios instance
const assistantApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
assistantApiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log('API Client - Auth Token:', token ? 'exists' : 'missing');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Missing auth token for API request');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
assistantApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract relevant error information
    const message = error.response?.data?.message || 
                    error.response?.data?.error || 
                    error.message || 
                    'An unknown error occurred';
    
    // Create a more informative error
    const enhancedError = new Error(message) as ApiError;
    
    // Add status code if available
    if (error.response?.status) {
      enhancedError.statusCode = error.response.status;
      
      // If this is an authentication error (401), dispatch the auth-error event
      if (error.response.status === 401) {
        const authErrorEvent = new CustomEvent('auth-error', {
          detail: {
            message: message || 'Authentication required. Please log in again.',
            statusCode: 401
          }
        });
        window.dispatchEvent(authErrorEvent);
      }
    }
    
    console.error('API Error:', message, error.response?.status);
    return Promise.reject(enhancedError);
  }
);

export { assistantApiClient }; 