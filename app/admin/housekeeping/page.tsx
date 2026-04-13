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
  IconRefresh,
} from "@tabler/icons-react";
import type { CleaningStatus, CleaningPriority, HousekeepingTask } from '@/lib/mockStore';

// ─── Label maps ────────────────────────────────────────────────────────────────

const CLEANING_STATUS_MAP: Record<CleaningStatus, { label: string; className: string }> = {
  needs_cleaning: { label: 'Цэвэрлэх шаардлагатай', className: 'bg-yellow-100 text-yellow-700' },
  in_progress:    { label: 'Цэвэрлэж байна',         className: 'bg-blue-100 text-blue-700'   },
  clean:          { label: 'Цэвэрхэн',               className: 'bg-green-100 text-green-700'  },
  dirty:          { label: 'Бохир',                  className: 'bg-red-100 text-red-700'     },
  replace:        { label: 'Солих',                  className: 'bg-purple-100 text-purple-700'},
};

const PRIORITY_MAP: Record<CleaningPriority, { label: string; icon: string; className: string }> = {
  urgent: { label: 'Яаралтай', icon: '⚡', className: 'text-red-600'    },
  normal: { label: 'Дунд',     icon: '⭐', className: 'text-yellow-600' },
  low:    { label: 'Бага',     icon: '🟢', className: 'text-green-600'  },
};

const BOOKING_STATUS_MAP: Record<string, { label: string; className: string }> = {
  checked_in:  { label: 'Зочин ирсэн',  className: 'bg-blue-100 text-blue-700'   },
  checked_out: { label: 'Зочин гарсан', className: 'bg-gray-100 text-gray-700'   },
  confirmed:   { label: 'Баталгаажсан', className: 'bg-green-100 text-green-700' },
  available:   { label: 'Чөлөөтэй',     className: 'bg-slate-100 text-slate-700' },
};

const STATUS_TABS = [
  { value: 'all',           label: 'Бүгд'                  },
  { value: 'needs_cleaning',label: 'Цэвэрлэх шаардлагатай' },
  { value: 'dirty',         label: 'Бохир'                 },
  { value: 'clean',         label: 'Цэвэрхэн'             },
  { value: 'in_progress',   label: 'Цэвэрлэж байна'       },
  { value: 'replace',       label: 'Солих'                },
];

const FLOOR_OPTIONS = [2, 3, 4, 5];
const PRIORITY_OPTIONS: CleaningPriority[] = ['urgent', 'normal', 'low'];
const ITEMS_PER_PAGE = 12;

// ─── Inline status select ──────────────────────────────────────────────────────

function CleaningStatusSelect({
  taskId,
  value,
  onUpdated,
}: {
  taskId: number;
  value: CleaningStatus;
  onUpdated: (id: number, newStatus: CleaningStatus) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: string) {
    setSaving(true);
    try {
      await fetch(`/api/mock/housekeeping/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleaning_status: newStatus }),
      });
      onUpdated(taskId, newStatus as CleaningStatus);
    } finally {
      setSaving(false);
    }
  }

  const info = CLEANING_STATUS_MAP[value] ?? { label: value, className: 'bg-gray-100 text-gray-700' };
  return (
    <Select value={value} onValueChange={handleChange} disabled={saving}>
      <SelectTrigger className={`h-7 w-[170px] text-xs border-0 ${info.className}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(CLEANING_STATUS_MAP) as CleaningStatus[]).map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {CLEANING_STATUS_MAP[s].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HousekeepingPage() {
  const [tasks, setTasks]             = useState<HousekeepingTask[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('cleaning_status', activeTab);
      if (floorFilter !== 'all') params.set('floor', floorFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      const res = await fetch(`/api/mock/housekeeping?${params.toString()}`);
      const data = await res.json();
      setTasks(data.results ?? []);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  }, [activeTab, floorFilter, priorityFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  function handleStatusUpdated(id: number, newStatus: CleaningStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, cleaning_status: newStatus } : t)));
  }

  const filtered = tasks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.room_number.toLowerCase().includes(q) ||
      t.room_type_name.toLowerCase().includes(q) ||
      (t.assigned_to ?? '').toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const tabCounts = STATUS_TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.value] = tab.value === 'all'
      ? tasks.length
      : tasks.filter((t) => t.cleaning_status === tab.value).length;
    return acc;
  }, {});

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Өрөө цэвэрлэгээ</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTasks}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Шинэчлэх
          </Button>
          <Button variant="outline" size="sm">
            <IconPrinter className="mr-2 h-4 w-4" />
            Хэвлэх
          </Button>
          <Button variant="outline" size="sm">
            <IconDownload className="mr-2 h-4 w-4" />
            Татах
          </Button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Хайх..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={floorFilter} onValueChange={(v) => setFloorFilter(v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Давхар" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх давхар</SelectItem>
            {FLOOR_OPTIONS.map((f) => (
              <SelectItem key={f} value={String(f)}>{f}-р давхар</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Ач холбогдол" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх ач холбогдол</SelectItem>
            {PRIORITY_OPTIONS.map((p) => (
              <SelectItem key={p} value={p}>{PRIORITY_MAP[p].icon} {PRIORITY_MAP[p].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status tabs */}
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
              <TableHead>Өрөө №</TableHead>
              <TableHead>Өрөөний төрөл</TableHead>
              <TableHead className="text-center">Давхар</TableHead>
              <TableHead className="text-center">Цэвэрлэгээний төлөв</TableHead>
              <TableHead className="text-center">Ач холбогдол</TableHead>
              <TableHead className="text-center">Захиалгын төлөв</TableHead>
              <TableHead>Хариуцагч</TableHead>
              <TableHead>Тэмдэглэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  Уншиж байна...
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  Мэдээлэл олдсонгүй
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((task) => {
                const priority  = PRIORITY_MAP[task.priority];
                const bookingSt = BOOKING_STATUS_MAP[task.booking_status];
                return (
                  <TableRow key={task.id} className="hover:bg-muted/50">
                    <TableCell><Checkbox /></TableCell>
                    <TableCell className="font-semibold">{task.room_number}</TableCell>
                    <TableCell className="text-sm">{task.room_type_name}</TableCell>
                    <TableCell className="text-center">{task.floor}</TableCell>
                    <TableCell className="text-center">
                      <CleaningStatusSelect
                        taskId={task.id}
                        value={task.cleaning_status}
                        onUpdated={handleStatusUpdated}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1 text-sm ${priority?.className ?? ''}`}>
                        {priority?.icon} {priority?.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${bookingSt?.className ?? 'bg-gray-100 text-gray-700'} hover:opacity-90`}>
                        {bookingSt?.label ?? task.booking_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{task.assigned_to || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {task.notes || '—'}
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
