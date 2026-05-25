import { WIFI_KEYWORDS } from "./constants";
import type {
  AllData,
  FlattenRow,
  LookupMaps,
  RoomData,
  RoomInsights,
  RoomBed
} from "./types";

// Helper function to get bed info from group_beds
const getBedInfo = (
  room: RoomData,
  bedTypesMap: Map<number, string>,
  bedSizesMap?: Map<number, string>
): { hasSingleBed: boolean; hasDoubleBed: boolean; roomBeds: { bed_type: number; bed_size?: number; quantity: number; bedTypeName?: string; bedSizeName?: string }[] } => {
  let hasSingleBed = false;
  let hasDoubleBed = false;
  const roomBeds: { bed_type: number; bed_size?: number; quantity: number; bedTypeName?: string; bedSizeName?: string }[] = [];

  const bedData = room.group_beds ?? [];

  bedData.forEach(bed => {
    const bedName = (bedTypesMap.get(bed.bed_type) ?? "").toLowerCase();
    const isDouble = bedName.includes("2") || bedName.includes("double") || bedName.includes("давхар");
    if (isDouble) { hasDoubleBed = true; } else { hasSingleBed = true; }
    roomBeds.push({
      bed_type: bed.bed_type,
      bed_size: bed.bed_size?.id,
      quantity: bed.quantity,
      bedTypeName: bedTypesMap.get(bed.bed_type),
      bedSizeName: bed.bed_size?.id ? bedSizesMap?.get(bed.bed_size.id) : undefined,
    });
  });

  return { hasSingleBed, hasDoubleBed, roomBeds };
};

export const buildLookupMaps = (rawRooms: RoomData[], lookup: AllData): LookupMaps => {
  // Each rawRoom IS a room group in the new API — key by group id
  const groupMap: LookupMaps["groupMap"] = new Map();

  rawRooms.forEach((room) => {
    const key = String(room.id);

    const typeName = room.room_type_name
      ?? (lookup.room_types ?? []).find((t) => t.id === room.room_type)?.name
      ?? `Type ${room.room_type}`;

    const _rc = (lookup.room_category ?? []).find((c) => c.id === room.room_category);
    const categoryName = room.room_category_name
      ?? (_rc?.name_mn || _rc?.name_en)
      ?? `Category ${room.room_category}`;

    groupMap.set(key, { type: typeName, category: categoryName, group: room });
  });

  const facilitiesMapMn = new Map<number, string>(
    (lookup.room_facilities ?? []).map((facility) => [facility.id, facility.name_mn])
  );

  const facilitiesMapEn = new Map<number, string>(
    (lookup.room_facilities ?? []).map((facility) => [facility.id, facility.name_en])
  );

  const bathroomItemsMap = new Map<number, string>(
    (lookup.bathroom_items ?? []).map((item) => [item.id, item.name_mn])
  );

  const toiletriesMap = new Map<number, string>(
    (lookup.free_toiletries ?? []).map((item) => [item.id, item.name_mn])
  );

  const foodDrinkMap = new Map<number, string>(
    (lookup.food_and_drink ?? []).map((item) => [item.id, item.name_mn])
  );

  const outdoorViewMap = new Map<number, string>(
    (lookup.outdoor_and_view ?? []).map((item) => [item.id, item.name_mn])
  );

  const bedTypesMap = new Map<number, string>(
    (lookup.bed_types ?? []).map((bed) => [bed.id, bed.name])
  );

  const bedSizesMap = new Map<number, string>(
    (lookup.bed_sizes ?? []).map((bs) => [bs.id, bs.size])
  );

  const roomTypesMap = new Map<number, string>(
    (lookup.room_types ?? []).map((type) => [type.id, type.name])
  );

  const roomCategoryMap = new Map<number, string>(
    (lookup.room_category ?? []).map((category) => [category.id, category.name_mn || category.name_en])
  );

  return {
    groupMap,
    facilitiesMapMn,
    facilitiesMapEn,
    bathroomItemsMap,
    toiletriesMap,
    foodDrinkMap,
    outdoorViewMap,
    bedTypesMap,
    bedSizesMap,
    roomTypesMap,
    roomCategoryMap
  };
};

type FlattenRowsParams = {
  lookupMaps: LookupMaps;
  expandedKeys: Set<string>;
};

