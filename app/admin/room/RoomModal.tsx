// RoomModal.tsx
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { schemaCreateRoom } from "@/app/schema"; // your Zod schema
import { z } from "zod";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronLeft,
  Trash2,
  Plus,
  Check,
  Edit,
  X,
  User,
  Baby,
  Wifi,
  Cigarette,
  Bed,
  Upload,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { getClientBackendToken } from "@/utils/auth";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import UserStorage from "@/utils/storage";
// Dialog primitives intentionally not used here to keep the modal logic
// self-contained (we render our own overlay + form). Avoid requiring
// Dialog context to prevent runtime errors: `DialogTitle` must be used
// within `Dialog`.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_COMBINED_DATA = "/api/lookup";
const API_CREATE_ROOM = "/api/rooms";

///////////////////////////////////////
//–– Types & Interfaces ––//
///////////////////////////////////////

interface RoomType {
  id: number;
  name: string;
  is_custom: boolean;
}
interface BedType {
  id: number;
  name: string;
  is_custom: boolean;
}
// For “generic” lookup items that have separate name_en / name_mn
interface LookupItem {
  id: number;
  name_en: string;
  name_mn: string;
}
// For SimpleLookup (room_category, bed_types, room_types) that use “name”
interface SimpleLookup {
  id: number;
  name: string;
  is_custom: boolean;
}
interface CombinedData {
  roomTypes: SimpleLookup[];
  bedTypes: SimpleLookup[];
  facilities: LookupItem[];
  bathroom_items: LookupItem[];
  free_Toiletries: LookupItem[];
  food_and_drink: LookupItem[];
  outdoor_and_view: LookupItem[];
  room_category: SimpleLookup[];
}

// The shape of the API’s RoomData object when fetching an existing room:
interface RoomImage {
  id: number;
  image: string; // presumably a URL
  description: string;
}
interface RoomData {
  id: number;
  hotel: number;
  room_number: number; // single number for leaf‐rooms; in editing we pass as array of numbers
  room_type: number;
  room_category: number;
  room_size: string; // e.g. "12.00"
  bed_type: number;
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

// The shape of the React Hook Form data (derived from your Zod schema):
type FormFields = z.infer<typeof schemaCreateRoom>;

// Props for the RoomModal component:
interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;

  // When editing, pass the existing room data. Otherwise pass null to create new.
  roomToEdit: RoomData | null;

  // After a successful create/update, parent can flip this to reload the datagrid
  isRoomAdded: boolean;
  setIsRoomAdded: (b: boolean) => void;

  // Existing rooms data for duplicate validation
  existingRooms: RoomData[];
}

///////////////////////////////////////
//–– Component ––//
///////////////////////////////////////

