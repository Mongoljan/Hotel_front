// RoomListNew.tsx - Using shadcn components with advanced table functionality
"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useTranslations } from 'next-intl';
import { getClientBackendToken } from "@/utils/auth";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdvancedTable } from "@/components/ui/advanced-table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Plus, 
  RefreshCw, 
  Sparkles, 
  Users as UsersIcon, 
  Wifi, 
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ImageIcon
} from "lucide-react";

import { AiOutlineWifi, AiOutlinePlus } from "react-icons/ai";
import { FaCheck, FaEdit, FaTrashAlt } from "react-icons/fa";
import { GiCigarette } from "react-icons/gi";
import { LiaSmokingBanSolid } from "react-icons/lia";
import { IoPerson } from "react-icons/io5";
import { FaChild } from "react-icons/fa6";
import { LuBedSingle, LuBedDouble } from "react-icons/lu";

import RoomModal from "./RoomModal";
import { toast } from "sonner";
import {
  buildLookupMaps,
  calculateRoomInsights,
  createFlattenedRows,
  getRelativeSyncedLabel
} from "./_lib/transformers";
import type { FlattenRow, LookupMaps, RoomData, RoomInsights } from "./_lib/types";
import { useRoomData } from "./_lib/hooks";

const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("en-US", options).format(Number.isFinite(value) ? value : 0);

interface RoomListProps {
  isRoomAdded: boolean;
  setIsRoomAdded: (value: boolean) => void;
}

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
};

const StatCard = ({ label, value, helper, icon: Icon, accent }: StatCardProps) => (
  <Card className="relative overflow-hidden border border-border/50 bg-background/70 shadow-xl backdrop-blur">
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-r opacity-40 blur-3xl",
        accent ?? "from-indigo-500/40 via-sky-500/30 to-cyan-500/40"
      )}
    />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      <span className="rounded-full bg-primary/10 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </span>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </CardContent>
  </Card>
);

