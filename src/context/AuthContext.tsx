'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthConfig } from '../lib/config';
import { getAccessToken, setAccessToken, removeAccessToken } from '../lib/token';
import { createAuthAxiosInstance } from '../lib/axios';
import type { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async (token: string): Promise<User | null> => {
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
          setAccessTokenState(null);
          return null;
        }
        throw new Error('Failed to fetch user');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        setAccessTokenState(token);
        const userData = await fetchUser(token);
        if (userData) {
          setUser(userData);
          if (!userData.is_verified) {
            router.push('/verify');
          }
        } else {
          removeAccessToken();
          setAccessTokenState(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchUser, router]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const config = getAuthConfig();
      
      // Generate PKCE values
      const { generateCodeVerifier, generateCodeChallenge } = await import('../lib/pkce');
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store code verifier in sessionStorage for later use
      sessionStorage.setItem('code_verifier', codeVerifier);

      // Step 1: Login to get code
      const loginResponse = await fetch(`${config.authServerEndpoint}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: config.clientId,
          code_challenge: codeChallenge,
          email,
          password,
        }),
      });

      if (!loginResponse.ok) {
        if (loginResponse.status === 401) {
          const error = await loginResponse.json().catch(() => ({ error: 'Invalid credentials' }));
          throw new Error(error.error || 'Invalid credentials');
        }
        throw new Error('Login failed');
      }

      const { code } = await loginResponse.json();

      // Step 2: Exchange code for tokens (server action)
      const { exchangeCodeForTokens } = await import('../lib/server-actions');
      const { access_token } = await exchangeCodeForTokens(code, codeVerifier);

      // Store access token
      setAccessToken(access_token);
      setAccessTokenState(access_token);

      // Step 3: Fetch user data
      const userData = await fetchUser(access_token);
      if (userData) {
        setUser(userData);
        if (!userData.is_verified) {
          router.push('/verify');
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [fetchUser, router]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAccessToken();
      setAccessTokenState(null);
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const { access_token } = await response.json();
      setAccessToken(access_token);
      setAccessTokenState(access_token);
      return access_token;
    } catch (error) {
      console.error('Refresh token error:', error);
      await logout();
      return null;
    }
  }, [logout]);

  const getUser = useCallback(async (): Promise<User | null> => {
    const token = getAccessToken();
    if (!token) {
      return null;
    }

    const userData = await fetchUser(token);
    if (userData) {
      setUser(userData);
    }
    return userData;
  }, [fetchUser]);

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    logout,
    refreshAccessToken,
    getUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
