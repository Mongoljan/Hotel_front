export const WIFI_KEYWORDS = ["wifi", "wi-fi", "wireless", "интернет"] as const;

export const ROOM_CACHE_KEYS = {
  lookup: "roomLookup",
  data: "roomData",
  syncedAt: "roomSyncedAt"
} as const;

export const ROOM_API_ENDPOINTS = {
  lookup: "https://dev.kacc.mn/api/all-data/",
  rooms: "https://dev.kacc.mn/api/roomsNew/"
} as const;