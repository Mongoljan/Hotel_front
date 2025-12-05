import { WIFI_KEYWORDS } from "./constants";
import type {
  AllData,
  FlattenRow,
  LookupMaps,
  RoomData,
  RoomInsights,
  RoomBed
} from "./types";

// Helper function to get bed info from bed_details/room_beds or fallback to bed_type
const getBedInfo = (
  room: RoomData,
  bedTypesMap: Map<number, string>
): { hasSingleBed: boolean; hasDoubleBed: boolean; roomBeds: { bed_type: number; quantity: number; bedTypeName?: string }[] } => {
  let hasSingleBed = false;
  let hasDoubleBed = false;
  const roomBeds: { bed_type: number; quantity: number; bedTypeName?: string }[] = [];

  // Prefer bed_details (API field name), then room_beds, then legacy bed_type
  const bedData = room.bed_details || room.room_beds;
  
  if (bedData && bedData.length > 0) {
    bedData.forEach(bed => {
      const bedName = (bedTypesMap.get(bed.bed_type) ?? "").toLowerCase();
      const isDouble = bedName.includes("2") || bedName.includes("double") || bedName.includes("давхар");
      
      if (isDouble) {
        hasDoubleBed = true;
      } else {
        hasSingleBed = true;
      }
      
      roomBeds.push({
        bed_type: bed.bed_type,
        quantity: bed.quantity,
        bedTypeName: bedTypesMap.get(bed.bed_type)
      });
    });
  } else if (room.bed_type !== undefined) {
    // Fallback to legacy bed_type field
    const bedName = (bedTypesMap.get(room.bed_type) ?? "").toLowerCase();
    const isDouble = bedName.includes("2") || bedName.includes("double") || bedName.includes("давхар");
    
    if (isDouble) {
      hasDoubleBed = true;
    } else {
      hasSingleBed = true;
    }
    
    roomBeds.push({
      bed_type: room.bed_type,
      quantity: 1,
      bedTypeName: bedTypesMap.get(room.bed_type)
    });
  }

  return { hasSingleBed, hasDoubleBed, roomBeds };
};

