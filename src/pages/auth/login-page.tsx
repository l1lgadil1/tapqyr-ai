import { LoginForm } from '../../features/auth/ui';
import { PageContainer } from '../../shared/ui/page-container';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const { t } = useTranslation();
  
  return (
    <PageContainer
      title={t('auth.login.pageTitle')}
      description={t('auth.login.pageDescription')}
      className="flex items-center justify-center py-10"
    >
      <LoginForm />
    </PageContainer>
  );
} 