"use client";

import { useMemo, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { ThemeProvider } from "@mui/material/styles";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Edit, Trash2, ChevronDown, ChevronRight, Users, AlertTriangle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useHotelMuiTheme } from "@/styles/mui-theme";
import { groupRooms } from "./utils";
import { GroupedRoomRow, RoomApiResponse, RoomLookupPayload } from "./types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getClientBackendToken } from "@/utils/auth";

interface RoomManagementTableProps {
  rooms: RoomApiResponse[];
  lookups: RoomLookupPayload;
  onEdit: (room: RoomApiResponse) => void;
  onDeleted: () => void;
  loading?: boolean;
}

function AmenityPills({ amenities, overflow }: { amenities?: string[]; overflow?: number }) {
  if (!amenities || amenities.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {amenities.map((name) => (
        <Badge key={name} variant="outline" className="bg-foreground/5 text-foreground">
          {name}
        </Badge>
      ))}
      {overflow && overflow > 0 ? (
        <Badge variant="secondary" className="bg-muted/70 text-muted-foreground">
          +{overflow}
        </Badge>
      ) : null}
    </div>
  );
}

function OccupancyMeter({ sold, total, label }: { sold?: number; total?: number; label: string }) {
  if (total == null || sold == null) return <span className="text-muted-foreground">—</span>;
  const ratio = total > 0 ? Math.round((sold / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{sold}/{total}</div>
      <Tooltip title={`${ratio}%`}>{/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div>
          <Progress value={ratio} className="h-2" aria-label={label} />
        </div>
      </Tooltip>
    </div>
  );
}

function CapacityCell({ adults, kids }: { adults?: number; kids?: number }) {
  if (adults == null && kids == null) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-3 text-sm">
      {typeof adults === "number" ? (
        <span className="inline-flex items-center gap-1 text-foreground">
          <Users className="h-4 w-4 text-muted-foreground" />
          {adults}
        </span>
      ) : null}
      {typeof kids === "number" ? (
        <span className="inline-flex items-center gap-1 text-foreground">
          <Users className="h-4 w-4 text-muted-foreground" />
          {kids}
        </span>
      ) : null}
    </div>
  );
}

function HousekeepingChip({ status, label }: { status?: string; label: (status: string) => string }) {
  if (!status) return <Badge variant="secondary">{label("unknown")}</Badge>;
  const variants: Record<string, string> = {
    clean: "bg-success/20 text-success-600",
    needs_service: "bg-warning/20 text-warning-700",
    occupied: "bg-danger/20 text-danger-600",
  };
  return (
    <Badge className={cn("capitalize", variants[status] ?? "bg-muted/70 text-muted-foreground")}>{label(status)}</Badge>
  );
}

export function RoomManagementTable({ rooms, lookups, onEdit, onDeleted, loading }: RoomManagementTableProps) {
  const locale = useLocale() as "en" | "mn";
  const t = useTranslations("Rooms");
  const theme = useHotelMuiTheme();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const groupResult = useMemo(() => {
    const amenities = {
      facilities: new Map(lookups.room_facilities.map((item) => [item.id, item])),
      bathroomItems: new Map(lookups.bathroom_items.map((item) => [item.id, item])),
      toiletries: new Map(lookups.free_toiletries.map((item) => [item.id, item])),
      foodAndDrink: new Map(lookups.food_and_drink.map((item) => [item.id, item])),
      outdoorAndView: new Map(lookups.outdoor_and_view.map((item) => [item.id, item])),
    };
    return groupRooms(rooms, { locale, lookups, amenities });
  }, [rooms, lookups, locale]);

  const rows = groupResult.rows;

  const toggleParent = (groupId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleDelete = async (room?: RoomApiResponse) => {
    if (!room) return;
    if (!confirm(t("actions.confirmDelete"))) return;
    setBusy(true);
    try {
      const token = await getClientBackendToken();
      if (!token) throw new Error("Missing token");
      const response = await fetch(`https://dev.kacc.mn/api/roomsNew/${room.id}/?token=${token}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success(t("actions.deleteSuccess"));
      onDeleted();
    } catch (error) {
      console.error(error);
      toast.error(t("actions.deleteError"));
    } finally {
      setBusy(false);
    }
  };

  const columns: GridColDef<GroupedRoomRow>[] = [
    {
      field: "expand",
      headerName: "",
      sortable: false,
      filterable: false,
      width: 64,
      renderCell: (params) => {
        if (!params.row.isParent) return null;
        const isOpen = expanded.has(params.row.groupId);
        return (
          <IconButton size="small" onClick={() => toggleParent(params.row.groupId)}>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </IconButton>
        );
      },
    },
    {
      field: "preview",
      headerName: t("columns.preview"),
      minWidth: 120,
      flex: 0.9,
      sortable: false,
      renderCell: (params) => {
        const imageUrl = params.row.previewImage;
        return (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {imageUrl ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border">
                <Image src={imageUrl} alt={params.row.typeName} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-xs text-muted-foreground">
                {t("empty.noImage")}
              </div>
            )}
          </Box>
        );
      },
    },
    {
      field: "name",
      headerName: t("columns.name"),
      flex: 1.6,
      minWidth: 260,
      renderCell: (params) => {
        const isParent = params.row.isParent;
        return (
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-foreground">
              {isParent ? params.row.categoryName : params.row.roomNumberLabel ?? params.row.categoryName}
            </div>
            <div className="text-sm text-muted-foreground">
              {params.row.typeName}
              {params.row.sizeLabel ? ` • ${params.row.sizeLabel}` : ""}
            </div>
            {!isParent && params.row.viewDescription ? (
              <div className="text-xs text-muted-foreground">{params.row.viewDescription}</div>
            ) : null}
          </div>
        );
      },
    },
    {
      field: "inventory",
      headerName: t("columns.inventory"),
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <OccupancyMeter sold={params.row.inventorySold} total={params.row.inventoryTotal} label={t("columns.inventory")} />
      ),
    },
    {
      field: "capacity",
      headerName: t("columns.capacity"),
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
  <CapacityCell adults={params.row.adultCapacity} kids={params.row.childCapacity} />
      ),
    },
    {
      field: "amenities",
      headerName: t("columns.amenities"),
      flex: 1.4,
      minWidth: 220,
      renderCell: (params) => (
        <AmenityPills amenities={params.row.amenities} overflow={params.row.amenitiesOverflow} />
      ),
    },
    {
      field: "housekeeping",
      headerName: t("columns.housekeeping"),
      flex: 0.9,
      minWidth: 160,
      renderCell: (params) => <HousekeepingChip status={params.row.housekeepingStatus} label={(status) => t(`status.${status}`)} />,
    },
    {
      field: "actions",
      headerName: t("columns.actions"),
      width: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams<GroupedRoomRow>) => {
        if (params.row.isParent) return null;
        const room = params.row.rawRoom;
        return (
          <div className="flex items-center justify-end gap-2">
            <Tooltip title={t("actions.edit")}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => room && onEdit(room)}
                  aria-label={t("actions.edit")}
                >
                  <Edit className="h-4 w-4" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t("actions.delete")}
            >
              <span>
                <IconButton
                  size="small"
                  disabled={busy}
                  onClick={() => handleDelete(room)}
                  aria-label={t("actions.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const filteredRows = rows.filter((row) => row.isParent || expanded.has(row.groupId));

  return (
    <ThemeProvider theme={theme}>
      <div className="space-y-4">
        <DataGrid
          autoHeight
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          hideFooter
          disableColumnSelector
          disableRowSelectionOnClick
          sx={{
            ".MuiDataGrid-row": {
              "&.Mui-even": {
                backgroundColor: "rgba(255,255,255,0.35)",
              },
            },
          }}
        />
        {filteredRows.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground" />
            <div className="text-lg font-semibold text-foreground">{t("empty.title")}</div>
            <p className="max-w-sm text-sm text-muted-foreground">{t("empty.caption")}</p>
          </div>
        ) : null}
      </div>
    </ThemeProvider>
  );
}
