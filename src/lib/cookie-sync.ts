/**
 * Utility to sync access token to cookie for middleware access
 * Call this after setting the access token
 */

export function syncAccessTokenToCookie(token: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Set cookie that middleware can read
  const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `auth_access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${isProduction ? '; Secure' : ''}`;
}

export function removeAccessTokenCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = 'auth_access_token=; path=/; max-age=0';
}
