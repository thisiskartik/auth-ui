# @kartikcs/auth-ui

A Next.js 16 UI package for authentication with auth-server integration. This package provides ready-to-use authentication components, middleware, and utilities for Next.js applications.

## Features

- 🔐 Complete authentication flow (Login, Register, Verify, Password Reset)
- 🎨 Beautiful UI components built with ShadCN
- ✅ Form validation with Zod and react-hook-form
- 🔄 Automatic token refresh with axios interceptors
- 🛡️ Middleware support for protected routes
- 🔑 PKCE (Proof Key for Code Exchange) flow for secure authentication
- 📦 TypeScript support

## Installation

```bash
npm install @kartikcs/auth-ui
```

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_CLIENT_ID="your-client-id"
CLIENT_SECRET="your-client-secret"
NEXT_PUBLIC_AUTH_SERVER_ENDPOINT="https://your-auth-server.com"
```

## Setup

### 1. Install Tailwind CSS (if not already installed)

This package uses Tailwind CSS for styling. Make sure you have Tailwind CSS configured in your Next.js app.

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@kartikcs/auth-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add Tailwind directives to your global CSS file (e.g., `app/globals.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Note:** You can also import the package's global styles which include ShadCN CSS variables:

```css
@import '@kartikcs/auth-ui/dist/styles/globals.css';
```

Or copy the CSS variables from `node_modules/@kartikcs/auth-ui/dist/styles/globals.css` to your own global CSS file.

### 2. Initialize Public Key

Before your app starts, you need to fetch the public key from the auth server. Create a file `lib/auth-init.ts`:

```typescript
import { getPublicKey } from '@kartikcs/auth-ui';

// This will be called once when the app starts
export async function initializeAuth() {
  try {
    await getPublicKey();
  } catch (error) {
    console.error('Failed to initialize auth:', error);
  }
}
```

Call this in your root layout or a server component that runs on app start.

### 3. Create API Routes

Create the following API routes in your Next.js app:

#### `/app/api/auth/refresh/route.ts`

```typescript
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
```

#### `/app/api/auth/logout/route.ts`

```typescript
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
```

### 4. Setup Middleware

Create or update `middleware.ts` in your project root:

```typescript
import { createAuthMiddleware } from '@kartikcs/auth-ui/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authMiddleware = createAuthMiddleware({
  protectedRoutes: [
    '/dashboard',
    '/profile',
    // Add your protected routes here
  ],
  publicRoutes: [
    '/',
    '/about',
    // Add your public routes here
  ],
});

export function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 5. Wrap Your App with AuthProvider

Update your root layout (`app/layout.tsx`):

```typescript
import { AuthProvider } from '@kartikcs/auth-ui';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 6. Create Auth Pages

Create the following pages in your app:

#### `/app/login/page.tsx`

```typescript
import { LoginForm } from '@kartikcs/auth-ui/components';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
```

#### `/app/sign-up/page.tsx`

```typescript
import { RegisterForm } from '@kartikcs/auth-ui/components';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
```

#### `/app/verify/page.tsx`

```typescript
import { VerifyForm } from '@kartikcs/auth-ui/components';

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <VerifyForm />
    </div>
  );
}
```

#### `/app/forgot-password/page.tsx`

```typescript
import { ForgotPasswordForm } from '@kartikcs/auth-ui/components';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ForgotPasswordForm />
    </div>
  );
}
```

#### `/app/reset-password/page.tsx`

```typescript
import { ResetPasswordForm } from '@kartikcs/auth-ui/components';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  );
}
```

## Usage

### Using Auth Context

```typescript
'use client';

import { useAuth } from '@kartikcs/auth-ui';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.first_name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Using Logout Button

```typescript
import { LogoutButton } from '@kartikcs/auth-ui/components';

export default function Header() {
  return (
    <header>
      <LogoutButton />
    </header>
  );
}
```

### Using Helper Functions

```typescript
import { getUser, isAuthenticated, createAuthenticatedAxios } from '@kartikcs/auth-ui';

// Check if user is authenticated
if (isAuthenticated()) {
  // Get user details
  const user = await getUser();
  
  // Create authenticated axios instance
  const api = createAuthenticatedAxios();
  const response = await api.get('/some-protected-endpoint');
}
```

### Making Authenticated API Calls

The `createAuthenticatedAxios` function creates an axios instance that:
- Automatically adds the access token to requests
- Handles 401 errors by refreshing the token
- Retries failed requests after token refresh
- Logs out the user if token refresh fails

```typescript
import { createAuthenticatedAxios } from '@kartikcs/auth-ui';

const api = createAuthenticatedAxios('https://your-api.com');

// This request will automatically include the access token
const response = await api.get('/protected-endpoint');

// If the token expires, it will be automatically refreshed
```

## Components

### LoginForm

Login form component with email and password fields.

**Props:** None (uses AuthContext)

### RegisterForm

Registration form with validation for:
- First name
- Last name
- Email
- Password (min 8 chars, uppercase, lowercase, number, special character)

**Props:** None

### VerifyForm

Email verification form with 6-digit code input and resend functionality.

**Props:** None (reads email from query params)

### ForgotPasswordForm

Form to request password reset link.

**Props:** None

### ResetPasswordForm

Form to reset password with new password and confirmation.

**Props:** None (reads reset code from query params)

### LogoutButton

Button component that handles logout.

**Props:**
- `variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'`
- `size?: 'default' | 'sm' | 'lg' | 'icon'`
- `className?: string`
- `children?: React.ReactNode`

## API Reference

### AuthContext

```typescript
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  getUser: () => Promise<User | null>;
}
```

### Helper Functions

- `getUser()`: Get current user details
- `logout()`: Logout user (client-side)
- `isAuthenticated()`: Check if user is authenticated
- `getToken()`: Get current access token
- `createAuthenticatedAxios(baseURL?)`: Create authenticated axios instance

### Server Actions

- `exchangeCodeForTokens(code, codeVerifier)`: Exchange authorization code for tokens
- `refreshAccessToken()`: Refresh access token using refresh token
- `logoutUser()`: Logout user (server-side, clears refresh token cookie)

## Authentication Flow

1. **Login Flow:**
   - User enters email and password
   - Client generates PKCE code verifier and challenge
   - POST `/login` with credentials and code challenge
   - Receive authorization code
   - Server action exchanges code for access and refresh tokens
   - Access token stored in localStorage
   - Refresh token stored in http-only cookie
   - Fetch user details
   - Redirect to home or verify page if not verified

2. **Registration Flow:**
   - User fills registration form
   - POST `/user/register` with user details
   - On success, redirect to verify page
   - User enters verification code
   - POST `/user/verify` to verify email
   - Redirect to login

3. **Token Refresh:**
   - When API call returns 401 with "Invalid access_token"
   - Axios interceptor calls `/api/auth/refresh`
   - Server action uses refresh token from cookie
   - New access token returned and stored
   - Original request retried

4. **Logout Flow:**
   - User clicks logout
   - POST `/logout` to auth server with refresh token
   - Clear refresh token cookie (server-side)
   - Clear access token from localStorage (client-side)
   - Redirect to login

## TypeScript Support

This package is fully typed with TypeScript. All exports include type definitions.

## License

ISC

## Author

Kartik Arora
