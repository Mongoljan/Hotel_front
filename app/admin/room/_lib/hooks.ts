import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getClientBackendToken } from "@/utils/auth";
import { toast } from "react-toastify";

import { ROOM_API_ENDPOINTS } from "./constants";
import { clearRoomCache, readRoomCache, writeRoomCache } from "./cache";
import type { AllData, RoomData } from "./types";

type UseRoomDataParams = {
  isRoomAdded: boolean;
  setIsRoomAdded: (value: boolean) => void;
  onAuthLost?: () => void;
};

const createEmptyLookup = (): AllData => ({
  room_types: [],
  bed_types: [],
  room_category: [],
  room_facilities: [],
  bathroom_items: [],
  free_toiletries: [],
  food_and_drink: [],
  outdoor_and_view: []
});

type UseRoomDataReturn = {
  rawRooms: RoomData[];
  lookup: AllData;
  loading: boolean;
  authError: string | null;
  setAuthError: (value: string | null) => void;
  lastSynced: Date | null;
  refreshData: () => void;
};

export const useRoomData = ({
  isRoomAdded,
  setIsRoomAdded,
  onAuthLost
}: UseRoomDataParams): UseRoomDataReturn => {
  const onAuthLostRef = useRef(onAuthLost);
  const [rawRooms, setRawRooms] = useState<RoomData[]>([]);
  const [lookup, setLookup] = useState<AllData>(() => createEmptyLookup());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    onAuthLostRef.current = onAuthLost;
  }, [onAuthLost]);

  const hydrateFromCache = useCallback(() => {
    const cached = readRoomCache();
    if (!cached) return false;

    setLookup(cached.lookup);
    setRawRooms(cached.rooms);
    setAuthError(null);
    if (cached.syncedAt) {
      setLastSynced(new Date(cached.syncedAt));
    }
    return true;
  }, []);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    let usedCache = false;

    try {
      const hadCache = hydrateFromCache();
      if (hadCache && !isRoomAdded) {
        usedCache = true;
      }

      const token = await getClientBackendToken();
      if (!token) {
        onAuthLostRef.current?.();
        if (!usedCache) {
          const message = "Authentication required. Please sign in again to manage rooms.";
          setAuthError(message);
          toast.error(message);
          setRawRooms([]);
        }
        return;
      }

      setAuthError(null);

      const [allRes, roomsRes] = await Promise.all([
        fetch(ROOM_API_ENDPOINTS.lookup),
        fetch(`${ROOM_API_ENDPOINTS.rooms}?token=${encodeURIComponent(token)}`)
      ]);

      if (!allRes.ok || !roomsRes.ok) {
        throw new Error("Failed to fetch room data");
      }

      const lookupPayload = (await allRes.json()) as AllData;
      const roomsPayload = (await roomsRes.json()) as RoomData[];

      setLookup(lookupPayload);
      setRawRooms(roomsPayload);

      const now = Date.now();
      setLastSynced(new Date(now));
      writeRoomCache({ lookup: lookupPayload, rooms: roomsPayload, syncedAt: now });
      toast.success("Room data refreshed");
    } catch (error) {
      console.error("Room data fetch failed", error);
      if (!usedCache) {
        const message =
          error instanceof Error ? error.message : "Failed to load room information.";
        setAuthError(message);
        toast.error(message);
        setRawRooms([]);
      }
    } finally {
      setLoading(false);
      if (isRoomAdded) {
        setIsRoomAdded(false);
      }
    }
  }, [hydrateFromCache, isRoomAdded, setIsRoomAdded]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms, refreshNonce]);

  const refreshData = useCallback(() => {
    clearRoomCache();
    setRefreshNonce((prev) => prev + 1);
  }, []);

  return useMemo(
    () => ({
      rawRooms,
      lookup,
      loading,
      authError,
      setAuthError,
      lastSynced,
      refreshData
    }),
    [authError, lastSynced, loading, lookup, rawRooms, refreshData]
  );
};