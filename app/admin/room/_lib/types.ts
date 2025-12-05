import { GridValidRowModel } from "@mui/x-data-grid";

export interface LookupItem {
  id: number;
  name_en: string;
  name_mn: string;
}

export interface SimpleLookup {
  id: number;
  name: string;
  is_custom: boolean;
}

export interface AllData {
  room_types: SimpleLookup[];
  bed_types: SimpleLookup[];
  room_category: SimpleLookup[];

  room_facilities: LookupItem[];
  bathroom_items: LookupItem[];
  free_toiletries: LookupItem[];
  food_and_drink: LookupItem[];
  outdoor_and_view: LookupItem[];
}

export interface RoomImage {
  id: number;
  image: string;
  description: string;
}

export interface RoomBed {
  bed_type: number;
  quantity: number;
}

export interface RoomData {
  id: number;
  hotel: number;
  room_number: number;
  room_type: number;
  room_category: number;
  room_size: string;
  bed_type?: number; // Legacy field, use room_beds/bed_details instead
  room_beds?: RoomBed[]; // Alternative field name
  bed_details?: RoomBed[]; // API returns this field name
  is_Bathroom: boolean;

  room_Facilities: number[];
  bathroom_Items: number[];
  free_Toiletries: number[];
  food_And_Drink: number[];
  outdoor_And_View: number[];

  adultQty: number;
  childQty: number;

  number_of_rooms: number;
  number_of_rooms_to_sell: number | string;
  room_Description: string;
  smoking_allowed: boolean;

  images: RoomImage[];
}

export interface GroupEntry {
  type: string;
  category: string;
  rooms: RoomData[];
}

export interface LookupMaps {
  groupMap: Map<string, GroupEntry>;
  facilitiesMapMn: Map<number, string>;
  facilitiesMapEn: Map<number, string>;
  bathroomItemsMap: Map<number, string>;
  toiletriesMap: Map<number, string>;
  foodDrinkMap: Map<number, string>;
  outdoorViewMap: Map<number, string>;
  bedTypesMap: Map<number, string>;
  roomTypesMap: Map<number, string>;
  roomCategoryMap: Map<number, string>;
}

export interface FlattenRow extends GridValidRowModel {
  id: string;
  isGroup: boolean;
  isPreviewRow?: boolean;
  arrowPlaceholder: string;
  images: string[];
  categoryName?: string;
  typeName?: string;
  sizeGroup?: string;
  hasWifiGroup?: boolean;
  roomNumberLeaf?: string;
  viewDescription?: string;
  roomNumbersStr?: string;
  totalRoomsInGroup?: number;
  totalRoomsToSellInGroup?: number;
  leafSize?: string;
  leafTotalRooms?: number;
  leafRoomsToSell?: number;
  smokingAllowed?: boolean;
  hasWifi?: boolean;
  groupHasAdult?: boolean;
  groupHasChild?: boolean;
  groupHasSingleBed?: boolean;
  groupHasDoubleBed?: boolean;
  adultQty?: number;
  childQty?: number;
  bedType?: number;
  roomBeds?: { bed_type: number; quantity: number; bedTypeName?: string }[]; // Multiple bed types with quantities
  // Separate feature arrays for each category
  commonFacilitiesArr: string[];
  thisRoomExtraFacilitiesArr?: string[];
  commonBathroomArr: string[];
  thisRoomExtraBathroomArr?: string[];
  commonToiletriesArr: string[];
  thisRoomExtraToiletriesArr?: string[];
  commonFoodDrinkArr: string[];
  thisRoomExtraFoodDrinkArr?: string[];
  commonOutdoorViewArr: string[];
  thisRoomExtraOutdoorViewArr?: string[];
  leafRoomId?: number;
}

export interface RoomInsights {
  totalRooms: number;
  totalInventory: number;
  available: number;
  sold: number;
  occupancyRate: number;
  avgCapacity: number;
  categories: number;
  wifiShare: number;
}