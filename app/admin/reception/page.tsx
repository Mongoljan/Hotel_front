'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  BedSingle,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Minus,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import type { Booking, BookingStatus, Guest, Room, RoomType } from '@/lib/mockStore';

// ─── Constants ─────────────────────────────────────────────────────────────────

const WEEKDAYS_MN = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];
const MONTHS_MN = [
  '1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар',
  '7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар',
];

const STATUS_COLORS: Record<string, string> = {
  checked_in:  'bg-green-500',
  confirmed:   'bg-blue-500',
  checked_out: 'bg-gray-400',
  draft:       'bg-yellow-400',
  cancelled:   'bg-red-200',
};
const STATUS_BAR_BG: Record<string, string> = {
  checked_in:  'bg-green-500/75',
  confirmed:   'bg-primary/75',
  checked_out: 'bg-gray-300',
  draft:       'bg-yellow-400/75',
  cancelled:   'bg-red-200/75',
};
const STATUS_LABEL: Record<string, string> = {
  checked_in:  'Checked-in',
  confirmed:   'Захиалагатай',
  checked_out: 'Checked-out',
  draft:       'Драфт',
  cancelled:   'Цуцлагдсан',
};

const MODAL_STEPS = [
  { id: 1, label: 'Огноо сонгох',   icon: CalendarDays },
  { id: 2, label: 'Өрөө сонгох',    icon: BedSingle   },
  { id: 3, label: 'Зочны мэдээлэл', icon: User        },
  { id: 4, label: 'Төлбөр',         icon: Wallet      },
];

const CHANNELS = [
  { value: 'reception', label: 'Ресепшн'  },
  { value: 'online',    label: 'Онлайн'   },
  { value: 'phone',     label: 'Утас'     },
  { value: 'agency',    label: 'Агентлаг' },
  { value: 'corp',      label: 'Корпорат' },
];

const CHECK_IN_TIMES  = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
const CHECK_OUT_TIMES = ['10:00','11:00','12:00','13:00','14:00'];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface OccupancyDay { date: string; percent: number; occupied: number; total: number }
interface DayStats { total_bookings: number; occupied_rooms: number; total_guests: number; free_rooms: number; revenue: number }
interface AvailRoom { room_type: RoomType; rooms: Room[]; available: number }
interface BookingWithGuest extends Booking { guest?: Guest }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date) { return d.toISOString().split('T')[0]; }

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function nights(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000));
}

function occupancyColor(pct: number) {
  if (pct >= 80) return 'text-green-600';
  if (pct >= 50) return 'text-yellow-600';
  return 'text-red-500';
}
function occupancyBarColor(pct: number) {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-400';
  return 'bg-red-400';
}
function occupancyArrow(pct: number) {
  return pct >= 60
    ? <TrendingUp className="inline ml-0.5 h-3 w-3 text-green-600" />
    : <TrendingDown className="inline ml-0.5 h-3 w-3 text-red-500" />;
}

