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
    try {
      return await apiClient.post<UserContext>('/users', data);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserContext> {
    try {
      return await apiClient.get<UserContext>(`/users/${id}`);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },

  /**
   * Update user context
   */
  async updateUserContext(id: string, data: UpdateUserContextRequest): Promise<UserContext> {
    try {
      // Ensure we're not sending null values
      const sanitizedData = { ...data };
      if (sanitizedData.workDescription === null) sanitizedData.workDescription = '';
      if (sanitizedData.shortTermGoals === null) sanitizedData.shortTermGoals = '';
      if (sanitizedData.longTermGoals === null) sanitizedData.longTermGoals = '';
      if (sanitizedData.otherContext === null) sanitizedData.otherContext = '';
      
      return await apiClient.patch<UserContext>(`/users/${id}/context`, sanitizedData);
    } catch (error) {
      console.error('Error updating user context:', error);
      throw error;
    }
  },

  /**
   * Get user context
   */
  async getUserContext(id: string): Promise<UserContext> {
    try {
      return await apiClient.get<UserContext>(`/users/${id}/context`);
    } catch (error) {
      console.error('Error getting user context:', error);
      throw error;
    }
  }
}; 