import { getAuthConfig } from './config';
import { getAccessToken, removeAccessToken } from './token';
import { createAuthAxiosInstance } from './axios';
import type { User } from '../types';

/**
 * Get current user details
 */
export async function getUser(): Promise<User | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  try {
    const config = getAuthConfig();
    const response = await fetch(`${config.authServerEndpoint}/user/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeAccessToken();
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Logout user (client-side)
 * Note: This only removes the access token from localStorage.
 * The refresh token cookie is cleared by the server action.
 */
export function logout(): void {
  removeAccessToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Get access token
 */
export function getToken(): string | null {
  return getAccessToken();
}

/**
 * Create an authenticated axios instance
 * This instance automatically handles token refresh on 401 errors
 */
export function createAuthenticatedAxios(baseURL?: string) {
  return createAuthAxiosInstance(baseURL);
}
