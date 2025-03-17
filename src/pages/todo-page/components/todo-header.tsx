'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '../../../shared/lib/i18n';

/**
 * Header component for the Todo page
 */
export function TodoHeader() {
  const { t } = useTranslation(['todo', 'common']);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 text-center"
    >
      <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-x">
        {t('app.name', { ns: 'common' })}
      </h1>
      <div className="flex items-center justify-center gap-2 mt-2">
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <p className="text-muted-foreground">
          {t('app.tagline', { ns: 'common' })}
        </p>
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      </div>
    </motion.div>
  );
} 