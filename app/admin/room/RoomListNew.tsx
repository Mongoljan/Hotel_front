"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getClientBackendToken } from "@/utils/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader as SSheetHeader, SheetTitle as SSheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Plus,
  Filter,
  Printer,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  ArrowUpDown,
  CheckCircle2,
  Search,
  AlertTriangle,
  Lock,
  Wifi,
  Waves,
  Mountain,
  Cigarette,
  X,
  Star,
} from "lucide-react";
import { IoPerson } from "react-icons/io5";
import { FaChild } from "react-icons/fa6";
import { LuBedSingle, LuBedDouble } from "react-icons/lu";
import { FaCheck } from "react-icons/fa";
import RoomModal from "./RoomModal";
import { toast } from "sonner";
import { buildLookupMaps } from "./_lib/transformers";
import type { RoomData, LookupMaps } from "./_lib/types";
import { useRoomData } from "./_lib/hooks";
import { ApiRequiredNotice } from "./modal/ApiRequiredNotice";

interface RoomListProps {
  isRoomAdded: boolean;
  setIsRoomAdded: (value: boolean) => void;
}

interface HotelRoomLimits {
  totalHotelRooms: number;
  availableRooms: number;
}

// ─── Centered confirm/success modal ─────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: "danger" | "warning";
}

function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, loading, variant = "danger" }: ConfirmModalProps) {
  const isWarning = variant === "warning";
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-sm text-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            isWarning ? "bg-status-warning-muted" : "bg-red/10"
          )}>
            <AlertTriangle className={cn("h-7 w-7", isWarning ? "text-status-warning" : "text-red")} />
          </div>
          <DialogHeader className="items-center space-y-1">
            <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground text-center">{message}</DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="flex-row gap-3 mt-6 sm:justify-center">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button
            className={cn("flex-1 text-white", isWarning ? "bg-primary hover:bg-primary/90" : "bg-red hover:bg-red/90")}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SuccessModalProps {
  open: boolean;
  message: string;
  detail: string;
  closeLabel: string;
  onClose: () => void;
}

function SuccessModal({ open, message, detail, closeLabel, onClose }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm text-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-status-success-muted flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-status-success" />
          </div>
          <DialogHeader className="items-center space-y-1">
            <DialogTitle className="text-base font-semibold">{message}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground text-center">{detail}</DialogDescription>
          </DialogHeader>
        </div>
        <Button className="w-full mt-6" variant="outline" onClick={onClose}>{closeLabel}</Button>
      </DialogContent>
    </Dialog>
  );
}

// ─── Room image gallery sheet (list preview) ───────────────────────────────────

type GalleryFilterId = "all" | "bedroom" | "bathroom" | "kitchen";

interface RoomImageGallerySheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  images: string[];
  hasImageTypeApi: boolean;
  hasProfileApi: boolean;
  hasDeleteApi: boolean;
  tGallery: ReturnType<typeof useTranslations>;
  tModal: ReturnType<typeof useTranslations>;
}

