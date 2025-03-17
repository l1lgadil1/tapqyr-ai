import { FC } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "../../../shared/ui/theme-toggle";
import { LanguageSwitcher } from "../../../shared/ui/language-switcher";
import { useTranslation } from "../../../shared/lib/i18n";
import { UserContextButton, UserContextModal, OnboardingModal, useUserContextModal, useUserOnboardingStore } from "../../../features/user-onboarding";
import { useAuthStore } from "../../../features/auth/model";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/ui/button";
import { Avatar, AvatarFallback } from "../../../shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../shared/ui/dropdown-menu";
import { useEffect } from "react";

export const Header: FC = () => {
  const { t } = useTranslation('common');
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { isOpen, setIsOpen } = useUserContextModal();
  const { loadUserContext, userId } = useUserOnboardingStore();
  
  // Load user context when component mounts if user is authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadUserContext();
    }
  }, [isAuthenticated, userId, loadUserContext]);
  
  const handleLogout = async () => {
    await logout();
  };
  
  // Don't render sensitive content while loading
  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/30 backdrop-blur-md supports-[backdrop-filter]:bg-background/10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl ai-text-gradient">{t('app.name')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>
    );
  }
  
  return (
    <>
      {/* Include the modals */}
      <OnboardingModal />
      <UserContextModal open={isOpen} onOpenChange={setIsOpen} />
      
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
            <ThemeToggle />
            <LanguageSwitcher />
            {isAuthenticated && user ? (
              <>
                <UserContextButton />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.name?.trim() 
                            ? user.name.charAt(0).toUpperCase() 
                            : user.email?.trim() 
                              ? user.email.charAt(0).toUpperCase() 
                              : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user?.name && <p className="font-medium">{user.name}</p>}
                        {user?.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/todo">
                        {t('nav.todo')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={handleLogout}
                    >
                      {t('auth.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">{t('auth.login.action')}</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/register">{t('auth.register.action')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}; 