export default function RoomModal({
  isOpen,
  onClose,
  roomToEdit,
  isRoomAdded,
  setIsRoomAdded,
  existingRooms,
}: RoomModalProps) {
  const [step, setStep] = useState<number>(1);
  const t = useTranslations("RoomModal"); // Changed from "Rooms" to "RoomModal"
  const { user } = useAuth(); // Get user from auth hook
  const [hasDuplicateCombination, setHasDuplicateCombination] = useState(false);
  const [bedCount, setBedCount] = useState<number>(1); // Separate state for bed count (UI only for now)

  // Combined lookup (room types, bed types, etc.)
  const [combinedData, setCombinedData] = useState<CombinedData>({
    roomTypes: [],
    bedTypes: [],
    facilities: [],
    bathroom_items: [],
    free_Toiletries: [],
    food_and_drink: [],
    outdoor_and_view: [],
    room_category: [],
  });

  // Helper: read hotel ID (or user's hotel) from localStorage/userInfo
  const getHotelId = (): number | null => {
    try {
      const propertyData = JSON.parse(localStorage.getItem("propertyData") || "{}");
      return propertyData?.property?.id ?? null;
    } catch {
      return null;
    }
  };

  // Helper: check if step 1 is complete for validation
  const isStep1Complete = (): boolean => {
    const roomType = watch("room_type");
    const roomCategory = watch("room_category");
    const bedType = watch("bed_type");
    const roomNo = watch("RoomNo");
    const entries = watch("entries");
    const isBathroom = watch("is_Bathroom");
    const smokingAllowed = watch("smoking_allowed");
    const roomSize = watch("room_size");
    const adultQty = watch("adultQty");
    const childQty = watch("childQty");
    const numberOfRooms = watch("number_of_rooms");
    const numberOfRoomsToSell = watch("number_of_rooms_to_sell");

    // Check for duplicate room_type + category combination (only when creating new room)
    if (!roomToEdit) {
      const hasDuplicateCombination = checkDuplicateRoomTypeCategoryCombination(roomType, roomCategory);
      if (hasDuplicateCombination) {
        return false;
      }
    }

    // Check if at least one image is uploaded
    const hasValidImage = entries?.some(entry => entry.images && entry.images.trim() !== '');

    // Check for duplicate room numbers and validate count
    if (roomNo) {
      const roomNumbersArr = roomNo.split(",")
        .map(txt => parseInt(txt.trim(), 10))
        .filter(n => !isNaN(n));

      const { hasDuplicate } = checkDuplicateRoomNumbers(roomNumbersArr);
      if (hasDuplicate) {
        return false;
      }

      // When creating (not editing), check if room numbers count matches number_of_rooms
      if (!roomToEdit) {
        // Check if the number of room numbers entered matches the total number of rooms
        const numberOfRoomsNum = Number(numberOfRooms);
        if (numberOfRoomsNum > 0 && roomNumbersArr.length !== numberOfRoomsNum) {
          return false;
        }
      }
    }

    // When creating, require number_of_rooms and number_of_rooms_to_sell
    const hasRoomCounts = roomToEdit || (numberOfRooms && numberOfRoomsToSell);

    // Validate that number_of_rooms_to_sell is not greater than number_of_rooms
    if (!roomToEdit && numberOfRooms && numberOfRoomsToSell) {
      if (parseInt(numberOfRoomsToSell) > numberOfRooms) {
        return false;
      }
    }

    return !!(
      roomType &&
      roomCategory &&
      bedType &&
      roomNo &&
      hasValidImage &&
      isBathroom &&
      smokingAllowed &&
      roomSize &&
      adultQty &&
      childQty &&
      hasRoomCounts
    );
  };

  // Helper: check if step 2 is complete for validation
  const isStep2Complete = (): boolean => {
    const roomFacilities = watch("room_Facilities");
    const bathroomItems = watch("bathroom_Items");
    const freeToiletries = watch("free_Toiletries");
    const foodAndDrink = watch("food_And_Drink");
    const outdoorAndView = watch("outdoor_And_View");
    const roomDescription = watch("room_Description");

    return !!(
      roomFacilities?.length > 0 &&
      bathroomItems?.length > 0 &&
      freeToiletries?.length > 0 &&
      foodAndDrink?.length > 0 &&
      outdoorAndView?.length > 0 &&
      roomDescription?.length >= 5
    );
  };

  // Helper: get missing fields for step 1
  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!watch("room_type")) missing.push(t('room_type'));
    if (!watch("room_category")) missing.push(t('category'));
    if (!watch("bed_type")) missing.push(t('bed_type'));
    if (!watch("RoomNo")) missing.push(t('room_numbers'));

    const entries = watch("entries");
    const hasValidImage = entries?.some(entry => entry.images && entry.images.trim() !== '');
    if (!hasValidImage) missing.push(t('images'));

    return missing;
  };

  // Helper: check for duplicate room numbers
  const checkDuplicateRoomNumbers = (roomNumbers: number[]): { hasDuplicate: boolean; duplicates: number[] } => {
    const duplicates: number[] = [];

    for (const num of roomNumbers) {
      // When editing, exclude the current room's number from the check
      const isDuplicate = existingRooms.some(room =>
        room.room_number === num &&
        (!roomToEdit || room.id !== roomToEdit.id)
      );

      if (isDuplicate) {
        duplicates.push(num);
      }
    }

    return {
      hasDuplicate: duplicates.length > 0,
      duplicates
    };
  };

  // Helper: check for duplicate room_type + category combination
  const checkDuplicateRoomTypeCategoryCombination = (roomType: string, roomCategory: string): boolean => {
    if (!roomType || !roomCategory) return false;

    // When editing, allow the same combination if it's the same room being edited
    const hasDuplicate = existingRooms.some(room => {
      const isSameType = room.room_type === Number(roomType);
      const isSameCategory = room.room_category === Number(roomCategory);
      const isSameRoom = roomToEdit && room.id === roomToEdit.id;
      
      // If we're editing and this is the same room, don't count it as duplicate
      if (isSameRoom) {
        return false;
      }
      
      // Otherwise, check if type + category match
      return isSameType && isSameCategory;
    });

    return hasDuplicate;
  };

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaCreateRoom),
    defaultValues: {
      room_type: "",
      room_category: "",
      room_size: "",
      bed_type: "",
      adultQty: "2",
      childQty: "1",
      number_of_rooms: 1,
      number_of_rooms_to_sell: "1",
      room_Description: "",
      smoking_allowed: "",
      RoomNo: "",

      room_Facilities: [],
      is_Bathroom: "",
      bathroom_Items: [],
      free_Toiletries: [],
      food_And_Drink: [],
      outdoor_And_View: [],

      // We store images+descriptions in a field array called "entries"
      entries: [{ images: "", descriptions: "" }],
    },
  });

  // Manage dynamic file upload fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });
  const watchedEntries = watch("entries");

  // When the modal opens (or roomToEdit changes), fetch combined lookup data & possibly pre‐fill form
  useEffect(() => {
    // 1) Fetch /api/lookup with token
    const fetchCombined = async () => {
      try {
        const token = await getClientBackendToken() || "";
        const resp = await fetch(`${API_COMBINED_DATA}?token=${encodeURIComponent(token)}`);
        const data = await resp.json();
        setCombinedData({
          roomTypes: data.room_types || [],
          bedTypes: data.bed_types || [],
          facilities: data.room_facilities || [],
          bathroom_items: data.bathroom_items || [],
          free_Toiletries: data.free_toiletries || [],
          food_and_drink: data.food_and_drink || [],
          outdoor_and_view: data.outdoor_and_view || [],
          room_category: data.room_category || [],
        });
      } catch (e) {
        console.error("Error fetching combined data:", e);
        toast.error("Failed to load lookup data.");
      }
    };

    fetchCombined();
  }, []);

  // 2) If roomToEdit is not null, populate the form with existing values
  useEffect(() => {
    // Only run when modal is open
    if (!isOpen) return;

    if (roomToEdit) {
      // Build a flat FormFields object from RoomData
      const existing = roomToEdit;

      // Reset bed count to 1 when editing (will be API-driven later)
      setBedCount(1);

      // Convert array of existing images into { images: base64|url, descriptions: string }[] form
      // Since the backend returns URLs, we just store the URL here (we assume no re‐upload in edit, or user can re‐upload if they choose).
      const initialEntries = existing.images.map((img) => ({
        images: img.image, // URL from server
        descriptions: img.description,
      }));

      // If there are no existing images, keep one blank "entry"
      if (initialEntries.length === 0) {
        initialEntries.push({ images: "", descriptions: "" });
      }

      // Convert the RoomData into the shape of our form
      reset({
        room_type: String(existing.room_type),
        room_category: String(existing.room_category),
        room_size: existing.room_size,
        bed_type: String(existing.bed_type),
        adultQty: String(existing.adultQty),
        childQty: String(existing.childQty),
        number_of_rooms: existing.number_of_rooms,
        number_of_rooms_to_sell: String(existing.number_of_rooms_to_sell),
        room_Description: existing.room_Description,
        smoking_allowed: existing.smoking_allowed ? "true" : "false",
        RoomNo: existing.room_number.toString(),

        room_Facilities: existing.room_Facilities.map(String),
        is_Bathroom: existing.is_Bathroom ? "true" : "false",
        bathroom_Items: existing.bathroom_Items.map(String),
        free_Toiletries: existing.free_Toiletries.map(String),
        food_And_Drink: existing.food_And_Drink.map(String),
        outdoor_And_View: existing.outdoor_And_View.map(String),

        entries: initialEntries,
      });
    } else {
      // If creating a brand new room, just reset to defaults
      setBedCount(1); // Reset bed count to 1
      
      reset({
        room_type: "",
        room_category: "",
        room_size: "",
        bed_type: "",
        adultQty: "2",
        childQty: "1",
        number_of_rooms: 1,
        number_of_rooms_to_sell: "1",
        room_Description: "",
        smoking_allowed: "",
        RoomNo: "",

        room_Facilities: [],
        is_Bathroom: "",
        bathroom_Items: [],
        free_Toiletries: [],
        food_And_Drink: [],
        outdoor_And_View: [],

        entries: [{ images: "", descriptions: "" }],
      });
      setStep(1); // always start at step 1 for "create" mode
    }
  }, [roomToEdit, reset, isOpen]);

  // Watch for changes in room_type and room_category to check for duplicate combinations
  const roomTypeValue = watch("room_type");
  const roomCategoryValue = watch("room_category");

  useEffect(() => {
    if (roomTypeValue && roomCategoryValue) {
      const isDuplicate = checkDuplicateRoomTypeCategoryCombination(roomTypeValue, roomCategoryValue);
      setHasDuplicateCombination(isDuplicate);
    } else {
      setHasDuplicateCombination(false);
    }
  }, [roomTypeValue, roomCategoryValue, existingRooms]);

  // File → Base64 conversion for image previews
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setValue(`entries.${index}.images`, base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  // Utility: check nested errors
  const hasNestedError = (field: string): boolean => {
    const parts = field.split(".");
    let current: any = errors;
    for (const part of parts) {
      if (!(part in current)) return false;
      current = (current as any)[part];
    }
    return true;
  };

  // Submit handler: POST if new, PUT if editing
  const onSubmit: SubmitHandler<FormFields> = async (formData) => {
    // Check for duplicate room_type + category combination (only when creating new room)
    if (!roomToEdit && checkDuplicateRoomTypeCategoryCombination(formData.room_type, formData.room_category)) {
      toast.error("Энэ өрөөний төрөл ба ангиллын хослол аль хэдийн бүртгэгдсэн байна. Өөр хослол сонгоно уу.");
      setStep(1);
      return;
    }

    // Validate Step 1 fields are filled before moving to Step 2
    const step1Fields = [
      "room_type",
      "room_category",
      "room_size",
      "bed_type",
      "is_Bathroom",
      "adultQty",
      "childQty",
      "number_of_rooms",
      "number_of_rooms_to_sell",
      "RoomNo",
      "smoking_allowed",
      "entries",
    ];
    const hasStep1Errors = step1Fields.some(hasNestedError);
    if (hasStep1Errors) {
      setStep(1);
      toast.error("Мэдээлэл дутуу байна. Та эхний хуудас дахь талбаруудыг шалгана уу.");
      return;
    }

    // Split "RoomNo" string by commas into an array of numbers
    const roomNumbersArr = formData.RoomNo.split(",")
      .map((txt) => parseInt(txt.trim(), 10))
      .filter((n) => !isNaN(n));
    if (roomNumbersArr.length === 0) {
      toast.error("Enter at least one valid room number.");
      return;
    }

    // Only validate room count when creating (not editing)
    if (!roomToEdit && roomNumbersArr.length < parseInt(formData.number_of_rooms_to_sell)) {
      toast.error(
        `Та ${formData.number_of_rooms_to_sell} өрөөг зарах гэж байгаа ч зөвхөн ${roomNumbersArr.length} өрөөний номер оруулсан байна.`
      );
      return;
    }

    // Build the final payload
    const transformedData: any = {
      hotel: user?.hotel,
      room_type: Number(formData.room_type),
      room_category: Number(formData.room_category),
      room_size: parseFloat(formData.room_size),
      bed_type: Number(formData.bed_type),
      is_Bathroom: formData.is_Bathroom === "true",
      room_Facilities: formData.room_Facilities.map(Number),
      bathroom_Items: formData.bathroom_Items.map(Number),
      free_Toiletries: formData.free_Toiletries.map(Number),
      food_And_Drink: formData.food_And_Drink.map(Number),
      outdoor_And_View: formData.outdoor_And_View.map(Number),
      number_of_rooms: roomToEdit ? 1 : formData.number_of_rooms,
      number_of_rooms_to_sell: roomToEdit ? 1 : formData.number_of_rooms_to_sell,
      room_Description: formData.room_Description,
      smoking_allowed: formData.smoking_allowed === "true",
      childQty: Number(formData.childQty),
      adultQty: Number(formData.adultQty),
      RoomNo: roomNumbersArr,
      // Only include entries that have actual images
      images: formData.entries
        .filter(entry => entry.images && entry.images.trim() !== '')
        .map((entry) => ({
          image: entry.images,
          description: entry.descriptions || "",
        })),
    };

    // Debug: Check what images are being sent
    console.log('🖼️ Submitting images:', {
      totalEntries: formData.entries.length,
      allEntries: formData.entries.map((entry, idx) => ({
        index: idx,
        hasImage: !!entry.images,
        isEmpty: !entry.images || entry.images.trim() === '',
        imagePreview: entry.images ? entry.images.substring(0, 50) + '...' : 'empty',
      })),
      filteredImages: transformedData.images.length,
      imageData: transformedData.images.map((img: any, idx: number) => ({
        index: idx,
        hasImage: !!img.image,
        imagePreview: img.image ? img.image.substring(0, 50) + '...' : 'empty',
        description: img.description
      }))
    });

    try {
      const token = await getClientBackendToken() || "";
      const isEdit = roomToEdit !== null;

      // If editing, do PUT /api/rooms with id in body
      // If creating, do POST /api/rooms
      const url = `${API_CREATE_ROOM}?token=${token}`;
      const method = isEdit ? "PUT" : "POST";

      // For PUT, include id in the body
      const bodyData = isEdit ? { ...transformedData, id: roomToEdit!.id } : transformedData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const err = await response.json();
        // Handle various error response formats
        const errorMessage = err.RoomNo || err.message || err.error || err.detail || `Server error: ${response.status}`;
        console.error("Server error response:", err);
        throw new Error(errorMessage);
      }

      // Success
      setIsRoomAdded(true);
      toast.success(isEdit ? t('success_updated') : t('success_created'));

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("RoomModal submit error:", err);
      const isEdit = roomToEdit !== null;
      toast.error(err.message || t(isEdit ? 'error_update' : 'error_create'));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50  bg-black/60 flex items-start md:items-center justify-center p-4"
    >
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log('❌ Form validation failed:', errors);
          toast.error('Форм бөглөхөд алдаа гарлаа. Талбаруудаа шалгана уу.');
        })}
        onClick={(e) => e.stopPropagation()}
        className="p-6 bg-white border max-w-3xl w-full max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl relative mx-auto"
      >

        {/* ─── Header + Close Button ───────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{roomToEdit ? t('title_edit') : t('title_add')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="close">
            <X className="h-5 w-5 text-slate-700" />
          </Button>
        </div>

        {/* ─── Step Indicator Bar ───────────────────────────────────────────── */}
        <section className="mb-6">
          <div className="flex gap-2 border-b">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex-1 pb-3 px-4 text-sm font-medium border-b-2 transition-colors relative ${
                step === 1
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {isStep1Complete() ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs">
                    1
                  </span>
                )}
                {t('basic_info')}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isStep1Complete()) {
                  toast.info(t('complete_basic_first'), {
                    description: t('fill_required_fields')
                  });
                  return;
                }
                setStep(2);
              }}
              className={`flex-1 pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                step === 2
                  ? "border-primary text-primary"
                  : isStep1Complete()
                  ? "border-transparent text-muted-foreground hover:text-foreground"
                  : "border-transparent text-muted-foreground/50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs">
                  2
                </span>
                {t('amenities')}
                {!isStep1Complete() && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {t('locked')}
                  </Badge>
                )}
              </div>
            </button>
          </div>

          {/* Show alert if step 1 is incomplete */}
          {step === 1 && !isStep1Complete() && (getMissingFields().length > 0) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                {t('required_fields_hint')}: <span className="font-medium">{getMissingFields().join(', ')}</span>
              </p>
            </div>
          )}
        </section>

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* ─── Step 1: Basic Room Info ───────────────────────────────────────── */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-10">
            {/* Row 1: Room Type & Room Category */}
            <section className="grid grid-cols-2 gap-10">
              {/* Room Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Өрөөний ангилал <span className="text-red-500">*</span>
                </label>
                <Select 
                  key={`room_type-${roomToEdit?.id || 'new'}-${watch("room_type")}`}
                  onValueChange={(value) => setValue("room_type", value)} 
                  value={watch("room_type") || undefined}
                  disabled={!!roomToEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Сонгох --" />
                  </SelectTrigger>
                  <SelectContent>
                    {combinedData.roomTypes.length === 0 ? (
                      <SelectItem value="loading" disabled>{t('loading')}</SelectItem>
                    ) : (
                      combinedData.roomTypes.map((rt) => (
                        <SelectItem key={rt.id} value={rt.id.toString()}>
                          {rt.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.room_type && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.room_type.message}
                  </span>
                )}
              </div>

              {/* Room Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Өрөөний төрөл <span className="text-red-500">*</span>
                </label>
                <Select 
                  key={`room_category-${roomToEdit?.id || 'new'}-${watch("room_category")}`}
                  onValueChange={(value) => setValue("room_category", value)} 
                  value={watch("room_category") || undefined}
                  disabled={!!roomToEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Сонгох --" />
                  </SelectTrigger>
                  <SelectContent>
                    {combinedData.room_category.length === 0 ? (
                      <SelectItem value="loading" disabled>{t('loading')}</SelectItem>
                    ) : (
                      combinedData.room_category.map((rc) => (
                        <SelectItem key={rc.id} value={rc.id.toString()}>
                          {rc.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.room_category && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.room_category.message}
                  </span>
                )}
              </div>
            </section>

            {/* Alert for duplicate room_type + category combination - only show when creating new room */}
            {hasDuplicateCombination && !roomToEdit && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Анхааруулга: Энэ өрөөний төрөл ба ангиллын хослол аль хэдийн бүртгэгдсэн байна. 
                  Та өөр хослол сонгох шаардлагатай. Ижил хослолтой өрөө нэмэх боломжгүй.
                </AlertDescription>
              </Alert>
            )}

            {/* Row 2: Occupancy & Room Size */}
            <section className="grid grid-cols-2 gap-10">
              {/* Occupancy (Adults + Children) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Өрөөнд орох боломжтой хүний тоог оруулна уу. <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <User className="text-blue-600 w-5 h-5 flex-shrink-0" />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const current = parseInt(watch("adultQty") || "0");
                        if (current > 0) setValue("adultQty", String(current - 1));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("adultQty")}
                      className="w-16 text-center"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Baby className="text-pink-600 w-5 h-5 flex-shrink-0" />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const current = parseInt(watch("childQty") || "0");
                        if (current > 0) setValue("childQty", String(current - 1));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("childQty")}
                      className="w-16 text-center"
                    />
                  </div>
                </div>
                {(errors.adultQty || errors.childQty) && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.adultQty?.message ?? errors.childQty?.message}
                  </span>
                )}
              </div>

              {/* Room Size */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Өрөөний хэмжээ (м2) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register("room_size")}
                />
                {errors.room_size && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.room_size.message}
                  </span>
                )}
              </div>
            </section>

            {/* Row 3: Bed Type with counter */}
            <section className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Орны төрөл <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <Select 
                  key={`bed_type-${roomToEdit?.id || 'new'}-${watch("bed_type")}`}
                  onValueChange={(value) => setValue("bed_type", value)} 
                  value={watch("bed_type") || undefined}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="-- Сонгох --" />
                  </SelectTrigger>
                  <SelectContent>
                    {combinedData.bedTypes.map((bt) => (
                      <SelectItem key={bt.id} value={bt.id.toString()}>
                        {bt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => {
                    if (bedCount > 1) setBedCount(bedCount - 1);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={bedCount}
                  onChange={(e) => setBedCount(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => {
                    setBedCount(bedCount + 1);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Badge variant="secondary" className="ml-2">
                  {bedCount === 1 ? '1 ор' : `${bedCount} ор`}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Энэ өрөөнд байгаа орны тоо (API-тай холбогдох хүлээгдэж байна)
              </p>
              {errors.bed_type && (
                <span className="text-red-500 text-xs mt-1 block">
                  {errors.bed_type.message}
                </span>
              )}
            </section>

            {/* Row 4: Is Bathroom? & Smoking Allowed */}
            <section className="grid grid-cols-2 gap-10">
              {/* Is Bathroom */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Өрөөнд ариун цэврийн өрөө байгаа эсэх: <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center cursor-pointer flex-1">
                    <input
                      type="radio"
                      {...register("is_Bathroom", {
                        required: "Энэ талбарыг бөглөнө үү",
                      })}
                      value="true"
                      className="hidden peer"
                    />
                    <span className="peer-checked:bg-blue-500 peer-checked:text-white border border-gray-300 px-4 py-2 rounded-lg transition w-full text-center">
                      Тийм
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer flex-1">
                    <input
                      type="radio"
                      {...register("is_Bathroom", {
                        required: "Энэ талбарыг бөглөнө үү",
                      })}
                      value="false"
                      className="hidden peer"
                    />
                    <span className="peer-checked:bg-blue-500 peer-checked:text-white border border-gray-300 px-4 py-2 rounded-lg transition w-full text-center">
                      Үгүй
                    </span>
                  </label>
                </div>
                {errors.is_Bathroom && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.is_Bathroom.message}
                  </span>
                )}
              </div>

              {/* Smoking Allowed */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Тамхи зөвшөөрөх эсэх <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center cursor-pointer flex-1">
                    <input
                      type="radio"
                      {...register("smoking_allowed", {
                        required: "Энэ талбарыг бөглөнө үү",
                      })}
                      value="true"
                      className="hidden peer"
                    />
                    <span className="peer-checked:bg-blue-500 peer-checked:text-white border border-gray-300 px-4 py-2 rounded-lg transition w-full text-center">
                      Тийм
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer flex-1">
                    <input
                      type="radio"
                      {...register("smoking_allowed", {
                        required: "Энэ талбарыг бөглөнө үү",
                      })}
                      value="false"
                      className="hidden peer"
                    />
                    <span className="peer-checked:bg-blue-500 peer-checked:text-white border border-gray-300 px-4 py-2 rounded-lg transition w-full text-center">
                      Үгүй
                    </span>
                  </label>
                </div>
                {errors.smoking_allowed && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.smoking_allowed.message}
                  </span>
                )}
              </div>
            </section>

            {/* Row 5: Total Rooms & Rooms to Sell */}
            {!roomToEdit && (
              <section className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Өрөөний нийт тоо <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("number_of_rooms")}
                  />
                  {errors.number_of_rooms && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.number_of_rooms.message}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Манай сайтаар зарах өрөөний тоо <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("number_of_rooms_to_sell")}
                  />
                  {errors.number_of_rooms_to_sell && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.number_of_rooms_to_sell.message}
                    </span>
                  )}
                  {/* Show warning if number_of_rooms_to_sell exceeds number_of_rooms */}
                  {(() => {
                    const numberOfRooms = watch("number_of_rooms");
                    const numberOfRoomsToSell = watch("number_of_rooms_to_sell");
                    if (numberOfRooms && numberOfRoomsToSell && parseInt(numberOfRoomsToSell) > numberOfRooms) {
                      return (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Зарах өрөөний тоо ({numberOfRoomsToSell}) нийт өрөөний тооноос ({numberOfRooms}) их байж болохгүй!</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </section>
            )}

            {/* Row 6: Room Numbers */}
            <section className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {roomToEdit 
                  ? "Өрөөний дугаар (1 дугаар байна)" 
                  : <>Та өрөө тус бүрийн №-ийг бичиж өгнө үү? <span className="text-red-500">*</span> <span className="text-gray-500 font-normal">(таслалаар тусгаарлагдсан)</span></>}
              </label>
              <Input
                {...register("RoomNo")}
                placeholder="Жнь: 101, 102, 103 гэх мэт"
              />
              {errors.RoomNo && (
                <span className="text-red-500 text-xs mt-1 block">{errors.RoomNo.message}</span>
              )}
              {/* Show duplicate room number warning */}
              {(() => {
                const roomNo = watch("RoomNo");
                if (roomNo && !roomToEdit) {
                  const roomNumbersArr = roomNo.split(",")
                    .map(txt => parseInt(txt.trim(), 10))
                    .filter(n => !isNaN(n));

                  // Check for duplicates
                  const { hasDuplicate, duplicates } = checkDuplicateRoomNumbers(roomNumbersArr);
                  if (hasDuplicate) {
                    return (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Дараах өрөөний дугаар аль хэдийн бүртгэгдсэн байна: {duplicates.join(", ")}</span>
                      </div>
                    );
                  }

                  // Check if count matches number_of_rooms
                  const numberOfRooms = watch("number_of_rooms");
                  const numberOfRoomsNum = Number(numberOfRooms);
                  // Only show warning if numberOfRooms is a positive number and doesn't match
                  if (numberOfRoomsNum > 0 && roomNumbersArr.length !== numberOfRoomsNum) {
                    return (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Өрөөний нийт тоо {numberOfRoomsNum} байхаар оруулсан байна. Та {numberOfRoomsNum} өрөөний дугаар оруулах шаардлагатай. Одоо {roomNumbersArr.length} дугаар оруулсан байна.</span>
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </section>

            {/* Row 7: Images */}
            <section className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Зураг нэмэх (Хамгийн багадаа 1 зураг) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500">
                  *JPG/ JPEG эсвэл PNG, 47MB-с их үй хэмжээтэй байхаар анхаарна уу.
                </p>
              </div>

              {/* Image grid - dynamically shows uploaded images + add button */}
              <div className="grid grid-cols-4 gap-5 mt-3">
                {/* Show uploaded images only (filter out empty entries) */}
                {fields
                  .map((field, index) => ({ field, index, hasImage: watchedEntries[index]?.images }))
                  .filter(item => item.hasImage && item.hasImage.trim() !== '')
                  .map(({ field, index }) => (
                    <div key={field.id} className="relative aspect-square">
                      <div className="relative w-full h-full group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, index)}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <img
                          src={watchedEntries[index].images}
                          alt={`Room image ${index + 1}`}
                          className="w-full h-full rounded-lg object-cover border-2 cursor-pointer hover:opacity-80 transition"
                          onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                        />
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                {/* Add new image button */}
                {fields.length < 10 && (
                  <div 
                    className="relative aspect-square w-full h-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => document.getElementById('add-new-image')?.click()}
                  >
                    <Plus className="h-8 w-8 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64Image = reader.result as string;
                            console.log('➕ Adding new image, current entries:', fields.length);
                            append({ images: base64Image, descriptions: "" });
                          };
                          reader.readAsDataURL(file);
                        }
                        // Reset input
                        e.target.value = '';
                      }}
                      className="hidden"
                      id="add-new-image"
                    />
                  </div>
                )}
              </div>
            </section>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!isStep1Complete()}
                className="flex items-center gap-2"
              >
                {t("next")} <ChevronRight />
              </Button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* ─── Step 2: Amenities & Final Description ─────────────────────────── */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            {/* Room Facilities */}
            <section className="flex justify-between">
              <div className="w-[45%] mb-4">
                <label className="block mb-1">{t('facilities')}</label>
                <div className="border p-2 rounded-lg max-h-60 overflow-y-auto flex flex-col gap-2">
                  {combinedData.facilities.map((f) => (
                    <label key={f.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={String(f.id)}
                        {...register("room_Facilities")}
                        className="form-checkbox"
                      />
                      <span>{f.name_en}</span>
                    </label>
                  ))}
                </div>
                {errors.room_Facilities && (
                  <span className="text-red text-sm">
                    {errors.room_Facilities.message}
                  </span>
                )}
              </div>

              <div className="w-[45%] mb-4">
                <label className="block mb-1">{t('bathroom')}</label>
                <div className="border p-2 rounded-lg max-h-60 overflow-y-auto flex flex-col gap-2">
                  {combinedData.bathroom_items.map((b) => (
                    <label key={b.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={String(b.id)}
                        {...register("bathroom_Items")}
                        className="form-checkbox"
                      />
                      <span>{b.name_en}</span>
                    </label>
                  ))}
                </div>
                {errors.bathroom_Items && (
                  <span className="text-red text-sm">
                    {errors.bathroom_Items.message}
                  </span>
                )}
              </div>
            </section>

            {/* Free Toiletries */}
            <div className="mb-4">
              <label className="block mb-1">{t('toiletries')}</label>
              <div className="flex flex-wrap gap-x-2 gap-y-6">
                {combinedData.free_Toiletries.map((ft) => (
                  <div key={ft.id}>
                    <input
                      type="checkbox"
                      value={String(ft.id)}
                      id={`ft-${ft.id}`}
                      {...register("free_Toiletries")}
                      className="hidden peer"
                    />
                    <label
                      htmlFor={`ft-${ft.id}`}
                      className="peer-checked:bg-blue-500 peer-checked:text-white 
                                 border border-gray-300 rounded-lg px-4 py-2 cursor-pointer 
                                 bg-gray-100 text-gray-800 transition hover:bg-accent text-sm"
                    >
                      {ft.name_en}
                    </label>
                  </div>
                ))}
              </div>
              {errors.free_Toiletries && (
                <span className="text-red text-sm">
                  {errors.free_Toiletries.message}
                </span>
              )}
            </div>

            {/* Outdoor & View */}
            <div className="mb-4">
              <label className="block mb-1">{t('view')}</label>
              <div className="flex flex-wrap gap-x-2 gap-y-6">
                {combinedData.outdoor_and_view.map((ov) => (
                  <div key={ov.id}>
                    <input
                      type="checkbox"
                      value={String(ov.id)}
                      id={`ov-${ov.id}`}
                      {...register("outdoor_And_View")}
                      className="hidden peer"
                    />
                    <label
                      htmlFor={`ov-${ov.id}`}
                      className="peer-checked:bg-blue-500 peer-checked:text-white 
                                 border border-gray-300 rounded-lg px-4 py-2 cursor-pointer 
                                 bg-gray-100 text-gray-800 transition hover:bg-accent"
                    >
                      {ov.name_en}
                    </label>
                  </div>
                ))}
              </div>
              {errors.outdoor_And_View && (
                <span className="text-red text-sm">
                  {errors.outdoor_And_View.message}
                </span>
              )}
            </div>

            {/* Food & Drink */}
            <div className="mb-4">
              <label className="block mb-1">Бусад</label>
              <div className="flex flex-wrap gap-x-2 gap-y-6">
                {combinedData.food_and_drink.map((fd) => (
                  <div key={fd.id}>
                    <input
                      type="checkbox"
                      value={String(fd.id)}
                      id={`fd-${fd.id}`}
                      {...register("food_And_Drink")}
                      className="hidden peer"
                    />
                    <label
                      htmlFor={`fd-${fd.id}`}
                      className="peer-checked:bg-blue-500 peer-checked:text-white 
                                 border border-gray-300 rounded-lg px-4 py-2 cursor-pointer 
                                 bg-gray-100 text-gray-800 transition hover:bg-accent"
                    >
                      {fd.name_en}
                    </label>
                  </div>
                ))}
              </div>
              {errors.food_And_Drink && (
                <span className="text-red text-sm">
                  {errors.food_And_Drink.message}
                </span>
              )}
            </div>

            {/* Final Room Description */}
            <div className="mb-4">
              <label className="block mb-1">{t('description')}</label>
              <textarea
                {...register("room_Description")}
                placeholder={t('description_placeholder')}
                className="border rounded-lg p-2 w-full h-24"
              />
              {errors.room_Description && (
                <span className="text-red text-sm">
                  {errors.room_Description.message}
                </span>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex items-center gap-2">
                <ChevronLeft /> {t('back')}
              </Button>
              <Button type="submit" disabled={isSubmitting || !isStep2Complete()} className="flex items-center gap-2">
                {isSubmitting ? t('saving') : (roomToEdit ? t('save') : t('save'))} <Check />
              </Button>
            </div>
          </div>
        )}

        {/* ─── END Step 2 ───────────────────────────────────────────────────────── */}
      </form>
    </div>
  );
}
