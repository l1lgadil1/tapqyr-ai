import { apiClient } from '../core/api-client';
import { 
  UserContext, 
  CreateUserRequest, 
  UpdateUserContextRequest 
} from '../types/user';

/**
 * User service for handling user-related operations
 */
export const userService = {
  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest): Promise<UserContext> {
    return apiClient.post<UserContext>('/users', data);
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserContext> {
    return apiClient.get<UserContext>(`/users/${id}`);
  },

  /**
   * Update user context
   */
  async updateUserContext(id: string, data: UpdateUserContextRequest): Promise<UserContext> {
    return apiClient.patch<UserContext>(`/users/${id}/context`, data);
  },

  /**
   * Get user context
   */
  async getUserContext(id: string): Promise<UserContext> {
    return apiClient.get<UserContext>(`/users/${id}/context`);
  }
}; 