export const buildLookupMaps = (rawRooms: RoomData[], lookup: AllData): LookupMaps => {
  const groupMap: LookupMaps["groupMap"] = new Map();

  rawRooms.forEach((room) => {
    const key = `${room.room_type}-${room.room_category}`;

    if (!groupMap.has(key)) {
      const typeObj = (lookup.room_types ?? []).find((t) => t.id === room.room_type) ?? null;
      const catObj = (lookup.room_category ?? []).find((c) => c.id === room.room_category) ?? null;

      const typeName = typeObj ? typeObj.name : `Type ${room.room_type}`;
      const categoryName = catObj ? catObj.name : `Category ${room.room_category}`;

      groupMap.set(key, {
        type: typeName,
        category: categoryName,
        rooms: []
      });
    }
    groupMap.get(key)!.rooms.push(room);
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

  const roomTypesMap = new Map<number, string>(
    (lookup.room_types ?? []).map((type) => [type.id, type.name])
  );

  const roomCategoryMap = new Map<number, string>(
    (lookup.room_category ?? []).map((category) => [category.id, category.name])
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
    roomTypesMap,
    roomCategoryMap
  };
};

// Helper to find intersection of arrays
const intersectLists = (arrays: string[][]): string[] => {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];
  
  const firstSet = new Set(arrays[0]);
  const result: string[] = [];
  
  for (const item of firstSet) {
    if (arrays.every(arr => arr.includes(item))) {
      result.push(item);
    }
  }
  
  return result;
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

  lookupMaps.groupMap.forEach((group, key) => {
    // Use the first room as the representative for the group
    // Don't aggregate/sum values from multiple rooms
    const representativeRoom = group.rooms.find(room => 
      Number(room.number_of_rooms_to_sell) > 0
    ) || group.rooms[0];

    // Show all room numbers in the group
    const roomNumbersStr = group.rooms.map((room) => String(room.room_number)).join(", ");
    const groupHasAdult = representativeRoom.adultQty > 0;
    const groupHasChild = representativeRoom.childQty > 0;

    // Use the new helper function for bed type detection
    const { hasSingleBed: groupHasSingleBed, hasDoubleBed: groupHasDoubleBed, roomBeds: groupRoomBeds } = getBedInfo(
      representativeRoom,
      lookupMaps.bedTypesMap
    );

    const anyWifiInGroup = hasWifiAmenity(representativeRoom.room_Facilities, {
      facilitiesMapMn: lookupMaps.facilitiesMapMn,
      facilitiesMapEn: lookupMaps.facilitiesMapEn
    });

    // Calculate intersection of features across ALL rooms in this group
    const collectNames = (
      ids: number[] | undefined,
      map: Map<number, string>
    ): string[] => Array.from(new Set((ids ?? []).map((id) => map.get(id)).filter(Boolean))) as string[];

    // Calculate intersections for each feature type separately
    const allRoomFacilitiesSets = group.rooms.map(room =>
      collectNames(room.room_Facilities, lookupMaps.facilitiesMapMn)
    );
    const commonFacilitiesArr = intersectLists(allRoomFacilitiesSets);

    const allRoomBathroomSets = group.rooms.map(room =>
      collectNames(room.bathroom_Items, lookupMaps.bathroomItemsMap)
    );
    const commonBathroomArr = intersectLists(allRoomBathroomSets);

    const allRoomToiletriesSets = group.rooms.map(room =>
      collectNames(room.free_Toiletries, lookupMaps.toiletriesMap)
    );
    const commonToiletriesArr = intersectLists(allRoomToiletriesSets);

    const allRoomFoodDrinkSets = group.rooms.map(room =>
      collectNames(room.food_And_Drink, lookupMaps.foodDrinkMap)
    );
    const commonFoodDrinkArr = intersectLists(allRoomFoodDrinkSets);

    const allRoomOutdoorViewSets = group.rooms.map(room =>
      collectNames(room.outdoor_And_View, lookupMaps.outdoorViewMap)
    );
    const commonOutdoorViewArr = intersectLists(allRoomOutdoorViewSets);

    // Collect images from the representative room only
    const imageSet = new Set<string>();

    // Collect images from this single room only
    if (representativeRoom?.images) {
      representativeRoom.images.forEach((image) => {
        const url = image.image?.trim();
        // Only add valid, non-empty image URLs
        if (url && url.length > 0 && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/'))) {
          imageSet.add(url);
        }
      });
    }

    // Convert to array and limit display to max 3 unique images
    const uniqueImages = Array.from(imageSet).slice(0, 3);

    // Debug logging to help identify issues
    if (imageSet.size > 0) {
    }

    // Calculate total rooms in this group
    // The actual number of rooms is simply the count of room records
    // number_of_rooms_to_sell should be summed from unique batches (consecutive IDs with same value)
    const calculateGroupTotals = (rooms: typeof group.rooms): { totalRooms: number; totalToSell: number } => {
      if (rooms.length === 0) return { totalRooms: 0, totalToSell: 0 };
      
      // Total rooms is simply the count of room records
      const totalRooms = rooms.length;
      
      // For totalToSell, we need to detect batches and sum once per batch
      // Rooms created together have consecutive IDs and same number_of_rooms_to_sell value
      const sortedRooms = [...rooms].sort((a, b) => a.id - b.id);
      
      let totalToSell = 0;
      let i = 0;
      
      while (i < sortedRooms.length) {
        const currentRoom = sortedRooms[i];
        const batchToSellValue = Number(currentRoom.number_of_rooms_to_sell) || 0;
        const batchNumberOfRooms = Number(currentRoom.number_of_rooms) || 1;
        
        // Count how many consecutive rooms belong to this batch
        // They should have consecutive IDs and same number_of_rooms/number_of_rooms_to_sell values
        let batchSize = 1;
        while (
          i + batchSize < sortedRooms.length &&
          sortedRooms[i + batchSize].id === currentRoom.id + batchSize &&
          Number(sortedRooms[i + batchSize].number_of_rooms) === batchNumberOfRooms &&
          Number(sortedRooms[i + batchSize].number_of_rooms_to_sell) === batchToSellValue
        ) {
          batchSize++;
        }
        
        // Add this batch's to_sell count (only once per batch)
        totalToSell += batchToSellValue;
        
        // Move to next batch
        i += batchSize;
      }
      
      return { totalRooms, totalToSell };
    };
    
    const { totalRooms: totalRoomsInGroup, totalToSell: totalRoomsToSellInGroup } = calculateGroupTotals(group.rooms);

    rows.push({
      id: key,
      isGroup: true,
      arrowPlaceholder: key,
      images: uniqueImages,
      categoryName: group.category,
      typeName: group.type,
      sizeGroup: representativeRoom?.room_size,
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
      roomBeds: groupRoomBeds, // Include room beds info for the group
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
      leafRoomId: undefined
    });

    if (!expandedKeys.has(key)) {
      return;
    }

    group.rooms.forEach((room) => {
      // Use the helper function for bed type detection
      const { hasSingleBed, hasDoubleBed, roomBeds: leafRoomBeds } = getBedInfo(room, lookupMaps.bedTypesMap);
      const bedTypeForIcon = hasDoubleBed ? 2 : 1;

      const leafHasWifi = hasWifiAmenity(room.room_Facilities, {
        facilitiesMapMn: lookupMaps.facilitiesMapMn,
        facilitiesMapEn: lookupMaps.facilitiesMapEn
      });

      const collectNames = (
        ids: number[] | undefined,
        map: Map<number, string>
      ): string[] => Array.from(new Set((ids ?? []).map((id) => map.get(id)).filter(Boolean))) as string[];

      // Calculate extras for each feature type separately
      const roomFacilities = new Set<string>(collectNames(room.room_Facilities, lookupMaps.facilitiesMapMn));
      commonFacilitiesArr.forEach((item: string) => roomFacilities.delete(item));
      const thisRoomExtraFacilitiesArr = Array.from(roomFacilities);

      const roomBathroom = new Set<string>(collectNames(room.bathroom_Items, lookupMaps.bathroomItemsMap));
      commonBathroomArr.forEach((item: string) => roomBathroom.delete(item));
      const thisRoomExtraBathroomArr = Array.from(roomBathroom);

      const roomToiletries = new Set<string>(collectNames(room.free_Toiletries, lookupMaps.toiletriesMap));
      commonToiletriesArr.forEach((item: string) => roomToiletries.delete(item));
      const thisRoomExtraToiletriesArr = Array.from(roomToiletries);

      const roomFoodDrink = new Set<string>(collectNames(room.food_And_Drink, lookupMaps.foodDrinkMap));
      commonFoodDrinkArr.forEach((item: string) => roomFoodDrink.delete(item));
      const thisRoomExtraFoodDrinkArr = Array.from(roomFoodDrink);

      const roomOutdoorView = new Set<string>(collectNames(room.outdoor_And_View, lookupMaps.outdoorViewMap));
      commonOutdoorViewArr.forEach((item: string) => roomOutdoorView.delete(item));
      const thisRoomExtraOutdoorViewArr = Array.from(roomOutdoorView);

      rows.push({
        id: `${key}-${room.room_number}`,
        isGroup: false,
        arrowPlaceholder: "",
        images: [],
        categoryName: undefined,
        typeName: undefined,
        sizeGroup: undefined,
        hasWifiGroup: undefined,
        roomNumberLeaf: String(room.room_number),
        viewDescription: room.room_Description,
        leafSize: room.room_size,
  leafTotalRooms: Number(room.number_of_rooms) || 0,
  leafRoomsToSell: Number(room.number_of_rooms_to_sell) || 0,
        roomNumbersStr: undefined,
        smokingAllowed: room.smoking_allowed,
        hasWifi: leafHasWifi,
        groupHasAdult: undefined,
        groupHasChild: undefined,
        groupHasSingleBed: undefined,
        groupHasDoubleBed: undefined,
        adultQty: room.adultQty,
        childQty: room.childQty,
        bedType: bedTypeForIcon,
        roomBeds: leafRoomBeds, // Include room beds info for the individual room
        commonFacilitiesArr: [],
        thisRoomExtraFacilitiesArr,
        commonBathroomArr: [],
        thisRoomExtraBathroomArr,
        commonToiletriesArr: [],
        thisRoomExtraToiletriesArr,
        commonFoodDrinkArr: [],
        thisRoomExtraFoodDrinkArr,
        commonOutdoorViewArr: [],
        thisRoomExtraOutdoorViewArr,
        leafRoomId: room.id
      });
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

  const totalInventory = rawRooms.reduce(
    (acc, room) => acc + (room.number_of_rooms ?? 0),
    0
  );

  const available = rawRooms.reduce(
    (acc, room) => acc + (Number(room.number_of_rooms_to_sell) || 0),
    0
  );

  const sold = Math.max(totalInventory - available, 0);
  const occupancyRate = totalInventory > 0 ? Math.round((sold / totalInventory) * 100) : 0;

  const totalCapacity = rawRooms.reduce(
    (acc, room) => acc + (room.adultQty ?? 0) + (room.childQty ?? 0),
    0
  );

  const avgCapacity = rawRooms.length
    ? Math.round((totalCapacity / rawRooms.length) * 10) / 10
    : 0;

  const categories = new Set(
    rawRooms.map((room) => `${room.room_type}-${room.room_category}`)
  ).size;

  const wifiEnabled = rawRooms.filter((room) =>
    hasWifiAmenity(room.room_Facilities, maps)
  ).length;

  const wifiShare = rawRooms.length
    ? Math.round((wifiEnabled / rawRooms.length) * 100)
    : 0;

  return {
    totalRooms: rawRooms.length,
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