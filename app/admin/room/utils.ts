import { GroupedRoomRow, GroupingOptions, RoomApiResponse } from "./types";

const WIFI_KEYWORDS = ["wifi", "wi-fi", "wireless", "интернет"];

export function normalizeImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `https://dev.kacc.mn${url}`;
}

function pickAmenityName(locale: "en" | "mn", value?: { name_en: string; name_mn: string }): string | undefined {
  if (!value) return undefined;
  return locale === "mn" ? value.name_mn : value.name_en;
}

export function summarizeAmenities(locale: "en" | "mn", ids: number[] = [], map: Map<number, { name_en: string; name_mn: string }>): [string[], number] {
  const names = ids
    .map((id) => pickAmenityName(locale, map.get(id)))
    .filter(Boolean) as string[];

  const unique = Array.from(new Set(names));
  return [unique.slice(0, 3), Math.max(unique.length - 3, 0)];
}

function computeInventory(room: RoomApiResponse) {
  const sold = Math.max(0, room.number_of_rooms - room.number_of_rooms_to_sell);
  const total = room.number_of_rooms;
  const ratio = total > 0 ? sold / total : 0;
  return { sold, total, ratio };
}

function hasWifi(locale: "en" | "mn", amenities: number[], dictionary: Map<number, { name_en: string; name_mn: string }>): boolean {
  return amenities.some((id) => {
    const entry = dictionary.get(id);
    if (!entry) return false;
    const text = (locale === "mn" ? entry.name_mn : entry.name_en).toLowerCase();
    return WIFI_KEYWORDS.some((key) => text.includes(key));
  });
}

function formatRoomName(room: RoomApiResponse, options: GroupingOptions) {
  const { lookups, locale } = options;
  const type = lookups.room_types.find((item) => item.id === room.room_type);
  const category = lookups.room_category.find((item) => item.id === room.room_category);
  return {
    typeName: type ? type.name : `Type ${room.room_type}`,
    categoryName: category ? category.name : `Category ${room.room_category}`,
    sizeLabel: room.room_size ? `${room.room_size} m²` : undefined,
    bedTypeName:
      lookups.bed_types.find((item) => item.id === room.bed_type)?.name ?? (locale === "mn" ? "Тодорхойгүй" : "Unknown"),
  };
}

function formatHousekeeping(room: RoomApiResponse) {
  const status = room.housekeeping_status ?? "clean";
  return {
    housekeepingStatus: status,
    housekeepingNote: room.housekeeping_note ?? null,
  };
}

export function groupRooms(rooms: RoomApiResponse[], options: GroupingOptions) {
  const grouped = new Map<string, { parent: GroupedRoomRow; children: GroupedRoomRow[] }>();
  const parents: GroupedRoomRow[] = [];
  const childrenByParent: Record<string, GroupedRoomRow[]> = {};

  rooms.forEach((room) => {
    const { locale, amenities } = options;
    const groupKey = `${room.room_type}-${room.room_category}`;
    const inventory = computeInventory(room);
    const image = normalizeImage(room.images?.[0]?.image);
    const name = formatRoomName(room, options);
    const wifi = hasWifi(locale, room.room_Facilities ?? [], amenities.facilities);
    const [amenityList, overflow] = summarizeAmenities(locale, room.room_Facilities, amenities.facilities);
  const { housekeepingStatus, housekeepingNote } = formatHousekeeping(room);

    if (!grouped.has(groupKey)) {
      const parentRow: GroupedRoomRow = {
        id: `parent-${groupKey}`,
        groupId: groupKey,
        isParent: true,
        typeName: name.typeName,
        categoryName: name.categoryName,
        previewImage: image ?? null,
        sizeLabel: name.sizeLabel,
        wifiAvailable: wifi,
        smokingAllowed: room.smoking_allowed,
        inventorySold: 0,
        inventoryTotal: 0,
        inventoryRatio: 0,
        adultCapacity: room.adultQty,
        childCapacity: room.childQty,
        bedTypeName: name.bedTypeName,
        amenities: [],
        amenitiesOverflow: 0,
        housekeepingStatus,
        housekeepingNote,
        pricePlans: [],
        roomNumbers: [],
      };
      grouped.set(groupKey, { parent: parentRow, children: [] });
      parents.push(parentRow);
      childrenByParent[parentRow.id] = [];
    }

    const entry = grouped.get(groupKey)!;
    const numberLabel = String(room.room_number);
    if (!entry.parent.roomNumbers?.includes(numberLabel)) {
      entry.parent.roomNumbers?.push(numberLabel);
    }
    entry.parent.inventorySold = (entry.parent.inventorySold ?? 0) + inventory.sold;
    entry.parent.inventoryTotal = (entry.parent.inventoryTotal ?? 0) + inventory.total;
    entry.parent.inventoryRatio = entry.parent.inventoryTotal
      ? (entry.parent.inventorySold ?? 0) / entry.parent.inventoryTotal
      : 0;
    entry.parent.adultCapacity = Math.max(entry.parent.adultCapacity ?? 0, room.adultQty);
    entry.parent.childCapacity = Math.max(entry.parent.childCapacity ?? 0, room.childQty);
    entry.parent.wifiAvailable = entry.parent.wifiAvailable || wifi;
    entry.parent.smokingAllowed = entry.parent.smokingAllowed || room.smoking_allowed;
    const combinedAmenities = Array.from(new Set([...(entry.parent.amenities ?? []), ...amenityList]));
    entry.parent.amenities = combinedAmenities.slice(0, 3);
    entry.parent.amenitiesOverflow = Math.max(combinedAmenities.length - 3, 0);

    const childRow: GroupedRoomRow = {
      id: `child-${room.id}`,
      groupId: groupKey,
      isParent: false,
      typeName: name.typeName,
      categoryName: name.categoryName,
      previewImage: image ?? null,
      sizeLabel: name.sizeLabel,
      wifiAvailable: wifi,
      smokingAllowed: room.smoking_allowed,
      inventorySold: inventory.sold,
      inventoryTotal: inventory.total,
      inventoryRatio: inventory.ratio,
      adultCapacity: room.adultQty,
      childCapacity: room.childQty,
      bedTypeName: name.bedTypeName,
      amenities: amenityList,
      amenitiesOverflow: overflow,
      housekeepingStatus,
      housekeepingNote,
      pricePlans: [],
      roomNumbers: [String(room.room_number)],
      roomNumberLabel: `№${room.room_number}`,
      viewDescription: room.room_Description || undefined,
      rawRoom: room,
    };

    entry.children.push(childRow);
    childrenByParent[entry.parent.id] = entry.children;
  });

  const rows: GroupedRoomRow[] = [];
  parents.forEach((parent) => {
    rows.push(parent, ...childrenByParent[parent.id]);
  });

  return { rows, parents, childrenByParent };
}
