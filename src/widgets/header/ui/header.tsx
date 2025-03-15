import { FC } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "../../../shared/ui/theme-toggle";
import { LanguageSwitcher } from "../../../shared/ui/language-switcher";
import { useTranslation } from "../../../shared/lib/i18n";

export const Header: FC = () => {
  const { t } = useTranslation('common');
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/30 backdrop-blur-md supports-[backdrop-filter]:bg-background/10">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <motion.span 
              className="font-bold text-xl ai-text-gradient"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {t('app.name')}
            </motion.span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}; 