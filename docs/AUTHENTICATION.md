# Authentication System Documentation

## Overview

This project uses NextAuth.js v4 with a credentials provider for authentication. The system has been cleaned up and organized for better maintainability, security, and user experience.

## Architecture

### Core Components

1. **Auth Configuration** (`app/auth.config.ts`)
   - NextAuth configuration with credentials provider
   - Type-safe session and JWT handling
   - Environment variable validation

2. **Server-side Auth Utilities** (`lib/auth.ts`)
   - Centralized authentication functions
   - Type-safe interfaces
   - Error handling

3. **Client-side Auth Hook** (`hooks/useAuth.ts`)
   - React hook for authentication state
   - Login/logout functions
   - Route protection utilities

4. **Middleware** (`middleware.ts`)
   - Route protection
   - Automatic redirects
   - Error handling

5. **API Utilities** (`utils/api.ts`)
   - Authenticated API requests
   - Error handling
   - Type-safe responses

## Setup

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Required
AUTH_SECRET=your-secret-key-here

# Optional (defaults to https://dev.kacc.mn/api)
NEXT_PUBLIC_API_URL=https://your-api-url.com/api
```

### Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

## Usage

### Server-side Authentication

```typescript
import { getAuthSession, isAuthenticated, getCurrentUser } from '@/lib/auth';

// Get current session
const session = await getAuthSession();

// Check if user is authenticated
const authenticated = await isAuthenticated();

// Get current user
const user = await getCurrentUser();
```

### Client-side Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout,
    requireAuth,
    requireApproval 
  } = useAuth();

  // Login
  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      // Redirect handled by middleware
    } else {
      // Handle error
      console.error(result.error);
    }
  };

  // Logout
  const handleLogout = () => {
    logout('/auth/login');
  };

  // Protect routes
  useEffect(() => {
    requireAuth('/auth/login');
  }, []);

  // Check approval status
  if (!isUserApproved) {
    return <div>Waiting for approval...</div>;
  }
}
```

### API Requests

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/utils/api';

// GET request
const response = await apiGet('/users');
if (response.data) {
  console.log(response.data);
}

// POST request
const response = await apiPost('/users', { name: 'John' });
if (response.error) {
  console.error(response.error);
}

// PUT request
const response = await apiPut('/users/1', { name: 'Jane' });

// DELETE request
const response = await apiDelete('/users/1');
```

## Route Protection

### Middleware Protection

The middleware automatically protects routes:

- `/admin/*` - Requires authentication
- `/superadmin/*` - Requires authentication
- `/auth/*` - Public routes (redirects if authenticated)

### Client-side Protection

```typescript
import { useAuth } from '@/hooks/useAuth';

function ProtectedComponent() {
  const { requireAuth, requireApproval } = useAuth();

  useEffect(() => {
    // Require authentication
    if (!requireAuth()) return;

    // Require approval
    if (!requireApproval()) return;
  }, []);

  return <div>Protected content</div>;
}
```

## User Approval System

The system includes a two-tier approval system:

1. **User Approval** (`user.approved`)
2. **Hotel Approval** (`user.isApproved`)

Users must have both approvals to access full functionality.

### Checking Approval Status

```typescript
// Server-side
const isApproved = await isUserApproved();

// Client-side
const { isUserApproved } = useAuth();
```

## Error Handling

### Authentication Errors

- Invalid credentials
- Network errors
- Server errors
- Configuration errors

### Error Pages

- `/auth/error` - Displays authentication errors
- Automatic redirects for unauthorized access

### API Error Handling

```typescript
import { ApiError } from '@/utils/api';

try {
  const response = await apiGet('/users');
  if (response.error) {
    // Handle error
    console.error(response.error);
  }
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
  }
}
```

## Security Features

1. **Environment Variables** - Sensitive data stored in environment variables
2. **Token-based Authentication** - JWT tokens for session management
3. **Route Protection** - Middleware and client-side protection
4. **Input Validation** - Email format validation
5. **Error Handling** - Comprehensive error handling without exposing sensitive data
6. **Session Management** - 24-hour session timeout
7. **CSRF Protection** - Built-in NextAuth protection

## File Structure

```
├── app/
│   ├── auth.config.ts          # NextAuth configuration
│   ├── auth/
│   │   ├── login/              # Login pages
│   │   ├── register/           # Registration pages
│   │   └── error/              # Error pages
│   └── api/auth/[...nextauth]/ # NextAuth API routes
├── lib/
│   └── auth.ts                 # Server-side auth utilities
├── hooks/
│   └── useAuth.ts              # Client-side auth hook
├── utils/
│   └── api.ts                  # API utilities
├── middleware.ts               # Route protection
└── docs/
    └── AUTHENTICATION.md       # This documentation
```

## Migration Guide

### From Old System

1. Replace direct `signIn`/`signOut` calls with `useAuth` hook
2. Replace manual session checks with `useAuth` utilities
3. Replace direct API calls with `apiRequest` utilities
4. Update environment variables
5. Remove old `UserContext` usage

### Breaking Changes

- `auth()` function replaced with `getAuthSession()`
- Direct NextAuth imports replaced with `useAuth` hook
- Manual API calls replaced with utility functions
- Environment variable requirements updated

## Troubleshooting

### Common Issues

1. **AUTH_SECRET not set**
   - Ensure `.env.local` contains `AUTH_SECRET`

2. **API calls failing**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify network connectivity

3. **Session not persisting**
   - Check browser cookies
   - Verify AUTH_SECRET is consistent

4. **TypeScript errors**
   - Ensure all type declarations are properly imported
   - Check NextAuth module extensions

### Debug Mode

Enable debug mode in development:

```typescript
// auth.config.ts
debug: process.env.NODE_ENV === "development"
```

## Best Practices

1. **Always use the `useAuth` hook** for client-side authentication
2. **Use server-side auth functions** for API routes and server components
3. **Handle errors gracefully** with proper user feedback
4. **Validate inputs** before sending to API
5. **Use environment variables** for sensitive configuration
6. **Implement proper loading states** during authentication
7. **Test authentication flows** thoroughly
8. **Monitor authentication errors** in production 