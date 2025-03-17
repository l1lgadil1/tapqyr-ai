import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Alert, AlertDescription } from '../../../shared/ui/alert';
import { useTranslation } from 'react-i18next';
import { requestPasswordReset } from '../../../shared/api/auth-api';

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await requestPasswordReset({ email });
      setIsSubmitted(true);
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : t('auth.forgotPassword.error')
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t('auth.forgotPassword.successTitle')}</CardTitle>
          <CardDescription>{t('auth.forgotPassword.successDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-primary/10 border-primary/20">
            <AlertDescription>
              {t('auth.forgotPassword.successMessage', { email })}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/auth/login" className="text-primary hover:underline">
            {t('auth.login.returnToLogin')}
          </Link>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('auth.forgotPassword.title')}</CardTitle>
        <CardDescription>{t('auth.forgotPassword.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') : t('auth.forgotPassword.action')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.forgotPassword.rememberPassword')}{' '}
          <Link to="/auth/login" className="text-primary hover:underline">
            {t('auth.login.action')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
} 