import { ForgotPasswordForm } from '../../features/auth/ui';
import { PageContainer } from '../../shared/ui/page-container';
import { useTranslation } from 'react-i18next';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  
  return (
    <PageContainer
      title={t('auth.forgotPassword.pageTitle')}
      description={t('auth.forgotPassword.pageDescription')}
      className="flex items-center justify-center py-10"
    >
      <ForgotPasswordForm />
    </PageContainer>
  );
} 