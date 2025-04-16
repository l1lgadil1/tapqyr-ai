import { useAuthStore } from '../../features/auth/model';

/**
 * Custom hook to access authentication state and actions
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, register } = useAuthStore();
  
  return { 
    user: user?.user, 
    isAuthenticated, 
    isLoading,
    login,
    logout,
    register
  };
} 