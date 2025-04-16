import { 
  UserGrowthMetrics,
  TodoCompletionRate,
  UserActivityPatterns,
  UserEngagementMetrics,
  TodoAnalytics,
  UserComprehensiveAnalytics,
  getUserGrowthMetrics as fetchGrowthMetrics,
  getTodoCompletionRates as fetchCompletionRates,
  getUserActivityPatterns as fetchActivityPatterns,
  getUserEngagementMetrics as fetchEngagementMetrics,
  getTodoAnalytics as fetchTodoAnalytics,
  getUserComprehensiveAnalytics as fetchComprehensiveAnalytics
} from '../analytics-api';

/**
 * Analytics service for handling analytics-related operations
 */
export const analyticsService = {
  /**
   * Get user growth metrics
   */
  async getUserGrowthMetrics(): Promise<UserGrowthMetrics> {
    return fetchGrowthMetrics();
  },

  /**
   * Get todo completion rates by user
   */
  async getTodoCompletionRates(): Promise<TodoCompletionRate[]> {
    return fetchCompletionRates();
  },

  /**
   * Get user activity patterns
   */
  async getUserActivityPatterns(userId: string): Promise<UserActivityPatterns> {
    return fetchActivityPatterns(userId);
  },

  /**
   * Get user engagement metrics
   */
  async getUserEngagementMetrics(userId: string): Promise<UserEngagementMetrics> {
    return fetchEngagementMetrics(userId);
  },

  /**
   * Get todo analytics for a specific date range
   */
  async getTodoAnalytics(startDate: Date, endDate: Date): Promise<TodoAnalytics> {
    return fetchTodoAnalytics(startDate, endDate);
  },
  
  /**
   * Get comprehensive user analytics
   */
  async getUserComprehensiveAnalytics(userId: string): Promise<UserComprehensiveAnalytics> {
    return fetchComprehensiveAnalytics(userId);
  }
}; 