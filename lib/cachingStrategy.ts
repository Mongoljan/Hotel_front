/**
 * Caching Strategy Configuration
 *
 * This file defines the caching strategy for different types of pages and data
 * in the application, following Next.js 13+ App Router patterns.
 *
 * Rendering Methods:
 * - SSG (Static Site Generation): Pre-rendered at build time
 * - ISR (Incremental Static Regeneration): Static with periodic revalidation
 * - SSR (Server-Side Rendering): Rendered on each request
 * - CSR (Client-Side Rendering): Rendered in the browser
 */

export const CACHE_STRATEGIES = {
  // Public pages - mostly static or with ISR
  PUBLIC: {
    // Hotel listing page - fast access, updates periodically
    HOTEL_LISTING: {
      method: 'ISR',
      revalidate: 300, // 5 minutes
      reason: 'Fast access + periodic updates for new hotels',
    },

    // Hotel detail page - SEO important, moderately dynamic
    HOTEL_DETAIL: {
      method: 'ISR',
      revalidate: 600, // 10 minutes
      reason: 'SEO optimization + moderate update frequency',
    },

    // Search results - fresh data required
    SEARCH_RESULTS: {
      method: 'SSR',
      revalidate: false,
      reason: 'Requires fresh results based on filters',
    },

    // Static info pages (About, Terms, Privacy)
    STATIC_PAGES: {
      method: 'SSG',
      revalidate: false,
      reason: 'Content rarely changes, no need to regenerate',
    },
  },

  // Authenticated user pages - CSR with data fetching
  AUTHENTICATED: {
    // User dashboard - fully interactive
    USER_DASHBOARD: {
      method: 'CSR',
      revalidate: false,
      reason: 'Authenticated + fully interactive + personalized',
    },

    // User bookings - personalized data
    USER_BOOKINGS: {
      method: 'CSR',
      revalidate: false,
      reason: 'Personalized data requiring authentication',
    },

    // User profile
    USER_PROFILE: {
      method: 'CSR',
      revalidate: false,
      reason: 'Private user data',
    },
  },

  // Admin pages - CSR for security and interactivity
  ADMIN: {
    // Admin dashboard - real-time metrics
    DASHBOARD: {
      method: 'CSR',
      revalidate: false,
      reason: 'Real-time data + authentication required',
    },

    // Bookings management
    BOOKINGS: {
      method: 'CSR',
      revalidate: false,
      reason: 'Frequent updates + real-time status',
    },

    // Room management
    ROOMS: {
      method: 'CSR',
      revalidate: false,
      reason: 'Interactive CRUD operations',
    },

    // Workers management
    WORKERS: {
      method: 'CSR',
      revalidate: false,
      reason: 'Interactive CRUD operations + approval workflows',
    },

    // Hotel registration - multi-step form
    HOTEL_REGISTRATION: {
      method: 'CSR',
      revalidate: false,
      reason: 'Form-heavy + dynamic + requires authentication',
    },
  },

  // Component-level caching
  COMPONENTS: {
    // Navigation/Header - can be cached
    NAVIGATION: {
      cache: true,
      ttl: 3600, // 1 hour
      reason: 'Menu items rarely change',
    },

    // Footer - static content
    FOOTER: {
      cache: true,
      ttl: 86400, // 24 hours
      reason: 'Static links and information',
    },

    // Hotel cards in listing - cached with ISR page
    HOTEL_CARDS: {
      cache: true,
      ttl: 300, // 5 minutes
      reason: 'Cached along with ISR page revalidation',
    },

    // User-specific components - no cache
    USER_WIDGETS: {
      cache: false,
      ttl: 0,
      reason: 'Personalized content',
    },
  },
};

// API Data Caching TTLs (in milliseconds)
export const API_CACHE_TTL = {
  // Rarely changes
  USER_TYPES: 24 * 60 * 60 * 1000, // 24 hours
  ROOM_TYPES: 24 * 60 * 60 * 1000, // 24 hours
  AMENITIES: 24 * 60 * 60 * 1000, // 24 hours

  // Moderate update frequency
  HOTEL_INFO: 10 * 60 * 1000, // 10 minutes
  ROOM_AVAILABILITY: 5 * 60 * 1000, // 5 minutes
  PRICING: 5 * 60 * 1000, // 5 minutes

  // Frequent updates
  BOOKINGS: 2 * 60 * 1000, // 2 minutes
  WORKERS: 5 * 60 * 1000, // 5 minutes
  DASHBOARD_STATS: 1 * 60 * 1000, // 1 minute
};

/**
 * Helper to get cache configuration for a page
 */
export function getCacheConfig(pageType: string) {
  // Traverse the nested object to find the config
  for (const category of Object.values(CACHE_STRATEGIES)) {
    if (typeof category === 'object') {
      for (const [key, config] of Object.entries(category)) {
        if (key === pageType) {
          return config;
        }
      }
    }
  }
  return null;
}

/**
 * Next.js revalidate helper
 * Returns the revalidate value for ISR pages
 */
export function getRevalidateTime(pageType: string): number | false {
  const config = getCacheConfig(pageType);
  if (!config) return false;

  if (config.method === 'ISR' && typeof config.revalidate === 'number') {
    return config.revalidate;
  }

  return false;
}

/**
 * Determine if a page should use dynamic rendering
 */
export function isDynamic(pageType: string): boolean {
  const config = getCacheConfig(pageType);
  if (!config) return true; // Default to dynamic

  return config.method === 'SSR' || config.method === 'CSR';
}

/**
 * Cache key generator for consistent caching
 */
export function generateCacheKey(
  endpoint: string,
  params?: Record<string, any>
): string {
  const baseKey = endpoint.replace(/^\/+/, '').replace(/\/+$/, '');

  if (!params || Object.keys(params).length === 0) {
    return baseKey;
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return `${baseKey}?${sortedParams}`;
}
