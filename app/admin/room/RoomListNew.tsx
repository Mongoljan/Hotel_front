// RoomListNew.tsx - Using shadcn components with advanced table functionality
"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { getClientBackendToken } from "@/utils/auth";
import { useAuth } from "@/hooks/useAuth";
import { ColumnDef } from "@tanstack/react-table";

// Hotel room limits type
interface HotelRoomLimits {
  totalHotelRooms: number;
  availableRooms: number;
}

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AdvancedTable, ExportColumn } from "@/components/ui/advanced-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  ImageIcon,
  Info
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
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAuthLost = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);
  
  // Auto-update sync time label every 60 seconds
  const [tick, setTick] = useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, []);
  
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

  // Hotel room limits from property-basic-info API
  const [hotelRoomLimits, setHotelRoomLimits] = useState<HotelRoomLimits | null>(null);

  // Fetch hotel room limits from property-basic-info API (where total_hotel_rooms and available_rooms are stored)
  useEffect(() => {
    const fetchHotelLimits = async () => {
      
      if (!user?.hotel) {
        return;
      }
      
      try {
        // Fetch from property-basic-info API which contains total_hotel_rooms and available_rooms
        const url = `https://dev.kacc.mn/api/property-basic-info/?property=${user.hotel}`;
        
        const res = await fetch(url, { cache: 'no-store' });
        
        if (!res.ok) {
          console.error('Failed to fetch hotel limits:', res.status);
          return;
        }
        
        const basicInfoList = await res.json();
        
        if (Array.isArray(basicInfoList) && basicInfoList.length > 0) {
          const basicInfo = basicInfoList[0];
          
          const limits = {
            totalHotelRooms: basicInfo.total_hotel_rooms || 0,
            availableRooms: basicInfo.available_rooms || 0
          };
          setHotelRoomLimits(limits);
        } else {
        }
      } catch (error) {
        console.error('Error fetching hotel limits:', error);
      }
    };
    
    fetchHotelLimits();
  }, [user?.hotel]);

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
  
  // Bulk delete state
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<number>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

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
    () => {
      const baseRows = createFlattenedRows({
        lookupMaps,
        expandedKeys: expanded
      });

      // Insert preview rows after collapsed groups
      const rowsWithPreviews: FlattenRow[] = [];
      baseRows.forEach((row) => {
        rowsWithPreviews.push(row);

        // If it's a group row and it's NOT expanded, add a preview row
        if (row.isGroup && row.arrowPlaceholder && !expanded.has(row.arrowPlaceholder)) {
          rowsWithPreviews.push({
            ...row,
            id: `${row.id}-preview`,
            isPreviewRow: true,
          } as FlattenRow);
        }
      });

      return rowsWithPreviews;
    },
    [lookupMaps, expanded]
  );

  // Calculate totals from group rows (not individual rooms)
  const groupTotals = useMemo(() => {
    const groupRows = rows.filter(row => row.isGroup && !row.isPreviewRow);
    const totalRooms = groupRows.reduce((sum, row) => sum + (row.totalRoomsInGroup ?? 0), 0);
    const totalForSale = groupRows.reduce((sum, row) => sum + (row.totalRoomsToSellInGroup ?? 0), 0);
    return { totalRooms, totalForSale };
  }, [rows]);

  const insights = useMemo<RoomInsights>(
    () =>
      calculateRoomInsights(rawRooms, {
        facilitiesMapEn: lookupMaps.facilitiesMapEn,
        facilitiesMapMn: lookupMaps.facilitiesMapMn
      }),
    [rawRooms, lookupMaps.facilitiesMapEn, lookupMaps.facilitiesMapMn]
  );

  const relativeSyncedLabel = useMemo(
    () => getRelativeSyncedLabel(lastSynced, t),
    [lastSynced, tick, t] // Include tick to auto-update every 60 seconds
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allRoomIds = new Set(rawRooms.map(room => room.id));
      setSelectedRoomIds(allRoomIds);
    } else {
      setSelectedRoomIds(new Set());
    }
  };

  const handleSelectRoom = (roomId: number, checked: boolean) => {
    const newSelected = new Set(selectedRoomIds);
    if (checked) {
      newSelected.add(roomId);
    } else {
      newSelected.delete(roomId);
    }
    setSelectedRoomIds(newSelected);
  };

  const handleBulkDeleteClick = () => {
    if (selectedRoomIds.size === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    const token = await getClientBackendToken();
    if (!token) {
      const message = "Authentication required. Please sign in again to delete rooms.";
      setAuthError(message);
      toast.error(message);
      setBulkDeleteDialogOpen(false);
      return;
    }

    const deletePromises = Array.from(selectedRoomIds).map(async (roomId) => {
      try {
        const response = await fetch(`/api/rooms?id=${roomId}&token=${token}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || errorData.details || `Failed to delete room ${roomId}`;
          throw new Error(errorMessage);
        }
        return { success: true, roomId };
      } catch (error) {
        console.error(`Error deleting room ${roomId}:`, error);
        return { success: false, roomId, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast.success(`${successCount} өрөө амжилттай устгагдлаа`);
      setIsRoomAdded(true);
    }
    if (failCount > 0) {
      toast.error(`${failCount} өрөө устгахад алдаа гарлаа`);
    }

    setSelectedRoomIds(new Set());
    setBulkDeleteDialogOpen(false);
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
    // Checkbox Column
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={selectedRoomIds.size === rawRooms.length && rawRooms.length > 0}
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        if (row.original.isPreviewRow || row.original.isGroup) return null;
        const roomId = row.original.leafRoomId;
        if (!roomId) return null;
        
        return (
          <Checkbox
            checked={selectedRoomIds.has(roomId)}
            onCheckedChange={(checked) => handleSelectRoom(roomId, !!checked)}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      size: 40,
    },
    
    // Expand/Collapse Column
    {
      id: "expand",
      header: "",
      cell: ({ row, table }) => {
        // Preview row - thin row showing room numbers when collapsed
        if (row.original.isPreviewRow) {
          const roomNumbers = row.original.roomNumbersStr || "";
          
          // If no room numbers, don't show anything
          if (!roomNumbers.trim()) {
            return null;
          }
          
          const roomNumbersArray = roomNumbers.split(",").map(n => n.trim()).filter(n => n);
          
          // If no valid room numbers after filtering, don't show
          if (roomNumbersArray.length === 0) {
            return null;
          }
          
          const shouldTruncate = roomNumbersArray.length > 10;
          const displayNumbers = shouldTruncate
            ? roomNumbersArray.slice(0, 10).join(", ") + "..."
            : roomNumbersArray.join(", ");

          return (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground whitespace-nowrap">Өрөөний №:</span>
              <span className="text-foreground/70">{displayNumbers}</span>
              {shouldTruncate && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 text-xs rounded hover:bg-muted"
                    >
                      <span className="text-muted-foreground">+{roomNumbersArray.length - 10} бусад</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Бүх өрөөний дугаарууд ({roomNumbersArray.length})</h4>
                      <p className="text-sm text-muted-foreground">{roomNumbersArray.join(", ")}</p>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          );
        }

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
      accessorKey: "roomNumberLeaf",
      header: "Зураг",
      cell: ({ row }) => {
        if (row.original.isPreviewRow) return null;

        // Filter out empty or invalid images
        const rawImages = row.original.images || [];
        const images = rawImages.filter((url: string) => {
          if (!url || typeof url !== 'string') return false;
          const trimmed = url.trim();
          return trimmed.length > 0 && (
            trimmed.startsWith('http://') || 
            trimmed.startsWith('https://') || 
            trimmed.startsWith('data:image/')
          );
        });

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
        } else {
          // For individual rooms, show room number
          return (
            <span className="font-semibold text-sm">
              {row.original.roomNumberLeaf}
            </span>
          );
        }
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.roomNumberLeaf ? parseInt(rowA.original.roomNumberLeaf) : 0;
        const b = rowB.original.roomNumberLeaf ? parseInt(rowB.original.roomNumberLeaf) : 0;
        return a - b;
      },
      size: 220,
    },

    // Room Name/Category Column
    {
      accessorKey: "categoryName",
      header: "Өрөөний нэр",
      cell: ({ row }) => {
        if (row.original.isPreviewRow) return null;

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
          // For individual rooms, show size, wifi, and smoking icons
          return (
            <div className="flex items-center gap-2">
              {row.original.leafSize && (
                <span className="text-sm">{row.original.leafSize} м²</span>
              )}
              {row.original.hasWifi ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <Wifi className="h-4 w-4 text-gray-400" />
              )}
              {row.original.smokingAllowed ? (
                <GiCigarette className="h-4 w-4" />
              ) : (
                <LiaSmokingBanSolid className="h-4 w-4 text-red-500" />
              )}
            </div>
          );
        }
      },
      size: 200,
    },



    // Combined Rooms Column (Total / For Sale)
    {
      accessorKey: "totalRoomsInGroup",
      header: "Нийт / Зарах",
      cell: ({ row }) => {
        if (row.original.isPreviewRow) return null;

        if (row.original.isGroup) {
          const total = row.original.totalRoomsInGroup ?? 0;
          const forSale = row.original.totalRoomsToSellInGroup ?? 0;
          
          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium">{total}</span>
                <span className="text-xs text-muted-foreground">нийт</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium text-green-600">{forSale}</span>
                <span className="text-xs text-muted-foreground">зарах</span>
              </div>
            </div>
          );
        } else {
          return null;
        }
      },
      size: 110,
    },

    // Capacity Column
    {
      id: "capacity",
      header: "Хүний тоо / Орны тоо",
      cell: ({ row }) => {
        if (row.original.isPreviewRow) return null;

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

    // Facilities Column (Тохижилт)
    {
      accessorKey: "commonFacilitiesArr",
      header: "Тохижилт",
      cell: ({ row }) => {
        if (row.original.isPreviewRow) return null;

        const features = row.original.isGroup
          ? row.original.commonFacilitiesArr
          : row.original.thisRoomExtraFacilitiesArr || [];

        if (!features?.length) return null;

        const displayFeatures = features.slice(0, 3);
        const hasMore = features.length > 3;

        return (
          <div className="flex flex-col gap-1">
            {displayFeatures.map((feat: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1 text-sm">
                <FaCheck className="h-3 w-3 text-green-600" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
            {hasMore && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-xs text-primary cursor-pointer hover:underline transition-colors text-left">
                    +{features.length - 3} илүү
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" className="w-64 max-h-60 overflow-y-auto">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-medium text-sm mb-2">Бүх тохижилт</h4>
                    {features.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 text-sm">
                        <FaCheck className="h-3 w-3 text-green-600" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 200,
    },

    // Bathroom Column
    {
      accessorKey: "commonBathroomArr",
      header: "Угаалгын өрөөнд",
      cell: ({ row }) => {
        if (row.original.isPreviewRow) return null;

        const bathFeatures = row.original.isGroup
          ? row.original.commonBathroomArr
          : row.original.thisRoomExtraBathroomArr || [];

        if (!bathFeatures?.length) return null;

        const displayFeatures = bathFeatures.slice(0, 3);
        const hasMore = bathFeatures.length > 3;

        return (
          <div className="flex flex-col gap-1">
            {displayFeatures.map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1 text-sm">
                <FaCheck className="h-3 w-3 text-green-600" />
                <span className="truncate">{item}</span>
              </div>
            ))}
            {hasMore && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-xs text-primary cursor-pointer hover:underline transition-colors text-left">
                    +{bathFeatures.length - 3} илүү
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" className="w-64 max-h-60 overflow-y-auto">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-medium text-sm mb-2">Угаалгын өрөөнд</h4>
                    {bathFeatures.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 text-sm">
                        <FaCheck className="h-3 w-3 text-green-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 200,
    },

    // Toiletries Column (Ариун цэврийн хэрэгсэл)
    {
      accessorKey: "commonToiletriesArr",
      header: "Ариун цэврийн хэрэгсэл",
      cell: ({ row }) => {
        if (row.original.isPreviewRow) return null;

        const features = row.original.isGroup
          ? row.original.commonToiletriesArr
          : row.original.thisRoomExtraToiletriesArr || [];

        if (!features?.length) return null;

        const displayFeatures = features.slice(0, 3);
        const hasMore = features.length > 3;

        return (
          <div className="flex flex-col gap-1">
            {displayFeatures.map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1 text-sm">
                <FaCheck className="h-3 w-3 text-green-600" />
                <span className="truncate">{item}</span>
              </div>
            ))}
            {hasMore && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-xs text-primary cursor-pointer hover:underline transition-colors text-left">
                    +{features.length - 3} илүү
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" className="w-64 max-h-60 overflow-y-auto">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-medium text-sm mb-2">Ариун цэврийн хэрэгсэл</h4>
                    {features.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 text-sm">
                        <FaCheck className="h-3 w-3 text-green-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 200,
    },

    // Food & Drink Column (Хоол, ундаа)
    {
      accessorKey: "commonFoodDrinkArr",
      header: "Хоол, ундаа",
      cell: ({ row }) => {
        if (row.original.isPreviewRow) return null;

        const features = row.original.isGroup
          ? row.original.commonFoodDrinkArr
          : row.original.thisRoomExtraFoodDrinkArr || [];

        if (!features?.length) return null;

        const displayFeatures = features.slice(0, 3);
        const hasMore = features.length > 3;

        return (
          <div className="flex flex-col gap-1">
            {displayFeatures.map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1 text-sm">
                <FaCheck className="h-3 w-3 text-green-600" />
                <span className="truncate">{item}</span>
              </div>
            ))}
            {hasMore && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-xs text-primary cursor-pointer hover:underline transition-colors text-left">
                    +{features.length - 3} илүү
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" className="w-64 max-h-60 overflow-y-auto">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-medium text-sm mb-2">Хоол, ундаа</h4>
                    {features.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 text-sm">
                        <FaCheck className="h-3 w-3 text-green-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 200,
    },

    // Outdoor & View Column (Байршил ба үзэмж)
    {
      accessorKey: "commonOutdoorViewArr",
      header: "Байршил ба үзэмж",
      cell: ({ row }) => {
        if (row.original.isPreviewRow) return null;

        const features = row.original.isGroup
          ? row.original.commonOutdoorViewArr
          : row.original.thisRoomExtraOutdoorViewArr || [];

        if (!features?.length) return null;

        const displayFeatures = features.slice(0, 3);
        const hasMore = features.length > 3;

        return (
          <div className="flex flex-col gap-1">
            {displayFeatures.map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1 text-sm">
                <FaCheck className="h-3 w-3 text-green-600" />
                <span className="truncate">{item}</span>
              </div>
            ))}
            {hasMore && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-xs text-primary cursor-pointer hover:underline transition-colors text-left">
                    +{features.length - 3} илүү
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" className="w-64 max-h-60 overflow-y-auto">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-medium text-sm mb-2">Байршил ба үзэмж</h4>
                    {features.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 text-sm">
                        <FaCheck className="h-3 w-3 text-green-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
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
        if (row.original.isPreviewRow) return null;

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

  // Create a map to lookup group data by group key for export
  const groupDataMap = useMemo(() => {
    const map = new Map<string, FlattenRow>();
    rows.forEach(row => {
      if (row.isGroup && row.arrowPlaceholder) {
        map.set(row.arrowPlaceholder, row);
      }
    });
    return map;
  }, [rows]);

  // Helper function to get parent group's common items
  const getParentGroupData = useCallback((leafRow: FlattenRow): FlattenRow | undefined => {
    // Leaf row ID format: "groupKey-roomNumber", extract group key
    const rowId = leafRow.id;
    const lastDashIndex = rowId.lastIndexOf('-');
    if (lastDashIndex > 0) {
      const groupKey = rowId.substring(0, lastDashIndex);
      return groupDataMap.get(groupKey);
    }
    return undefined;
  }, [groupDataMap]);

  // Export columns configuration for CSV export
  const exportColumns: ExportColumn<FlattenRow>[] = useMemo(() => [
    { 
      header: 'Өрөөний дугаар', 
      getValue: (d) => d.roomNumberLeaf || '' 
    },
    { 
      header: 'Категори', 
      getValue: (d) => {
        if (d.categoryName) return d.categoryName;
        const parent = getParentGroupData(d);
        return parent?.categoryName || '';
      }
    },
    { 
      header: 'Төрөл', 
      getValue: (d) => {
        if (d.typeName) return d.typeName;
        const parent = getParentGroupData(d);
        return parent?.typeName || '';
      }
    },
    { 
      header: 'Хэмжээ (м²)', 
      getValue: (d) => d.leafSize || d.sizeGroup || '' 
    },
    { 
      header: 'WiFi', 
      getValue: (d) => d.hasWifi ?? d.hasWifiGroup ?? false
    },
    { 
      header: 'Тамхи зөвшөөрөх', 
      getValue: (d) => d.smokingAllowed ?? false
    },
    { 
      header: 'Том хүн', 
      getValue: (d) => d.adultQty ?? '' 
    },
    { 
      header: 'Хүүхэд', 
      getValue: (d) => d.childQty ?? '' 
    },
    { 
      header: 'Орны төрөл', 
      getValue: (d) => {
        if (d.bedType === 2) return 'Давхар ор';
        if (d.bedType === 1) return 'Ганц ор';
        return '';
      }
    },
    { 
      header: 'Тохижилт', 
      getValue: (d) => {
        const parent = getParentGroupData(d);
        const common = parent?.commonFacilitiesArr || d.commonFacilitiesArr || [];
        const extra = d.thisRoomExtraFacilitiesArr || [];
        return [...common, ...extra];
      }
    },
    { 
      header: 'Угаалгын өрөөнд', 
      getValue: (d) => {
        const parent = getParentGroupData(d);
        const common = parent?.commonBathroomArr || d.commonBathroomArr || [];
        const extra = d.thisRoomExtraBathroomArr || [];
        return [...common, ...extra];
      }
    },
    { 
      header: 'Ариун цэврийн хэрэгсэл', 
      getValue: (d) => {
        const parent = getParentGroupData(d);
        const common = parent?.commonToiletriesArr || d.commonToiletriesArr || [];
        const extra = d.thisRoomExtraToiletriesArr || [];
        return [...common, ...extra];
      }
    },
    { 
      header: 'Хоол ундаа', 
      getValue: (d) => {
        const parent = getParentGroupData(d);
        const common = parent?.commonFoodDrinkArr || d.commonFoodDrinkArr || [];
        const extra = d.thisRoomExtraFoodDrinkArr || [];
        return [...common, ...extra];
      }
    },
    { 
      header: 'Байршил ба үзэмж', 
      getValue: (d) => {
        const parent = getParentGroupData(d);
        const common = parent?.commonOutdoorViewArr || d.commonOutdoorViewArr || [];
        const extra = d.thisRoomExtraOutdoorViewArr || [];
        return [...common, ...extra];
      }
    },
  ], [getParentGroupData]);

  // Filter function for export - only export leaf rows (actual rooms)
  const exportRowFilter = useCallback((row: FlattenRow) => {
    return !row.isGroup && !row.isPreviewRow && row.leafRoomId != null;
  }, []);

  return (
    <div className="">
      {/* Header with metrics */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between  pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Building2 className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">{t('table.title')}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-medium text-foreground">{groupTotals.totalRooms}</span>
                <span>нийт</span>
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1">
                <span className="font-medium text-green-600">{groupTotals.totalForSale}</span>
                <span>зарах</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedRoomIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDeleteClick}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Устгах ({selectedRoomIds.size})
            </Button>
          )}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Шинэчлэх
          </Button> */}
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
            hotelRoomLimits={hotelRoomLimits}
          />

          {/* Advanced Table with sync status in title row */}
          <TooltipProvider>
            <AdvancedTable
              data={rows}
              columns={columns}
              searchPlaceholder={t('search.placeholder')}
              title={
                <div className="flex items-center justify-between w-full">
                  {/* <span>Өрөөнүүд ({rawRooms.length})</span>
                  <Badge variant="outline" className="border-dashed border-muted-foreground/50 bg-muted/20 text-muted-foreground text-xs">
                    {relativeSyncedLabel}
                  </Badge> */}
                </div>
              }
              enableExport={true}
              enableColumnFilter={true}
              enableGlobalSearch={true}
              exportColumns={exportColumns}
              exportRowFilter={exportRowFilter}
            />
          </TooltipProvider>
        </>
      )}

      {/* Image Preview Modal with Carousel Indicators */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader className="pt-2">
            <DialogTitle className="flex items-center justify-between">
              <span>Өрөөний зургууд</span>
              <span className="text-sm font-normal text-muted-foreground mr-6">
                {currentImageIndex + 1} / {previewImages.length}
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
                    "w-3 h-3 rounded-full transition-all duration-200 hover:scale-110 border",
                    index === currentImageIndex
                      ? "bg-primary border-primary scale-110"
                      : "bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500 hover:bg-gray-400 dark:hover:bg-gray-500"
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Олон өрөө устгах</AlertDialogTitle>
            <AlertDialogDescription>
              Та үнэхээр {selectedRoomIds.size} өрөөг устгахыг хүсэж байна уу? Энэ үйлдэл буцалтгүй бөгөөд 
              сонгосон өрөөнүүдтэй холбоотой бүх мэдээлэл устах болно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Бүгдийг устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}