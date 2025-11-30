import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RouteConfig } from '../types';

export interface AuthMiddlewareConfig {
  protectedRoutes: string[];
  publicRoutes: string[];
}

const LOGIN_ROUTE = '/login';
const SIGNUP_ROUTE = '/sign-up';
const VERIFY_ROUTE = '/verify';
const FORGOT_PASSWORD_ROUTE = '/forgot-password';
const RESET_PASSWORD_ROUTE = '/reset-password';

export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  return async function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Always allow auth routes
    const authRoutes = [
      LOGIN_ROUTE,
      SIGNUP_ROUTE,
      VERIFY_ROUTE,
      FORGOT_PASSWORD_ROUTE,
      RESET_PASSWORD_ROUTE,
    ];

    if (authRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check if route is public
    const isPublicRoute = config.publicRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Check if route is protected
    const isProtectedRoute = config.protectedRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isProtectedRoute) {
      // Check for access token in cookie
      // Note: localStorage is not accessible in middleware, so we check cookies
      // The access token should also be stored in a cookie for middleware access
      // or the app should handle client-side redirects
      const accessToken = request.cookies.get('auth_access_token')?.value;

      if (!accessToken) {
        // Redirect to login if no token found
        const url = request.nextUrl.clone();
        url.pathname = LOGIN_ROUTE;
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  };
}

export function getRouteConfig(): RouteConfig {
  return {
    protected: [],
    public: [],
  };
}
