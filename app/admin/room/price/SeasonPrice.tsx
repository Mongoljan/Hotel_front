"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { DataGrid, GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Lookup data types
interface AllData {
  room_types: { id: number; name: string; is_custom: boolean }[];
  bed_types: { id: number; name: string; is_custom: boolean }[];
  room_category: { id: number; name: string; is_custom: boolean }[];
}

// Raw room data
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

// Seasonal price type
interface SeasonalPrice {
  id: number;
  room_price: number;
  start_date: string;
  end_date: string;
  price: number;
}

// Flattened row for DataGrid
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

interface RoomManagementProps {
  isRoomAdded: boolean;
  setIsRoomAdded: (value: boolean) => void;
}

export default function RoomManagement({ isRoomAdded, setIsRoomAdded }: RoomManagementProps) {
  const [rawRooms, setRawRooms] = useState<RoomData[]>([]);
  const [roomPrices, setRoomPrices] = useState<PriceEntry[]>([]);
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPrice[]>([]);
  const [lookup, setLookup] = useState<AllData>({ room_types: [], bed_types: [], room_category: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [seasonForm, setSeasonForm] = useState({ room_price: 0, start_date: '', end_date: '', price: 0 });
  const [tableWidth, setTableWidth] = useState(window.innerWidth * 0.4);

  const hotel = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('userInfo') || '{}').hotel
    : 0;

  // Fetch all relevant data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token not found");

        const [allRes, roomsRes, pricesRes, seasonalRes] = await Promise.all([
          fetch("https://dev.kacc.mn/api/all-data/"),
          fetch(`https://dev.kacc.mn/api/roomsNew/?token=${token}`),
          fetch(`https://dev.kacc.mn/api/room-prices?hotel=${hotel}`),
          fetch(`https://dev.kacc.mn/api/seasonal-prices?hotel=${hotel}`),
        ]);
        const [allData, roomsData, pricesData, seasonalData] = await Promise.all([
          allRes.json(),
          roomsRes.json(),
          pricesRes.json(),
          seasonalRes.json(),
        ]);
        setLookup(allData);
        setRawRooms(roomsData);
        setRoomPrices(pricesData);
        setSeasonalPrices(seasonalData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        if (isRoomAdded) setIsRoomAdded(false);
      }
    }
    fetchData();
  }, [isRoomAdded, hotel]);

  // Group raw data by type+category
  const groups = React.useMemo(() => {
    const typeMap = new Map(lookup.room_types.map(t => [t.id, t.name]));
    const categoryMap = new Map(lookup.room_category.map(c => [c.id, c.name]));
    const priceMap = new Map(roomPrices.map(p => [`${p.room_type}-${p.room_category}`, p]));
    const seasonalMap = seasonalPrices.reduce((m, sp) => {
      if (!m.has(sp.room_price)) m.set(sp.room_price, []);
      m.get(sp.room_price)!.push(sp);
      return m;
    }, new Map<number, SeasonalPrice[]>());

    const map = new Map<string, { type: string; category: string; rooms: RoomData[]; price?: PriceEntry; seasonal?: SeasonalPrice[] }>();
    rawRooms.forEach(r => {
      const key = `${r.room_type}-${r.room_category}`;
      if (!map.has(key)) map.set(key, {
        type: typeMap.get(r.room_type) || `Type ${r.room_type}`,
        category: categoryMap.get(r.room_category) || `Category ${r.room_category}`,
        rooms: [],
        price: priceMap.get(key),
        seasonal: priceMap.get(key) && seasonalMap.get(priceMap.get(key)!.id),
      });
      map.get(key)!.rooms.push(r);
    });
    return map;
  }, [rawRooms, lookup, roomPrices, seasonalPrices]);

  // Build flattened rows
  const rows: FlattenRow[] = [];
  groups.forEach((grp, key) => {
    const priceEntry = grp.price;
    const seasonalList = grp.seasonal;
    const seasonalStr = seasonalList ? seasonalList.map(sp => `${sp.price} (${sp.start_date}–${sp.end_date})`).join(", ") : '';

    rows.push({
      id: key,
      isGroup: true,
      type: grp.type,
      category: grp.category,
      roomNumber: `(${grp.rooms.length} rooms)`,
      size: "",
      bedType: "",
      wc: "",
      numberOfRooms: grp.rooms.reduce((sum, r) => sum + r.number_of_rooms, 0),
      numberOfRoomsToSell: grp.rooms.reduce((sum, r) => sum + r.number_of_rooms_to_sell, 0),
      basePrice: priceEntry?.base_price,
      seasonalPrice: seasonalStr,
    });
    if (expanded.has(key)) {
      grp.rooms.forEach(r => rows.push({
        id: `${key}-${r.room_number}`,
        isGroup: false,
        groupKey: key,
        type: '', category: '',
        roomNumber: String(r.room_number),
        size: `${r.room_size} m²`,
        bedType: lookup.bed_types.find(b => b.id === r.bed_type)?.name || `Bed ${r.bed_type}`,
        wc: r.is_Bathroom ? "Yes" : "No",
        numberOfRooms: r.number_of_rooms,
        numberOfRoomsToSell: r.number_of_rooms_to_sell,
        basePrice: priceEntry?.base_price,
        seasonalPrice: seasonalStr,
      }));
    }
  });

  // POST seasonal price
  const createSeason = async () => {
    const token = Cookies.get("token");
    if (!token) return;
    await fetch("https://dev.kacc.mn/api/seasonal-prices/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotel, ...seasonForm }),
    });
    setSeasonModalOpen(false);
    setSeasonForm({ room_price: 0, start_date: '', end_date: '', price: 0 });
    // refresh
    setIsRoomAdded(true);
  };

  // Columns with seasonal pricing
  const columns: GridColDef<FlattenRow>[] = [
    {
      field: 'roomNumber', headerName: 'Room Number', flex: 1,
      renderCell: (params) => params.row.isGroup ? (
        <IconButton size="small" onClick={() => {
          const newSet = new Set(expanded);
          if (newSet.has(params.row.id)) newSet.delete(params.row.id);
          else newSet.add(params.row.id);
          setExpanded(newSet);
        }}>{expanded.has(params.row.id) ? <ExpandMoreIcon /> : <ChevronRightIcon />}</IconButton>
      ) : <span style={{ paddingLeft: 24 }}>{params.value}</span>
    },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'basePrice', headerName: 'Base Price', flex: 1 },
    { field: 'seasonalPrice', headerName: 'Seasonal Price', flex: 2 },
    // { field: 'numberOfRooms', headerName: 'Total Rooms', flex: 1 },
    // { field: 'numberOfRoomsToSell', headerName: 'Rooms for Sale', flex: 1 },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg font-semibold">Улиралын үнэ</h1>
        <Button variant="contained" color="primary" onClick={() => setSeasonModalOpen(true)}>+ Add Seasonal Price</Button>
      </div>

      {/* Seasonal Price Modal */}
      <Dialog open={seasonModalOpen} onClose={() => setSeasonModalOpen(false)}>
        <DialogTitle>Add Seasonal Price</DialogTitle>
        <DialogContent>
          <TextField
            select label="Room Price Entry" fullWidth margin="dense"
            value={seasonForm.room_price}
            onChange={e => setSeasonForm(f => ({ ...f, room_price: Number(e.target.value) }))}
          >
            {roomPrices.map(p => (
              <MenuItem key={p.id} value={p.id}>ID {p.id}: {lookup.room_types.find(t=>t.id===p.room_type)?.name} – {lookup.room_category.find(c=>c.id===p.room_category)?.name}</MenuItem>
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
          <Button onClick={createSeason} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <div className="overflow-auto" style={{ width: tableWidth, height: 500 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full"><CircularProgress /></div>
        ) : (
          <DataGrid rows={rows} columns={columns} getRowId={row=>row.id} pageSizeOptions={[5,10,20]} autoPageSize />
        )}
      </div>
    </div>
  );
}
