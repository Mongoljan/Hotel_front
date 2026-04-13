'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconPrinter,
  IconDownload,
  IconSearch,
  IconPlus,
  IconEye,
  IconEdit,
  IconRefresh,
  IconFilter,
} from "@tabler/icons-react";
import type { Booking, Guest, BookingStatus, BookingChannel } from '@/lib/mockStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingRow extends Booking {
  guest_name: string;
  room_numbers: string[];
}

// ─── Label maps ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; variant: string; className: string }> = {
  confirmed:   { label: 'Баталгаажсан',    variant: 'default', className: 'bg-green-100 text-green-700' },
  draft:       { label: 'Хүлээгдэж буй',  variant: 'default', className: 'bg-orange-100 text-orange-700'},
  checked_in:  { label: 'Зочин ирсэн',     variant: 'default', className: 'bg-blue-100 text-blue-700'  },
  checked_out: { label: 'Гарсан',          variant: 'default', className: 'bg-gray-100 text-gray-700'  },
  cancelled:   { label: 'Цуцалсан',       variant: 'default', className: 'bg-red-100 text-red-700'    },
};

const CHANNEL_LABELS: Record<BookingChannel, string> = {
  reception: 'Рецепшн',
  online:    'Онлайн',
  phone:     'Утас',
  agency:    'Агентлаг',
  corp:      'Корпорэйт',
};

const STATUS_TABS = [
  { value: 'all',         label: 'Бүгд'                 },
  { value: 'draft',       label: 'Хүлээгдэж буй'        },
  { value: 'confirmed',   label: 'Баталгаажсан'         },
  { value: 'checked_in',  label: 'Зочин байрлаж байгаа' },
  { value: 'checked_out', label: 'Гарсан'               },
  { value: 'cancelled',   label: 'Цуцалсан'            },
];

const ITEMS_PER_PAGE = 12;

const fmt = (n: number) => new Intl.NumberFormat('mn-MN').format(n) + ' ₮';
const fmtDate = (d: string) => d.replace(/-/g, '/');

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [bookings, setBookings]         = useState<BookingRow[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [currentPage, setCurrentPage]   = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookRes, guestRes] = await Promise.all([
        fetch('/api/mock/bookings'),
        fetch('/api/mock/guests'),
      ]);
      const bookData  = await bookRes.json();
      const guestData = await guestRes.json();

      const guestMap = new Map<number, Guest>(
        (guestData.results ?? []).map((g: Guest) => [g.id, g])
      );

      // Also fetch rooms to get room numbers
      const roomRes  = await fetch('/api/mock/rooms');
      const roomData = await roomRes.json();
      const roomMap  = new Map<number, string>(
        (roomData.results ?? []).map((r: { id: number; room_number: string }) => [r.id, r.room_number])
      );

      const rows: BookingRow[] = (bookData.results ?? []).map((b: Booking) => {
        const guest = guestMap.get(b.guest_id);
        return {
          ...b,
          guest_name:   guest ? `${guest.last_name} ${guest.first_name}` : `Зочин #${b.guest_id}`,
          room_numbers: b.room_ids.map((rid) => roomMap.get(rid) ?? String(rid)),
        };
      });

      setBookings(rows);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = bookings.filter((b) => {
    if (activeTab !== 'all' && b.status !== activeTab) return false;
    if (channelFilter !== 'all' && b.channel !== channelFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.guest_name.toLowerCase().includes(q) ||
        b.room_numbers.join(',').includes(q) ||
        String(b.id).includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const tabCounts = STATUS_TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.value] = tab.value === 'all'
      ? bookings.length
      : bookings.filter((b) => b.status === tab.value).length;
    return acc;
  }, {});

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Захиалгын жагсаалт</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Шинэчлэх
          </Button>
          <Button variant="outline" size="sm">
            <IconDownload className="mr-2 h-4 w-4" />
            Татах
          </Button>
          <Button variant="outline" size="sm">
            <IconPrinter className="mr-2 h-4 w-4" />
            Хэвлэх
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <IconPlus className="mr-2 h-4 w-4" />
            Шинэ захиалга
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Зочин, өрөө, ID хайх..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={channelFilter} onValueChange={(v) => { setChannelFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Захиалгын суваг" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх суваг</SelectItem>
            {(Object.entries(CHANNEL_LABELS) as [BookingChannel, string][]).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? 'default' : 'outline'}
            size="sm"
            className="h-8"
            onClick={() => { setActiveTab(tab.value); setCurrentPage(1); }}
          >
            {tab.label}
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
              {tabCounts[tab.value] ?? 0}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10"><Checkbox /></TableHead>
              <TableHead>Зочин нэр</TableHead>
              <TableHead className="text-center">Өрөө №</TableHead>
              <TableHead className="text-center">Захиалгын ID</TableHead>
              <TableHead className="text-center">Check-in</TableHead>
              <TableHead className="text-center">Check-out</TableHead>
              <TableHead className="text-center">Нийт дүн</TableHead>
              <TableHead className="text-center">Хүмүүс</TableHead>
              <TableHead className="text-center">Суваг</TableHead>
              <TableHead className="text-center">Төлөв</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                  Уншиж байна...
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                  Захиалга олдсонгүй
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((b) => {
                const st = STATUS_LABELS[b.status];
                return (
                  <TableRow key={b.id} className="hover:bg-muted/50">
                    <TableCell><Checkbox /></TableCell>
                    <TableCell className="font-medium text-primary">{b.guest_name}</TableCell>
                    <TableCell className="text-center font-medium">{b.room_numbers.join(', ')}</TableCell>
                    <TableCell className="text-center text-primary font-mono text-sm">B-{b.id}</TableCell>
                    <TableCell className="text-center">{fmtDate(b.check_in)}</TableCell>
                    <TableCell className="text-center">{fmtDate(b.check_out)}</TableCell>
                    <TableCell className="text-center">{fmt(b.total_price)}</TableCell>
                    <TableCell className="text-center">{b.adults + b.children}x</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {CHANNEL_LABELS[b.channel] ?? b.channel}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${st?.className ?? 'bg-gray-100 text-gray-700'} hover:opacity-90`}>
                        {st?.label ?? b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconDownload className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconEdit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length} бичлэг
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >← Өмнөх</Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | string)[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === '...' ? (
                  <span key={`dots-${i}`} className="px-2 text-muted-foreground">…</span>
                ) : (
                  <Button key={item} variant={currentPage === item ? 'default' : 'outline'} size="sm"
                    className="w-8" onClick={() => setCurrentPage(item as number)}>
                    {item}
                  </Button>
                )
              )}
            <Button variant="outline" size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >Дараагийнх →</Button>
          </div>
        </div>
      )}
    </div>
  );
}
