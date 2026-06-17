// RoomModal.tsx — 4-step Sheet modal for creating/editing room types
"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useForm, useFieldArray, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSchemaCreateRoom, createSchemaAddToGroup, createSchemaEditGroup } from "@/app/schema";
import { toast } from "sonner";
import { getClientBackendToken } from "@/utils/auth";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations, useLocale } from "next-intl";
import { Star, Coffee, Waves, SprayCan, Mountain } from "lucide-react";
import type { AllData } from "./_lib/types";
import { getPreset, getSmallestBedSizeId, sortBedSizes, sortBedTypes } from "./_lib/presets";
import { API_CREATE_ROOM, AMENITY_PANEL_WIDTH, IMAGE_UPLOAD_PANEL_WIDTH, ROOM_CONFIG_PANEL_WIDTH } from "./modal/constants";
import { sanitizeRoomNumberInput, buildTakenRoomNumberSet, findRoomNumberConflicts } from "./modal/roomNumberInput";
import { AmenityPanel } from "./modal/AmenityPanel";
import { RoomConfigPanel } from "./modal/RoomConfigPanel";
import {
  RoomImageUploadPanel,
  validateRoomImageFile,
  type RoomImageDraft,
} from "./modal/RoomImageUploadPanel";
import type { AmenityKey, FormFields, RoomConfig, RoomModalProps } from "./modal/types";
import { RoomModalSheetLayout } from "./modal/RoomModalSheetLayout";
import { RoomModalFooter } from "./modal/RoomModalFooter";
import { AddToGroupForm } from "./modal/AddToGroupForm";
import { Step1BasicInfo } from "./modal/Step1BasicInfo";
import { Step2Amenities } from "./modal/Step2Amenities";
import type { AmenityDef } from "./modal/Step2Amenities";
import { Step3RoomCount } from "./modal/Step3RoomCount";
import { Step4Images } from "./modal/Step4Images";

