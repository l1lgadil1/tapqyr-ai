import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from '../../../shared/api/auth-api';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../../../shared/api/auth-api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

// Helper function to check if token exists
const hasToken = () => {
  return !!localStorage.getItem('token');
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiLogin(credentials);
          
          // Store token
          localStorage.setItem('token', response.accessToken);
          
          // Set user state
          set({ 
            user: response.user,
            isAuthenticated: true,
            isLoading: false 
          });
          
          return response;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to login',
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiRegister(data);
          
          // Store token
          localStorage.setItem('token', response.accessToken);
          
          // Set user state
          set({ 
            user: response.user,
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to register',
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await apiLogout();
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to logout',
            isLoading: false 
          });
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          if (!hasToken()) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          const user = await getCurrentUser();
          set({ user, isAuthenticated: !!user, isLoading: false });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
); 