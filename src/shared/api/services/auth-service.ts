import { apiClient } from '../core/api-client';
import { setToken, removeToken } from '../core/token-storage';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  PasswordResetRequest,
  ChangePasswordRequest,
  User
} from '../types/auth';

/**
 * Authentication service for handling user authentication
 */
export const authService = {
  /**
   * Login a user with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    setToken(response.accessToken);
    return response;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    setToken(response.accessToken);
    return response;
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<void>('/auth/logout', {});
    } catch (error) {
      // Continue even if the server request fails
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Request a password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await apiClient.post<void>('/auth/request-password-reset', data);
  },

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post<void>('/auth/change-password', data);
  }
}; 