const hasWifiAmenity = (
  facilityIds: number[] | undefined,
  maps: Pick<LookupMaps, "facilitiesMapMn" | "facilitiesMapEn">
) => {
  if (!facilityIds?.length) return false;
  return facilityIds.some((id) => {
    const mn = maps.facilitiesMapMn.get(id) ?? "";
    const en = maps.facilitiesMapEn.get(id) ?? "";
    const label = `${mn} ${en}`.toLowerCase();
    return WIFI_KEYWORDS.some((keyword) => label.includes(keyword));
  });
};

export const createFlattenedRows = ({
  lookupMaps,
  expandedKeys
}: FlattenRowsParams): FlattenRow[] => {
  const rows: FlattenRow[] = [];

  lookupMaps.groupMap.forEach((entry, key) => {
    const group = entry.group;

    // All room numbers in this group (from the API's room_numbers array)
    const roomNumbersStr = (group.room_numbers ?? []).map(String).join(", ");
    const totalRoomsInGroup = group.room_numbers?.length ?? 0;
    const totalRoomsToSellInGroup = Number(group.number_of_rooms_to_sell) || 0;

    const { hasSingleBed: groupHasSingleBed, hasDoubleBed: groupHasDoubleBed, roomBeds: groupRoomBeds } =
      getBedInfo(group, lookupMaps.bedTypesMap, lookupMaps.bedSizesMap);

    const groupHasAdult = group.adultQty > 0;
    const groupHasChild = group.childQty > 0;

    const anyWifiInGroup = hasWifiAmenity(group.room_Facilities, {
      facilitiesMapMn: lookupMaps.facilitiesMapMn,
      facilitiesMapEn: lookupMaps.facilitiesMapEn
    });

    const collectNames = (
      ids: number[] | undefined,
      map: Map<number, string>
    ): string[] => Array.from(new Set((ids ?? []).map((id) => map.get(id)).filter(Boolean))) as string[];

    // Group-level amenities (same for all rooms in the group)
    const commonFacilitiesArr = collectNames(group.room_Facilities, lookupMaps.facilitiesMapMn);
    const commonBathroomArr = collectNames(group.bathroom_Items, lookupMaps.bathroomItemsMap);
    const commonToiletriesArr = collectNames(group.free_Toiletries, lookupMaps.toiletriesMap);
    const commonFoodDrinkArr = collectNames(group.food_And_Drink, lookupMaps.foodDrinkMap);
    const commonOutdoorViewArr = collectNames(group.outdoor_And_View, lookupMaps.outdoorViewMap);

    // Collect group images — resolve relative URLs with the backend base URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';
    const uniqueImages: string[] = [];
    (group.images ?? []).forEach((img) => {
      const raw = img.image?.trim();
      if (!raw) return;
      if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:image/')) {
        uniqueImages.push(raw);
      } else if (raw.startsWith('/')) {
        uniqueImages.push(`${backendUrl}${raw}`);
      }
    });

    rows.push({
      id: key,
      isGroup: true,
      arrowPlaceholder: key,
      images: uniqueImages.slice(0, 3),
      categoryName: entry.category,
      typeName: entry.type,
      sizeGroup: group.room_size,
      hasWifiGroup: anyWifiInGroup,
      roomNumbersStr,
      totalRoomsInGroup,
      totalRoomsToSellInGroup,
      leafSize: undefined,
      smokingAllowed: undefined,
      hasWifi: undefined,
      groupHasAdult,
      groupHasChild,
      groupHasSingleBed,
      groupHasDoubleBed,
      adultQty: undefined,
      childQty: undefined,
      bedType: undefined,
      roomBeds: groupRoomBeds,
      commonFacilitiesArr,
      thisRoomExtraFacilitiesArr: undefined,
      commonBathroomArr,
      thisRoomExtraBathroomArr: undefined,
      commonToiletriesArr,
      thisRoomExtraToiletriesArr: undefined,
      commonFoodDrinkArr,
      thisRoomExtraFoodDrinkArr: undefined,
      commonOutdoorViewArr,
      thisRoomExtraOutdoorViewArr: undefined,
      groupId: group.id,
      leafRoomNumber: undefined
    });

    if (!expandedKeys.has(key)) {
      return;
    }

    // Single "rooms card" row — shows all room numbers as compact cards (switch + edit)
    rows.push({
      id: `${key}-rooms`,
      isGroup: false,
      isRoomsCardRow: true,
      isPreviewRow: true, // triggers colSpan rendering in AdvancedTable
      arrowPlaceholder: key,
      images: [],
      roomNumbersArr: group.room_numbers ?? [],
      groupId: group.id,
      categoryName: undefined,
      typeName: undefined,
      sizeGroup: undefined,
      hasWifiGroup: undefined,
      roomNumberLeaf: undefined,
      roomNumbersStr: roomNumbersStr, // populated so global search can match room numbers
      smokingAllowed: undefined,
      hasWifi: undefined,
      groupHasAdult: undefined,
      groupHasChild: undefined,
      groupHasSingleBed: undefined,
      groupHasDoubleBed: undefined,
      adultQty: undefined,
      childQty: undefined,
      bedType: undefined,
      roomBeds: [],
      commonFacilitiesArr: [],
      thisRoomExtraFacilitiesArr: undefined,
      commonBathroomArr: [],
      thisRoomExtraBathroomArr: undefined,
      commonToiletriesArr: [],
      thisRoomExtraToiletriesArr: undefined,
      commonFoodDrinkArr: [],
      thisRoomExtraFoodDrinkArr: undefined,
      commonOutdoorViewArr: [],
      thisRoomExtraOutdoorViewArr: undefined,
      leafRoomNumber: undefined,
    });
  });

  return rows;
};