export default function RoomListNew({ isRoomAdded, setIsRoomAdded }: RoomListProps) {
  const t = useTranslations('Rooms');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAuthLost = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);
  
  const {
    rawRooms,
    lookup,
    loading,
    authError,
    setAuthError,
    lastSynced,
    refreshData
  } = useRoomData({
    isRoomAdded,
    setIsRoomAdded,
    onAuthLost: handleAuthLost
  });

  // Which groups are expanded?
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // ─── Modal state for Create / Edit ─────────────────────────────────────────
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

  // Image preview state
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);

  // Keyboard navigation for image carousel
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isImageModalOpen || previewImages.length <= 1) return;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentImageIndex((prev) =>
          prev > 0 ? prev - 1 : previewImages.length - 1
        );
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCurrentImageIndex((prev) => (prev + 1) % previewImages.length);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setIsImageModalOpen(false);
      }
    };

    if (isImageModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isImageModalOpen, previewImages.length]);

  // Build lookupMaps and flattened rows
  const lookupMaps = React.useMemo<LookupMaps>(
    () => buildLookupMaps(rawRooms, lookup),
    [rawRooms, lookup]
  );

  // Expand all groups by default
  React.useEffect(() => {
    if (lookupMaps.groupMap.size > 0) {
      const allKeys = Array.from(lookupMaps.groupMap.keys());
      setExpanded(new Set(allKeys));
    }
  }, [lookupMaps.groupMap]);

  const rows = useMemo<FlattenRow[]>(
    () =>
      createFlattenedRows({
        lookupMaps,
        expandedKeys: expanded
      }),
    [lookupMaps, expanded]
  );

  const insights = useMemo<RoomInsights>(
    () =>
      calculateRoomInsights(rawRooms, {
        facilitiesMapEn: lookupMaps.facilitiesMapEn,
        facilitiesMapMn: lookupMaps.facilitiesMapMn
      }),
    [rawRooms, lookupMaps.facilitiesMapEn, lookupMaps.facilitiesMapMn]
  );

  const relativeSyncedLabel = useMemo(
    () => getRelativeSyncedLabel(lastSynced),
    [lastSynced]
  );

  const handleRefresh = () => {
    refreshData();
    setAuthError(null);
  };

  const openCreateModal = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  // Edit / Delete Handlers
  const handleEdit = (roomId: number | undefined) => {
    if (roomId == null) return;
    const found = rawRooms.find((r) => r.id === roomId);
    if (!found) {
      console.warn("Room to edit not found:", roomId);
      return;
    }
    setSelectedRoom(found);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (roomId: number | undefined) => {
    if (roomId == null) return;
    setRoomToDelete(roomId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (roomToDelete == null) return;
    
    const token = await getClientBackendToken();
    if (!token) {
      const message = "Authentication required. Please sign in again to delete rooms.";
      setAuthError(message);
      toast.error(message);
      setDeleteDialogOpen(false);
      return;
    }

    try {
      const res = await fetch(
        `https://dev.kacc.mn/api/roomsNew/${roomToDelete}/?token=${encodeURIComponent(token)}`,
        {
          method: "DELETE"
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete room.");
      }
      toast.success("Өрөө амжилттай устгагдлаа.");
      setIsRoomAdded(true);
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error(err.message || "Устгах амжилтгүй.");
      setDeleteDialogOpen(false);
    }
  };

  // Column definitions for shadcn table
  const columns: ColumnDef<FlattenRow>[] = [
    // Expand/Collapse Column
    {
      id: "expand",
      header: "",
      cell: ({ row }) => {
        if (row.original.isGroup) {
          const grpKey = row.original.arrowPlaceholder!;
          const isExpanded = expanded.has(grpKey);
          return (
            <Button
              variant={isExpanded ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                const newSet = new Set(expanded);
                if (newSet.has(grpKey)) newSet.delete(grpKey);
                else newSet.add(grpKey);
                setExpanded(newSet);
              }}
              className={cn(
                "h-8 w-8 p-0 rounded-md border-2 shadow-md transition-all duration-200 text-white",
                isExpanded
                  ? "bg-primary border-primary hover:bg-primary/90 hover:scale-105"
                  : "bg-primary/80 border-primary hover:bg-primary hover:scale-105"
              )}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          );
        }
        return null;
      },
      enableSorting: false,
      size: 50,
    },
    
    // Images Column
    {
      accessorKey: "images",
      header: "Зураг",
      cell: ({ row }) => {
        const images = row.original.images;
        if (row.original.isGroup) {
          // Only show if there are valid images
          if (!images || images.length === 0) {
            return (
              <div className="flex items-center justify-center h-12 w-16 bg-muted/30 rounded border border-border/30">
                <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
              </div>
            );
          }
          
          return (
            <div className="flex gap-1 flex-wrap max-w-[200px]">
              {images.slice(0, 3).map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Room img ${idx}`}
                  className="h-12 w-16 flex-shrink-0 object-cover rounded cursor-pointer border border-border/50 hover:border-primary transition-colors"
                  onClick={() => {
                    setPreviewImages(images);
                    setCurrentImageIndex(idx);
                    setIsImageModalOpen(true);
                  }}
                  onError={(e) => {
                    // Handle broken image links
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ))}
              {images.length > 3 && (
                <div className="h-12 w-16 flex-shrink-0 border border-border/50 rounded flex items-center justify-center bg-muted text-xs font-medium cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    setPreviewImages(images);
                    setCurrentImageIndex(3);
                    setIsImageModalOpen(true);
                  }}
                >
                  +{images.length - 3}
                </div>
              )}
            </div>
          );
        }
        return null;
      },
      enableSorting: false,
      size: 220,
    },

    // Room Name/Category Column
    {
      accessorKey: "categoryName",
      header: "Өрөөний нэр",
      cell: ({ row }) => {
        if (row.original.isGroup) {
          return (
            <div className="flex flex-col space-y-1">
              <span className="font-semibold">{row.original.categoryName}</span>
              <span className="text-sm text-muted-foreground">
                {row.original.typeName}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{row.original.sizeGroup} м²</span>
                {row.original.hasWifiGroup ? (
                  <Wifi className="h-3 w-3 text-green-600" />
                ) : (
                  <Wifi className="h-3 w-3 text-gray-400" />
                )}
              </div>
            </div>
          );
        } else {
          return (
            <div className="flex flex-col space-y-1">
              <span className="font-semibold">{row.original.roomNumberLeaf}</span>
              <span className="text-sm text-muted-foreground">
                {row.original.viewDescription}
              </span>
            </div>
          );
        }
      },
      size: 200,
    },

    // Room Numbers/Size Column
    {
      accessorKey: "roomNumbersStr",
      header: "Өрөөний тоо / Зарах тоо",
      cell: ({ row }) => {
        if (row.original.isGroup) {
          return (
            <span className="text-sm text-muted-foreground">
              {row.original.roomNumbersStr}
            </span>
          );
        } else {
          return (
            <div className="flex flex-col space-y-1">
              <span className="font-semibold">{row.original.leafSize} м²</span>
              <div className="flex items-center gap-2">
                {row.original.smokingAllowed ? (
                  <GiCigarette className="h-4 w-4" />
                ) : (
                  <LiaSmokingBanSolid className="h-4 w-4 text-red-500" />
                )}
                {row.original.hasWifi ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <Wifi className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          );
        }
      },
      size: 150,
    },

    // Capacity Column
    {
      id: "capacity",
      header: "Хүний тоо / Орны тоо",
      cell: ({ row }) => {
        if (row.original.isGroup) {
          return (
            <div className="flex items-center gap-3">
              {row.original.groupHasAdult && <IoPerson className="h-4 w-4" />}
              {row.original.groupHasChild && <FaChild className="h-4 w-4" />}
              {row.original.groupHasSingleBed && <LuBedSingle className="h-4 w-4" />}
              {row.original.groupHasDoubleBed && <LuBedDouble className="h-4 w-4" />}
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <IoPerson className="h-4 w-4" />
                <span>{row.original.adultQty}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaChild className="h-4 w-4" />
                <span>{row.original.childQty}</span>
              </div>
              {row.original.bedType === 2 ? (
                <LuBedDouble className="h-4 w-4" />
              ) : (
                <LuBedSingle className="h-4 w-4" />
              )}
            </div>
          );
        }
      },
      enableSorting: false,
      size: 200,
    },

    // Features Column
    {
      accessorKey: "commonFeaturesArr",
      header: "Ерөнхий онцлог зүйлс",
      cell: ({ row }) => {
        const features = row.original.isGroup 
          ? row.original.commonFeaturesArr 
          : row.original.thisRoomExtraFeaturesArr || [];
        
        if (!features?.length) return null;
        
        return (
          <div className="flex flex-col gap-1">
            {features.slice(0, 3).map((feat: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1 text-sm">
                <FaCheck className="h-3 w-3 text-green-600" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
            {features.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{features.length - 3} more
              </span>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 250,
    },

    // Bathroom Column
    {
      accessorKey: "commonBathroomArr", 
      header: "Угаалгын өрөөнд",
      cell: ({ row }) => {
        const bathFeatures = row.original.isGroup
          ? row.original.commonBathroomArr
          : row.original.thisRoomExtraBathroomArr || [];
          
        if (!bathFeatures?.length) return null;
        
        return (
          <div className="flex flex-col gap-1">
            {bathFeatures.slice(0, 3).map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1 text-sm">
                <FaCheck className="h-3 w-3 text-green-600" />
                <span className="truncate">{item}</span>
              </div>
            ))}
            {bathFeatures.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{bathFeatures.length - 3} more
              </span>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 200,
    },

    // Actions Column
    {
      id: "actions",
      header: "Засах",
      cell: ({ row }) => {
        if (!row.original.isGroup && row.original.leafRoomId != null) {
          const roomId = row.original.leafRoomId;
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(roomId)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(roomId)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          );
        }
        return null;
      },
      enableSorting: false,
      size: 100,
    },
  ];

  return (
    <div className="">
      {/* Header with metrics */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Өрөөний удирдлага</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatNumber(insights.totalInventory)} өрөө</span>
            <span>•</span>
            <span>{formatNumber(insights.available)} боломжтой</span>
            <span>•</span>
            <span>{insights.occupancyRate}% эзэлхүүн</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Шинэчлэх
          </Button>
          <Button
            onClick={openCreateModal}
            disabled={!!authError}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Өрөө нэмэх
          </Button>
        </div>
      </div>

      {authError ? (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold text-destructive">{t('errors.authRequired')}</p>
            <p className="mt-2 text-sm text-destructive/80">{authError}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <RoomModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            roomToEdit={selectedRoom}
            isRoomAdded={isRoomAdded}
            setIsRoomAdded={setIsRoomAdded}
            existingRooms={rawRooms}
          />

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-dashed border-muted-foreground/50 bg-muted/20 text-muted-foreground">
              {relativeSyncedLabel}
            </Badge>
          </div>

          {/* Advanced Table */}
          <AdvancedTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search rooms, descriptions, amenities..."
            title={`Өрөөнүүд (${rows.length})`}
            enableExport={true}
            enableColumnFilter={true}
            enableGlobalSearch={true}
          />
        </>
      )}

      {/* Image Preview Modal with Carousel Indicators */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Room Images</span>
              <span className="text-sm font-normal text-muted-foreground">
                {currentImageIndex + 1} of {previewImages.length}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            {/* Main Image Display */}
            <div className="flex justify-center items-center min-h-[500px] bg-muted/20 rounded-lg">
              {previewImages.length > 0 && (
                <img
                  src={previewImages[currentImageIndex]}
                  alt={`Room preview ${currentImageIndex + 1}`}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg"
                />
              )}
            </div>
            
            {/* Navigation Arrows */}
            {previewImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev > 0 ? prev - 1 : previewImages.length - 1
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  onClick={() =>
                    setCurrentImageIndex((prev) => (prev + 1) % previewImages.length)
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Carousel Indicators */}
          {previewImages.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              {previewImages.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-200 hover:scale-110",
                    index === currentImageIndex
                      ? "bg-primary scale-110"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail Strip for Better Navigation */}
          {previewImages.length > 3 && (
            <div className="mt-4 max-w-full overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {previewImages.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      "flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-all duration-200",
                      index === currentImageIndex
                        ? "border-primary scale-105"
                        : "border-border hover:border-muted-foreground"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-16 h-12 object-cover"
                    />
                    {index === currentImageIndex && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>Use arrow keys or click dots to navigate</span>
            </div>
            <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Өрөө устгах</AlertDialogTitle>
            <AlertDialogDescription>
              Та үнэхээр энэ өрөөг устгахыг хүсэж байна уу? Энэ үйлдэл буцалтгүй бөгөөд 
              өрөөтэй холбоотой бүх мэдээлэл устах болно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}