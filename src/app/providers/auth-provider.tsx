import { useEffect } from 'react';
import { useAuthStore } from '../../features/auth/model';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password','/'];
    const isPublicPath = publicPaths.includes(location.pathname);

    if (!isLoading) {
      if (!isAuthenticated && !isPublicPath) {
        // Redirect to login if not authenticated and trying to access protected route
        navigate('/auth/login', { state: { from: location.pathname }, replace: true });
      } else if (isAuthenticated && isPublicPath) {
        // Redirect to home if authenticated and trying to access auth routes
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
} 