export const calculateRoomInsights = (
  rawRooms: RoomData[],
  maps: Pick<LookupMaps, "facilitiesMapMn" | "facilitiesMapEn">
): RoomInsights => {
  if (!rawRooms.length) {
    return {
      totalRooms: 0,
      totalInventory: 0,
      available: 0,
      sold: 0,
      occupancyRate: 0,
      avgCapacity: 0,
      categories: 0,
      wifiShare: 0
    };
  }

  // In the new model, each rawRoom is a group; total physical rooms = sum of room_numbers lengths
  const totalRooms = rawRooms.reduce(
    (acc, group) => acc + (group.room_numbers?.length ?? 0),
    0
  );

  const totalInventory = rawRooms.reduce(
    (acc, group) => acc + (group.number_of_rooms ?? 0),
    0
  );

  const available = rawRooms.reduce(
    (acc, group) => acc + (Number(group.number_of_rooms_to_sell) || 0),
    0
  );

  const sold = Math.max(totalInventory - available, 0);
  const occupancyRate = totalInventory > 0 ? Math.round((sold / totalInventory) * 100) : 0;

  const totalCapacity = rawRooms.reduce(
    (acc, group) => acc + (group.adultQty ?? 0) + (group.childQty ?? 0),
    0
  );

  const avgCapacity = rawRooms.length
    ? Math.round((totalCapacity / rawRooms.length) * 10) / 10
    : 0;

  // Number of distinct groups = number of categories
  const categories = rawRooms.length;

  const wifiEnabled = rawRooms.filter((group) =>
    hasWifiAmenity(group.room_Facilities, maps)
  ).length;

  const wifiShare = rawRooms.length
    ? Math.round((wifiEnabled / rawRooms.length) * 100)
    : 0;

  return {
    totalRooms,
    totalInventory,
    available,
    sold,
    occupancyRate,
    avgCapacity,
    categories,
    wifiShare
  };
};

type SyncTranslationFn = (key: string, values?: Record<string, number>) => string;

export const getRelativeSyncedLabel = (
  lastSynced: Date | null,
  t?: SyncTranslationFn
): string => {
  // Fallback to hardcoded strings if translation function is not provided
  if (!t) {
    if (!lastSynced) return "Синхрон хийгээгүй";
    const diffMs = Date.now() - lastSynced.getTime();
    if (diffMs < 60_000) return "Саяхан шинэчлэгдсэн";
    const minutes = Math.round(diffMs / 60_000);
    if (minutes < 60) return `${minutes} минутын өмнө`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} цагийн өмнө`;
    const days = Math.round(hours / 24);
    return `${days} өдрийн өмнө`;
  }

  if (!lastSynced) return t('sync.notSynced');

  const diffMs = Date.now() - lastSynced.getTime();
  if (diffMs < 60_000) return t('sync.justNow');

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) return t('sync.minutesAgo', { minutes });

  const hours = Math.round(minutes / 60);
  if (hours < 24) return t('sync.hoursAgo', { hours });

  const days = Math.round(hours / 24);
  return t('sync.daysAgo', { days });
};