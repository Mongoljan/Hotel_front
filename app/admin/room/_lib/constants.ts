export const WIFI_KEYWORDS = ["wifi", "wi-fi", "wireless", "интернэт"] as const;

export const ROOM_CACHE_KEYS = {
  lookup: "roomLookup",
  data: "roomData",
  syncedAt: "roomSyncedAt",
  version: "roomCacheVersion"
} as const;

// Bump this whenever the cache schema changes (e.g. new lookup fields added).
// Mismatched versions trigger a full cache bust on next load.
export const ROOM_CACHE_VERSION = 2;

export const ROOM_API_ENDPOINTS = {
  lookup: "/api/lookup",
  rooms: "/api/roomsNew"
} as const;