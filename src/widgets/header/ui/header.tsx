import { FC } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "../../../shared/ui/theme-toggle";
import { LanguageSwitcher } from "../../../shared/ui/language-switcher";
import { useTranslation } from "../../../shared/lib/i18n";
import { useAuthStore } from "../../../features/auth/model";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/ui/button";
import { Avatar, AvatarFallback } from "../../../shared/ui/avatar";
import { ContextButton, useUserContextModal } from "../../../features/user-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../shared/ui/dropdown-menu";

export const Header: FC = () => {
  const { t } = useTranslation('common');
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  
  // Initialize the user context modal hook if user is authenticated
  const userId = user?.user?.id || '';
  const { userContext, updateUserContext } = useUserContextModal(userId);
  
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
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/30 backdrop-blur-md supports-[backdrop-filter]:bg-background/10">
          <div className="container flex h-16 items-center">
              <div className="mr-4 flex">
                  <a href="/" className="mr-6 flex items-center space-x-2">
                      <motion.span
                          className="font-bold text-xl ai-text-gradient"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}>
                          {t('app.name')}
                      </motion.span>
                  </a>
              </div>
              <div className="flex flex-1 items-center justify-end space-x-2">
                  <ThemeToggle />
                  <LanguageSwitcher />

                  {/* Context Button - Only show when user is authenticated */}
                  {isAuthenticated && user && (
                      <ContextButton
                          userContext={userContext}
                          onUpdateContext={updateUserContext}
                      />
                  )}

                  {isAuthenticated && user ? (
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                  <Avatar className="h-8 w-8">
                                      <AvatarFallback>
                                          {user.user?.name?.trim()
                                              ? user.user.name.charAt(0).toUpperCase()
                                              : user.user?.email?.trim()
                                              ? user.user.email.charAt(0).toUpperCase()
                                              : 'U'}
                                      </AvatarFallback>
                                  </Avatar>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <div className="flex items-center justify-start gap-2 p-2">
                                  <div className="flex flex-col space-y-1 leading-none">
                                      {user?.user?.name && (
                                          <p className="font-medium">{user.user.name}</p>
                                      )}
                                      {user?.user?.email && (
                                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                                              {user.user.email}
                                          </p>
                                      )}
                                  </div>
                              </div>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                  <Link to="/analytics">{t('nav.analytics')}</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                  <Link to="/todo">{t('nav.todo')}</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                                  {t('auth.logout')}
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
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
  );
}; 