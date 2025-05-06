"use client";

import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
  DataGrid, GridColDef, GridValidRowModel
} from "@mui/x-data-grid";
import {
  CircularProgress, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, TextField, MenuItem
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Interfaces
interface AllData {
  room_types: { id: number; name: string; is_custom: boolean }[];
  bed_types: { id: number; name: string; is_custom: boolean }[];
  room_category: { id: number; name: string; is_custom: boolean }[];
}

interface RoomData {
  room_number: number;
  room_type: number;
  room_category: number;
  room_size: string;
  bed_type: number;
  is_Bathroom: boolean;
  number_of_rooms: number;
  number_of_rooms_to_sell: number;
  room_Description: string;
  smoking_allowed: boolean;
}

interface PriceEntry {
  id: number;
  base_price: number;
  single_person_price: number | null;
  half_day_price: number | null;
  hotel: number;
  room_type: number;
  room_category: number;
}

interface SeasonalPrice {
  id: number;
  room_price: number;
  start_date: string;
  end_date: string;
  price: number;
}

interface FlattenRow extends GridValidRowModel {
  id: string;
  isGroup: boolean;
  groupKey?: string;
  type: string;
  category: string;
  roomNumber: string;
  size: string;
  bedType: string;
  wc: string;
  numberOfRooms: number;
  numberOfRoomsToSell: number;
  basePrice?: number;
  seasonalPrice?: string;
}

export default function RoomManagement() {
  const hotel = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("userInfo") || "{}").hotel
    : 0;

  const token = Cookies.get("token");

  const [lookup, setLookup] = useState<AllData | null>(null);
  const [rawRooms, setRawRooms] = useState<RoomData[]>([]);
  const [roomPrices, setRoomPrices] = useState<PriceEntry[]>([]);
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [seasonForm, setSeasonForm] = useState({
    room_price: 0,
    start_date: "",
    end_date: "",
    price: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lookupRes, roomRes, priceRes, seasonalRes] = await Promise.all([
        fetch("https://dev.kacc.mn/api/all-data/"),
        fetch(`https://dev.kacc.mn/api/roomsNew/?token=${token}`),
        fetch(`https://dev.kacc.mn/api/room-prices?hotel=${hotel}`),
        fetch(`https://dev.kacc.mn/api/seasonal-prices?hotel=${hotel}`),
      ]);

      const [lookupJson, roomJson, priceJson, seasonalJson] = await Promise.all([
        lookupRes.json(),
        roomRes.json(),
        priceRes.json(),
        seasonalRes.json(),
      ]);

      localStorage.setItem("lookup", JSON.stringify(lookupJson));
      localStorage.setItem("rooms", JSON.stringify(roomJson));
      localStorage.setItem(`prices_${hotel}`, JSON.stringify(priceJson));
      localStorage.setItem(`seasonal_${hotel}`, JSON.stringify(seasonalJson));

      setLookup(lookupJson);
      setRawRooms(roomJson);
      setRoomPrices(priceJson);
      setSeasonalPrices(seasonalJson);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const lookupCache = localStorage.getItem("lookup");
    const roomsCache = localStorage.getItem("rooms");
    const pricesCache = localStorage.getItem(`prices_${hotel}`);
    const seasonalCache = localStorage.getItem(`seasonal_${hotel}`);

    if (lookupCache && roomsCache && pricesCache && seasonalCache) {
      setLookup(JSON.parse(lookupCache));
      setRawRooms(JSON.parse(roomsCache));
      setRoomPrices(JSON.parse(pricesCache));
      setSeasonalPrices(JSON.parse(seasonalCache));
      setLoading(false);
    } else {
      fetchData();
    }
  }, [hotel]);

  const rows: FlattenRow[] = useMemo(() => {
    if (!lookup) return [];

    const typeMap = new Map(lookup.room_types.map(t => [t.id, t.name]));
    const catMap = new Map(lookup.room_category.map(c => [c.id, c.name]));
    const bedMap = new Map(lookup.bed_types.map(b => [b.id, b.name]));

    const priceMap = new Map<string, PriceEntry>();
    roomPrices.forEach(p => {
      const key = `${p.room_type}-${p.room_category}`;
      priceMap.set(key, p);
    });

    const seasonalMap = new Map<number, SeasonalPrice[]>();
    seasonalPrices.forEach(sp => {
      if (!seasonalMap.has(sp.room_price)) seasonalMap.set(sp.room_price, []);
      seasonalMap.get(sp.room_price)!.push(sp);
    });

    const grouped = new Map<string, {
      type: string;
      category: string;
      price?: PriceEntry;
      seasonal?: SeasonalPrice[];
      rooms: RoomData[];
    }>();

    if (Array.isArray(rawRooms)) {
      rawRooms.forEach(r => {
        const key = `${r.room_type}-${r.room_category}`;
        if (!grouped.has(key)) {
          const price = priceMap.get(key);
          grouped.set(key, {
            type: typeMap.get(r.room_type) || `Type ${r.room_type}`,
            category: catMap.get(r.room_category) || `Category ${r.room_category}`,
            price,
            seasonal: price ? seasonalMap.get(price.id) : [],
            rooms: [],
          });
        }
        grouped.get(key)!.rooms.push(r);
      });
    } else {
      console.warn("Invalid or missing rawRooms data:", rawRooms);
    }
    

    const result: FlattenRow[] = [];
    grouped.forEach((grp, key) => {
      const seasonStr = grp.seasonal
        ?.map(s => `${s.price} (${s.start_date}–${s.end_date})`)
        .join(", ") || "";

      result.push({
        id: key,
        isGroup: true,
        type: grp.type,
        category: grp.category,
        roomNumber: `(${grp.rooms.length} rooms)`,
        size: "",
        bedType: "",
        wc: "",
        numberOfRooms: grp.rooms.reduce((acc, r) => acc + r.number_of_rooms, 0),
        numberOfRoomsToSell: grp.rooms.reduce((acc, r) => acc + r.number_of_rooms_to_sell, 0),
        basePrice: grp.price?.base_price,
        seasonalPrice: seasonStr,
      });

      if (expanded.has(key)) {
        grp.rooms.forEach(r => {
          result.push({
            id: `${key}-${r.room_number}`,
            isGroup: false,
            groupKey: key,
            type: "",
            category: "",
            roomNumber: r.room_number.toString(),
            size: `${r.room_size} m²`,
            bedType: bedMap.get(r.bed_type) || `Bed ${r.bed_type}`,
            wc: r.is_Bathroom ? "Yes" : "No",
            numberOfRooms: r.number_of_rooms,
            numberOfRoomsToSell: r.number_of_rooms_to_sell,
          });
        });
      }
    });

    return result;
  }, [lookup, rawRooms, roomPrices, seasonalPrices, expanded]);

  const createSeasonal = async () => {
    await fetch("https://dev.kacc.mn/api/seasonal-prices/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotel, ...seasonForm }),
    });
    // Clear cache and reload
    localStorage.removeItem(`seasonal_${hotel}`);
    setSeasonModalOpen(false);
    setSeasonForm({ room_price: 0, start_date: "", end_date: "", price: 0 });
    fetchData();
  };

  const columns: GridColDef<FlattenRow>[] = [
    {
      field: "roomNumber", headerName: "Room Number", flex: 1,
      renderCell: (params) =>
        params.row.isGroup ? (
          <IconButton size="small" onClick={() => {
            const newSet = new Set(expanded);
            newSet.has(params.row.id) ? newSet.delete(params.row.id) : newSet.add(params.row.id);
            setExpanded(newSet);
          }}>
            {expanded.has(params.row.id) ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        ) : (
          <span style={{ paddingLeft: 24 }}>{params.value}</span>
        )
    },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "basePrice", headerName: "Base Price", flex: 1 },
    { field: "seasonalPrice", headerName: "Seasonal Price", flex: 2 },
  ];

  return (
    <>
      <div className="flex justify-between mb-4">
        <h1 className="text-lg font-semibold">Room Management</h1>
        <Button variant="contained" color="primary" onClick={() => setSeasonModalOpen(true)}>
          + Add Seasonal Price
        </Button>
      </div>

      <div style={{ width: "100%", height: 500 }}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress />
          </div>
        ) : (
          <DataGrid rows={rows} columns={columns} getRowId={(row) => row.id} pageSizeOptions={[5, 10]} autoPageSize />
        )}
      </div>

      <Dialog open={seasonModalOpen} onClose={() => setSeasonModalOpen(false)}>
        <DialogTitle>Add Seasonal Price</DialogTitle>
        <DialogContent>
          <TextField
            select label="Room Price Entry" fullWidth margin="dense"
            value={seasonForm.room_price}
            onChange={e => setSeasonForm(f => ({ ...f, room_price: Number(e.target.value) }))}
          >
            {roomPrices.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {lookup?.room_types.find(t => t.id === p.room_type)?.name} –
                {lookup?.room_category.find(c => c.id === p.room_category)?.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Start Date" type="date" fullWidth margin="dense"
            InputLabelProps={{ shrink: true }}
            value={seasonForm.start_date}
            onChange={e => setSeasonForm(f => ({ ...f, start_date: e.target.value }))}
          />
          <TextField
            label="End Date" type="date" fullWidth margin="dense"
            InputLabelProps={{ shrink: true }}
            value={seasonForm.end_date}
            onChange={e => setSeasonForm(f => ({ ...f, end_date: e.target.value }))}
          />
          <TextField
            label="Price" type="number" fullWidth margin="dense"
            value={seasonForm.price}
            onChange={e => setSeasonForm(f => ({ ...f, price: Number(e.target.value) }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeasonModalOpen(false)}>Cancel</Button>
          <Button onClick={createSeasonal} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
