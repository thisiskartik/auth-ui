/**
 * API route handlers that should be created in the integrating app
 * These are templates/instructions for the integrating app
 */

export const API_ROUTES = {
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
} as const;

/**
 * Template for /api/auth/refresh route handler
 * This should be created in the integrating app's app/api/auth/refresh/route.ts
 */
export const REFRESH_ROUTE_TEMPLATE = `
import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@kartikcs/auth-ui/lib/server-actions';

export async function POST() {
  try {
    const { access_token } = await refreshAccessToken();
    return NextResponse.json({ access_token });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 401 }
    );
  }
}
`;

/**
 * Template for /api/auth/logout route handler
 * This should be created in the integrating app's app/api/auth/logout/route.ts
 */
export const LOGOUT_ROUTE_TEMPLATE = `
import { NextResponse } from 'next/server';
import { logoutUser } from '@kartikcs/auth-ui/lib/server-actions';

export async function POST() {
  try {
    await logoutUser();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
`;
