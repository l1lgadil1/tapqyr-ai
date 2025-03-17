const TOKEN_KEY = 'token';

/**
 * Get the authentication token from storage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set the authentication token in storage
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove the authentication token from storage
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if a token exists
 */
export const hasToken = (): boolean => {
  return !!getToken();
}; 