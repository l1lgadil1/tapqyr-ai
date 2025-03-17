import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '../../../../shared/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        if (!i18n.isInitialized) {
          await i18n.init();
        }
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeI18n();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
} 