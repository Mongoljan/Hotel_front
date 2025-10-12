import { WIFI_KEYWORDS } from "./constants";
import type {
  AllData,
  FlattenRow,
  LookupMaps,
  RoomData,
  RoomInsights
} from "./types";

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
    const roomNumbersStr = group.rooms.map((room) => String(room.room_number)).join(", ");
    const groupHasAdult = group.rooms.some((room) => room.adultQty > 0);
    const groupHasChild = group.rooms.some((room) => room.childQty > 0);

    let groupHasSingleBed = false;
    let groupHasDoubleBed = false;

    group.rooms.forEach((room) => {
      const bedName = (lookupMaps.bedTypesMap.get(room.bed_type) ?? "").toLowerCase();
      if (bedName.includes("2") || bedName.includes("double")) {
        groupHasDoubleBed = true;
      } else {
        groupHasSingleBed = true;
      }
    });

    const anyWifiInGroup = group.rooms.some((room) =>
      hasWifiAmenity(room.room_Facilities, {
        facilitiesMapMn: lookupMaps.facilitiesMapMn,
        facilitiesMapEn: lookupMaps.facilitiesMapEn
      })
    );

    const intersectLists = (arrays: Array<number[] | undefined>): number[] => {
      const [first = []] = arrays;
      return first.filter((id) =>
        arrays.every((list) => (list ?? []).includes(id))
      );
    };

    const facilitiesIntersection = intersectLists(
      group.rooms.map((room) => room.room_Facilities)
    );
    const toiletriesIntersection = intersectLists(
      group.rooms.map((room) => room.free_Toiletries)
    );
    const foodIntersection = intersectLists(
      group.rooms.map((room) => room.food_And_Drink)
    );
    const outdoorIntersection = intersectLists(
      group.rooms.map((room) => room.outdoor_And_View)
    );
    const bathroomIntersection = intersectLists(
      group.rooms.map((room) => room.bathroom_Items)
    );

    const commonFeaturesArr = Array.from(
      new Set(
        [
          ...facilitiesIntersection.map((id) => lookupMaps.facilitiesMapMn.get(id)),
          ...toiletriesIntersection.map((id) => lookupMaps.toiletriesMap.get(id)),
          ...foodIntersection.map((id) => lookupMaps.foodDrinkMap.get(id)),
          ...outdoorIntersection.map((id) => lookupMaps.outdoorViewMap.get(id))
        ].filter((value): value is string => Boolean(value))
      )
    );

    const commonBathroomArr = bathroomIntersection
      .map((id) => lookupMaps.bathroomItemsMap.get(id))
      .filter((value): value is string => Boolean(value));

    const uniqueImages = Array.from(
      new Set(
        group.rooms.flatMap((room) => 
          room.images
            .map((image) => image.image)
            .filter((url) => url && url.trim() !== '') // Filter out empty/null images
        )
      )
    ).slice(0, 3);

    rows.push({
      id: key,
      isGroup: true,
      arrowPlaceholder: key,
      images: uniqueImages,
      categoryName: group.category,
      typeName: group.type,
      sizeGroup: group.rooms[0]?.room_size,
      hasWifiGroup: anyWifiInGroup,
      roomNumbersStr,
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
      commonFeaturesArr,
      thisRoomExtraFeaturesArr: undefined,
      commonBathroomArr,
      thisRoomExtraBathroomArr: undefined,
      leafRoomId: undefined
    });

    if (!expandedKeys.has(key)) {
      return;
    }

    group.rooms.forEach((room) => {
      const bedName = (lookupMaps.bedTypesMap.get(room.bed_type) ?? "").toLowerCase();
      const bedTypeForIcon = bedName.includes("2") || bedName.includes("double") ? 2 : 1;

      const leafHasWifi = hasWifiAmenity(room.room_Facilities, {
        facilitiesMapMn: lookupMaps.facilitiesMapMn,
        facilitiesMapEn: lookupMaps.facilitiesMapEn
      });

      const collectNames = (
        ids: number[] | undefined,
        map: Map<number, string>
      ): string[] => Array.from(new Set((ids ?? []).map((id) => map.get(id)).filter(Boolean))) as string[];

      const fullFeatureSet = new Set<string>([
        ...collectNames(room.room_Facilities, lookupMaps.facilitiesMapMn),
        ...collectNames(room.free_Toiletries, lookupMaps.toiletriesMap),
        ...collectNames(room.food_And_Drink, lookupMaps.foodDrinkMap),
        ...collectNames(room.outdoor_And_View, lookupMaps.outdoorViewMap)
      ]);

      commonFeaturesArr.forEach((feature) => fullFeatureSet.delete(feature));
      const thisRoomExtraFeaturesArr = Array.from(fullFeatureSet);

      const fullBathroomSet = new Set<string>(
        collectNames(room.bathroom_Items, lookupMaps.bathroomItemsMap)
      );
      commonBathroomArr.forEach((bath) => fullBathroomSet.delete(bath));
      const thisRoomExtraBathroomArr = Array.from(fullBathroomSet);

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
        commonFeaturesArr: [],
        thisRoomExtraFeaturesArr,
        commonBathroomArr: [],
        thisRoomExtraBathroomArr,
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
    (acc, room) => acc + (room.number_of_rooms_to_sell ?? 0),
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

export const getRelativeSyncedLabel = (lastSynced: Date | null): string => {
  if (!lastSynced) return "Not synced yet";

  const diffMs = Date.now() - lastSynced.getTime();
  if (diffMs < 60_000) return "Synced just now";

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) return `Synced ${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Synced ${hours} hr${hours > 1 ? "s" : ""} ago`;

  const days = Math.round(hours / 24);
  return `Synced ${days} day${days > 1 ? "s" : ""} ago`;
};