import { 
  createUser, 
  getUserById, 
  updateUserContext, 
  getUserContext,
  CreateUserRequest,
  UpdateUserContextRequest,
  UserContext
} from './user-api';

/**
 * User API service
 */
export const userApiService = {
  /**
   * Create a new user
   */
  createUser: async (data: CreateUserRequest): Promise<UserContext> => {
    return createUser(data);
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<UserContext> => {
    return getUserById(id);
  },

  /**
   * Update user context
   */
  updateUserContext: async (id: string, data: UpdateUserContextRequest): Promise<UserContext> => {
    return updateUserContext(id, data);
  },

  /**
   * Get user context
   */ 
  getUserContext: async (id: string): Promise<UserContext> => {
    return getUserContext(id);
  }
}; 