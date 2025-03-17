import { RegisterForm } from '../../features/auth/ui';
import { PageContainer } from '../../shared/ui/page-container';
import { useTranslation } from 'react-i18next';

export function RegisterPage() {
  const { t } = useTranslation();
  
  return (
    <PageContainer
      title={t('auth.register.pageTitle')}
      description={t('auth.register.pageDescription')}
      className="flex items-center justify-center py-10"
    >
      <RegisterForm />
    </PageContainer>
  );
} 