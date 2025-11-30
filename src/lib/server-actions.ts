'use server';

import { getAuthConfig } from './config';
import { cookies } from 'next/headers';

const REFRESH_TOKEN_COOKIE = 'auth_refresh_token';

export async function exchangeCodeForTokens(code: string, codeVerifier: string) {
  const config = getAuthConfig();
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  try {
    const response = await fetch(`${config.authServerEndpoint}/oauth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to exchange code' }));
      throw new Error(error.error || 'Failed to exchange code for tokens');
    }

    const data = await response.json();
    
    // Set refresh token in http-only cookie
    const cookieStore = await cookies();
    cookieStore.set(REFRESH_TOKEN_COOKIE, data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
}

export async function refreshAccessToken() {
  const config = getAuthConfig();
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  try {
    const response = await fetch(`${config.authServerEndpoint}/oauth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      // Clear refresh token cookie on failure
      cookieStore.delete(REFRESH_TOKEN_COOKIE);
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);
    throw error;
  }
}

export async function logoutUser() {
  const config = getAuthConfig();
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    try {
      await fetch(`${config.authServerEndpoint}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Clear refresh token cookie
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
