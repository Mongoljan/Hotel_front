import { schemaCreateRoom } from "@/app/schema";
import { z } from "zod";
import type { useTranslations } from "next-intl";
import type { AllData, RoomData } from "../_lib/types";

export type FormFields = z.infer<typeof schemaCreateRoom>;
export type ModalTranslate = ReturnType<typeof useTranslations>;
export type ValidationTranslate = ReturnType<typeof useTranslations>;

export type AmenityKey =
  | "room_Facilities"
  | "bathroom_Items"
  | "free_Toiletries"
  | "food_And_Drink"
  | "outdoor_And_View";

export interface AmenityItem {
  id: number;
  name_en: string;
  name_mn: string;
}

export interface HotelRoomLimits {
  totalHotelRooms: number;
  availableRooms: number;
}

export interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomToEdit: RoomData | null;
  isRoomAdded: boolean;
  setIsRoomAdded: (b: boolean) => void;
  existingRooms: RoomData[];
  hotelRoomLimits?: HotelRoomLimits | null;
  addToGroupMode?: boolean;
  editGroupMode?: boolean;
  lookupData?: AllData | null;
}

export interface RoomConfig {
  smoking: boolean;
  wifi: boolean;
  lakeView: boolean;
  mountainView: boolean;
}

export interface CombinedBedOption {
  value: string;
  label: string;
  bedTypeId: number;
  bedSizeId: number;
}