export default function RoomModal({
  isOpen,
  onClose,
  roomToEdit,
  isRoomAdded,
  setIsRoomAdded,
  existingRooms,
  hotelRoomLimits,
  addToGroupMode = false,
  editGroupMode = false,
  lookupData,
}: RoomModalProps) {
  const t = useTranslations("Rooms.modal");
  const tv = useTranslations("Rooms.modal.validation");
  const locale = useLocale();
  const { user } = useAuth();

  const isActualEdit = !!roomToEdit && !addToGroupMode;

  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showStepErrors, setShowStepErrors] = useState(false);
  const [activePanel, setActivePanel] = useState<AmenityKey | null>(null);
  const [activeRoomConfigIdx, setActiveRoomConfigIdx] = useState<number | null>(null);
  const [imagePanelMode, setImagePanelMode] = useState<"add" | "edit" | null>(null);
  const [imagePanelIdx, setImagePanelIdx] = useState<number | null>(null);
  const [imageDraft, setImageDraft] = useState<RoomImageDraft>({
    images: "",
    image_type: "",
    descriptions: "",
  });
  const [imageDraftFileSize, setImageDraftFileSize] = useState<number | null>(null);

  const emptyImageDraft: RoomImageDraft = { images: "", image_type: "", descriptions: "" };

  const closeImagePanel = useCallback(() => {
    setImagePanelMode(null);
    setImagePanelIdx(null);
    setImageDraft(emptyImageDraft);
    setImageDraftFileSize(null);
  }, []);

  const totalSteps = addToGroupMode ? 1 : 4;
  const stepLabels = addToGroupMode
    ? [t("label_sellCount")]
    : [t("step1"), t("step2"), t("step3"), t("step4")];

  const [lookup, setLookup] = useState<AllData | null>(lookupData ?? null);
  const [lookupLoading, setLookupLoading] = useState(!lookupData);

  useEffect(() => {
    if (lookupData) { setLookup(lookupData); setLookupLoading(false); return; }
    if (!isOpen) return;
    const fetchLookup = async () => {
      setLookupLoading(true);
      try {
        const token = await getClientBackendToken();
        if (!token) return;
        const res = await fetch(`/api/lookup?token=${encodeURIComponent(token)}`);
        if (res.ok) setLookup(await res.json());
      } catch { toast.error("Мэдээлэл ачааллахад алдаа гарлаа."); }
      finally { setLookupLoading(false); }
    };
    fetchLookup();
  }, [isOpen, lookupData]);

  const roomImageTypeOptions = useMemo(
    () =>
      (lookup?.room_image_types ?? []).map(item => ({
        id: item.id,
        label: locale === "en" ? item.name_en : item.name_mn,
      })),
    [lookup?.room_image_types, locale]
  );
  const hasRoomImageTypeApi = roomImageTypeOptions.length > 0;
  /** Room group images do not expose is_profile on the backend yet (unlike property-images). */
  const hasProfileImageApi = false;

  const validationMessages = useMemo(() => ({
    room_type_required: tv("room_type_required"),
    room_category_required: tv("room_category_required"),
    room_size_required: tv("room_size_required"),
    bed_type_required: tv("bed_type_required"),
    bed_size_required: tv("bed_size_required"),
    bed_quantity_required: tv("bed_quantity_required"),
    beds_required: tv("beds_required"),
    adult_qty_required: tv("adult_qty_required"),
    child_qty_required: tv("child_qty_required"),
    number_of_rooms_int: tv("number_of_rooms_int"),
    number_of_rooms_min: tv("number_of_rooms_min"),
    rooms_to_sell_required: tv("rooms_to_sell_required"),
    rooms_to_sell_number: tv("rooms_to_sell_number"),
    rooms_to_sell_exceed: tv("rooms_to_sell_exceed"),
    room_no_required: tv("room_no_required"),
    select_one: tv("select_one"),
    facility_required: tv("facility_required"),
    image_required: tv("image_required"),
  }), [tv]);

  const schema = useMemo(() => {
    if (addToGroupMode) return createSchemaAddToGroup(validationMessages);
    if (isActualEdit) return createSchemaEditGroup(validationMessages);
    return createSchemaCreateRoom(validationMessages);
  }, [addToGroupMode, isActualEdit, validationMessages]);

  const defaultValues: Partial<FormFields> = {
    room_type: "",
    room_category: "",
    room_short_name: "",
    room_size: "30",
    room_beds: [{ bed_type: "", bed_size: "", quantity: 1 }],
    is_Bathroom: "true",
    adultQty: "",
    childQty: "0",
    room_Facilities: [],
    bathroom_Items: [],
    free_Toiletries: [],
    food_And_Drink: [],
    outdoor_And_View: [],
    room_Description: "",
    smoking_allowed: "false",
    number_of_rooms: 0,
    number_of_rooms_to_sell: "0",
    RoomNo: "",
    entries: [],
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    trigger,
    formState: { isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as any,
  });

  const [roomConfigs, setRoomConfigs] = useState<Record<number, RoomConfig>>({});

  const emptyRoomConfig: RoomConfig = { smoking: false, wifi: false, lakeView: false, mountainView: false };

  const setRoomConfig = (i: number, key: keyof RoomConfig, val: boolean) =>
    setRoomConfigs(prev => ({
      ...prev,
      [i]: { ...emptyRoomConfig, ...prev[i], [key]: val },
    }));

  const { fields: bedFields, append: appendBed, remove: removeBed } = useFieldArray({ control, name: "room_beds" });
  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: "entries" });

  const watchedRoomType = watch("room_type");
  const watchedBeds = watch("room_beds");
  const watchedNumberOfRooms = watch("number_of_rooms");
  const prevRoomTypeRef = useRef<string>("");
  const roomCount = Number(watchedNumberOfRooms) || 0;
  const [roomNumbers, setRoomNumbers] = useState<string[]>([]);

  useEffect(() => {
    setValue("number_of_rooms_to_sell", String(watchedNumberOfRooms || 0));
  }, [watchedNumberOfRooms, setValue]);

  useEffect(() => {
    setRoomNumbers(prev => {
      if (roomCount === prev.length) return prev;
      return Array.from({ length: roomCount }, (_, i) => prev[i] ?? "");
    });
  }, [roomCount]);

  useEffect(() => {
    setValue("RoomNo", roomNumbers.filter(Boolean).join(", "));
  }, [roomNumbers, setValue]);

  const updateRoomNum = (idx: number, val: string) => {
    const sanitized = sanitizeRoomNumberInput(val);
    setRoomNumbers(prev => { const n = [...prev]; n[idx] = sanitized; return n; });
  };

  useEffect(() => {
    const typeId = parseInt(watchedRoomType, 10);
    if (!typeId || isNaN(typeId) || watchedRoomType === prevRoomTypeRef.current) return;
    if (isActualEdit) { prevRoomTypeRef.current = watchedRoomType; return; }
    prevRoomTypeRef.current = watchedRoomType;

    const preset = getPreset(typeId);
    if (preset.manualMode) return;

    if (preset.defaultAdultQty > 0) {
      setValue("adultQty", String(preset.defaultAdultQty));
    }
    setValue("childQty", String(preset.defaultChildQty));

    const defaultSizeId = getSmallestBedSizeId(preset.allowedBedSizeIds);
    if (preset.defaultBedRows.length > 0 && preset.defaultBedRows[0].bedTypeId > 0) {
      const bedRows = preset.defaultBedRows.map(row => ({
        bed_type: String(row.bedTypeId),
        bed_size: defaultSizeId ? String(defaultSizeId) : "",
        quantity: row.quantity,
      }));
      setValue("room_beds", bedRows);
    }
  }, [watchedRoomType, isActualEdit, setValue]);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setCompletedSteps(new Set());
    setShowStepErrors(false);
    setActivePanel(null);
    setActiveRoomConfigIdx(null);

    if (isActualEdit && roomToEdit) {
      const beds = (roomToEdit.group_beds ?? []).map(b => ({
        bed_type: String(b.bed_type),
        bed_size: b.bed_size ? String(b.bed_size.id) : "",
        quantity: b.quantity,
      }));
      const imgs = (roomToEdit.images ?? []).map((i, idx, arr) => {
        const profileIdx = arr.findIndex(img => img.is_profile);
        return {
          images: i.image,
          descriptions: i.description,
          image_type: i.image_type != null ? String(i.image_type) : "",
          is_profile: Boolean(i.is_profile) || (profileIdx === -1 && idx === 0),
        };
      });
      const editRoomNums = (roomToEdit.room_numbers ?? []).map(String);
      const editRoomCount = editRoomNums.length || Number(roomToEdit.number_of_rooms) || 1;
      reset({
        room_type: String(roomToEdit.room_type),
        room_category: String(roomToEdit.room_category),
        room_short_name: roomToEdit.room_short_name ?? "",
        room_size: String(roomToEdit.room_size),
        room_beds: beds.length ? beds : [{ bed_type: "", bed_size: "", quantity: 1 }],
        is_Bathroom: roomToEdit.is_Bathroom ? "true" : "false",
        adultQty: String(roomToEdit.adultQty ?? 0),
        childQty: String(roomToEdit.childQty ?? 0),
        room_Facilities: (roomToEdit.room_Facilities ?? []).map(String),
        bathroom_Items: (roomToEdit.bathroom_Items ?? []).map(String),
        free_Toiletries: (roomToEdit.free_Toiletries ?? []).map(String),
        food_And_Drink: (roomToEdit.food_And_Drink ?? []).map(String),
        outdoor_And_View: (roomToEdit.outdoor_And_View ?? []).map(String),
        room_Description: roomToEdit.room_Description ?? "",
        smoking_allowed: roomToEdit.smoking_allowed ? "true" : "false",
        number_of_rooms: editRoomCount,
        number_of_rooms_to_sell: String(roomToEdit.number_of_rooms_to_sell ?? editRoomCount),
        RoomNo: editRoomNums.join(", "),
        entries: imgs.length ? imgs : [{ images: "", descriptions: "", image_type: "", is_profile: false }],
      } as any);
      setRoomNumbers(Array.from({ length: editRoomCount }, (_, i) => editRoomNums[i] ?? ""));
      setCompletedSteps(new Set([1, 2, 3]));
    } else {
      reset(defaultValues as any);
      setRoomNumbers([]);
    }
  }, [isOpen, roomToEdit, isActualEdit, addToGroupMode, reset]);

  const typeId = parseInt(watchedRoomType, 10);
  const preset = getPreset(isNaN(typeId) ? null : typeId);

  const filteredBedTypes = useMemo(() => {
    const all = lookup?.bed_types ?? [];
    const filtered = preset.manualMode || !preset.allowedBedTypeIds.length
      ? all
      : all.filter(b => preset.allowedBedTypeIds.includes(b.id));
    return sortBedTypes(filtered);
  }, [lookup, preset]);

  const filteredBedSizes = useMemo(() => {
    const all = lookup?.bed_sizes ?? [];
    const filtered = preset.manualMode || !preset.allowedBedSizeIds.length
      ? all
      : all.filter(b => preset.allowedBedSizeIds.includes(b.id));
    return sortBedSizes(filtered);
  }, [lookup, preset]);

  const combinedBedOptions = useMemo(() => {
    return filteredBedTypes.flatMap(bt =>
      filteredBedSizes.map(bs => ({
        value: `${bt.id}:${bs.id}`,
        label: `${bt.name} (${bs.size})`,
        bedTypeId: bt.id,
        bedSizeId: bs.id,
      }))
    );
  }, [filteredBedTypes, filteredBedSizes]);

  useEffect(() => {
    if (preset.manualMode || combinedBedOptions.length !== 1 || isActualEdit) return;
    const only = combinedBedOptions[0];
    const beds = watchedBeds ?? [];
    beds.forEach((bed, idx) => {
      const bt = String(bed?.bed_type ?? "");
      const bs = String(bed?.bed_size ?? "");
      if (bt !== String(only.bedTypeId) || bs !== String(only.bedSizeId)) {
        setValue(`room_beds.${idx}.bed_type`, String(only.bedTypeId));
        setValue(`room_beds.${idx}.bed_size`, String(only.bedSizeId));
      }
    });
  }, [combinedBedOptions, preset.manualMode, watchedBeds, setValue, isActualEdit]);

  const takenRoomNumbers = useMemo(
    () => buildTakenRoomNumberSet(existingRooms, isActualEdit && roomToEdit ? roomToEdit.id : null),
    [existingRooms, isActualEdit, roomToEdit]
  );

  const getRoomNumberConflictMessage = useCallback(
    (numbers: string[]): string | null => {
      const { existing, inForm } = findRoomNumberConflicts(numbers, takenRoomNumbers);
      if (inForm.length) {
        return tv("duplicate_room_number_in_form", { n: inForm.join(", ") });
      }
      if (existing.length) {
        return t("duplicate_room_numbers", { nums: existing.join(", ") });
      }
      return null;
    },
    [takenRoomNumbers, t, tv]
  );

  const validateRoomNumbersOrToast = useCallback(
    (numbers: string[]): boolean => {
      const msg = getRoomNumberConflictMessage(numbers);
      if (!msg) return true;
      toast.error(msg);
      setShowStepErrors(true);
      return false;
    },
    [getRoomNumberConflictMessage]
  );

  const isStep1Valid = () => {
    const rt = watch("room_type");
    const rc = watch("room_category");
    const rs = watch("room_size");
    const beds = watch("room_beds") ?? [];
    const adult = watch("adultQty");
    if (!rt || !rc || !rs) return false;
    if (!beds.length || beds.some(b => !b.bed_type || !b.bed_size)) return false;
    if (!preset.manualMode) {
      if (beds.length !== preset.defaultBedRows.length) return false;
      const bedsMatchPreset = preset.defaultBedRows.every((row, i) => {
        const bed = beds[i];
        if (!bed) return false;
        if (bed.quantity !== row.quantity) return false;
        if (row.bedTypeId > 0 && bed.bed_type !== String(row.bedTypeId)) return false;
        return true;
      });
      if (!bedsMatchPreset) return false;
    }
    if (preset.manualMode && (!adult || parseInt(adult, 10) < 1)) return false;
    return true;
  };

  const isStep2Valid = () => {
    const f = watch("room_Facilities") ?? [];
    const b = watch("bathroom_Items") ?? [];
    const t2 = watch("free_Toiletries") ?? [];
    return f.length > 0 && b.length > 0 && t2.length > 0;
  };

  const isStep3Valid = () => {
    const n = watch("number_of_rooms");
    const rno = watch("RoomNo");
    if (!n || n < 1) return false;
    const nums = (rno ?? "").split(",").map(x => x.trim()).filter(Boolean);
    if (nums.length !== n) return false;
    if (!nums.every(x => !isNaN(parseInt(x, 10)))) return false;
    const { existing, inForm } = findRoomNumberConflicts(nums, takenRoomNumbers);
    return existing.length === 0 && inForm.length === 0;
  };

  const handleImagePanelFile = (file: File) => {
    const err = validateRoomImageFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setImageDraftFileSize(file.size);
    const reader = new FileReader();
    reader.onload = e => {
      setImageDraft(prev => ({ ...prev, images: (e.target?.result as string) ?? "" }));
    };
    reader.readAsDataURL(file);
  };

  const openAddImagePanel = () => {
    setImageDraft(emptyImageDraft);
    setImageDraftFileSize(null);
    setImagePanelMode("add");
    setImagePanelIdx(null);
  };

  const openEditImagePanel = (idx: number) => {
    setImageDraft({
      images: watch(`entries.${idx}.images`) ?? "",
      image_type: watch(`entries.${idx}.image_type`) ?? "",
      descriptions: watch(`entries.${idx}.descriptions`) ?? "",
    });
    setImageDraftFileSize(null);
    setImagePanelMode("edit");
    setImagePanelIdx(idx);
  };

  const saveImagePanel = () => {
    if (hasRoomImageTypeApi && !imageDraft.image_type?.trim()) {
      toast.error("Зургийн төрөл сонгоно уу.");
      return;
    }
    if (!imageDraft.images) {
      toast.error("Зураг оруулна уу.");
      return;
    }
    if (imagePanelMode === "add") {
      const hasProfile = (watch("entries") ?? []).some(e => e.is_profile && e.images?.trim());
      appendImage({
        ...imageDraft,
        is_profile: !hasProfile,
      });
    } else if (imagePanelMode === "edit" && imagePanelIdx !== null) {
      setValue(`entries.${imagePanelIdx}.images`, imageDraft.images);
      if (hasRoomImageTypeApi) {
        setValue(`entries.${imagePanelIdx}.image_type`, imageDraft.image_type);
      }
      setValue(`entries.${imagePanelIdx}.descriptions`, imageDraft.descriptions ?? "");
    }
    closeImagePanel();
  };

  const setAsProfile = (index: number) => {
    imageFields.forEach((_, i) => {
      setValue(`entries.${i}.is_profile`, i === index);
    });
  };

  const handleRemoveImage = (idx: number) => {
    const wasProfile = watch(`entries.${idx}.is_profile`);
    removeImage(idx);
    if (wasProfile) {
      window.setTimeout(() => {
        const entries = watch("entries") ?? [];
        const firstIdx = entries.findIndex(e => {
          const img = e.images?.trim() ?? "";
          return img.startsWith("http") || img.startsWith("data:image/");
        });
        if (firstIdx >= 0) setAsProfile(firstIdx);
      }, 0);
    }
  };

  const onInvalid = (errors: FieldErrors<FormFields>) => {
    const first = Object.values(errors).find(e => e?.message);
    const message = first?.message ?? tv("fill_required_fields");
    toast.error(typeof message === "string" ? message : tv("fill_required_fields"));
    setShowStepErrors(true);
  };

  const extractApiError = (err: Record<string, unknown>, status: number): string => {
    const details = err.details;
    if (details && typeof details === "object") {
      const d = details as Record<string, unknown>;
      const nested = d.RoomNo ?? d.message ?? d.error ?? d.detail;
      if (nested) return Array.isArray(nested) ? String(nested[0]) : String(nested);
    }
    const msg = err.RoomNo ?? err.message ?? err.error ?? err.detail;
    if (msg) return Array.isArray(msg) ? String(msg[0]) : String(msg);
    return `Server error: ${status}`;
  };

  const onSubmit = async (formData: FormFields) => {
    const roomNumbersArr = (formData.RoomNo ?? "")
      .split(",")
      .map(x => x.trim())
      .filter(Boolean)
      .map(x => parseInt(x, 10))
      .filter(x => !isNaN(x));

    if (!addToGroupMode && roomNumbersArr.length === 0) {
      toast.error("Дор хаяж нэг өрөөний дугаар оруулна уу.");
      return;
    }

    if (!addToGroupMode && roomNumbersArr.length !== Number(formData.number_of_rooms ?? 0)) {
      toast.error(tv("enter_valid_room_numbers"));
      setStep(3);
      return;
    }

    if (!validateRoomNumbersOrToast(
      (formData.RoomNo ?? "").split(",").map(x => x.trim()).filter(Boolean)
    )) {
      if (!addToGroupMode) setStep(3);
      return;
    }

    const sellCount = String(formData.number_of_rooms ?? 0);
    formData.number_of_rooms_to_sell = sellCount;

    const submitTypeId = parseInt(formData.room_type, 10);
    const submitPreset = getPreset(isNaN(submitTypeId) ? null : submitTypeId);
    const adultQty = submitPreset.manualMode
      ? Number(formData.adultQty)
      : Number(formData.adultQty) || submitPreset.defaultAdultQty || 1;
    const childQty = Number(formData.childQty) || submitPreset.defaultChildQty || 0;
    const smokingFromConfigs = Object.values(roomConfigs).some(c => c.smoking);
    const smokingAllowed = smokingFromConfigs || formData.smoking_allowed === "true";
    const hotelId = user?.hotel ? Number(user.hotel) : undefined;

    const token = await getClientBackendToken() ?? "";
    if (!token) { toast.error("Нэвтрэх шаардлагатай."); return; }

    try {
      let url: string;
      let method: string;
      let body: Record<string, unknown>;

      if (addToGroupMode && roomToEdit) {
        url = `${API_CREATE_ROOM}?token=${token}`;
        method = "POST";
        body = {
          hotel: hotelId,
          room_type: roomToEdit.room_type,
          room_category: roomToEdit.room_category,
          RoomNo: roomNumbersArr,
        };
      } else if (isActualEdit && roomToEdit) {
        url = `${API_CREATE_ROOM}/${roomToEdit.id}/?token=${token}`;
        method = "PATCH";

        const orig = roomToEdit;
        const newBeds = (formData.room_beds ?? [])
          .filter(b => b.bed_type)
          .map(b => ({ bed_type: Number(b.bed_type), bed_size: Number(b.bed_size), quantity: b.quantity }));
        const origBeds = (orig.group_beds ?? []).map(b => ({
          bed_type: b.bed_type,
          bed_size: b.bed_size?.id ?? 0,
          quantity: b.quantity,
        }));

        const arrEq = (a: number[], b: number[]) =>
          a.length === b.length && [...a].sort().join() === [...b].sort().join();
        const bedEq = (a: typeof newBeds, b: typeof origBeds) =>
          a.length === b.length &&
          a.every((ab, i) => ab.bed_type === b[i].bed_type && ab.bed_size === b[i].bed_size && ab.quantity === b[i].quantity);

        const diff: Record<string, unknown> = {};
        if (Number(formData.room_type) !== orig.room_type) diff.room_type = Number(formData.room_type);
        if (Number(formData.room_category) !== orig.room_category) diff.room_category = Number(formData.room_category);
        if ((formData.room_short_name ?? "") !== (orig.room_short_name ?? "")) diff.room_short_name = formData.room_short_name;
        if (parseFloat(formData.room_size) !== parseFloat(orig.room_size)) diff.room_size = parseFloat(formData.room_size);
        if (!bedEq(newBeds, origBeds)) diff.group_beds = newBeds;
        if ((formData.is_Bathroom === "true") !== orig.is_Bathroom) diff.is_Bathroom = formData.is_Bathroom === "true";
        if (smokingAllowed !== orig.smoking_allowed) diff.smoking_allowed = smokingAllowed;
        if (adultQty !== orig.adultQty) diff.adultQty = adultQty;
        if (Number(formData.childQty) !== orig.childQty) diff.childQty = Number(formData.childQty);
        if (!arrEq((formData.room_Facilities ?? []).map(Number), orig.room_Facilities ?? [])) diff.room_Facilities = (formData.room_Facilities ?? []).map(Number);
        if (!arrEq((formData.bathroom_Items ?? []).map(Number), orig.bathroom_Items ?? [])) diff.bathroom_Items = (formData.bathroom_Items ?? []).map(Number);
        if (!arrEq((formData.free_Toiletries ?? []).map(Number), orig.free_Toiletries ?? [])) diff.free_Toiletries = (formData.free_Toiletries ?? []).map(Number);
        if (!arrEq((formData.food_And_Drink ?? []).map(Number), orig.food_And_Drink ?? [])) diff.food_And_Drink = (formData.food_And_Drink ?? []).map(Number);
        if (!arrEq((formData.outdoor_And_View ?? []).map(Number), orig.outdoor_And_View ?? [])) diff.outdoor_And_View = (formData.outdoor_And_View ?? []).map(Number);
        if ((formData.room_Description ?? "") !== (orig.room_Description ?? "")) diff.room_Description = formData.room_Description;
        if (Number(formData.number_of_rooms_to_sell) !== Number(orig.number_of_rooms_to_sell)) diff.number_of_rooms_to_sell = formData.number_of_rooms_to_sell;

        const imgs = (formData.entries ?? [])
          .filter(e => e.images?.trim())
          .map(e => ({
            image: e.images,
            description: e.descriptions ?? "",
          }));
        if (imgs.length) diff.images = imgs;

        if (!Object.keys(diff).length) { toast.info("Өөрчлөлт олдсонгүй"); return; }
        body = diff;
      } else {
        url = `${API_CREATE_ROOM}?token=${token}`;
        method = "POST";
        body = {
          hotel: hotelId,
          room_type: Number(formData.room_type),
          room_category: Number(formData.room_category),
          room_size: parseFloat(formData.room_size),
          group_beds: (formData.room_beds ?? [])
            .filter(b => b.bed_type)
            .map(b => ({ bed_type: Number(b.bed_type), bed_size: Number(b.bed_size), quantity: b.quantity })),
          is_Bathroom: formData.is_Bathroom === "true",
          room_Facilities: (formData.room_Facilities ?? []).map(Number),
          bathroom_Items: (formData.bathroom_Items ?? []).map(Number),
          free_Toiletries: (formData.free_Toiletries ?? []).map(Number),
          food_And_Drink: (formData.food_And_Drink ?? []).map(Number),
          outdoor_And_View: (formData.outdoor_And_View ?? []).map(Number),
          adultQty,
          childQty,
          number_of_rooms: formData.number_of_rooms,
          number_of_rooms_to_sell: sellCount,
          room_Description: formData.room_Description ?? "",
          smoking_allowed: smokingAllowed,
          RoomNo: roomNumbersArr,
          images: (formData.entries ?? [])
            .filter(e => e.images?.trim())
            .map(e => ({
              image: e.images,
              description: e.descriptions ?? "",
            })),
        };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(extractApiError(err as Record<string, unknown>, res.status));
      }

      toast.success(isActualEdit ? "Бүлгийн мэдээлэл амжилттай шинэчлэгдлээ" : "Өрөөний бүлэг амжилттай бүртгэгдлээ");
      setIsRoomAdded(true);
      onClose();
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("combination") || err.message?.toLowerCase().includes("хослол")) {
        toast.error(t("duplicate_error"));
        setStep(1);
      } else {
        toast.error(err.message || "Алдаа гарлаа.");
      }
    }
  };

  const goNext = useCallback(async () => {
    if (step === 1) {
      const step1Fields: (keyof FormFields)[] = ["room_type", "room_category", "room_size", "room_beds"];
      if (preset.manualMode) step1Fields.push("adultQty");
      const valid = await trigger(step1Fields as any);
      if (!valid || !isStep1Valid()) {
        setShowStepErrors(true);
        toast.error(tv("fill_required_fields"));
        return;
      }
    }
    if (step === 2) {
      const valid = await trigger(["room_Facilities", "bathroom_Items", "free_Toiletries"] as any);
      if (!valid || !isStep2Valid()) {
        setShowStepErrors(true);
        toast.error(tv("select_required_amenities"));
        return;
      }
    }
    if (step === 3) {
      const valid = await trigger(["number_of_rooms", "RoomNo"] as any);
      if (!valid || !isStep3Valid()) {
        setShowStepErrors(true);
        const conflictMsg = getRoomNumberConflictMessage(roomNumbers.map(n => n.trim()).filter(Boolean));
        toast.error(conflictMsg ?? tv("enter_valid_room_numbers"));
        return;
      }
    }
    setShowStepErrors(false);
    setCompletedSteps(prev => new Set(prev).add(step));
    setStep(prev => Math.min(prev + 1, totalSteps));
  }, [step, trigger, isStep1Valid, isStep2Valid, isStep3Valid, totalSteps, preset.manualMode, tv, roomNumbers, getRoomNumberConflictMessage]);

  const goBack = () => setStep(prev => Math.max(prev - 1, 1));
  const handleStepClick = (s: number) => {
    if (s <= step || completedSteps.has(s)) setStep(s);
  };

  const getRoomNumberError = useCallback(
    (index: number, value: string): string | null => {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const n = parseInt(trimmed, 10);
      if (isNaN(n)) return null;
      if (takenRoomNumbers.has(n)) {
        return tv("duplicate_room_number_existing", { n: trimmed });
      }
      const duplicatedInForm = roomNumbers.some(
        (v, i) => i !== index && v.trim() === trimmed
      );
      if (duplicatedInForm) {
        return tv("duplicate_room_number_in_form", { n: trimmed });
      }
      return null;
    },
    [takenRoomNumbers, roomNumbers, tv]
  );

  const amenityDefsWithItems = useMemo(
    () => [
      { key: "room_Facilities" as const, label: t("amenity_facilities"), items: lookup?.room_facilities ?? [], required: true, icon: Star },
      { key: "bathroom_Items" as const, label: t("amenity_bathroom"), items: lookup?.bathroom_items ?? [], required: true, icon: Waves },
      { key: "free_Toiletries" as const, label: t("amenity_toiletries"), items: lookup?.free_toiletries ?? [], required: true, icon: SprayCan },
      { key: "food_And_Drink" as const, label: t("amenity_food"), items: lookup?.food_and_drink ?? [], required: false, icon: Coffee },
      { key: "outdoor_And_View" as const, label: t("amenity_outdoor"), items: lookup?.outdoor_and_view ?? [], required: false, icon: Mountain },
    ],
    [lookup, t]
  );

  const amenityDefs: AmenityDef[] = amenityDefsWithItems.map(({ key, label, required, icon }) => ({
    key,
    label,
    required,
    icon,
  }));

  const getSelectedCount = (key: AmenityKey): number => (watch(key) ?? []).length;

  const panelDef = activePanel ? amenityDefsWithItems.find(a => a.key === activePanel) : null;
  const amenityPanelOpen = step === 2 && !!activePanel && !!panelDef;
  const roomConfigPanelOpen = step === 3 && activeRoomConfigIdx !== null;
  const imagePanelOpen = step === 4 && imagePanelMode !== null;
  const sidePanelOpen = amenityPanelOpen || roomConfigPanelOpen || imagePanelOpen;
  const sidePanelWidth = imagePanelOpen
    ? IMAGE_UPLOAD_PANEL_WIDTH
    : roomConfigPanelOpen
      ? ROOM_CONFIG_PANEL_WIDTH
      : AMENITY_PANEL_WIDTH;

  const sidePanel =
    amenityPanelOpen && panelDef ? (
      <AmenityPanel
        key={activePanel}
        title={panelDef.label}
        items={panelDef.items}
        selectedIds={(watch(panelDef.key) ?? []).map(Number)}
        onSave={(ids) => {
          setValue(panelDef.key, ids.map(String));
          setActivePanel(null);
        }}
        onBack={() => setActivePanel(null)}
      />
    ) : roomConfigPanelOpen && activeRoomConfigIdx !== null ? (
      <RoomConfigPanel
        key={activeRoomConfigIdx}
        roomIndex={activeRoomConfigIdx}
        roomNumber={roomNumbers[activeRoomConfigIdx] ?? ""}
        config={{ ...emptyRoomConfig, ...roomConfigs[activeRoomConfigIdx] }}
        t={t}
        onChange={(key, val) => setRoomConfig(activeRoomConfigIdx, key, val)}
        onBack={() => setActiveRoomConfigIdx(null)}
        onSave={() => setActiveRoomConfigIdx(null)}
      />
    ) : imagePanelOpen && imagePanelMode ? (
      <RoomImageUploadPanel
        key={`${imagePanelMode}-${imagePanelIdx ?? "new"}`}
        mode={imagePanelMode}
        draft={imageDraft}
        t={t}
        hasImageTypeApi={hasRoomImageTypeApi}
        imageTypeOptions={roomImageTypeOptions}
        selectedFileSizeBytes={imageDraftFileSize}
        onDraftChange={patch => setImageDraft(prev => ({ ...prev, ...patch }))}
        onFileSelected={handleImagePanelFile}
        onSave={saveImagePanel}
        onBack={closeImagePanel}
      />
    ) : null;

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setActivePanel(null);
      setActiveRoomConfigIdx(null);
      closeImagePanel();
      onClose();
    }
  };
  const watchedRoomCategory = watch("room_category");
  const watchedRoomSize = watch("room_size");
  const watchedAdultQty = watch("adultQty");

  const showStep1FieldError = (invalid: boolean) => showStepErrors && step === 1 && invalid;
  const showStep3FieldError = (invalid: boolean) => showStepErrors && step === 3 && invalid;

  const step1RoomTypeError = showStep1FieldError(!watchedRoomType);
  const step1RoomCategoryError = showStep1FieldError(!watchedRoomCategory);
  const step1RoomSizeError = showStep1FieldError(!watchedRoomSize?.trim());
  const step1AdultError = showStep1FieldError(
    preset.manualMode && (!watchedAdultQty || parseInt(watchedAdultQty, 10) < 1)
  );
  const step3RoomCountError = showStep3FieldError(!watchedNumberOfRooms || watchedNumberOfRooms < 1);

  useEffect(() => {
    if (step !== 2 && activePanel) setActivePanel(null);
  }, [step, activePanel]);

  useEffect(() => {
    if (step !== 3 && activeRoomConfigIdx !== null) setActiveRoomConfigIdx(null);
  }, [step, activeRoomConfigIdx]);

  useEffect(() => {
    if (step !== 4 && imagePanelMode) closeImagePanel();
  }, [step, imagePanelMode, closeImagePanel]);

  const sheetTitle = addToGroupMode
    ? t("addToGroupTitle")
    : isActualEdit
    ? `${watch("room_category") ? (lookup?.room_category?.find(c => c.id === Number(watch("room_category")))?.name_en ?? "Room") : "Room"}`
    : t("addTitle");

  return (
    <RoomModalSheetLayout
      isOpen={isOpen}
      sheetTitle={sheetTitle}
      sidePanelOpen={sidePanelOpen}
      sidePanelWidth={sidePanelWidth}
      sidePanel={sidePanel}
      onOpenChange={handleSheetOpenChange}
      showStepIndicator={!addToGroupMode}
      step={step}
      stepLabels={stepLabels}
      completedSteps={completedSteps}
      onStepClick={handleStepClick}
      form={
        <form
          id="room-form"
          onSubmit={e => {
            e.preventDefault();
            if (addToGroupMode || step === 4) {
              handleSubmit(onSubmit, onInvalid)(e);
            }
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && !addToGroupMode && step < 4) {
              e.preventDefault();
            }
          }}
          className="flex-1 overflow-y-auto"
        >
          {lookupLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              Мэдээлэл ачааллаж байна...
            </div>
          ) : (
            <>
              {addToGroupMode && roomToEdit && (
                <AddToGroupForm
                  t={t}
                  tv={tv}
                  roomToEdit={roomToEdit}
                  lookup={lookup}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  roomNumbers={roomNumbers}
                  updateRoomNum={updateRoomNum}
                  showStepErrors={showStepErrors}
                  getRoomNumberError={getRoomNumberError}
                />
              )}

              {!addToGroupMode && step === 1 && (
                <Step1BasicInfo
                  control={control}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  t={t}
                  tv={tv}
                  lookup={lookup}
                  preset={preset}
                  combinedBedOptions={combinedBedOptions}
                  bedFields={bedFields}
                  appendBed={appendBed}
                  removeBed={removeBed}
                  step1RoomTypeError={step1RoomTypeError}
                  step1RoomCategoryError={step1RoomCategoryError}
                  step1RoomSizeError={step1RoomSizeError}
                  step1AdultError={step1AdultError}
                  showStep1FieldError={showStep1FieldError}
                />
              )}

              {!addToGroupMode && step === 2 && (
                <Step2Amenities
                  register={register}
                  t={t}
                  tv={tv}
                  amenityDefs={amenityDefs}
                  getSelectedCount={getSelectedCount}
                  setActivePanel={setActivePanel}
                  showStepErrors={showStepErrors}
                />
              )}

              {!addToGroupMode && step === 3 && (
                <Step3RoomCount
                  register={register}
                  setValue={setValue}
                  t={t}
                  tv={tv}
                  roomCount={roomCount}
                  roomNumbers={roomNumbers}
                  setRoomNumbers={setRoomNumbers}
                  updateRoomNum={updateRoomNum}
                  onOpenRoomConfig={setActiveRoomConfigIdx}
                  step3RoomCountError={step3RoomCountError}
                  showStep3FieldError={showStep3FieldError}
                  getRoomNumberError={getRoomNumberError}
                />
              )}

              {!addToGroupMode && step === 4 && (
                <Step4Images
                  t={t}
                  imageFields={imageFields}
                  getImageValue={idx => watch(`entries.${idx}.images`) ?? ""}
                  getImageType={idx => watch(`entries.${idx}.image_type`) ?? ""}
                  getIsProfile={idx => Boolean(watch(`entries.${idx}.is_profile`))}
                  imageTypeOptions={roomImageTypeOptions}
                  hasImageTypeApi={hasRoomImageTypeApi}
                  hasProfileImageApi={hasProfileImageApi}
                  onOpenAddPanel={openAddImagePanel}
                  onOpenEditPanel={openEditImagePanel}
                  onRemoveImage={handleRemoveImage}
                  onSetProfile={setAsProfile}
                />
              )}
            </>
          )}
        </form>
      }
      footer={
        <RoomModalFooter
          step={step}
          addToGroupMode={addToGroupMode}
          isActualEdit={isActualEdit}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onBack={goBack}
          onNext={goNext}
          onFinish={() => handleSubmit(onSubmit, onInvalid)()}
          t={t}
        />
      }
    />
  );
}
