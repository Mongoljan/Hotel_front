export interface RoomAmenityLookup {
  id: number;
  name_en: string;
  name_mn: string;
}

export interface RoomSimpleLookup {
  id: number;
  name: string;
  is_custom?: boolean;
}

export interface RoomLookupPayload {
  room_types: RoomSimpleLookup[];
  bed_types: RoomSimpleLookup[];
  room_category: RoomSimpleLookup[];
  room_facilities: RoomAmenityLookup[];
  bathroom_items: RoomAmenityLookup[];
  free_toiletries: RoomAmenityLookup[];
  food_and_drink: RoomAmenityLookup[];
  outdoor_and_view: RoomAmenityLookup[];
}

export interface RoomBed {
  bed_type: number;
  quantity: number;
}

export interface RoomApiResponse {
  id: number;
  hotel: number;
  room_number: number;
  room_type: number;
  room_category: number;
  room_size: string;
  bed_type?: number; // Legacy field
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
  number_of_rooms_to_sell: number;
  room_Description: string;
  smoking_allowed: boolean;
  housekeeping_status?: "clean" | "needs_service" | "occupied" | string;
  housekeeping_note?: string | null;
  images: Array<{
    id: number;
    image: string;
    description: string;
  }>;
}

export interface GroupedRoomRow {
  id: string;
  groupId: string;
  isParent: boolean;
  typeName: string;
  categoryName: string;
  previewImage?: string | null;
  sizeLabel?: string;
  wifiAvailable?: boolean;
  smokingAllowed?: boolean;
  inventorySold?: number;
  inventoryTotal?: number;
  inventoryRatio?: number;
  adultCapacity?: number;
  childCapacity?: number;
  bedTypeName?: string;
  amenities?: string[];
  amenitiesOverflow?: number;
  housekeepingStatus?: string;
  housekeepingNote?: string | null;
  pricePlans?: string[];
  roomNumbers?: string[];
  roomNumberLabel?: string;
  viewDescription?: string;
  parentImageList?: string[];
  locale?: "en" | "mn";
  translations?: {
    name: string;
    amenitiesLabel: string;
    inventoryLabel: string;
    capacityLabel: string;
    housekeepingLabel: string;
  };
  rawRoom?: RoomApiResponse;
}

export interface RoomGroupingResult {
  rows: GroupedRoomRow[];
  parents: GroupedRoomRow[];
  childrenByParent: Record<string, GroupedRoomRow[]>;
}

export interface AmenityDictionary {
  facilities: Map<number, RoomAmenityLookup>;
  bathroomItems: Map<number, RoomAmenityLookup>;
  toiletries: Map<number, RoomAmenityLookup>;
  foodAndDrink: Map<number, RoomAmenityLookup>;
  outdoorAndView: Map<number, RoomAmenityLookup>;
}

export interface GroupingOptions {
  locale: "en" | "mn";
  lookups: RoomLookupPayload;
  amenities: AmenityDictionary;
}
