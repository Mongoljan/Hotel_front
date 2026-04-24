'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconRefresh,
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Booking, Guest } from '@/lib/mockStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingRow {
  id: number;
  guest_name: string;
  room_type_name: string;
  room_numbers: string[];
  created_at: string;
  check_in: string;
  check_out: string;
  total_price: number;
  channel: string;
  status: string;
}

// ─── Status colours ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  confirmed:   'bg-green-100 text-green-700',
  draft:       'bg-yellow-100 text-yellow-700',
  cancelled:   'bg-red-100 text-red-700',
  checked_in:  'bg-blue-100 text-blue-700',
  checked_out: 'bg-gray-100 text-gray-700',
};

const CHANNEL_LABELS: Record<string, string> = {
  reception: 'Рецепшн',
  online:    'Онлайн',
  phone:     'Утас',
  agency:    'Агентлаг',
  corp:      'Корпорэйт',
};

type TabType = 'all' | 'confirmed' | 'draft' | 'cancelled' | 'checked_in' | 'checked_out';

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function GuestRegistrationPage() {
  const t = useTranslations('GuestRegistration');

  const [rows, setRows]               = useState<BookingRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [dateFilter, setDateFilter]   = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookRes, guestRes, roomRes] = await Promise.all([
        fetch('/api/mock/bookings'),
        fetch('/api/mock/guests'),
        fetch('/api/mock/rooms'),
      ]);
      const bookData  = await bookRes.json();
      const guestData = await guestRes.json();
      const roomData  = await roomRes.json();

      const guestMap = new Map<number, Guest>(
        (guestData.results ?? []).map((g: Guest) => [g.id, g])
      );
      const roomMap  = new Map<number, { num: string; typeName: string }>(
        (roomData.results ?? []).map((r: { id: number; room_number: string; room_type: number }) => [
          r.id,
          { num: r.room_number, typeName: '' },
        ])
      );

      const mapped: BookingRow[] = (bookData.results ?? []).map((b: Booking) => {
        const guest = guestMap.get(b.guest_id);
        const roomNums = b.room_ids.map((rid) => roomMap.get(rid)?.num ?? String(rid));
        return {
          id:             b.id,
          guest_name:     guest ? `${guest.last_name} ${guest.first_name}` : `Зочин #${b.guest_id}`,
          room_type_name: 'Өрөө',
          room_numbers:   roomNums,
          created_at:     b.created_at,
          check_in:       b.check_in,
          check_out:      b.check_out,
          total_price:    b.total_price,
          channel:        b.channel,
          status:         b.status,
        };
      });

      setRows(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (activeTab !== 'all') {
      result = result.filter((r) => r.status === activeTab);
    }
    if (dateFilter) {
      result = result.filter((r) => r.check_in <= dateFilter && r.check_out > dateFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.guest_name.toLowerCase().includes(q) ||
          String(r.id).includes(q) ||
          r.room_numbers.join(',').includes(q)
      );
    }
    return result;
  }, [rows, activeTab, dateFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    const labels: Record<string, string> = {
      confirmed:   t('statuses.confirmed'),
      draft:       t('statuses.pending'),
      cancelled:   t('statuses.cancelled'),
      checked_in:  t('statuses.checkedIn'),
      checked_out: t('statuses.checkedOut'),
    };
    return (
      <Badge className={cn('text-xs font-medium', STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700')}>
        {labels[status] ?? status}
      </Badge>
    );
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all',         label: t('tabs.all')       },
    { key: 'confirmed',   label: t('tabs.confirmed')  },
    { key: 'draft',       label: t('tabs.pending')    },
    { key: 'cancelled',   label: t('tabs.cancelled')  },
    { key: 'checked_in',  label: t('tabs.checkedIn')  },
    { key: 'checked_out', label: t('tabs.checkedOut') },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <IconRefresh className="mr-2 h-4 w-4" />
          Шинэчлэх
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.roomType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allRoomTypes')}</SelectItem>
                <SelectItem value="standard">Standard Single Room</SelectItem>
                <SelectItem value="deluxe">Deluxe Double Room</SelectItem>
                <SelectItem value="suite">Suite Twin Room</SelectItem>
                <SelectItem value="family">Family Room</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full"
              placeholder="Огноо шүүх"
            />

            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs + Table */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => {
              const count = tab.key === 'all' ? rows.length : rows.filter((r) => r.status === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                    activeTab === tab.key
                      ? 'border-b-2 border-primary text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <span>{tab.label}</span>
                  <Badge variant="secondary" className="text-xs">{count}</Badge>
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-medium">{t('table.bookingId')}</TableHead>
                  <TableHead className="font-medium">{t('table.guestName')}</TableHead>
                  <TableHead className="font-medium">{t('table.room')}</TableHead>
                  <TableHead className="font-medium">{t('table.bookingDate')}</TableHead>
                  <TableHead className="font-medium">{t('table.checkInOut')}</TableHead>
                  <TableHead className="font-medium">{t('table.amount')}</TableHead>
                  <TableHead className="font-medium">{t('table.source')}</TableHead>
                  <TableHead className="font-medium">{t('table.status')}</TableHead>
                  <TableHead className="font-medium w-24">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      Уншиж байна...
                    </TableCell>
                  </TableRow>
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      {t('messages.noBookings')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium font-mono text-sm">B-{r.id}</TableCell>
                      <TableCell>{r.guest_name}</TableCell>
                      <TableCell>
                        <div className="font-medium">{r.room_numbers.join(', ')}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.created_at.slice(0, 10)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-sm">
                          <div>Check-in: {r.check_in}</div>
                          <div>Check-out: {r.check_out}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.total_price > 0 ? `${r.total_price.toLocaleString()}₮` : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {CHANNEL_LABELS[r.channel] ?? r.channel}
                      </TableCell>
                      <TableCell>{getStatusBadge(r.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <IconEye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
