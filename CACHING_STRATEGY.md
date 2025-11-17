# Caching Strategy Documentation

This document outlines the caching strategy implemented in the Hotel Management System to optimize performance and reduce unnecessary API calls.

## Overview

The application uses a multi-layered caching approach:

1. **Page-level caching** using Next.js rendering strategies (SSG, ISR, SSR, CSR)
2. **Client-side API caching** using a custom cache manager
3. **Component-level caching** for reusable UI elements

## Page-Level Caching Strategy

### Public Pages

| Page Type | Method | Revalidate | Reason |
|-----------|--------|------------|--------|
| Hotel Listing | ISR | 5 minutes | Fast access + periodic updates |
| Hotel Detail | ISR | 10 minutes | SEO optimization + moderate updates |
| Search Results | SSR | N/A | Requires fresh filtered results |
| Static Pages | SSG | N/A | Content rarely changes |

### Authenticated Pages

| Page Type | Method | Reason |
|-----------|--------|--------|
| User Dashboard | CSR | Authenticated + personalized |
| User Bookings | CSR | Private user data |
| User Profile | CSR | Private user data |

### Admin Pages

All admin pages use **CSR (Client-Side Rendering)** because:
- Require authentication
- Real-time data updates
- Interactive CRUD operations
- Security considerations

## API Data Caching

### Cache TTL Configuration

```typescript
// Rarely changes (24 hours)
- User Types (Manager, Reception, etc.)
- Room Types
- Amenities

// Moderate frequency (5-10 minutes)
- Hotel Information
- Room Availability
- Pricing

// Frequent updates (1-2 minutes)
- Bookings
- Dashboard Statistics
- Workers List
```

### Usage Example

```typescript
import { useApiData } from '@/hooks/useApiData';
import { API_CACHE_TTL } from '@/lib/cachingStrategy';

function MyComponent() {
  const { data, loading, refetch } = useApiData({
    endpoint: '/api/workers/',
    token: userToken,
    ttl: API_CACHE_TTL.WORKERS, // 5 minutes
  });

  // Data is automatically cached and reused
}
```

## Client-Side API Cache

### Features

- **Automatic caching** with configurable TTL
- **Automatic cleanup** of expired entries
- **Manual invalidation** when needed
- **Type-safe** with TypeScript

### API Functions with Caching

The following API functions use caching:

```typescript
// Cached for 24 hours
getUserTypes()

// Cached for 5 minutes (configurable)
getWorkers(token)
```

### Cache Invalidation

Cache is automatically invalidated:
- When TTL expires
- After mutations (create, update, delete)
- On manual refetch

## Implementation Files

### Core Files

1. **`/lib/apiCache.ts`** - Cache manager implementation
2. **`/lib/api.ts`** - API functions with caching
3. **`/lib/cachingStrategy.ts`** - Strategy configuration
4. **`/hooks/useApiData.ts`** - React hooks for data fetching

### Example Implementations

- **Workers Page** (`/app/admin/workers/page.tsx`) - Uses cached API calls
- **Room Management** - Uses existing caching in hooks

## Best Practices

### 1. Choose the Right Caching Strategy

```typescript
// For rarely changing reference data
const { data: userTypes } = useApiData({
  endpoint: '/api/user-types/',
  ttl: API_CACHE_TTL.USER_TYPES, // 24 hours
});

// For frequently changing data
const { data: bookings } = useApiData({
  endpoint: '/api/bookings/',
  ttl: API_CACHE_TTL.BOOKINGS, // 2 minutes
});
```

### 2. Invalidate Cache After Mutations

```typescript
const { mutate } = useMutation({
  endpoint: '/api/workers/',
  method: 'POST',
  invalidateKeys: ['/api/workers/'], // Invalidate workers cache
  onSuccess: () => {
    toast.success('Worker created!');
    refetch(); // Refetch fresh data
  },
});
```

### 3. Use ISR for Public Pages

For public-facing pages that need SEO but update periodically:

```typescript
// In your page.tsx
export const revalidate = 300; // 5 minutes

export default async function HotelListingPage() {
  const hotels = await fetchHotels();
  return <HotelList hotels={hotels} />;
}
```

### 4. Avoid Over-Caching

Don't cache:
- Real-time data (live updates, notifications)
- User-specific sensitive data
- Form submissions
- One-time operations

## Performance Benefits

1. **Reduced API Calls**: User types fetched once per 24 hours instead of on every page load
2. **Faster Load Times**: Cached data served instantly from memory
3. **Better UX**: Instant navigation between cached pages
4. **Reduced Server Load**: Fewer requests to backend

## Monitoring Cache Effectiveness

To check if caching is working:

```typescript
import apiCache from '@/lib/apiCache';

// Check cache stats (add this method if needed)
console.log('Cache size:', apiCache.cache.size);

// Manually inspect cache
const cached = apiCache.get('/api/user-types/');
console.log('User types cached:', !!cached);
```

## Future Improvements

1. **Redis integration** for server-side caching in production
2. **Cache warming** on app initialization
3. **Stale-while-revalidate** pattern for better UX
4. **Cache analytics** dashboard
5. **Automatic cache size management** with LRU eviction

## References

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [React Query Documentation](https://tanstack.com/query/latest) (alternative approach)
