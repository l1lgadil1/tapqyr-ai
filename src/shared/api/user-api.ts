import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface UserContext {
  id: string;
  workDescription: string;
  shortTermGoals: string;
  longTermGoals: string;
  otherContext: string;
  onboardingComplete: boolean;
}

export interface CreateUserRequest {
  email: string;
  name?: string;
}

export interface UpdateUserContextRequest {
  workDescription?: string;
  shortTermGoals?: string;
  longTermGoals?: string;
  otherContext?: string;
  onboardingComplete?: boolean;
}

/**
 * Helper function to sanitize user context data
 */
const sanitizeUserContext = (data: UserContext): UserContext => {
  return {
    ...data,
    workDescription: data.workDescription === null ? '' : (data.workDescription || ''),
    shortTermGoals: data.shortTermGoals === null ? '' : (data.shortTermGoals || ''),
    longTermGoals: data.longTermGoals === null ? '' : (data.longTermGoals || ''),
    otherContext: data.otherContext === null ? '' : (data.otherContext || ''),
  };
};

/**
 * Create a new user
 */
export const createUser = async (data: CreateUserRequest) => {
  try {
    const response = await axios.post<UserContext>(`${API_URL}/users`, data);
    return sanitizeUserContext(response.data);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string) => {
  try {
    const response = await axios.get<UserContext>(`${API_URL}/users/${id}`);
    return sanitizeUserContext(response.data);
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

/**
 * Update user context
 */
export const updateUserContext = async (id: string, data: UpdateUserContextRequest) => {
  try {
    // Ensure we're not sending null values
    const sanitizedData = { ...data };
    if (sanitizedData.workDescription === null) sanitizedData.workDescription = '';
    if (sanitizedData.shortTermGoals === null) sanitizedData.shortTermGoals = '';
    if (sanitizedData.longTermGoals === null) sanitizedData.longTermGoals = '';
    if (sanitizedData.otherContext === null) sanitizedData.otherContext = '';
    
    const response = await axios.patch<UserContext>(`${API_URL}/users/${id}/context`, sanitizedData);
    return sanitizeUserContext(response.data);
  } catch (error) {
    console.error('Error updating user context:', error);
    throw error;
  }
};

/**
 * Get user context
 */
export const getUserContext = async (id: string) => {
  try {
    const response = await axios.get<UserContext>(`${API_URL}/users/${id}/context`);
    return sanitizeUserContext(response.data);
  } catch (error) {
    console.error('Error getting user context:', error);
    throw error;
  }
}; 