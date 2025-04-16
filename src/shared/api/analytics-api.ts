import axios from 'axios';

// Define the API base URL - replace with your actual analytics service URL
const API_BASE_URL = 'http://localhost:9090/api/analytics';

// Types for the API responses
export interface UserGrowthMetrics {
  dailyNewUsers: number;
  weeklyNewUsers: number;
  monthlyNewUsers: number;
  totalUsers: number;
}

export interface UserActivityPatterns {
  todoCount: number;
  completionRate?: number;
  todosByDayOfWeek?: Record<string, number>;
  mostActiveDay?: string;
  mostActiveDayCount?: number;
  dueDatePatterns?: {
    withDueDate: number;
    withoutDueDate: number;
  };
}

export interface UserEngagementMetrics {
  onboardingComplete: boolean;
  profileCompleteness: number;
  daysSinceRegistration: number;
  lastLogin: string | null;
  totalTodos: number;
  hasMemory: boolean;
  hasTaskPreferences?: boolean;
  hasWorkPatterns?: boolean;
  hasInteractionHistory?: boolean;
  hasUserPersona?: boolean;
  memoryLastUpdated?: string;
}

export interface TodoCompletionRate {
  userId: string;
  userName?: string;
  userEmail?: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

export interface TodoAnalytics {
  todoCount: number;
  completionRate: number;
  priorityDistribution: Record<string, number>;
  aiGeneratedCount: number;
  aiGeneratedPercentage: number;
  withDueDate: number;
  withoutDueDate: number;
}

export interface UserComprehensiveAnalytics {
  taskAnalytics: {
    todoCount: number;
    completionRate?: number;
    todosByDayOfWeek?: Record<string, number>;
    mostActiveDay?: string;
    mostActiveDayCount?: number;
    dueDatePatterns?: {
      withDueDate: number;
      withoutDueDate: number;
    };
    priorityDistribution?: Record<string, number>;
    aiGeneratedCount?: number;
    aiGeneratedPercentage?: number;
  };
  engagementMetrics: {
    onboardingComplete: boolean;
    profileCompleteness: number;
    daysSinceRegistration: number;
    lastLogin: string | null;
    totalTodos: number;
    hasMemory: boolean;
    hasTaskPreferences?: boolean;
    hasWorkPatterns?: boolean;
    hasInteractionHistory?: boolean;
    hasUserPersona?: boolean;
    memoryLastUpdated?: string;
  };
  weeklyReport: {
    completedTasks: number;
    addedTasks: number;
    upcomingTasks: number;
    overdueTasks: number;
    completionRateChange?: number;
    mostProductiveDay?: string;
  };
}

/**
 * Get user growth metrics
 */
export const getUserGrowthMetrics = async (): Promise<UserGrowthMetrics> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/growth`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user growth metrics:', error);
    throw error;
  }
};

/**
 * Get todo completion rates by user
 */
export const getTodoCompletionRates = async (): Promise<TodoCompletionRate[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/todo/completion-rates`);
    return response.data;
  } catch (error) {
    console.error('Error fetching todo completion rates:', error);
    throw error;
  }
};

/**
 * Get user activity patterns
 */
export const getUserActivityPatterns = async (userId: string): Promise<UserActivityPatterns> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}/activity-patterns`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity patterns:', error);
    throw error;
  }
};

/**
 * Get user engagement metrics
 */
export const getUserEngagementMetrics = async (userId: string): Promise<UserEngagementMetrics> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}/engagement`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user engagement metrics:', error);
    throw error;
  }
};

/**
 * Get todo analytics for a specific date range
 */
export const getTodoAnalytics = async (
  startDate: Date, 
  endDate: Date
): Promise<TodoAnalytics> => {
  try {
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();
    
    const response = await axios.get(
      `${API_BASE_URL}/todo/analytics?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching todo analytics:', error);
    throw error;
  }
};

/**
 * Get comprehensive user analytics including task completion and activity
 */
export const getUserComprehensiveAnalytics = async (userId: string): Promise<UserComprehensiveAnalytics> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}/comprehensive`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comprehensive user analytics:', error);
    throw error;
  }
}; 