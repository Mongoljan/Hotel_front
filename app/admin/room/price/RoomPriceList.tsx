"use client";

import React, { useEffect, useState, useMemo } from "react";

import Cookies from "js-cookie";
import { DataGrid, GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

// Lookup data types
interface AllData {
  room_types: { id: number; name: string; is_custom: boolean }[];
  room_category: { id: number; name: string; is_custom: boolean }[];
}

// Price entry type
interface PriceEntry {
  id: number;
  base_price: number;
  single_person_price: number | null;
  half_day_price: number | null;
  hotel: number;
  room_type: number;
  room_category: number;
}

// Combined row type with type/category ids
interface RoomRow extends GridValidRowModel {
  id: number;
  roomNumber: number;
  room_type: number;
  room_category: number;
  type: string;
  category: string;
  basePrice: number | null;
  singlePrice: number | null;
  halfDayPrice: number | null;
  numberOfRoomsToSell: number;
}

interface RoomModalProps {
  isRoomAdded: boolean;
  setIsRoomAdded: (value: boolean) => void;
}

export default function RoomPriceList({ isRoomAdded, setIsRoomAdded }: RoomModalProps) {
  const [rows, setRows] = useState<RoomRow[]>([]);
  const [lookup, setLookup] = useState<AllData>({ room_types: [], room_category: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({ room_type: 0, room_category: 0, base_price: 0, single_person_price: 0, half_day_price: 0 });

  // Get hotel id from stored userInfo
  const hotel = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('userInfo') || '{}').hotel
    : 0;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token not found");
        const [allRes, roomsRes, pricesRes] = await Promise.all([
          fetch(`https://dev.kacc.mn/api/all-data/`),
          fetch(`https://dev.kacc.mn/api/roomsNew/?token=${token}`),
          fetch(`https://dev.kacc.mn/api/room-prices?hotel=${hotel}`),
        ]);
        if (!allRes.ok || !roomsRes.ok || !pricesRes.ok) throw new Error("Fetch failed");

        const allData = await allRes.json() as AllData;
        const roomsData = await roomsRes.json();
        const prices: PriceEntry[] = await pricesRes.json();

        // Save lookup lists
        setLookup({ room_types: allData.room_types, room_category: allData.room_category });

        // Map existing prices
        const priceMap = new Map(prices.map(p => [`${p.room_type}-${p.room_category}`, p]));

        const mapped: RoomRow[] = roomsData.map((r: any) => {
          const key = `${r.room_type}-${r.room_category}`;
          const price = priceMap.get(key);
          return {
            id: r.room_number,
            roomNumber: r.room_number,
            room_type: r.room_type,
            room_category: r.room_category,
            type: allData.room_types.find(t => t.id === r.room_type)?.name ?? String(r.room_type),
            category: allData.room_category.find(c => c.id === r.room_category)?.name ?? String(r.room_category),
            basePrice: price?.base_price ?? null,
            singlePrice: price?.single_person_price ?? null,
            halfDayPrice: price?.half_day_price ?? null,
            numberOfRoomsToSell: r.number_of_rooms_to_sell,
          };
        });
        setRows(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        if (isRoomAdded) setIsRoomAdded(false);
      }
    };
    fetchData();
  }, [isRoomAdded, hotel]);

  // Group options by type-category
  const options = useMemo(() => {
    const map = new Map<string, { label: string; count: number; room_type: number; room_category: number }>();
    rows.forEach(r => {
      const key = `${r.room_type}-${r.room_category}`;
      if (!map.has(key)) {
        map.set(key, {
          label: `${r.type} – ${r.category}`,
          count: 1,
          room_type: r.room_type,
          room_category: r.room_category,
        });
      } else {
        map.get(key)!.count++;
      }
    });
    return Array.from(map.values()).map(o => ({
      ...o,
      label: `${o.label} (${o.count} rooms)`,
      value: `${o.room_type}-${o.room_category}`,
    }));
  }, [rows]);

  // Add price
  const createPrice = async () => {
    const token = Cookies.get("token");
    if (!token) throw new Error("Token not found");
    await fetch("https://dev.kacc.mn/api/room-prices/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotel, ...form }),
    });
    setOpenAdd(false);
    setIsRoomAdded(true);
  };

  const columns: GridColDef<RoomRow>[] = [
    { field: "roomNumber", headerName: "Room Number", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "basePrice", headerName: "Base Price", flex: 1 },
    { field: "singlePrice", headerName: "Single Person Price", flex: 1 },
    { field: "halfDayPrice", headerName: "Half Day Price", flex: 1 },
    { field: "numberOfRoomsToSell", headerName: "Rooms for Sale", flex: 1 },
  ];

  return (
    <>
      <div className="w-full">
        <div className="flex justify-between mb-4">
          <h1 className="text-lg font-semibold">Өрөөний үнэ</h1>
          <Button onClick={() => setOpenAdd(true)} variant="contained" color="primary">
            + Өрөөний үнэ нэмэх
          </Button>
        </div>
        <div className="overflow-auto" style={{ width: '100%', height: 500 }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <CircularProgress />
            </div>
          ) : (
            <DataGrid rows={rows} columns={columns} getRowId={r => r.id} pageSizeOptions={[5, 10, 20]} autoPageSize />
          )}
        </div>
      </div>

      {/* Add Price Modal */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Нэмэх Үнийн Мэдээлэл</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Available Room Group"
            value={`${form.room_type}-${form.room_category}`}
            fullWidth
            onChange={e => {
              const [rt, rc] = e.target.value.split('-').map(Number);
              setForm(f => ({ ...f, room_type: rt, room_category: rc }));
            }}
          >
            {options.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Base Price"
            type="number"
            fullWidth
            onChange={e => setForm(f => ({ ...f, base_price: Number(e.target.value) }))}
          />
          <TextField
            margin="dense"
            label="Single Person Price"
            type="number"
            fullWidth
            onChange={e => setForm(f => ({ ...f, single_person_price: Number(e.target.value) }))}
          />
          <TextField
            margin="dense"
            label="Half Day Price"
            type="number"
            fullWidth
            onChange={e => setForm(f => ({ ...f, half_day_price: Number(e.target.value) }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={createPrice} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
