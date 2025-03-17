/**
 * User related types
 */

export interface UserContext {
  id: string;
  workDescription?: string | null;
  shortTermGoals?: string | null;
  longTermGoals?: string | null;
  otherContext?: string | null;
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