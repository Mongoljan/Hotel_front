import { ROOM_CACHE_KEYS } from "./constants";
import type { AllData, RoomData } from "./types";

export type RoomCachePayload = {
  lookup: AllData;
  rooms: RoomData[];
  syncedAt: number | null;
};

export const readRoomCache = (): RoomCachePayload | null => {
  try {
    const lookupRaw = localStorage.getItem(ROOM_CACHE_KEYS.lookup);
    const roomsRaw = localStorage.getItem(ROOM_CACHE_KEYS.data);

    if (!lookupRaw || !roomsRaw) {
      return null;
    }

    const lookup = JSON.parse(lookupRaw) as AllData;
    const rooms = JSON.parse(roomsRaw) as RoomData[];
    const syncedAtRaw = localStorage.getItem(ROOM_CACHE_KEYS.syncedAt);

    return {
      lookup,
      rooms,
      syncedAt: syncedAtRaw ? Number(syncedAtRaw) : null
    };
  } catch (error) {
    console.warn("Failed to parse room cache", error);
    return null;
  }
};

export const writeRoomCache = (payload: RoomCachePayload) => {
  try {
    localStorage.setItem(ROOM_CACHE_KEYS.lookup, JSON.stringify(payload.lookup));
    localStorage.setItem(ROOM_CACHE_KEYS.data, JSON.stringify(payload.rooms));
    if (payload.syncedAt) {
      localStorage.setItem(ROOM_CACHE_KEYS.syncedAt, String(payload.syncedAt));
    }
  } catch (error) {
    console.warn("Failed to persist room cache", error);
  }
};

export const clearRoomCache = () => {
  localStorage.removeItem(ROOM_CACHE_KEYS.lookup);
  localStorage.removeItem(ROOM_CACHE_KEYS.data);
  localStorage.removeItem(ROOM_CACHE_KEYS.syncedAt);
};