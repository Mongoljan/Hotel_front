export const WIFI_KEYWORDS = ["wifi", "wi-fi", "wireless", "интернет"] as const;

export const ROOM_CACHE_KEYS = {
  lookup: "roomLookup",
  data: "roomData",
  syncedAt: "roomSyncedAt"
} as const;

export const ROOM_API_ENDPOINTS = {
  lookup: "/api/lookup",
  rooms: "/api/rooms"
} as const;