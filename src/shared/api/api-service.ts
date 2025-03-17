import { 
  createUser, 
  getUserById, 
  updateUserContext, 
  getUserContext,
  CreateUserRequest,
  UpdateUserContextRequest,
  UserContext
} from './user-api';

import {
  mockCreateUser,
  mockGetUserById,
  mockUpdateUserContext,
  mockGetUserContext
} from './mock-user-api';

// Check if we should use mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || 
  process.env.NODE_ENV === 'development' || 
  !import.meta.env.VITE_API_URL;

/**
 * User API service that can switch between real and mock implementations
 */
export const userApiService = {
  /**
   * Create a new user
   */
  createUser: async (data: CreateUserRequest): Promise<UserContext> => {
    if (USE_MOCK_API) {
      console.log('Using mock createUser');
      return mockCreateUser(data);
    }
    return createUser(data);
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<UserContext> => {
    if (USE_MOCK_API) {
      console.log('Using mock getUserById');
      return mockGetUserById(id);
    }
    return getUserById(id);
  },

  /**
   * Update user context
   */
  updateUserContext: async (id: string, data: UpdateUserContextRequest): Promise<UserContext> => {
    if (USE_MOCK_API) {
      console.log('Using mock updateUserContext');
      return mockUpdateUserContext(id, data);
    }
    return updateUserContext(id, data);
  },

  /**
   * Get user context
   */ 
  getUserContext: async (id: string): Promise<UserContext> => {
    if (USE_MOCK_API) {
      console.log('Using mock getUserContext');
      return mockGetUserContext(id);
    }
    return getUserContext(id);
  }
}; 