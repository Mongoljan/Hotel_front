// RoomList.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import { getClientBackendToken } from "@/utils/auth";

import {
  DataGrid,
  GridColDef,
  GridValidRowModel,
  useGridApiRef
} from "@mui/x-data-grid";

import {
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton
} from "@mui/material";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Building2, Plus, RefreshCw, Sparkles, Users as UsersIcon, Wifi } from "lucide-react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { AiOutlineWifi, AiOutlinePlus } from "react-icons/ai";
import { FaCheck, FaEdit, FaTrashAlt } from "react-icons/fa";
import { GiCigarette } from "react-icons/gi";
import { LiaSmokingBanSolid } from "react-icons/lia";
import { IoPerson } from "react-icons/io5";
import { FaChild } from "react-icons/fa6";
import { LuBedSingle, LuBedDouble } from "react-icons/lu";

import RoomModal from "./RoomModal";
import { toast } from "react-toastify";
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

export default function RoomList({ isRoomAdded, setIsRoomAdded }: RoomListProps) {
  const apiRef = useGridApiRef();
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
  const [searchTerm, setSearchTerm] = useState("");
  const [density, setDensity] = useState<"standard" | "compact">("standard");

  // Which groups are expanded?
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // ─── Modal state for Create / Edit ─────────────────────────────────────────
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

  // Image preview state
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  /////////////////////////////////////////////////////////////////////////////
  // 4) Fetch “/api/all-data/” and “/api/roomsNew/” with caching
  /////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////
  // 5) Build groupMap and lookup maps (with nullish guards)
  ///////////////////////////////////////////////////////////////////////////
  const lookupMaps = React.useMemo<LookupMaps>(
    () => buildLookupMaps(rawRooms, lookup),
    [rawRooms, lookup]
  );

  /////////////////////////////////////////////////////////////////////////////
  // 6) Flatten groups + children into rows[], with the desired layout
  /////////////////////////////////////////////////////////////////////////////
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

  const densityOptions = useMemo(
    () => [
      { value: "standard" as const, label: "Comfort" },
      { value: "compact" as const, label: "Compact" }
    ],
    []
  );

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value) {
      apiRef.current?.setQuickFilterValues([value]);
    } else {
      apiRef.current?.setQuickFilterValues([]);
    }
  };

  const handleRefresh = () => {
    refreshData();
    setSearchTerm("");
    apiRef.current?.setQuickFilterValues([]);
    setAuthError(null);
  };

  const openCreateModal = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  /////////////////////////////////////////////////////////////////////////////
  // 8) Edit / Delete Handlers
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Called when the user clicks “Edit” (FaEdit) on a leaf row.
   * We find the corresponding RoomData in rawRooms, set it as selectedRoom,
   * and open the modal in “Edit” mode.
   */
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

  /**
   * Called when the user clicks “Delete” (FaTrashAlt) on a leaf row.
   * Sends DELETE to /api/roomsNew/<roomId>/?token=<token>, then refreshes the list.
   */
  const handleDelete = async (roomId: number | undefined) => {
    if (roomId == null) return;
    const token = await getClientBackendToken();
    if (!token) {
      const message = "Authentication required. Please sign in again to delete rooms.";
      setAuthError(message);
      toast.error(message);
      return;
    }
    if (
      !confirm(
        "Та үнэхээр энэ өрөөг устгахыг хүсэж байна уу? Энэ үйлдэл буцалтгүй."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `https://dev.kacc.mn/api/roomsNew/${roomId}/?token=${encodeURIComponent(token)}`,
        {
          method: "DELETE"
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete room.");
      }
      toast.success("Room deleted successfully.");
      // Trigger a re-fetch
      setIsRoomAdded(true);
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error(err.message || "Delete failed.");
    }
  };

  //////////////////////////////////////////////
  // 9) Column definitions (with Edit/Delete)
  //////////////////////////////////////////////
  const columns: GridColDef<FlattenRow>[] = [
    //
    // ── Column 1: Arrow ───────────────────────────────────────────────────────
    //
    {
      field: "arrowPlaceholder",
      headerName: "",
      width: 48,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          const grpKey = params.row.arrowPlaceholder!;
          return (
            <IconButton
              size="small"
              onClick={() => {
                const newSet = new Set(expanded);
                if (newSet.has(grpKey)) newSet.delete(grpKey);
                else newSet.add(grpKey);
                setExpanded(newSet);
              }}
            >
              {expanded.has(grpKey) ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          );
        }
        return null;
      }
    },

    //
    // ── Column 2: “Зураг” ──────────────────────────────────────────────────────
    //
    {
      field: "images",
      headerName: "Зураг",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (params.row.isGroup && params.value?.length) {
          return (
            <div style={{ display: "flex", gap: 4 }}>
              {params.value.map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Room img ${idx}`}
                  style={{
                    height: 48,
                    width: 64,
                    objectFit: "cover",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setPreviewImages(params.value);
                    setCurrentImageIndex(idx);
                    setIsImageModalOpen(true);
                  }}
                />
              ))}
            </div>
          );
        }
        return null;
      }
    },

    //
    // ── Column 3: “Өрөөний нэр” ─────────────────────────────────────────────────
    //    Group: three lines — (1) category (bold), (2) type, (3) size + Wi-Fi icon
    //    Leaf: two lines — (1) roomNumberLeaf (bold), (2) viewDescription
    //
    {
      field: "categoryName",
      headerName: "Өрөөний нэр",
      flex: 2,
      sortable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* 1) Category name bold */}
              <span style={{ fontWeight: 600 }}>{params.value} </span>
              {/* 2) Type name */}
              <span
                style={{
                  fontSize: "0.90rem",
                  color: "#333",
                  marginTop: 2
                }}
              >
                {params.row.typeName}
              </span>
              {/* 3) size + Wi-Fi */}
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#555",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 2
                }}
              >
                {params.row.sizeGroup} м²{" "}
                {params.row.hasWifiGroup ? (
                  <AiOutlineWifi color="#000" size={16} />
                ) : (
                  <AiOutlineWifi color="#aaa" size={16} />
                )}
              </span>
            </div>
          );
        } else {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* 1) Room number bold */}
              <span style={{ fontWeight: 600 }}>{params.row.roomNumberLeaf}</span>
              {/* 2) View description */}
              <span style={{ fontSize: "0.85rem", color: "#555" }}>
                {params.row.viewDescription}
              </span>
            </div>
          );
        }
      }
    },

    //
    // ── Column 4: “Өрөөний тоо / Зарах тоо” ────────────────────────────────────
    //    Group: single line = comma-separated roomNumbers
    //    Leaf: two lines — (1) size bold, (2) smoking + Wi-Fi icons
    //
    {
      field: "roomNumbersStr",
      headerName: "Өрөөний тоо / Зарах тоо",
      flex: 1.5,
      sortable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          return (
            <span style={{ fontSize: "0.85rem", color: "#555" }}>
              {params.value}
            </span>
          );
        } else {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* 1) size */}
              <span style={{ fontWeight: 600 }}>{params.row.leafSize} м²</span>
              {/* 2) smoking + Wi-Fi */}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 2
                }}
              >
                {params.row.smokingAllowed ? (
                  <GiCigarette color="#000" size={16} />
                ) : (
                  <LiaSmokingBanSolid color="#d00" size={16} />
                )}
                {params.row.hasWifi ? (
                  <AiOutlineWifi color="#000" size={16} />
                ) : (
                  <AiOutlineWifi color="#aaa" size={16} />
                )}
              </span>
            </div>
          );
        }
      }
    },

    //
    // ── Column 5: “Хүний тоо / Орны тоо” ────────────────────────────────────────
    //
    {
      field: "groupHasAdult",
      headerName: "Хүний тоо / Орны тоо",
      flex: 2,
      sortable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {params.row.groupHasAdult && <IoPerson />}
              {params.row.groupHasChild && <FaChild />}
              {params.row.groupHasSingleBed && <LuBedSingle size={18} />}
              {params.row.groupHasDoubleBed && <LuBedDouble size={18} />}
            </div>
          );
        } else {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <IoPerson /> <span>{params.row.adultQty}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <FaChild /> <span>{params.row.childQty}</span>
              </div>
              {params.row.bedType === 2 ? (
                <LuBedDouble size={18} />
              ) : (
                <LuBedSingle size={18} />
              )}
            </div>
          );
        }
      }
    },

    //
    // ── Column 6: “Ерөнхий онцлог зүйлс” ────────────────────────────────────────
    //
    {
      field: "commonFeaturesArr",
      headerName: "Ерөнхий онцлог зүйлс",
      flex: 3,
      sortable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {(params.value as string[]).map((feat: string, idx: number) => (
                <span
                  key={idx}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <FaCheck color="green" /> <span>{feat}</span>
                </span>
              ))}
            </div>
          );
        } else {
          const arr: string[] = params.row.thisRoomExtraFeaturesArr || [];
          if (arr.length === 0) return null;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {arr.map((feat, i) => (
                <span
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <AiOutlinePlus color="green" /> <span>{feat}</span>
                </span>
              ))}
            </div>
          );
        }
      }
    },

    //
    // ── Column 7: “Угаалгын өрөөнд:” ─────────────────────────────────────────────
    //
    {
      field: "commonBathroomArr",
      headerName: "Угаалгын өрөөнд:",
      flex: 2.5,
      sortable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {(params.value as string[]).map((item: string, idx: number) => (
                <span
                  key={idx}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <FaCheck color="green" /> <span>{item}</span>
                </span>
              ))}
            </div>
          );
        } else {
          const arr: string[] = params.row.thisRoomExtraBathroomArr || [];
          if (arr.length === 0) return null;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {arr.map((item, i) => (
                <span
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <AiOutlinePlus color="green" /> <span>{item}</span>
                </span>
              ))}
            </div>
          );
        }
      }
    },

    //
    // ── Column 8: “Засах” (Edit + Delete) ──────────────────────────────────────
    //
    {
      field: "actions",
      headerName: "Засах",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        // Only show edit/delete for leaf rows (not for group headers)
        if (!params.row.isGroup && params.row.leafRoomId != null) {
          const rid = params.row.leafRoomId;
          return (
            <div style={{ display: "flex", gap: 8 }}>
              {/* Edit Icon */}
              <IconButton
                size="small"
                onClick={() => handleEdit(rid)}
                title="Edit Room"
              >
                <FaEdit />
              </IconButton>

              {/* Delete Icon */}
              <IconButton
                size="small"
                onClick={() => handleDelete(rid)}
                title="Delete Room"
              >
                <FaTrashAlt />
              </IconButton>
            </div>
          );
        }
        return null;
      }
    }
  ];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-8 text-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),transparent_45%)]" />
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Badge variant="outline" className="w-fit border-white/30 bg-white/10 text-white/90 backdrop-blur">
              <Sparkles className="mr-2 h-3.5 w-3.5" /> Room operations
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Hotel rooms, orchestrated with clarity.
            </h1>
            <p className="max-w-xl text-sm text-slate-200/80 md:text-base">
              Keep pace with demand, understand occupancy in seconds, and launch new room types with confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={openCreateModal}
                disabled={!!authError}
                className="group inline-flex items-center gap-2 rounded-full bg-white/95 px-6 py-2 text-slate-900 shadow-lg transition hover:bg-white"
              >
                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                New room
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleRefresh}
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync data
              </Button>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
              <span>Occupancy rate</span>
              <span className="text-2xl font-semibold text-white">{insights.occupancyRate}%</span>
            </div>
            <div className="mt-4">
              <Progress value={Math.min(insights.occupancyRate, 100)} className="h-2 bg-white/20" />
              <p className="mt-3 text-xs text-white/70">
                {formatNumber(insights.sold)} sold · {formatNumber(insights.totalInventory)} total keys
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-white/90">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-white/60">Ready to sell</p>
                <p className="mt-1 text-lg font-semibold">{formatNumber(insights.available)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-white/60">Wifi coverage</p>
                <p className="mt-1 text-lg font-semibold">{insights.wifiShare}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Inventory keys"
          value={formatNumber(insights.totalInventory)}
          helper={`${formatNumber(insights.available)} ready to sell`}
          icon={Building2}
        />
        <StatCard
          label="Distinct room families"
          value={formatNumber(insights.categories)}
          helper="Grouped by type & category"
          icon={Sparkles}
          accent="from-fuchsia-500/30 via-purple-400/20 to-indigo-400/30"
        />
        <StatCard
          label="Avg. guest capacity"
          value={`${formatNumber(insights.avgCapacity, { maximumFractionDigits: 1 })} pax`}
          helper="Adults + children per room"
          icon={UsersIcon}
          accent="from-emerald-500/30 via-teal-400/20 to-sky-400/30"
        />
        <StatCard
          label="Wifi coverage"
          value={`${insights.wifiShare}%`}
          helper="Rooms with high-speed connectivity"
          icon={Wifi}
          accent="from-sky-500/30 via-blue-400/20 to-cyan-300/30"
        />
      </div>

      {authError ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-8 text-center text-destructive">
          <p className="text-lg font-semibold">Authentication required</p>
          <p className="mt-2 text-sm text-destructive/80">{authError}</p>
        </div>
      ) : (
        <>
          <RoomModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            roomToEdit={selectedRoom}
            isRoomAdded={isRoomAdded}
            setIsRoomAdded={setIsRoomAdded}
          />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-xs">
                <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={handleSearchInput}
                  placeholder="Search room numbers, descriptions, amenities..."
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 p-1">
                {densityOptions.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={density === option.value ? "default" : "ghost"}
                    className={cn(
                      "rounded-full px-4",
                      density === option.value ? "" : "text-muted-foreground"
                    )}
                    onClick={() => setDensity(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="border-dashed border-muted-foreground/50 bg-muted/20 text-muted-foreground">
                {relativeSyncedLabel}
              </Badge>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh data
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/60 bg-background/60 p-4 shadow-lg backdrop-blur">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <CircularProgress />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Rooms ({rows.length})</h2>
                </div>
                <DataGrid
                  apiRef={apiRef}
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  pagination
                  autoPageSize={false}
                  pageSizeOptions={[5, 10, 20, 50]}
                  density={density}
                  autoHeight
                  getRowHeight={() => "auto"}
                  disableColumnMenu
                  disableColumnSelector
                  disableRowSelectionOnClick
                  sx={{
                    border: "none",
                    borderRadius: 24,
                    backgroundColor: "transparent",
                    "& .MuiDataGrid-columnHeaders": {
                      borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
                      color: "rgba(71, 85, 105, 0.9)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      backgroundColor: "transparent"
                    },
                    "& .MuiDataGrid-cell": {
                      alignItems: "flex-start",
                      whiteSpace: "normal",
                      borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
                      color: "rgba(30, 41, 59, 0.9)"
                    },
                    "& .MuiDataGrid-row:hover": {
                      backgroundColor: "rgba(59, 130, 246, 0.08)"
                    },
                    "& .MuiDataGrid-virtualScroller": {
                      backgroundColor: "transparent"
                    },
                    "& .MuiDataGrid-footerContainer": {
                      borderTop: "1px solid rgba(148, 163, 184, 0.12)"
                    }
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}

      <Dialog
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Room Images</DialogTitle>
        <DialogContent className="flex justify-center items-center">
          {previewImages.length > 0 && (
            <img
              src={previewImages[currentImageIndex]}
              alt="Room preview"
              style={{
                maxHeight: "70vh",
                maxWidth: "100%",
                objectFit: "contain"
              }}
            />
          )}
        </DialogContent>
        <DialogActions className="justify-between px-6">
          <MuiButton
            onClick={() =>
              setCurrentImageIndex((prev) =>
                prev > 0 ? prev - 1 : previewImages.length - 1
              )
            }
          >
            ◀ Previous
          </MuiButton>
          <MuiButton onClick={() => setIsImageModalOpen(false)}>Close</MuiButton>
          <MuiButton
            onClick={() =>
              setCurrentImageIndex((prev) => (prev + 1) % previewImages.length)
            }
          >
            Next ▶
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
