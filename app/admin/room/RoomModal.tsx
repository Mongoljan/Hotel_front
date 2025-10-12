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
  Image as ImageIcon
} from "lucide-react";
import { getClientBackendToken } from "@/utils/auth";
import { useTranslations } from "next-intl";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_COMBINED_DATA = "https://dev.kacc.mn/api/all-data/";
const API_CREATE_ROOM = "https://dev.kacc.mn/api/roomsNew/";

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
  number_of_rooms_to_sell: number;
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
}: RoomModalProps) {
  const [step, setStep] = useState<number>(1);
  const t = useTranslations("Rooms");

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

  // Helper: read hotel ID (or user’s hotel) from localStorage/userInfo
  const getHotelId = (): number | null => {
    try {
      const propertyData = JSON.parse(localStorage.getItem("propertyData") || "{}");
      return propertyData?.property?.id ?? null;
    } catch {
      return null;
    }
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
      adultQty: "",
      childQty: "",
      number_of_rooms: 0,
      number_of_rooms_to_sell: "",
      room_Description: "",
      smoking_allowed: "",
      RoomNo: "",

      room_Facilities: [],
      is_Bathroom: "",
      bathroom_Items: [],
      free_Toiletries: [],
      food_And_Drink: [],
      outdoor_And_View: [],

      // We store images+descriptions in a field array called “entries”
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
    // 1) Fetch /api/all-data/
    const fetchCombined = async () => {
      try {
        const resp = await fetch(API_COMBINED_DATA);
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
    if (roomToEdit) {
      // Build a flat FormFields object from RoomData
      const existing = roomToEdit;

      // Convert array of existing images into { images: base64|url, descriptions: string }[] form
      // Since the backend returns URLs, we just store the URL here (we assume no re‐upload in edit, or user can re‐upload if they choose).
      const initialEntries = existing.images.map((img) => ({
        images: img.image, // URL from server
        descriptions: img.description,
      }));

      // If there are no existing images, keep one blank “entry”
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
      reset({
        room_type: "",
        room_category: "",
        room_size: "",
        bed_type: "",
        adultQty: "",
        childQty: "",
        number_of_rooms: 0,
        number_of_rooms_to_sell: "",
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
      setStep(1); // always start at step 1 for “create” mode
    }
  }, [roomToEdit, reset]);

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

    // Split “RoomNo” string by commas into an array of numbers
    const roomNumbersArr = formData.RoomNo.split(",")
      .map((txt) => parseInt(txt.trim(), 10))
      .filter((n) => !isNaN(n));
    if (roomNumbersArr.length === 0) {
      toast.error("Enter at least one valid room number.");
      return;
    }
    if (roomNumbersArr.length < parseInt(formData.number_of_rooms_to_sell)) {
      toast.error(
        `Та ${formData.number_of_rooms_to_sell} өрөөг зарах гэж байгаа ч зөвхөн ${roomNumbersArr.length} өрөөний номер оруулсан байна.`
      );
      return;
    }

    // Build the final payload
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const transformedData: any = {
      hotel: userInfo?.hotel,
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
      images: formData.entries.map((entry) => ({
        image: entry.images,
        description: "",
      })),
    };

    try {
      const token = await getClientBackendToken() || "";
      const isEdit = roomToEdit !== null;

      // If editing, do PUT /api/roomsNew/<id>/?token=
      // If creating, do POST /api/roomsNew/?token=
      const url = isEdit
        ? `${API_CREATE_ROOM}${roomToEdit!.id}/?token=${token}`
        : `${API_CREATE_ROOM}?token=${token}`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.RoomNo || "Unknown server error");
      }

      // Success
      setIsRoomAdded(true);
      toast.success(isEdit ? "Room updated successfully!" : "Room created successfully!");

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("RoomModal submit error:", err);
      toast.error(err.message || "An unexpected error occurred.");
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
        onSubmit={handleSubmit(onSubmit)}
        onClick={(e) => e.stopPropagation()}
        className="p-6 bg-white border max-w-[700px] w-full max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl relative mx-auto"
      >

        {/* ─── Header + Close Button ───────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{roomToEdit ? "Өрөө засварлах" : "Өрөө нэмэх"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="close">
            <X className="h-5 w-5 text-slate-700" />
          </Button>
        </div>

        {/* ─── Step Indicator Bar ───────────────────────────────────────────── */}
        <section className="mb-6">
          {step === 1 ? (
            <div className="flex rounded-[10px]">
              <div className="h-1 w-1/2 rounded-[10px] bg-primary"></div>
              <div className="h-1 w-1/2 rounded-r-[10px] bg-gray-200"></div>
            </div>
          ) : (
            <div className="flex rounded-[10px]">
              <div className="h-1 w-1/2 rounded-l-[10px] bg-gray-200"></div>
              <div className="h-1 w-1/2 rounded-[10px] bg-primary"></div>
            </div>
          )}
        </section>

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* ─── Step 1: Basic Room Info ───────────────────────────────────────── */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <section className="flex justify-between mb-4">
              {/* Room Type */}
              <div className="w-[45%]">
                <label className="block mb-1">Өрөөний төрөл</label>
                <Select 
                  key={`room_type-${roomToEdit?.id || 'new'}-${watch("room_type")}`}
                  onValueChange={(value) => setValue("room_type", value)} 
                  value={watch("room_type") || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Сонгох --" />
                  </SelectTrigger>
                  <SelectContent>
                    {combinedData.roomTypes.map((rt) => (
                      <SelectItem key={rt.id} value={rt.id.toString()}>
                        {rt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.room_type && (
                  <span className="text-red text-sm">
                    {errors.room_type.message}
                  </span>
                )}
              </div>

              {/* Room Category */}
              <div className="w-[45%]">
                <label className="block mb-1">Өрөөний ангилал</label>
                <Select 
                  key={`room_category-${roomToEdit?.id || 'new'}-${watch("room_category")}`}
                  onValueChange={(value) => setValue("room_category", value)} 
                  value={watch("room_category") || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Сонгох --" />
                  </SelectTrigger>
                  <SelectContent>
                    {combinedData.room_category.map((rc) => (
                      <SelectItem key={rc.id} value={rc.id.toString()}>
                        {rc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.room_category && (
                  <span className="text-red text-sm">
                    {errors.room_category.message}
                  </span>
                )}
              </div>
            </section>

            <section className="flex justify-between mb-4">
              {/* Room Size */}
              <div className="w-[45%]">
                <label className="block mb-1">Өрөөний хэмжээ (m²)</label>
                <Input
                  type="number"
                  step="0.1"
                  {...register("room_size")}
                />
                {errors.room_size && (
                  <span className="text-red text-sm">
                    {errors.room_size.message}
                  </span>
                )}
              </div>

              {/* Occupancy (Adults + Children) */}
              <div className="w-[45%]">
                <label className="block mb-1">
                  Өрөөнд орох боломжтой хүний тоог оруулна уу?
                </label>
                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <User className="text-primary text-xl" />{" "}
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("adultQty")}
                      className="w-16"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Baby className="text-primary text-xl" />{" "}
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("childQty")}
                      className="w-16"
                    />
                  </div>
                </div>
                {(errors.adultQty || errors.childQty) && (
                  <span className="text-red text-sm">
                    {errors.adultQty?.message ?? errors.childQty?.message}
                  </span>
                )}
              </div>
            </section>

            <section className="flex justify-between mb-4">
              {/* Bed Type */}
              <div className="w-[45%]">
                <label className="block mb-1">Орны төрөл</label>
                <Select 
                  key={`bed_type-${roomToEdit?.id || 'new'}-${watch("bed_type")}`}
                  onValueChange={(value) => setValue("bed_type", value)} 
                  value={watch("bed_type") || undefined}
                >
                  <SelectTrigger>
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
                {errors.bed_type && (
                  <span className="text-red text-sm">
                    {errors.bed_type.message}
                  </span>
                )}
              </div>

              {/* Is Bathroom? */}
              <div className="w-[45%]">
                <label className="block font-medium mb-1">
                  Өрөөнд ариун цэврийн өрөө байгаа эсэх
                </label>
                <div className="flex gap-8 mt-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      {...register("is_Bathroom", {
                        required: "Энэ талбарыг бөглөнө үү",
                      })}
                      value="true"
                      className="hidden peer"
                    />
                    <span className="peer-checked:bg-blue-500 peer-checked:text-white border border-gray-300 px-4 py-2 rounded-lg transition">
                      Тийм
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      {...register("is_Bathroom", {
                        required: "Энэ талбарыг бөглөнө үү",
                      })}
                      value="false"
                      className="hidden peer"
                    />
                    <span className="peer-checked:bg-blue-500 peer-checked:text-white border border-gray-300 px-4 py-2 rounded-lg transition">
                      Үгүй
                    </span>
                  </label>
                </div>
                {errors.is_Bathroom && (
                  <span className="text-red text-sm">
                    {errors.is_Bathroom.message}
                  </span>
                )}
              </div>
            </section>

<div className="flex justify-between mb-4">
            <section className="mb-6 w-[45%]">
              <h3 className="font-medium text-center ">Зураг нэмэх (Хамгийн багадаа 1 зураг)  </h3>
              <p className="text-xs text-soft mb-2">*jpg/ jpeg эсвэл png, 47MB-с ихгүй хэмжээтэй байхыг анхаарна уу.</p>
              {fields.map((field, index) => (
                <div key={field.id} className="mb-4 border  p-4 rounded-lg">
                  <section className="mb-2">
                    <label className="block mb-1">Зураг оруулах</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, index)}
                      className="border p-2 w-full rounded-lg"
                    />
                    {errors.entries?.[index]?.images && (
                      <div className="text-red text-sm">
                        {errors.entries[index]?.images?.message}
                      </div>
                    )}
                  </section>

                  {watchedEntries[index]?.images && (
                    <img
                      src={watchedEntries[index].images}
                      alt={`Preview ${index + 1}`}
                      className="mt-2 max-h-20 w-auto rounded-md border"
                    />
                  )}

                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="mr-2" /> Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => append({ images: "", descriptions: "" })}
                variant="outline"
                className="w-full"
              >
                <Plus className="mr-2" /> Add More
              </Button>
            </section>

            <section className=" w-[45%]">
               {roomToEdit ? <></>
 :
 <div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Өрөөний нийт тоо</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("number_of_rooms")}
                  className="w-1/2"
                />
                {errors.number_of_rooms && (
                  <span className="text-red text-sm">
                    {errors.number_of_rooms.message}
                  </span>
                )}
              </div>
              <div className=" mb-4">
                <label className="block font-medium">Манай сайтаар зарах өрөөний тоо</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("number_of_rooms_to_sell")}
                  className="w-1/2"
                />
                {errors.number_of_rooms_to_sell && (
                  <span className="text-red text-sm">
                    {errors.number_of_rooms_to_sell.message}
                  </span>
                )}
              </div>
              </div>
 }
                <div className="mb-4">
              <label className="block  font-medium ">
        {roomToEdit ? <div>Өрөөний дугаар ( 1 дугаар байна)</div> :  <div> Та өрөө тус бүрийн номерийг бичиж оруулна уу? (таслалаар тусгаарлагдсан)</div>   }  
              </label>
              <Input
                {...register("RoomNo")}
                placeholder="E.g. 101, 102"
              />
              {errors.RoomNo && (
                <span className="text-red text-sm">{errors.RoomNo.message}</span>
              )}
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1">Тамхи зөвшөөрөх эсэх</label>
              <div className="flex gap-8 mt-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("smoking_allowed", {
                      required: "Энэ талбарыг бөглөнө үү",
                    })}
                    value="true"
                    className="hidden peer"
                  />
                  <span className="peer-checked:bg-blue-500 peer-checked:text-white border border-gray-300 px-4 py-2 rounded-lg transition">
                    Тийм
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("smoking_allowed", {
                      required: "Энэ талбарыг бөглөнө үү",
                    })}
                    value="false"
                    className="hidden peer"
                  />
                  <span className="peer-checked:bg-blue-500 peer-checked:text-white border border-gray-300 px-4 py-2 rounded-lg transition">
                    Үгүй
                  </span>
                </label>
              </div>
              {errors.smoking_allowed && (
                <span className="text-red text-sm">
                  {errors.smoking_allowed.message}
                </span>
              )}
            </div>
            </section>
            </div>

          


            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} className="flex items-center gap-2">
                {t("actions.next")} <ChevronRight />
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
                <label className="block mb-1">Өрөөний ерөнхий онцлог зүйлс</label>
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
                <label className="block mb-1">Ариун цэврийн өрөөнд</label>
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
              <label className="block mb-1">Үнэгүй 1 удаагийн хэрэгсэл</label>
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
              <label className="block mb-1">Нэмэлт:</label>
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
              <label className="block mb-1">Нэмэлт тайлбар</label>
              <textarea
                {...register("room_Description")}
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
                <ChevronLeft /> Буцах
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                {roomToEdit ? "Хадгалах" : "Үүсгэх"} <Check />
              </Button>
            </div>
          </div>
        )}

        {/* ─── END Step 2 ───────────────────────────────────────────────────────── */}
      </form>
    </div>
  );
}