function RoomImageGallerySheet({
  open,
  onClose,
  title,
  images,
  hasImageTypeApi,
  hasProfileApi,
  hasDeleteApi,
  tGallery,
  tModal,
}: RoomImageGallerySheetProps) {
  const [activeFilter, setActiveFilter] = useState<GalleryFilterId>("all");
  const [profileIdx, setProfileIdx] = useState(0);

  React.useEffect(() => {
    if (!open) return;
    setActiveFilter("all");
    setProfileIdx(0);
  }, [open, images]);

  const filters: { id: GalleryFilterId; label: string; count: number }[] = [
    { id: "all", label: tGallery("filterAll"), count: images.length },
    { id: "bedroom", label: tGallery("filterBedroom"), count: 0 },
    { id: "bathroom", label: tGallery("filterBathroom"), count: 0 },
    { id: "kitchen", label: tGallery("filterKitchen"), count: 0 },
  ];

  const visibleImages = activeFilter === "all" ? images : [];

  return (
    <Sheet open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        fallbackTitle={title}
        className="flex h-full flex-col gap-0 p-0 sm:max-w-none"
        style={{ width: 420, maxWidth: 420 }}
      >
        <SSheetHeader className="border-b border-border px-5 py-4 flex-row items-center justify-between space-y-0">
          <SSheetTitle className="text-base font-semibold pr-8">{title}</SSheetTitle>
        </SSheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {filters.map(f => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-border bg-muted text-foreground shadow-sm"
                      : "border-border/70 bg-background text-muted-foreground hover:bg-muted/40"
                  )}
                >
                  {f.label} ({f.count})
                </button>
              );
            })}
          </div>

          {!hasImageTypeApi && (
            <ApiRequiredNotice message={tModal("apiRequiredImageType")} />
          )}
          {activeFilter !== "all" && (
            <p className="text-sm text-muted-foreground">{tGallery("filterUnavailable")}</p>
          )}
          {!hasProfileApi && images.length > 0 && (
            <ApiRequiredNotice message={tModal("apiRequiredProfile")} />
          )}
          {!hasDeleteApi && images.length > 0 && (
            <ApiRequiredNotice message={tGallery("apiRequiredDelete")} />
          )}

          {visibleImages.length === 0 ? (
            <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
              {tGallery("noImagesInFilter")}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {visibleImages.map((src, idx) => {
                const isProfile = profileIdx === idx;
                return (
                  <div
                    key={`${src}-${idx}`}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-xl border bg-muted/20 transition-colors",
                      isProfile ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
                    )}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />

                    <button
                      type="button"
                      onClick={() => setProfileIdx(idx)}
                      className={cn(
                        "group/star absolute top-1.5 left-1.5 z-10 rounded-full p-1.5 shadow transition-all",
                        isProfile
                          ? "bg-warning text-warning-foreground"
                          : "bg-white/90 text-muted-foreground hover:bg-white"
                      )}
                      aria-label={!isProfile ? tModal("setAsProfile") : undefined}
                    >
                      <Star className={cn("h-3.5 w-3.5", isProfile && "fill-current")} />
                      {!isProfile && (
                        <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-1.5 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover/star:opacity-100">
                          {tModal("setAsProfile")}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        toast.info(tGallery("apiRequiredDelete"));
                      }}
                      className="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/55 p-1 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-black/75"
                      aria-label={tGallery("deleteImage")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Room detail panel (Бүртгэлтэй өрөө) ────────────────────────────────────

function getGroupLabel(group: RoomData, lookupMaps: LookupMaps) {
  const catName = group.room_category_name ?? lookupMaps.roomCategoryMap.get(group.room_category) ?? "—";
  const typeName = group.room_type_name ?? lookupMaps.roomTypesMap.get(group.room_type) ?? "—";
  return `${catName} — ${typeName}`;
}

interface RoomDetailPanelProps {
  open: boolean;
  onClose: () => void;
  roomNumber: number;
  group: RoomData;
  allGroups: RoomData[];
  lookupMaps: LookupMaps;
  onTransferRoom: (roomNumber: number, targetGroupId: number) => Promise<void>;
}

function RoomDetailPanel({ open, onClose, roomNumber, group, allGroups, lookupMaps, onTransferRoom }: RoomDetailPanelProps) {
  const tc = useTranslations("Rooms.confirm");
  const [selectedGroupId, setSelectedGroupId] = useState(String(group.id));
  const [isTransferring, setIsTransferring] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{ targetGroupId: number; targetLabel: string } | null>(null);

  React.useEffect(() => {
    setSelectedGroupId(String(group.id));
    setPendingTransfer(null);
  }, [group.id, open]);

  const fromGroupLabel = getGroupLabel(group, lookupMaps);

  const handleGroupChange = (value: string) => {
    const targetId = parseInt(value, 10);
    if (!targetId || targetId === group.id || isTransferring) return;

    const targetGroup = allGroups.find(g => g.id === targetId);
    if (!targetGroup) return;

    setPendingTransfer({
      targetGroupId: targetId,
      targetLabel: getGroupLabel(targetGroup, lookupMaps),
    });
  };

  const handleConfirmTransfer = async () => {
    if (!pendingTransfer) return;
    setIsTransferring(true);
    try {
      await onTransferRoom(roomNumber, pendingTransfer.targetGroupId);
      setSelectedGroupId(String(pendingTransfer.targetGroupId));
      setPendingTransfer(null);
      onClose();
    } catch {
      setPendingTransfer(null);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCancelTransfer = () => {
    if (isTransferring) return;
    setPendingTransfer(null);
  };

  const toggles = [
    { label: "Өрөөнд тамхи татах боломжтой эсэх", icon: <Cigarette className="h-4 w-4" /> },
    { label: "Өрөө интернет холболтой эсэх", icon: <Wifi className="h-4 w-4" /> },
    { label: "Нуур луу харсан", icon: <Waves className="h-4 w-4" /> },
    { label: "Уул руу харсан", icon: <Mountain className="h-4 w-4" /> },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        fallbackTitle="Бүртгэлтэй өрөө"
        className="flex flex-col h-full gap-0 p-0 sm:max-w-none"
        style={{ width: 400, maxWidth: 400 }}
      >
        <SSheetHeader className="border-b border-border px-5 py-4 flex-row items-center justify-between space-y-0">
          <SSheetTitle className="text-base font-semibold">Бүртгэлтэй өрөө</SSheetTitle>
        </SSheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Room number */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Өрөөний №</label>
            <div className="mt-1 h-10 rounded-lg border border-border px-3 flex items-center text-sm font-medium bg-muted/20">
              {roomNumber}
            </div>
          </div>

          {/* Category / Type — change group via dropdown */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Ангилал / Төрөл</label>
            <Select
              value={selectedGroupId}
              onValueChange={handleGroupChange}
              disabled={isTransferring}
            >
              <SelectTrigger className="mt-1 h-10 rounded-lg border-border bg-muted/20 text-sm">
                <SelectValue placeholder="Ангилал / төрөл сонгох" />
              </SelectTrigger>
              <SelectContent>
                {allGroups.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {getGroupLabel(g, lookupMaps)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isTransferring && (
              <p className="mt-1.5 text-xs text-muted-foreground">Өрөө шилжүүлж байна...</p>
            )}
          </div>

          {/* Тохиргоо section */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 bg-muted/30 px-4 py-2.5">
              <span className="text-base font-semibold tracking-wide">Тохиргоо</span>
            </div>
            <div className="p-4 space-y-3">
              {/* API badge */}
              <div className="flex items-center gap-2 rounded-lg bg-status-warning-muted border border-status-warning/30 px-3 py-2">
                <Lock className="h-3.5 w-3.5 text-status-warning flex-shrink-0" />
                <span className="text-xs font-semibold text-status-warning">
                  API шаардлагатай — тохиргоо хадгалагдахгүй
                </span>
              </div>
              {toggles.map(({ label, icon }) => (
                <div key={label} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {icon}
                    <span>{label}</span>
                  </div>
                  {/* Display-only toggle (always off) */}
                  <div className="relative w-9 h-5 rounded-full bg-muted border border-border pointer-events-none">
                    <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Буцах
          </button>
          <button
            disabled
            className="flex-1 h-10 rounded-lg bg-primary/40 text-white text-sm font-medium cursor-not-allowed"
            title="API шаардлагатай"
          >
            Хадгалах
          </button>
        </div>
      </SheetContent>
    </Sheet>

      <ConfirmModal
        open={!!pendingTransfer}
        variant="warning"
        title={tc("transferTitle")}
        message={tc("transferMessage", {
          roomNo: roomNumber,
          fromGroup: fromGroupLabel,
          toGroup: pendingTransfer?.targetLabel ?? "",
        })}
        confirmLabel={tc("transferYes")}
        cancelLabel={tc("transferNo")}
        onConfirm={handleConfirmTransfer}
        onCancel={handleCancelTransfer}
        loading={isTransferring}
      />
    </>
  );
}

// ─── Inline room image carousel (table cell) ───────────────────────────────────

interface RoomRowImageCarouselProps {
  images: string[];
  emptyLabel: string;
  onOpenPreview: () => void;
}

function RoomRowImageCarousel({ images, emptyLabel, onOpenPreview }: RoomRowImageCarouselProps) {
  const [idx, setIdx] = useState(0);
  const imagesKey = images.join("|");

  React.useEffect(() => {
    setIdx(0);
  }, [imagesKey]);

  if (!images.length) {
    return (
      <div className="h-[7.5rem] w-[10.5rem] shrink-0 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-center text-muted-foreground/50 text-xs px-2 text-center">
        {emptyLabel}
      </div>
    );
  }

  const safeIdx = Math.min(idx, images.length - 1);
  const hasMultiple = images.length > 1;

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx(p => (p > 0 ? p - 1 : images.length - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx(p => (p + 1) % images.length);
  };

  return (
    <div className="relative h-[7.5rem] w-[10.5rem] shrink-0 overflow-hidden rounded-xl border border-border/40 bg-muted/20 shadow-sm group/img">
      <button
        type="button"
        className="absolute inset-0 z-0"
        onClick={() => onOpenPreview()}
        aria-label="Preview room images"
      >
        <img
          src={images[safeIdx]}
          alt="Room"
          className="h-full w-full object-cover"
        />
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-white/25 text-white shadow-sm backdrop-blur-md transition-colors hover:bg-white/40"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-white/25 text-white shadow-sm backdrop-blur-md transition-colors hover:bg-white/40"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/35 bg-black/25 px-2 py-1 backdrop-blur-md">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-full transition-all",
                  i === safeIdx
                    ? "h-1.5 w-4 bg-white"
                    : "h-1.5 w-1.5 bg-white/55"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Room number chips ───────────────────────────────────────────────────────

interface RoomChipsProps {
  roomNumbers: number[];
  onAddToGroup: () => void;
  onChipClick: (roomNumber: number) => void;
}

function RoomChips({ roomNumbers, onAddToGroup, onChipClick }: RoomChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 py-3 px-4">
      {/* Add room button */}
      <button
        onClick={onAddToGroup}
        className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
      >
        <Plus className="h-4 w-4" />
      </button>
      {/* Room number chips */}
      {roomNumbers.map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChipClick(num)}
          className="flex items-center border border-border rounded-xl px-2.5 py-1.5 bg-background shadow-sm text-sm font-medium hover:border-primary/50 transition-colors"
        >
          {num}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function RoomListNew({ isRoomAdded, setIsRoomAdded }: RoomListProps) {
  const t = useTranslations("Rooms");
  const tGallery = useTranslations("Rooms.gallery");
  const tModal = useTranslations("Rooms.modal");
  const { user } = useAuth();

  const handleAuthLost = useCallback(() => setIsModalOpen(false), []);

  const { rawRooms, lookup, loading, authError, setAuthError, refreshData } = useRoomData({
    isRoomAdded,
    setIsRoomAdded,
    onAuthLost: handleAuthLost,
  });

  const [hotelRoomLimits, setHotelRoomLimits] = useState<HotelRoomLimits | null>(null);

  React.useEffect(() => {
    const fetchLimits = async () => {
      if (!user?.hotel) return;
      try {
        const token = await getClientBackendToken();
        if (!token) return;
        const res = await fetch(`/api/property-info?property=${user.hotel}&token=${encodeURIComponent(token)}`, { cache: "no-store" });
        if (!res.ok) return;
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          setHotelRoomLimits({ totalHotelRooms: list[0].total_hotel_rooms || 0, availableRooms: list[0].available_rooms || 0 });
        }
      } catch {}
    };
    fetchLimits();
  }, [user?.hotel]);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [addToGroupMode, setAddToGroupMode] = useState(false);
  const [editGroupMode, setEditGroupMode] = useState(false);

  // ── Expand state ─────────────────────────────────────────────────────────────
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Delete state ─────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<RoomData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // ── Room chip detail panel ───────────────────────────────────────────────────
  const [selectedChip, setSelectedChip] = useState<{ roomNumber: number; group: RoomData } | null>(null);

  // ── Image gallery sheet ─────────────────────────────────────────────────────
  const [galleryContext, setGalleryContext] = useState<{
    group: RoomData;
    images: string[];
  } | null>(null);

  const hasRoomImageTypeApi = (lookup?.room_image_types?.length ?? 0) > 0;

  // ── Search ───────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ── Lookup maps ──────────────────────────────────────────────────────────────
  const lookupMaps = useMemo(() => buildLookupMaps(rawRooms, lookup), [rawRooms, lookup]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dev.kacc.mn";
  const resolveImage = (img: string) => {
    if (!img) return "";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    if (img.startsWith("/")) return `${backendUrl}${img}`;
    return img;
  };

  const getGroupImages = (group: RoomData): string[] => {
    return (group.images ?? [])
      .map(i => resolveImage(i.image))
      .filter(Boolean);
  };

  const getFacilityNames = (ids: number[]): string[] =>
    (ids ?? []).map(id => lookupMaps.facilitiesMapMn.get(id)).filter(Boolean) as string[];

  const getBathroomNames = (ids: number[]): string[] =>
    (ids ?? []).map(id => lookupMaps.bathroomItemsMap.get(id)).filter(Boolean) as string[];

  const getCategoryName = (group: RoomData) =>
    group.room_category_name ??
    lookupMaps.roomCategoryMap.get(group.room_category) ??
    `Cat ${group.room_category}`;

  const getTypeName = (group: RoomData) =>
    group.room_type_name ??
    lookupMaps.roomTypesMap.get(group.room_type) ??
    `Type ${group.room_type}`;

  const getBedLabel = (group: RoomData): string => {
    const beds = group.group_beds ?? [];
    if (!beds.length) return "—";
    return beds.map(b => {
      const typeName = lookupMaps.bedTypesMap.get(b.bed_type) ?? "";
      const sizeName = b.bed_size ? lookupMaps.bedSizesMap?.get(b.bed_size.id) ?? b.bed_size.size : "";
      return `${sizeName || typeName}`;
    }).join(", ");
  };

  // ── Filtered rooms ───────────────────────────────────────────────────────────
  const filteredRooms = useMemo(() => {
    if (!search.trim()) return rawRooms;
    const q = search.toLowerCase();
    return rawRooms.filter(g => {
      const catName = getCategoryName(g).toLowerCase();
      const typeName = getTypeName(g).toLowerCase();
      const roomNums = (g.room_numbers ?? []).join(",");
      return catName.includes(q) || typeName.includes(q) || roomNums.includes(q);
    });
  }, [rawRooms, search, lookupMaps]);

  const handlePrint = useCallback(() => {
    if (!filteredRooms.length) {
      toast.error(t("header.printEmpty"));
      return;
    }
    window.print();
  }, [filteredRooms.length, t]);

  const handleDownload = useCallback(() => {
    if (!filteredRooms.length) {
      toast.error(t("header.exportEmpty"));
      return;
    }

    const headers = [
      t("table.colRoom"),
      t("table.colCapacity"),
      t("table.colBed"),
      t("table.colAmenities"),
      "Өрөөний №",
    ];

    const rows = filteredRooms.map(group => {
      const facilityNames = getFacilityNames(group.room_Facilities ?? []);
      const bathroomNames = getBathroomNames(group.bathroom_Items ?? []);
      const amenities = [...facilityNames, ...bathroomNames].join("; ");
      return [
        `${getCategoryName(group)} — ${getTypeName(group)}`,
        `${group.adultQty ?? 0} / ${group.childQty ?? 0}`,
        getBedLabel(group),
        amenities,
        (group.room_numbers ?? []).join(", "),
      ];
    });

    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map(row => row.map(cell => escapeCell(String(cell ?? ""))).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rooms-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("header.exportSuccess"));
  }, [filteredRooms, t, lookupMaps]);

  // ── Modal openers ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setSelectedRoom(null);
    setAddToGroupMode(false);
    setEditGroupMode(false);
    setIsModalOpen(true);
  };

  const openAddToGroup = (group: RoomData) => {
    setSelectedRoom(group);
    setAddToGroupMode(true);
    setEditGroupMode(false);
    setIsModalOpen(true);
  };

  const openEdit = (group: RoomData) => {
    setSelectedRoom(group);
    setEditGroupMode(true);
    setAddToGroupMode(false);
    setIsModalOpen(true);
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token = await getClientBackendToken();
      if (!token) { toast.error("Нэвтрэх шаардлагатай."); setIsDeleting(false); return; }
      const res = await fetch(`/api/roomsNew?id=${deleteTarget.id}&token=${encodeURIComponent(token)}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Устгахад алдаа гарлаа.");
      }
      const name = getCategoryName(deleteTarget);
      setDeleteTarget(null);
      setDeleteSuccess(name);
      setIsRoomAdded(true);
    } catch (err: any) {
      toast.error(err.message || "Устгахад алдаа гарлаа.");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Transfer room to another group ───────────────────────────────────────────
  const transferRoomToGroup = async (roomNumber: number, targetGroupId: number) => {
    const token = await getClientBackendToken();
    if (!token) {
      toast.error("Нэвтрэх шаардлагатай.");
      throw new Error("auth");
    }
    const res = await fetch(`/api/roomsNew/transfer?token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_numbers: [roomNumber], target_room_group_id: targetGroupId }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      const message = e.error || "Шилжүүлэхэд алдаа гарлаа.";
      toast.error(message);
      throw new Error(message);
    }
    toast.success(`Өрөө №${roomNumber} амжилттай шилжүүлэгдлээ`);
    setIsRoomAdded(true);
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalRooms = rawRooms.reduce((s, g) => s + (g.room_numbers?.length ?? 0), 0);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (authError) {
    return (
      <div className="border border-destructive/40 bg-destructive/10 rounded-lg p-8 text-center">
        <p className="font-semibold text-destructive">{t("errors.authRequired")}</p>
        <p className="mt-1 text-sm text-destructive/80">{authError}</p>
      </div>
    );
  }

  return (
    <div className="w-full print:text-foreground">
      {/* ── Header chips ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap print:hidden">
        <div className="flex items-center gap-1.5 border border-border rounded-full px-3 py-1 text-sm bg-background">
          <span className="text-muted-foreground">{t("header.totalRooms")}</span>
          <span className="font-semibold text-foreground">
            {totalRooms}
            {hotelRoomLimits ? `/${hotelRoomLimits.totalHotelRooms}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 border border-border rounded-full px-3 py-1 text-sm bg-background">
          <span className="text-muted-foreground">{t("header.typeCategory")}</span>
          <span className="font-semibold text-foreground">{rawRooms.length}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={t("header.export")}
            aria-label={t("header.export")}
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={t("header.print")}
            aria-label={t("header.print")}
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4 print:hidden">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Өрөө №, төрлөөр хайх"
            className="pl-9 h-9 rounded-full border-border/60 bg-background"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full border-border/60">
            <Filter className="h-4 w-4" />
            Шүүлтүүр
          </Button>
          <Button
            size="sm"
            onClick={openCreate}
            className="h-9 gap-2 rounded-full bg-primary hover:bg-primary/90 text-white border-0"
          >
            <Plus className="h-4 w-4" />
            {t("header.addRoomType")}
          </Button>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div id="room-list-print-area" className="rounded-xl border border-border bg-background p-2 print:border-0 print:p-0">
        {/* Table header */}
        <div className="grid grid-cols-[12.5rem_1fr_140px_160px_1fr_72px] gap-3 rounded-lg border border-border/50 bg-muted/25 px-4 py-2.5 mb-1">
          {[t("table.colImage"), t("table.colRoom"), t("table.colCapacity"), t("table.colBed"), t("table.colAmenities"), ""].map((h, i) => (
            <div key={i} className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              {h}
              {h && <ArrowUpDown className="h-3 w-3 opacity-50" />}
            </div>
          ))}
        </div>

        {/* Table body */}
        {filteredRooms.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">{t("table.noRooms")}</div>
        ) : (
          filteredRooms.map((group) => {
            const images = getGroupImages(group);
            const isExpanded = expanded.has(group.id);
            const categoryName = getCategoryName(group);
            const typeName = getTypeName(group);
            const facilityNames = getFacilityNames(group.room_Facilities ?? []);
            const bathroomNames = getBathroomNames(group.bathroom_Items ?? []);
            const allAmenities = [...facilityNames, ...bathroomNames];
            const displayAmenities = allAmenities.slice(0, 4);
            const moreCount = allAmenities.length - displayAmenities.length;
            const bedLabel = getBedLabel(group);
            const roomCount = group.room_numbers?.length ?? 0;

            return (
              <React.Fragment key={group.id}>
                {/* Group row */}
                <div
                  className={cn(
                    "grid grid-cols-[12.5rem_1fr_140px_160px_1fr_72px] gap-3 px-4 py-3 rounded-lg border border-transparent items-start transition-all",
                    "hover:border-primary/35 hover:bg-muted/15",
                    isExpanded && "border-border/60 bg-muted/10"
                  )}
                >
                  {/* Image + chevron */}
                  <div className="flex items-start gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={() => toggleExpand(group.id)}
                      className="mt-10 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <RoomRowImageCarousel
                      images={images}
                      emptyLabel={t("empty.noImage")}
                      onOpenPreview={() => {
                        setGalleryContext({ group, images });
                      }}
                    />
                  </div>

                  {/* Room name — 16px for type+category, 14px for everything else */}
                  <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-primary text-base leading-tight hover:underline cursor-pointer">
                        {categoryName}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-medium px-2 py-0.5">
                        x {roomCount}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground/80">{typeName}</span>
                    {group.room_short_name && (
                      <span className="text-sm text-muted-foreground">{group.room_short_name}</span>
                    )}
                    <span className="text-sm text-muted-foreground">Хэмжээ: {group.room_size} м²</span>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="inline-flex items-center gap-0.5 border border-border rounded px-1.5 py-0.5 text-xs">
                        <IoPerson className="h-3 w-3" /> x {group.adultQty ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="inline-flex items-center gap-0.5 border border-border rounded px-1.5 py-0.5 text-xs">
                        <FaChild className="h-3 w-3" /> x {group.childQty ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Bed info */}
                  <div className="flex items-start gap-1.5">
                    <span className="inline-flex items-center gap-1 border border-border rounded px-2 py-0.5 text-sm text-muted-foreground">
                      <LuBedDouble className="h-3.5 w-3.5" />
                      x1 ({bedLabel})
                    </span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                    {displayAmenities.map((name, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <FaCheck className="h-2.5 w-2.5 text-status-success flex-shrink-0" />
                        <span className="truncate">{name}</span>
                      </div>
                    ))}
                    {moreCount > 0 && (
                      <button className="text-xs text-primary hover:underline text-left mt-0.5">
                        {t("table.seeMore")} →
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end print:hidden">
                    <button
                      onClick={() => openEdit(group)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Засах"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(group)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-red hover:bg-red/10 transition-colors"
                      title="Устгах"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded: room number chips */}
                {isExpanded && (
                  <div className="mx-2 mb-1 rounded-lg border border-border/40 bg-muted/5 print:hidden">
                    <RoomChips
                      roomNumbers={group.room_numbers ?? []}
                      onAddToGroup={() => openAddToGroup(group)}
                      onChipClick={(num) => setSelectedChip({ roomNumber: num, group })}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* ── Pagination placeholder ─────────────────────────────────────── */}
      {rawRooms.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground print:hidden">
          <span>Хуудас 1: 1–{Math.min(filteredRooms.length, 9)} ({filteredRooms.length})</span>
          <div className="flex items-center gap-1">
            {[1].map(p => (
              <button key={p} className="w-7 h-7 rounded border border-primary bg-primary text-primary-foreground text-xs font-medium">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── RoomModal ─────────────────────────────────────────────────────── */}
      <RoomModal
        key={addToGroupMode ? "add" : editGroupMode ? "edit" : "create"}
        isOpen={isModalOpen}
        onClose={() => {
          const wasAdding = addToGroupMode;
          setIsModalOpen(false);
          setAddToGroupMode(false);
          setEditGroupMode(false);
          if (wasAdding) refreshData();
        }}
        roomToEdit={selectedRoom}
        isRoomAdded={isRoomAdded}
        setIsRoomAdded={setIsRoomAdded}
        existingRooms={rawRooms}
        hotelRoomLimits={hotelRoomLimits}
        addToGroupMode={addToGroupMode}
        editGroupMode={editGroupMode}
        lookupData={lookup}
      />

      {/* ── Delete confirm modal ──────────────────────────────────────────── */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirm.deleteTitle")}
        message={t("confirm.deleteMessage", { name: deleteTarget ? getCategoryName(deleteTarget) : "" })}
        confirmLabel={t("confirm.deleteYes")}
        cancelLabel={t("confirm.deleteNo")}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={isDeleting}
      />

      {/* ── Delete success modal ──────────────────────────────────────────── */}
      <SuccessModal
        open={!!deleteSuccess}
        message={t("confirm.deleteSuccess")}
        detail={t("confirm.deleteSuccessDetail", { name: deleteSuccess ?? "" })}
        closeLabel={t("confirm.close")}
        onClose={() => setDeleteSuccess(null)}
      />

      {/* ── Image gallery sheet ───────────────────────────────────────────── */}
      <RoomImageGallerySheet
        open={!!galleryContext}
        onClose={() => setGalleryContext(null)}
        title={galleryContext ? getTypeName(galleryContext.group) : ""}
        images={galleryContext?.images ?? []}
        hasImageTypeApi={hasRoomImageTypeApi}
        hasProfileApi={false}
        hasDeleteApi={false}
        tGallery={tGallery}
        tModal={tModal}
      />

      {/* ── Room chip detail panel ────────────────────────────────────────── */}
      {selectedChip && (
        <RoomDetailPanel
          open={!!selectedChip}
          onClose={() => setSelectedChip(null)}
          roomNumber={selectedChip.roomNumber}
          group={selectedChip.group}
          allGroups={rawRooms}
          lookupMaps={lookupMaps}
          onTransferRoom={transferRoomToGroup}
        />
      )}
    </div>
  );
}
