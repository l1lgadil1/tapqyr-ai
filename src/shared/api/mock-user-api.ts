import { UserContext, CreateUserRequest, UpdateUserContextRequest } from './user-api';

// In-memory storage for mock data
const users: Record<string, UserContext> = {};

/**
 * Helper function to ensure context fields are never null
 */
const sanitizeUserContext = (user: UserContext): UserContext => {
  return {
    ...user,
    workDescription: user.workDescription === null ? '' : user.workDescription,
    shortTermGoals: user.shortTermGoals === null ? '' : user.shortTermGoals,
    longTermGoals: user.longTermGoals === null ? '' : user.longTermGoals,
    otherContext: user.otherContext === null ? '' : user.otherContext,
  };
};

/**
 * Mock implementation of createUser
 */
export const mockCreateUser = async (data: CreateUserRequest): Promise<UserContext> => {
  const id = `user_${Date.now()}`;
  const newUser: UserContext = {
    id,
    workDescription: '',
    shortTermGoals: '',
    longTermGoals: '',
    otherContext: '',
    onboardingComplete: false,
    ...data
  };
  
  // Ensure no null values
  const sanitizedUser = sanitizeUserContext(newUser);
  
  // Store in mock database
  users[id] = sanitizedUser;
  
  // Log for debugging
  console.log('Mock API: Created user', sanitizedUser);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return sanitizedUser;
};

/**
 * Mock implementation of getUserById
 */
export const mockGetUserById = async (id: string): Promise<UserContext> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const user = users[id];
  if (!user) {
    console.log('Mock API: User not found', id);
    
    // Create a default user instead of throwing an error
    const defaultUser: UserContext = {
      id,
      workDescription: '',
      shortTermGoals: '',
      longTermGoals: '',
      otherContext: '',
      onboardingComplete: false
    };
    
    // Store the default user
    users[id] = defaultUser;
    persistMockData();
    
    console.log('Mock API: Created default user', defaultUser);
    return defaultUser;
  }
  
  // Ensure no null values
  const sanitizedUser = sanitizeUserContext(user);
  
  // Update if sanitization changed anything
  if (JSON.stringify(user) !== JSON.stringify(sanitizedUser)) {
    users[id] = sanitizedUser;
    persistMockData();
    console.log('Mock API: Sanitized user data', sanitizedUser);
  }
  
  console.log('Mock API: Retrieved user', sanitizedUser);
  return sanitizedUser;
};

/**
 * Mock implementation of updateUserContext
 */
export const mockUpdateUserContext = async (id: string, data: UpdateUserContextRequest): Promise<UserContext> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const user = users[id];
  if (!user) {
    console.log('Mock API: User not found for update', id);
    
    // Create a new user with the provided data
    const newUser: UserContext = {
      id,
      workDescription: data.workDescription || '',
      shortTermGoals: data.shortTermGoals || '',
      longTermGoals: data.longTermGoals || '',
      otherContext: data.otherContext || '',
      onboardingComplete: data.onboardingComplete ?? false
    };
    
    // Store the new user
    users[id] = newUser;
    persistMockData();
    
    console.log('Mock API: Created new user during update', newUser);
    return newUser;
  }
  
  // Update user context
  const updatedUser = {
    ...user,
    ...data,
    // Ensure these are never null
    workDescription: data.workDescription === null ? '' : (data.workDescription ?? user.workDescription),
    shortTermGoals: data.shortTermGoals === null ? '' : (data.shortTermGoals ?? user.shortTermGoals),
    longTermGoals: data.longTermGoals === null ? '' : (data.longTermGoals ?? user.longTermGoals),
    otherContext: data.otherContext === null ? '' : (data.otherContext ?? user.otherContext),
  };
  
  // Store updated user
  users[id] = updatedUser;
  
  // Log for debugging
  console.log('Mock API: Updated user context', updatedUser);
  
  // Persist to localStorage immediately after update
  persistMockData();
  
  return updatedUser;
};

/**
 * Mock implementation of getUserContext
 */
export const mockGetUserContext = async (id: string): Promise<UserContext> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const user = users[id];
  if (!user) {
    console.log('Mock API: User context not found', id);
    
    // Create a default user context
    const defaultContext: UserContext = {
      id,
      workDescription: '',
      shortTermGoals: '',
      longTermGoals: '',
      otherContext: '',
      onboardingComplete: false
    };
    
    // Store the default context
    users[id] = defaultContext;
    persistMockData();
    
    console.log('Mock API: Created default user context', defaultContext);
    return defaultContext;
  }
  
  // Ensure no null values
  const sanitizedUser = sanitizeUserContext(user);
  
  // Update if sanitization changed anything
  if (JSON.stringify(user) !== JSON.stringify(sanitizedUser)) {
    users[id] = sanitizedUser;
    persistMockData();
    console.log('Mock API: Sanitized user context data', sanitizedUser);
  }
  
  console.log('Mock API: Retrieved user context', sanitizedUser);
  return sanitizedUser;
};

/**
 * Helper function to persist mock data to localStorage
 */
export const persistMockData = (): void => {
  try {
    // Sanitize all users before persisting
    for (const id in users) {
      users[id] = sanitizeUserContext(users[id]);
    }
    
    localStorage.setItem('mock_users', JSON.stringify(users));
    console.log('Mock API: Persisted data to localStorage', users);
  } catch (error) {
    console.error('Mock API: Error persisting data to localStorage', error);
  }
};

/**
 * Helper function to load mock data from localStorage
 */
export const loadMockData = (): void => {
  try {
    const storedData = localStorage.getItem('mock_users');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      // Sanitize all loaded users
      for (const id in parsedData) {
        parsedData[id] = sanitizeUserContext(parsedData[id]);
      }
      
      Object.assign(users, parsedData);
      console.log('Mock API: Loaded and sanitized data from localStorage', users);
    }
  } catch (error) {
    console.error('Mock API: Error loading data from localStorage', error);
  }
};

// Initialize by loading any existing mock data
loadMockData();

// Set up periodic persistence
setInterval(persistMockData, 5000); 