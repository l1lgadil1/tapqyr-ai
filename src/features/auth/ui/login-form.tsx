import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../model';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Alert, AlertDescription } from '../../../shared/ui/alert';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../../shared/ui/icons';

export function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL from location state or default to '/'
  const from = (location.state as { from?: string })?.from || '/';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      const response = await login({ email, password });
      if (response?.accessToken) {
        navigate(from, { replace: true });
      }
    } catch {
      // Error is handled by the store
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-2 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <CardHeader className="space-y-3 pb-2">
        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
          {t('auth.login.title')}
        </CardTitle>
        <CardDescription className="text-center text-base font-medium">
          {t('auth.login.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-shake border-2">
              <Icons.alertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold text-foreground">
              {t('auth.email')}
            </Label>
            <div className="relative">
              <Icons.mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                autoComplete="email"
                autoFocus
                className="pl-10 bg-card border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/80 transition-all placeholder:text-muted-foreground/50 h-12"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                {t('auth.password')}
              </Label>
              <Link 
                to="/auth/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <Icons.lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
                autoComplete="current-password"
                className="pl-10 pr-10 bg-card border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/80 transition-all placeholder:text-muted-foreground/50 h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
              >
                {showPassword ? (
                  <Icons.eyeOff className="h-4 w-4" />
                ) : (
                  <Icons.eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              t('auth.login.action')
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center pb-8">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium">
              {t('auth.login.or')}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('auth.login.noAccount')}{' '}
          <Link 
            to="/auth/register" 
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center transition-colors"
          >
            {t('auth.register.action')}
            <Icons.arrowRight className="ml-1 h-4 w-4" />
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
} 