function fmt(n: number) { return n.toLocaleString('mn-MN') + ' ₮'; }

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReceptionPage() {
  const today = useMemo(() => toDateStr(new Date()), []);

  // ── View state ──────────────────────────────────────────────────────────────
  const [viewMode,   setViewMode]   = useState<'week' | 'month'>('week');
  const [weekStart,  setWeekStart]  = useState<Date>(() => new Date());
  const [monthDate,  setMonthDate]  = useState<Date>(() => new Date());

  // ── Remote data ─────────────────────────────────────────────────────────────
  const [bookings,  setBookings]  = useState<BookingWithGuest[]>([]);
  const [rooms,     setRooms]     = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [guests,    setGuests]    = useState<Guest[]>([]);
  const [occupancy, setOccupancy] = useState<OccupancyDay[]>([]);
  const [stats,     setStats]     = useState<DayStats | null>(null);
  const [availRooms,setAvailRooms]= useState<AvailRoom[]>([]);
  const [loading,   setLoading]   = useState(true);

  // ── Month-view side panel ───────────────────────────────────────────────────
  const [panelDate,   setPanelDate]   = useState<string | null>(null);
  const [panelFilter, setPanelFilter] = useState<string[]>(['check_in','check_out','available']);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [searchQ,        setSearchQ]        = useState('');
  const [filterRoomType, setFilterRoomType] = useState('all');
  const [filterChannel,  setFilterChannel]  = useState('all');

  // ── New-booking modal ────────────────────────────────────────────────────────
  const [modalOpen,  setModalOpen]  = useState(false);
  const [step,       setStep]       = useState(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Step-1 form
  const [checkIn,    setCheckIn]   = useState('');
  const [checkOut,   setCheckOut]  = useState('');
  const [inTime,     setInTime]    = useState('14:00');
  const [outTime,    setOutTime]   = useState('12:00');
  const [channel,    setChannel]   = useState('reception');
  const [corporate,  setCorporate] = useState('none');
  const [adultCount, setAdultCount]= useState(1);
  const [childCount, setChildCount]= useState(0);

  // Step-2 form
  const [selectedRooms, setSelectedRooms] = useState<
    Record<number, { roomId: number; extraBed: boolean; childBed: boolean }[]>
  >({});

  // Step-3 form
  const [firstName,   setFirstName]   = useState('');
  const [lastName,    setLastName]    = useState('');
  const [phone,       setPhone]       = useState('+976 ');
  const [guestNotes,  setGuestNotes]  = useState('');
  const [nowRegister, setNowRegister] = useState(false);

  // Step-4 form
  const [payNow,   setPayNow]   = useState(false);
  const [currency, setCurrency] = useState('MNT');

  // ── Fetch all data ────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const end = toDateStr(addDays(new Date(today), 60));
      const [bRes, rRes, rtRes, gRes, oRes] = await Promise.all([
        fetch('/api/mock/bookings'),
        fetch('/api/mock/rooms'),
        fetch('/api/mock/room-types'),
        fetch('/api/mock/guests'),
        fetch(`/api/mock/occupancy?start=${today}&end=${end}&today=${today}`),
      ]);
      const [bs, rs, rts, gs, occ] = await Promise.all([
        bRes.json(), rRes.json(), rtRes.json(), gRes.json(), oRes.json(),
      ]);

      const guestMap: Record<number, Guest> = {};
      (gs as Guest[]).forEach((g) => { guestMap[g.id] = g; });

      setBookings((bs as Booking[]).map((b) => ({ ...b, guest: guestMap[b.guest_id] })));
      setRooms(rs as Room[]);
      setRoomTypes(rts as RoomType[]);
      setGuests(gs as Guest[]);
      setOccupancy((occ.occupancy ?? []) as OccupancyDay[]);
      setStats(occ.stats as DayStats);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Fetch available rooms when step 2 opens
  useEffect(() => {
    if (step !== 2 || !checkIn || !checkOut) return;
    fetch(`/api/mock/rooms?check_in=${checkIn}&check_out=${checkOut}`)
      .then((r) => r.json())
      .then((d) => setAvailRooms(d as AvailRoom[]));
  }, [step, checkIn, checkOut]);

  // ── Week columns ──────────────────────────────────────────────────────────────

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      return { date: toDateStr(d), day: d.getDate(), weekday: WEEKDAYS_MN[d.getDay()] };
    }),
  [weekStart]);

  const weekOccupancy = useMemo(() => {
    const map: Record<string, OccupancyDay> = {};
    occupancy.forEach((o) => { map[o.date] = o; });
    return weekDays.map((d) => map[d.date] ?? { date: d.date, percent: 0, occupied: 0, total: 0 });
  }, [weekDays, occupancy]);

  // ── Room groups ───────────────────────────────────────────────────────────────

  const roomGroups = useMemo(() =>
    roomTypes
      .map((rt) => {
        const typeRooms = rooms.filter((r) => r.room_type === rt.id);
        const free = typeRooms.filter((r) => {
          if (r.status !== 'available') return false;
          return !bookings.some(
            (b) => b.status !== 'cancelled' && b.room_ids.includes(r.id) &&
                   b.check_in <= today && b.check_out > today
          );
        }).length;
        return { rt, rooms: typeRooms, free };
      })
      .filter((g) => g.rooms.length > 0),
  [roomTypes, rooms, bookings, today]);

  function roomBookingOnDate(roomId: number, date: string): BookingWithGuest | undefined {
    return bookings.find(
      (b) => b.status !== 'cancelled' && b.room_ids.includes(roomId) &&
             b.check_in <= date && b.check_out > date
    );
  }

  // ── Month grid ────────────────────────────────────────────────────────────────

  const monthGrid = useMemo(() => {
    const year  = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const cells: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [monthDate]);

  const occMap = useMemo(() => {
    const m: Record<string, OccupancyDay> = {};
    occupancy.forEach((o) => { m[o.date] = o; });
    return m;
  }, [occupancy]);

  // ── Side-panel bookings ───────────────────────────────────────────────────────

  const panelBookings = useMemo(() => {
    if (!panelDate) return [];
    return bookings.filter(
      (b) => b.status !== 'cancelled' && b.check_in <= panelDate && b.check_out > panelDate
    );
  }, [panelDate, bookings]);

  // ── Modal price totals ────────────────────────────────────────────────────────

  const modalTotals = useMemo(() => {
    const nightCount = nights(checkIn, checkOut);
    let roomTotal = 0;
    let extraTotal = 0;
    const selectedRoomList: { room: Room; rt: RoomType }[] = [];

    Object.entries(selectedRooms).forEach(([rtId, entries]) => {
      const rt = roomTypes.find((r) => r.id === Number(rtId));
      if (!rt) return;
      entries.forEach(({ roomId, extraBed, childBed }) => {
        const room = rooms.find((r) => r.id === roomId);
        if (!room) return;
        selectedRoomList.push({ room, rt });
        roomTotal  += rt.base_price * nightCount;
        if (extraBed) extraTotal += 30_000 * nightCount;
        if (childBed) extraTotal += 20_000 * nightCount;
      });
    });

    const total = roomTotal + extraTotal;
    return { nightCount, roomTotal, extraTotal, total, totalRooms: selectedRoomList.length, selectedRoomList };
  }, [checkIn, checkOut, selectedRooms, roomTypes, rooms]);

  // ── Actions ────────────────────────────────────────────────────────────────────

  async function handleCreate(draft: boolean) {
    const allRoomIds = Object.values(selectedRooms).flatMap((e) => e.map((x) => x.roomId));
    if (!allRoomIds.length) { alert('Өрөө сонгоно уу'); return; }
    if (!firstName || !lastName || !phone.replace(/\D/g, '')) { alert('Зочны мэдээлэл бөглөнө үү'); return; }

    const cleanPhone = phone.replace(/\D/g, '');
    let guestId: number;

    const existing = guests.find(
      (g) => g.first_name === firstName && g.last_name === lastName && g.phone === cleanPhone
    );
    if (existing) {
      guestId = existing.id;
    } else {
      const res = await fetch('/api/mock/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, phone: cleanPhone, email: '', notes: guestNotes }),
      });
      const g = await res.json();
      guestId = g.id;
    }

    const status: BookingStatus = draft ? 'draft' : 'confirmed';

    await fetch('/api/mock/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_ids: allRoomIds, guest_id: guestId,
        check_in: checkIn, check_out: checkOut,
        check_in_time: inTime, check_out_time: outTime,
        adults: adultCount, children: childCount,
        status, channel, corporate_id: null,
        extra_services: [], discount_percent: 0,
        notes: guestNotes, total_price: modalTotals.total,
      }),
    });

    setModalOpen(false);
    setSuccessMsg(
      draft
        ? 'Шинэ захиалга амжилттай драфтанд нэмэгдлээ'
        : 'Шинэ захиалга амжилттай баталгаажиж, календарь дээр нэмэгдлээ.'
    );
    await fetchAll();
    resetModal();
  }

  async function handleDelete(id: number) {
    if (!confirm('Захиалгыг устгах уу?')) return;
    await fetch(`/api/mock/bookings/${id}`, { method: 'DELETE' });
    await fetchAll();
  }

  function resetModal() {
    setStep(1);
    setCheckIn(''); setCheckOut('');
    setInTime('14:00'); setOutTime('12:00');
    setChannel('reception'); setCorporate('none');
    setAdultCount(1); setChildCount(0);
    setSelectedRooms({});
    setFirstName(''); setLastName('');
    setPhone('+976 '); setGuestNotes('');
    setNowRegister(false); setPayNow(false);
  }

  function openModal() { resetModal(); setModalOpen(true); }

  // ── Room-type quantity in step 2 ──────────────────────────────────────────────

  function changeRoomCount(rtId: number, delta: number) {
    const ar  = availRooms.find((a) => a.room_type.id === rtId);
    if (!ar) return;
    const cur = selectedRooms[rtId] ?? [];
    if (delta > 0) {
      const usedIds = cur.map((e) => e.roomId);
      const next    = ar.rooms.find((r) => r.status === 'available' && !usedIds.includes(r.id));
      if (!next) return;
      setSelectedRooms((p) => ({ ...p, [rtId]: [...cur, { roomId: next.id, extraBed: false, childBed: false }] }));
    } else {
      if (!cur.length) return;
      setSelectedRooms((p) => ({ ...p, [rtId]: cur.slice(0, -1) }));
    }
  }

  function updateEntry(rtId: number, idx: number, patch: Partial<{ extraBed: boolean; childBed: boolean }>) {
    setSelectedRooms((p) => {
      const arr = [...(p[rtId] ?? [])];
      arr[idx]  = { ...arr[idx], ...patch };
      return { ...p, [rtId]: arr };
    });
  }

  function removeEntry(rtId: number, idx: number) {
    setSelectedRooms((p) => {
      const arr = [...(p[rtId] ?? [])];
      arr.splice(idx, 1);
      return { ...p, [rtId]: arr };
    });
  }

  // ── Filtered groups ────────────────────────────────────────────────────────────

  const filteredGroups = useMemo(() =>
    roomGroups
      .filter((g) => filterRoomType === 'all' || g.rt.id === Number(filterRoomType))
      .filter((g) => {
        if (!searchQ) return true;
        return g.rt.name.toLowerCase().includes(searchQ.toLowerCase()) ||
               g.rooms.some((r) => r.room_number.includes(searchQ));
      }),
  [roomGroups, filterRoomType, searchQ]);

  // ────────────────────────────────────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">

      {/* Title bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Front desk</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <Bell className="h-4 w-4" />
          </Button>
          <Button onClick={openModal} className="h-9 rounded-full px-4 text-sm">
            <Plus className="mr-1 h-4 w-4" />
            Шинэ захиалга
          </Button>
        </div>
      </div>

      {/* Calendar card */}
      <Card className="border-border/80 bg-card shadow-sm">
        <CardContent className="space-y-5 p-6">

          {/* Toolbar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {/* View toggle */}
              <div className="flex overflow-hidden rounded-md">
                {(['week','month'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors rounded-md ${
                      viewMode === m
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {m === 'week' ? '7 хоногоор' : 'Сараар'}
                  </button>
                ))}
              </div>

              <Select value={filterRoomType} onValueChange={setFilterRoomType}>
                <SelectTrigger className="h-9 w-[170px] rounded-full bg-background/90 text-sm">
                  <SelectValue placeholder="Өрөөний төрөл" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Өрөөний төрөл</SelectItem>
                  {roomTypes.map((rt) => <SelectItem key={rt.id} value={String(rt.id)}>{rt.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterChannel} onValueChange={setFilterChannel}>
                <SelectTrigger className="h-9 w-[175px] rounded-full bg-background/90 text-sm">
                  <SelectValue placeholder="Захиалгын төрөл" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Захиалгын төрөл</SelectItem>
                  {CHANNELS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Хайх"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="rounded-full pl-9 text-sm"
              />
            </div>
          </div>

          {/* ── WEEK VIEW ───────────────────────────────────────────────────── */}
          {viewMode === 'week' && (
            <div className="page-scroll overflow-auto rounded-2xl border border-border">
              <div className="min-w-[860px]">

                {/* Year + month strip nav */}
                <div className="border-b border-border/70 bg-muted/20 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setWeekStart((d) => addDays(d, -7))} className="rounded-full p-1 hover:bg-muted">
                      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <span className="text-sm font-semibold">{weekStart.getFullYear()}</span>
                    <button onClick={() => setWeekStart((d) => addDays(d, 7))} className="rounded-full p-1 hover:bg-muted">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-12 text-center text-[11px] text-muted-foreground">
                    {MONTHS_MN.map((m, i) => (
                      <span key={i} className={i === weekStart.getMonth() ? 'rounded-full bg-foreground px-1 py-0.5 text-background' : ''}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Date headers */}
                <div className="grid border-b border-border/70" style={{ gridTemplateColumns: '175px repeat(7, minmax(105px, 1fr))' }}>
                  <div className="border-r border-border/70 bg-background px-3 py-2 text-sm font-semibold">
                    Нийт өрөө: {rooms.length}
                  </div>
                  {weekDays.map((col, i) => (
                    <div
                      key={col.date}
                      className={`bg-background px-2 py-2 text-center ${i < 6 ? 'border-r border-border/70' : ''} ${col.date === today ? 'outline outline-1 outline-primary/60' : ''}`}
                    >
                      {col.date === today && <p className="text-[10px] font-semibold text-primary">Өнөөдөр</p>}
                      <p className="text-sm font-semibold">{col.day}</p>
                      <p className="text-[11px] text-muted-foreground">{col.weekday}</p>
                    </div>
                  ))}
                </div>

                {/* Occupancy row */}
                <div className="grid border-b border-border/70" style={{ gridTemplateColumns: '175px repeat(7, minmax(105px, 1fr))' }}>
                  <div className="border-r border-border/70 bg-background px-3 py-2 text-xs text-muted-foreground">
                    Өрөө дүүргэлт %
                  </div>
                  {weekOccupancy.map((occ, i) => (
                    <div key={occ.date} className={`bg-background px-2 py-2 text-center ${i < 6 ? 'border-r border-border/70' : ''}`}>
                      <p className={`text-xs font-semibold ${occupancyColor(occ.percent)}`}>{occ.percent}%</p>
                      <div className="mx-auto mt-1 h-1.5 w-full max-w-[80px] rounded-full bg-muted">
                        <div className={`h-full rounded-full ${occupancyBarColor(occ.percent)}`} style={{ width: `${occ.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Room groups */}
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                    Ачааллаж байна…
                  </div>
                ) : (
                  filteredGroups.map(({ rt, rooms: gr, free }) => (
                    <div key={rt.id}>
                      {/* Group header */}
                      <div className="grid border-b border-border/70 bg-muted/30" style={{ gridTemplateColumns: '175px repeat(7, minmax(105px, 1fr))' }}>
                        <div className="border-r border-border/70 bg-muted px-3 py-2 text-xs font-semibold">{rt.name}</div>
                        {weekDays.map((col, i) => (
                          <div key={col.date} className={`bg-muted px-2 py-2 text-center text-[11px] text-muted-foreground ${i < 6 ? 'border-r border-border/70' : ''}`}>
                            Сул • {free}/{gr.length}
                          </div>
                        ))}
                      </div>

                      {/* Room rows */}
                      {gr.map((room) => (
                        <div key={room.id} className="grid border-b border-border/70 last:border-0" style={{ gridTemplateColumns: '175px repeat(7, minmax(105px, 1fr))' }}>
                          <div className="flex items-center gap-2 border-r border-border/70 bg-background px-3 py-2 text-xs">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${
                              room.status === 'maintenance' ? 'bg-yellow-400' :
                              room.status === 'blocked'     ? 'bg-gray-900' :
                              (() => {
                                const b = roomBookingOnDate(room.id, today);
                                return b ? (STATUS_COLORS[b.status] ?? 'bg-gray-300') : 'bg-gray-300';
                              })()
                            }`} />
                            <span className="font-medium">{room.room_number}</span>
                            {room.status !== 'available' && (
                              <Badge variant="outline" className="ml-auto py-0 px-1 text-[9px]">
                                {room.status === 'maintenance' ? 'Засвар' : 'Блок'}
                              </Badge>
                            )}
                          </div>

                          {weekDays.map((col, i) => {
                            const b          = roomBookingOnDate(room.id, col.date);
                            const isCheckIn  = b?.check_in  === col.date;
                            const isCheckOut = b?.check_out === col.date;
                            const barBg      = b ? (STATUS_BAR_BG[b.status] ?? 'bg-primary/60') : '';

                            return (
                              <div
                                key={col.date}
                                className={`relative min-h-[34px] bg-background ${i < 6 ? 'border-r border-border/70' : ''}`}
                              >
                                {b && (
                                  <div
                                    title={`${b.guest?.first_name ?? ''} ${b.guest?.last_name ?? ''} — ${STATUS_LABEL[b.status] ?? b.status}`}
                                    className={`absolute inset-y-1 flex items-center px-1.5 text-[10px] font-medium text-white ${barBg}
                                      ${isCheckIn  ? 'left-1.5 rounded-l-full' : 'left-0'}
                                      ${isCheckOut ? 'right-1.5 rounded-r-full' : 'right-0'}
                                    `}
                                  >
                                    {isCheckIn && (
                                      <span className="truncate leading-none">
                                        {b.guest?.first_name ?? ''}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── MONTH VIEW ──────────────────────────────────────────────────── */}
          {viewMode === 'month' && (
            <div className="flex gap-4">
              {/* Calendar grid */}
              <div className="flex-1 min-w-0 rounded-2xl border border-border overflow-hidden">
                {/* Month nav */}
                <div className="flex items-center justify-between border-b border-border/70 bg-muted/20 px-4 py-2">
                  <button onClick={() => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="rounded-full p-1 hover:bg-muted">
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <span className="text-sm font-semibold">{monthDate.getFullYear()} · {MONTHS_MN[monthDate.getMonth()]}</span>
                  <button onClick={() => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="rounded-full p-1 hover:bg-muted">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b border-border/70 bg-muted/10">
                  {WEEKDAYS_MN.map((w) => (
                    <div key={w} className="py-2 text-center text-[11px] font-medium text-muted-foreground">{w}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                  {monthGrid.map((cell, idx) => {
                    if (!cell) return (
                      <div key={`e-${idx}`} className={`min-h-[72px] border-b border-border/70 bg-muted/5 ${(idx + 1) % 7 !== 0 ? 'border-r' : ''}`} />
                    );

                    const dateStr = toDateStr(cell);
                    const occ     = occMap[dateStr];
                    const isToday = dateStr === today;
                    const isPast  = dateStr < today;
                    const isSel   = panelDate === dateStr;

                    return (
                      <div
                        key={dateStr}
                        onClick={() => setPanelDate(isSel ? null : dateStr)}
                        className={`min-h-[72px] cursor-pointer border-b border-border/70 p-2 transition
                          ${(idx + 1) % 7 !== 0 ? 'border-r' : ''}
                          ${isPast  ? 'bg-muted/5'     : 'bg-background hover:bg-primary/5'}
                          ${isSel   ? 'bg-primary/10 !border-primary/50' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-sm
                            ${isToday ? 'bg-primary font-bold text-primary-foreground' : isPast ? 'text-muted-foreground' : 'text-foreground'}`}
                          >
                            {cell.getDate()}
                          </span>
                        </div>
                        {occ && (
                          <div className="mt-1.5 space-y-1">
                            <p className={`text-xs font-semibold ${occupancyColor(occ.percent)}`}>
                              {occ.percent}% {occupancyArrow(occ.percent)}
                            </p>
                            <div className="h-1 w-full rounded-full bg-muted">
                              <div className={`h-full rounded-full ${occupancyBarColor(occ.percent)}`} style={{ width: `${occ.percent}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Occupancy legend */}
                <div className="flex flex-wrap gap-4 border-t border-border/70 px-4 py-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" />Муу буюу 50%-с бага</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-400" />Дунд буюу 50% – 70% хооронд</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" />Сайн буюу 80%-с дээш</span>
                </div>
              </div>

              {/* Side panel */}
              {panelDate && (
                <div className="w-80 shrink-0 rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">{panelDate}</p>
                      {occMap[panelDate] && (
                        <p className={`text-xs font-medium ${occupancyColor(occMap[panelDate].percent)}`}>
                          Өнөөдөр {occMap[panelDate].percent}% {occupancyArrow(occMap[panelDate].percent)}
                        </p>
                      )}
                    </div>
                    <button onClick={() => setPanelDate(null)} className="rounded-full p-1 hover:bg-muted">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Filter chips */}
                  <div className="flex flex-wrap gap-1.5 border-b border-border/70 px-3 py-2">
                    {[
                      { key: 'check_in',  label: `Check-in today (${panelBookings.filter((b) => b.check_in === panelDate).length})`  },
                      { key: 'check_out', label: `Check-out today (${panelBookings.filter((b) => b.check_out === panelDate).length})` },
                      { key: 'available', label: `Available Room (${(occMap[panelDate]?.total ?? 0) - (occMap[panelDate]?.occupied ?? 0)})`  },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setPanelFilter((p) =>
                          p.includes(f.key) ? p.filter((k) => k !== f.key) : [...p, f.key]
                        )}
                        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition
                          ${panelFilter.includes(f.key) ? 'border-primary bg-primary/10 font-medium text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                      >
                        {f.label}
                        {panelFilter.includes(f.key) && <X className="h-2.5 w-2.5" />}
                      </button>
                    ))}
                  </div>

                  {/* Booking list */}
                  <div className="flex-1 overflow-auto divide-y divide-border/70">
                    {panelBookings.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-muted-foreground">Захиалга байхгүй</p>
                    ) : (
                      panelBookings.map((b) => {
                        const firstRoom = rooms.find((r) => r.id === b.room_ids[0]);
                        const rt = roomTypes.find((r) => r.id === firstRoom?.room_type);
                        const checkInToday  = b.check_in  === panelDate;
                        const isStaying     = !checkInToday && b.check_out !== panelDate;

                        return (
                          <div key={b.id} className="group px-3 py-2.5 hover:bg-muted/30 transition">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold">{rt?.name ?? 'Өрөө'}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {b.room_ids.map((rid) => rooms.find((r) => r.id === rid)?.room_number).filter(Boolean).join(', ')} · {b.adults + b.children} зочин
                                </p>
                                {b.total_price > 0 && (
                                  <p className="text-[11px] text-muted-foreground">Үнэ: {fmt(b.total_price)}</p>
                                )}
                              </div>
                              <div className="shrink-0 text-right space-y-0.5">
                                {checkInToday && <Badge className="block bg-primary/10 text-primary text-[10px]">Захиалгатай</Badge>}
                                {isStaying    && <Badge className="block bg-orange-100 text-orange-700 text-[10px]">Байрлаж байна</Badge>}
                                {b.check_out === panelDate && <Badge className="block bg-red-100 text-red-700 text-[10px]">Гарах өдөр</Badge>}
                              </div>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                              <p className="text-[10px] text-muted-foreground">{b.guest?.first_name} {b.guest?.last_name}</p>
                              <button
                                onClick={() => handleDelete(b.id)}
                                className="hidden group-hover:block text-[10px] text-destructive hover:underline"
                              >
                                Устгах
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { color: 'bg-green-500',  label: 'Checked-in'        },
              { color: 'bg-primary',    label: 'Захиалагатай өрөө' },
              { color: 'bg-red-400',    label: 'Due out'           },
              { color: 'bg-yellow-400', label: 'Сунгалт хийсэн'    },
              { color: 'bg-gray-400',   label: 'Checked-out'       },
              { color: 'bg-gray-900',   label: 'Өрөө блок'         },
            ].map(({ color, label }) => (
              <Badge key={label} variant="outline" className="rounded-full px-3 py-1">
                <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${color}`} />
                {label}
              </Badge>
            ))}
          </div>

          {/* Today stats */}
          <div className="flex flex-col gap-3 border-t border-border/70 pt-3 text-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
              <span className="font-medium text-foreground">Өнөөдрийн байдал:</span>
              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {stats?.total_bookings ?? 0} захиалга</span>
              <span className="flex items-center gap-1"><BedSingle className="h-3 w-3" /> {stats?.occupied_rooms ?? 0} өрөө захиалгатай</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {stats?.total_guests ?? 0} зочин</span>
              <span className="flex items-center gap-1"><CircleDot className="h-3 w-3" /> {stats?.free_rooms ?? 0} сул өрөө</span>
            </div>
            <Button className="h-9 rounded-xl px-4 text-sm font-semibold">
              <Wallet className="mr-1.5 h-4 w-4" />
              {stats ? fmt(stats.revenue) : '0 ₮'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── NEW BOOKING MODAL ───────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) resetModal(); setModalOpen(v); }}>
        <DialogContent className="max-h-[90vh] max-w-[640px] overflow-hidden rounded-3xl border-border p-0">

          <DialogHeader className="px-6 pb-2 pt-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">Шинэ захиалга</DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => { setModalOpen(false); resetModal(); }} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Step indicator */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {MODAL_STEPS.map((item, idx) => {
                const Icon   = item.icon;
                const done   = step > item.id;
                const active = step === item.id;
                return (
                  <div key={item.id} className="relative">
                    {idx < MODAL_STEPS.length - 1 && (
                      <div className={`absolute left-1/2 top-4 h-px w-full z-0 ${done ? 'bg-primary' : 'bg-border'}`} />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors
                        ${done || active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}
                      >
                        {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={`text-[11px] leading-tight ${active ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogHeader>

          {/* Step body */}
          <div className="max-h-[55vh] overflow-auto px-6 pb-2 space-y-4">

            {/* Step 1 – Dates */}
            {step === 1 && (
              <div className="space-y-4 rounded-2xl border border-border p-4">
                <div>
                  <p className="mb-1.5 text-sm text-muted-foreground">Огноо сонгох</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
                      <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                      <input type="date" value={checkIn}  onChange={(e) => setCheckIn(e.target.value)}  className="bg-transparent outline-none text-sm w-32" />
                      <span className="text-muted-foreground">—</span>
                      <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="bg-transparent outline-none text-sm w-32" />
                    </div>
                    {checkIn && checkOut && nights(checkIn, checkOut) > 0 && (
                      <Badge variant="secondary">{nights(checkIn, checkOut)} шөнө</Badge>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Орох цаг">
                    <Select value={inTime} onValueChange={setInTime}>
                      <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>{CHECK_IN_TIMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Гарах цаг">
                    <Select value={outTime} onValueChange={setOutTime}>
                      <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>{CHECK_OUT_TIMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Захиалгын суваг">
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>{CHANNELS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Гэрээт байгууллага">
                    <Select value={corporate} onValueChange={setCorporate}>
                      <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Сонгох</SelectItem>
                        <SelectItem value="mongol-bank">Монгол Банк</SelectItem>
                        <SelectItem value="erdenes">Эрдэнэс Монгол</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div>
                  <p className="mb-1.5 text-sm text-muted-foreground">Зочдын тоо</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    <GuestCounter label="Том хүн" value={adultCount} onDecrement={() => setAdultCount((v) => Math.max(1, v - 1))} onIncrement={() => setAdultCount((v) => v + 1)} />
                    <GuestCounter label="Хүүхэд"  value={childCount} onDecrement={() => setChildCount((v) => Math.max(0, v - 1))} onIncrement={() => setChildCount((v) => v + 1)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 – Rooms */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Боломжит өрөөнүүд</h3>
                  <p className="text-xs text-muted-foreground">
                    {availRooms.reduce((s, a) => s + a.available, 0)} / {availRooms.reduce((s, a) => s + a.rooms.length, 0)}
                  </p>
                </div>

                {availRooms.map(({ room_type: rt, rooms: tr, available }) => {
                  const selected = selectedRooms[rt.id] ?? [];
                  const count    = selected.length;
                  return (
                    <div key={rt.id} className={`rounded-2xl border p-3 transition ${count > 0 ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 rounded-lg bg-muted" />
                          <div>
                            <p className="text-sm font-semibold">{rt.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Үлдэгдэл:{' '}
                              <span className={`font-semibold ${available === 0 ? 'text-red-500' : available <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {available}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-xl border border-border px-2 py-1">
                          <button onClick={() => changeRoomCount(rt.id, -1)} disabled={count === 0} className="rounded-full p-0.5 hover:bg-muted disabled:opacity-30">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-5 text-center text-sm font-semibold">{count}</span>
                          <button onClick={() => changeRoomCount(rt.id, 1)} disabled={available === 0 || count >= available} className="rounded-full p-0.5 hover:bg-muted disabled:opacity-30">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {selected.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {selected.map((entry, idx) => {
                            const room = tr.find((r) => r.id === entry.roomId);
                            return (
                              <div key={entry.roomId} className="flex flex-wrap items-center gap-2 text-xs">
                                <Badge className="rounded-full px-2 text-xs">{room?.room_number ?? '—'}</Badge>
                                <Select defaultValue={String(rt.base_price)}>
                                  <SelectTrigger className="h-7 w-[185px] rounded-full text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={String(rt.base_price)}>Үндсэн үнэ / {rt.base_price.toLocaleString('mn-MN')} ₮</SelectItem>
                                  </SelectContent>
                                </Select>
                                <label className="flex items-center gap-1 cursor-pointer text-muted-foreground">
                                  <Switch checked={entry.extraBed} onCheckedChange={(v) => updateEntry(rt.id, idx, { extraBed: v })} />
                                  Нэмэлт ор
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer text-muted-foreground">
                                  <Switch checked={entry.childBed} onCheckedChange={(v) => updateEntry(rt.id, idx, { childBed: v })} />
                                  Хүүхдийн ор
                                </label>
                                <button onClick={() => removeEntry(rt.id, idx)}>
                                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 3 – Guest info */}
            {step === 3 && (
              <div className="space-y-3 rounded-2xl border border-border p-4">
                <Field label="Зочны овог">
                  <Input value={lastName}  onChange={(e) => setLastName(e.target.value)}  placeholder="Овог" className="h-10 rounded-xl" />
                </Field>
                <Field label="Зочны нэр">
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Нэр"  className="h-10 rounded-xl" />
                </Field>
                <Field label="Утасны дугаар">
                  <div className="flex gap-2">
                    <Select defaultValue="MN">
                      <SelectTrigger className="h-10 w-[80px] shrink-0 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MN">MN</SelectItem>
                        <SelectItem value="CN">CN</SelectItem>
                        <SelectItem value="KR">KR</SelectItem>
                        <SelectItem value="RU">RU</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+976 0000-0000" className="h-10 rounded-xl" />
                  </div>
                </Field>
                <Field label="Нэмэлт хүсэлт, тайлбар">
                  <Textarea value={guestNotes} onChange={(e) => setGuestNotes(e.target.value)} rows={3} placeholder="Тайлбар оруулах..." className="rounded-xl" />
                </Field>
                <label className="flex cursor-pointer items-center gap-2 pt-1 text-sm text-muted-foreground">
                  <Switch checked={nowRegister} onCheckedChange={setNowRegister} />
                  Одоо бүртгэх
                </label>
              </div>
            )}

            {/* Step 4 – Payment */}
            {step === 4 && (
              <div className="space-y-4">
                {/* Summary card */}
                <div className="rounded-2xl bg-muted-foreground/75 p-4 text-background">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-60">Захиалгын хуураангуй</p>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-70">Захиалагч мэдээлэл</span>
                      <span className="font-medium">{firstName} {lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Холбогдох утас</span>
                      <span>{phone}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div className="col-span-1 rounded-lg bg-background/20 px-2 py-1.5">
                        <CalendarDays className="mb-0.5 h-3 w-3 opacity-60" />
                        {checkIn} — {checkOut}
                      </div>
                      <div className="rounded-lg bg-background/20 px-2 py-1.5 text-center">{inTime}</div>
                      <div className="rounded-lg bg-background/20 px-2 py-1.5 text-center">{outTime}</div>
                    </div>
                    {modalTotals.nightCount > 0 && (
                      <Badge className="mt-1 w-fit rounded-full bg-background/20 text-background text-xs">
                        {modalTotals.nightCount} шөнө
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="rounded-2xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Төлбөр тооцоо</h3>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-8 w-[90px] rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MNT">MNT</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 text-sm">
                    <SummaryRow label="Өрөө үйлчилгээ" hint={`${modalTotals.totalRooms} өрөө x ${modalTotals.nightCount} шөнө`} value={fmt(modalTotals.roomTotal)} />
                    {modalTotals.extraTotal > 0 && (
                      <SummaryRow label="Нэмэлт үйлчилгээ" value={fmt(modalTotals.extraTotal)} />
                    )}
                    <SummaryRow label="Хөнгөлөлт" value={fmt(0)} hint={corporate !== 'none' ? 'Гэрээт -10%' : undefined} />
                  </div>

                  <div className="mt-3 rounded-xl bg-primary/15 px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">Нийт дүн</span>
                      <span className="text-base font-semibold text-primary">{fmt(modalTotals.total)}</span>
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <Switch checked={payNow} onCheckedChange={setPayNow} />
                  Одоо төлөх
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-card px-6 py-3">
            {/* Mini summary strip */}
            {step >= 2 && (
              <div className="mb-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-primary to-primary/80 px-4 py-2 text-xs font-medium text-primary-foreground">
                <div className="flex items-center gap-3">
                  <span>{nights(checkIn, checkOut)} шөнө</span>
                  <span className="opacity-50">|</span>
                  <span><User className="mr-0.5 inline h-3 w-3" /> x {adultCount}</span>
                  {modalTotals.totalRooms > 0 && (
                    <>
                      <span className="opacity-50">|</span>
                      <span><BedSingle className="mr-0.5 inline h-3 w-3" /> x {modalTotals.totalRooms} өрөө</span>
                    </>
                  )}
                </div>
                {modalTotals.total > 0 && <span>{fmt(modalTotals.total)}</span>}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => { if (step === 1) { setModalOpen(false); resetModal(); } else setStep((p) => p - 1); }}
                className="min-w-[100px] rounded-xl"
              >
                Буцах
              </Button>
              <div className="flex gap-2">
                {step === 4 ? (
                  <>
                    <Button variant="secondary" className="rounded-xl" onClick={() => handleCreate(true)}>Түр хадгалах</Button>
                    <Button className="rounded-xl px-5" onClick={() => handleCreate(false)}>Баталгаажуулах</Button>
                  </>
                ) : (
                  <Button onClick={() => setStep((p) => Math.min(4, p + 1))} className="min-w-[130px] rounded-xl">
                    Үргэлжлүүлэх
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── SUCCESS DIALOG ───────────────────────────────────────────────────────── */}
      <Dialog open={!!successMsg} onOpenChange={() => setSuccessMsg(null)}>
        <DialogContent className="max-w-[300px] rounded-3xl border-border p-8 text-center">
          <DialogTitle className="sr-only">Захиалгын мэдээлэл</DialogTitle>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm leading-relaxed text-foreground">{successMsg}</p>
          <Button variant="outline" className="mt-6 w-full rounded-xl" onClick={() => setSuccessMsg(null)}>
            Хаах
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GuestCounter({ label, value, onIncrement, onDecrement }: {
  label: string; value: number; onIncrement: () => void; onDecrement: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onDecrement}>
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="min-w-5 text-center text-sm font-medium">{value}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onIncrement}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function SummaryRow({ label, hint, value }: { label: string; hint?: string; value: string }) {
  return (
    <div className="flex items-start justify-between border-b border-border/60 pb-2 last:border-0">
      <div>
        <p className="text-sm">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">/ {hint} /</p>}
      </div>
      <div className="flex items-center gap-1">
        <p className="font-medium">{value}</p>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}
