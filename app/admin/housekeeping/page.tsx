'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getClientBackendToken } from '@/utils/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  IconSearch,
  IconPlus,
  IconDownload,
  IconPrinter,
  IconX,
  IconRefresh,
  IconFilter,
  IconUser,
  IconEye,
  IconEdit,
  IconCheck,
  IconLoader2,
  IconCalendar,
  IconSparkles,
  IconChevronDown,
  IconNote,
  IconClock,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TaskLog {
  id: number;
  action: string;
  action_label: string;
  note: string;
  performed_by: number;
  performed_by_name: string;
  created_at: string;
}

interface CleaningTask {
  id: number;
  property: number;
  rooms: number[];
  room_numbers: number[];
  cleaning_type: number;
  cleaning_type_name: string;
  assignee: number | null;
  assignee_name: string | null;
  supervisor: number | null;
  supervisor_name: string | null;
  priority: string;
  priority_label: string;
  status: string;
  status_label: string;
  note: string;
  booking: number | null;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  created_by: number;
  created_by_name: string;
  logs: TaskLog[];
  created_at: string;
  updated_at: string;
}

interface GuestRequest {
  id: number;
  property: number;
  room: number;
  room_number: number;
  assignee: number | null;
  assignee_name: string | null;
  priority: string;
  priority_label: string;
  status: string;
  status_label: string;
  note: string;
  completed_at: string | null;
  created_by: number;
  created_by_name: string;
  logs: TaskLog[];
  created_at: string;
  updated_at: string;
}

interface HousekeepingStaff {
  id: number;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

interface RoomItem {
  id: number;
  room_number: string | number;
  room_type_name?: string;
}

interface CleaningType {
  id: number;
  name: string;
}

// ─── Static config ─────────────────────────────────────────────────────────────

const CLEANING_STATUS: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Бохир',           cls: 'bg-red-50 text-red-600 border border-red-200' },
  assigned:  { label: 'Хүлээгдэж байна', cls: 'bg-blue-50 text-blue-600 border border-blue-200' },
  cleaning:  { label: 'Цэвэрлэж байна',  cls: 'bg-sky-50 text-sky-600 border border-sky-200' },
  completed: { label: 'Биелсэн',         cls: 'bg-green-50 text-green-600 border border-green-200' },
};

const PRIORITY_MAP: Record<string, { label: string; cls: string; star: string }> = {
  low:    { label: 'Бага',         cls: 'text-gray-500',    star: '☆' },
  medium: { label: 'Дунд',         cls: 'text-yellow-500',  star: '★' },
  normal: { label: 'Дунд',         cls: 'text-yellow-500',  star: '★' },
  high:   { label: 'Яаралтай',     cls: 'text-orange-500',  star: '★' },
  urgent: { label: 'Маш яаралтай', cls: 'text-red-600',     star: '★' },
  vip:    { label: 'VIP',          cls: 'text-red-700 font-bold', star: '★' },
};

const ROOM_STATUS_FROM_TYPE: Record<string, { label: string; cls: string }> = {
  'Check-out cleaning': { label: 'Биелсэн',        cls: 'bg-green-100 text-green-700 font-medium' },
  'Deep cleaning':      { label: 'Биелсэн',        cls: 'bg-green-100 text-green-700 font-medium' },
  'Stay-over cleaning': { label: 'Байрлаж байгаа', cls: 'bg-green-100 text-green-700 font-medium' },
  'Touch-up cleaning':  { label: 'Байрлаж байгаа', cls: 'bg-green-100 text-green-700 font-medium' },
  'DND':                { label: 'DND',             cls: 'bg-gray-100 text-gray-600' },
};

const GUEST_STATUS: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Драфт',           cls: 'bg-gray-100 text-gray-600' },
  pending:   { label: 'Хүлээгдэж байна', cls: 'bg-blue-50 text-blue-600 border border-blue-200' },
  completed: { label: 'Биелсэн',         cls: 'bg-green-50 text-green-600' },
  cancelled: { label: 'Цуцлагдсан',      cls: 'bg-red-50 text-red-500' },
};

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Бага' },
  { value: 'medium', label: 'Дунд' },
  { value: 'high',   label: 'Яаралтай' },
  { value: 'urgent', label: 'Маш яаралтай' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('mn-MN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtTime(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
}

// ─── SearchableSelect ──────────────────────────────────────────────────────────

interface SearchableSelectProps {
  options: { id: number; name: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  extraAction?: { label: string; onClick: () => void };
  rowActions?: (item: { id: number; name: string }) => { onEdit?: () => void; onDelete?: () => void };
}

function SearchableSelect({
  options, value, onChange, placeholder = 'Сонгох', label, extraAction, rowActions,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()));
  const selected = options.find((o) => String(o.id) === value);

  useEffect(() => {
    function handleOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOut);
    return () => document.removeEventListener('mousedown', handleOut);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm bg-background hover:bg-muted/40 transition-colors',
          !value ? 'text-muted-foreground border-input' : 'text-foreground border-input'
        )}
      >
        <span>{selected ? selected.name : placeholder}</span>
        <IconChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="p-2">
            <div className="relative">
              <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Хайх"
                className="w-full rounded border bg-background pl-7 pr-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          {label && (
            <div className="px-3 py-1 text-xs text-muted-foreground font-medium border-t">
              {label}
            </div>
          )}
          <div className="max-h-48 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">Олдсонгүй</div>
            ) : (
              filtered.map((o) => {
                const actions = rowActions?.(o);
                return (
                  <div
                    key={o.id}
                    className={cn(
                      'group relative flex items-center hover:bg-muted/60 transition-colors',
                      String(o.id) === value && 'bg-primary/10'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => { onChange(String(o.id)); setOpen(false); setQ(''); }}
                      className={cn(
                        'flex-1 px-3 py-2 text-left text-sm',
                        String(o.id) === value && 'text-primary font-medium'
                      )}
                    >
                      {o.name}
                    </button>
                    {actions && (
                      <div className="flex items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {actions.onEdit && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); actions.onEdit?.(); setOpen(false); }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <IconPencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {actions.onDelete && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); actions.onDelete?.(); setOpen(false); }}
                            className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <IconX className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {extraAction && (
            <>
              <div className="border-t" />
              <button
                type="button"
                onClick={() => { extraAction.onClick(); setOpen(false); }}
                className="w-full flex items-center gap-1.5 px-3 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors"
              >
                <IconPlus className="h-3.5 w-3.5" />
                {extraAction.label}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MultiCheckSelect (cleaning types) ─────────────────────────────────────────

interface MultiCheckSelectProps {
  options: CleaningType[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}

function MultiCheckSelect({
  options, value, onChange, placeholder = 'Сонгох', label,
}: MultiCheckSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()));
  const selected = options.find((o) => String(o.id) === value);

  useEffect(() => {
    function handleOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOut);
    return () => document.removeEventListener('mousedown', handleOut);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between rounded-md border border-input px-3 py-2 text-sm bg-background hover:bg-muted/40 transition-colors"
      >
        <span className={!value ? 'text-muted-foreground' : 'text-foreground'}>
          {selected ? selected.name : placeholder}
        </span>
        <IconChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="p-2">
            <div className="relative">
              <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Хайх"
                className="w-full rounded border bg-background pl-7 pr-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          {label && (
            <div className="px-3 py-1 text-xs text-muted-foreground font-medium border-t">
              {label}
            </div>
          )}
          <div className="max-h-48 overflow-auto">
            {filtered.map((o) => (
              <div
                key={o.id}
                role="option"
                aria-selected={String(o.id) === value}
                onClick={() => { onChange(String(o.id)); setOpen(false); setQ(''); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 transition-colors cursor-pointer select-none"
              >
                <Checkbox checked={String(o.id) === value} readOnly className="pointer-events-none" />
                {o.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Activity Timeline ─────────────────────────────────────────────────────────

const LOG_ICONS: Record<string, React.ReactNode> = {
  created:   <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><IconPlus className="h-3.5 w-3.5" /></span>,
  assigned:  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600"><IconUser className="h-3.5 w-3.5" /></span>,
  cleaning:  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600"><IconSparkles className="h-3.5 w-3.5" /></span>,
  completed: <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600"><IconCheck className="h-3.5 w-3.5" /></span>,
  note:      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground"><IconNote className="h-3.5 w-3.5" /></span>,
};

function ActivityLog({ logs }: { logs: TaskLog[] }) {
  if (!logs.length) return <div className="text-sm text-muted-foreground py-2">Мэдээлэл байхгүй</div>;
  return (
    <div className="space-y-0">
      {logs.map((log, i) => (
        <div key={log.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            {LOG_ICONS[log.action] ?? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <IconClock className="h-3.5 w-3.5" />
              </span>
            )}
            {i < logs.length - 1 && <div className="w-px flex-1 bg-border mt-1 mb-1" />}
          </div>
          <div className="pb-4 min-w-0">
            <div className="text-sm font-medium leading-7">{log.action_label}</div>
            <div className="text-xs text-muted-foreground">{fmtDateTime(log.created_at)}</div>
            {log.note && (
              <div className="mt-1 text-sm text-foreground/80 bg-muted/50 rounded px-2 py-1">
                {log.note}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Stats Panel ──────────────────────────────────────────────────────────────

function StatsPanel({ tasks }: { tasks: CleaningTask[] }) {
  const total     = tasks.length;
  const dirty     = tasks.filter((t) => t.status === 'pending').length;
  const waiting   = tasks.filter((t) => t.status === 'assigned' || t.status === 'cleaning').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 w-[200px] shrink-0">
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Нийт өрөө</span>
          <Badge variant="outline" className="text-xs">өнөөдөр</Badge>
        </div>
        <div className="text-3xl font-bold">{total}</div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm border-red-100">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="h-2 w-2 rounded-full bg-red-400 inline-block" />
          <span className="text-xs text-muted-foreground">Цэвэрлэгдэж өрөө</span>
        </div>
        <div className="text-3xl font-bold text-red-600">{dirty}</div>
        <div className="mt-1">
          <Badge className="bg-red-50 text-red-600 border border-red-200 text-xs rounded-full">Бохир</Badge>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm border-blue-100">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="h-2 w-2 rounded-full bg-blue-400 inline-block" />
          <span className="text-xs text-muted-foreground">Хүлээгдэж байгаа</span>
        </div>
        <div className="text-3xl font-bold text-blue-600">{waiting}</div>
        <div className="mt-1">
          <Badge className="bg-blue-50 text-blue-600 border border-blue-200 text-xs rounded-full">Цэвэрлэж байна</Badge>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm border-green-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-400 inline-block" />
            <span className="text-xs text-muted-foreground">Биелсэн</span>
          </div>
          <span className="text-xs font-semibold text-green-600">{pct}%</span>
        </div>
        <div className="text-3xl font-bold text-green-600">{completed}</div>
        <div className="mt-1">
          <Badge className="bg-green-50 text-green-600 border border-green-200 text-xs rounded-full">Биелсэн</Badge>
        </div>
      </div>
    </div>
  );
}

// ─── Guest Request Card ────────────────────────────────────────────────────────

function GuestRequestCard({
  req,
  onComplete,
  onCancel,
}: {
  req: GuestRequest;
  onComplete: (id: number) => void;
  onCancel: (id: number) => void;
}) {
  const priority = PRIORITY_MAP[req.priority] ?? PRIORITY_MAP.medium;
  const status   = GUEST_STATUS[req.status] ?? { label: req.status_label, cls: 'bg-gray-100 text-gray-600' };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 w-[260px]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background font-bold text-sm shrink-0">
            {req.room_number}
          </span>
          <span className={cn('text-xs font-medium', priority.cls)}>
            {priority.star} {priority.label}
          </span>
        </div>
        <Badge className={cn('text-xs font-medium rounded-full shrink-0', status.cls)}>
          {status.label}
        </Badge>
      </div>

      <div className="text-sm font-medium min-h-[1.5rem]">{req.note || '—'}</div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <IconUser className="h-3.5 w-3.5" />
          {req.assignee_name ?? 'Хариуцсан ажилтан байхгүй'}
        </span>
        <span className="flex items-center gap-1">
          <IconClock className="h-3.5 w-3.5" />
          {fmtTime(req.created_at)}
        </span>
      </div>

      {(req.status === 'pending' || req.status === 'draft') && (
        <div className="flex items-center justify-end gap-2 mt-1">
          {req.status === 'pending' && (
            <button
              type="button"
              onClick={() => onComplete(req.id)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
            >
              <IconCheck className="h-4 w-4" />
            </button>
          )}
          {req.status === 'draft' && (
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <IconEdit className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onCancel(req.id)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function HousekeepingPage() {
  const [tasks, setTasks]                       = useState<CleaningTask[]>([]);
  const [guestRequests, setGuestRequests]       = useState<GuestRequest[]>([]);
  const [staff, setStaff]                       = useState<HousekeepingStaff[]>([]);
  const [cleaningTypes, setCleaningTypes]       = useState<CleaningType[]>([]);
  const [rooms, setRooms]                       = useState<RoomItem[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [searchQuery, setSearchQuery]           = useState('');

  // Detail drawer
  const [selectedTask, setSelectedTask]         = useState<CleaningTask | null>(null);
  const [drawerOpen, setDrawerOpen]             = useState(false);
  const [drawerNote, setDrawerNote]             = useState('');
  const [drawerAssignee, setDrawerAssignee]     = useState('');
  const [drawerSupervisor, setDrawerSupervisor] = useState('');
  const [drawerSaving, setDrawerSaving]         = useState(false);

  // Create cleaning task
  const [createOpen, setCreateOpen]             = useState(false);
  const [createRoom, setCreateRoom]             = useState('');
  const [createType, setCreateType]             = useState('');
  const [createPriority, setCreatePriority]     = useState('medium');
  const [createAssignee, setCreateAssignee]     = useState('');
  const [createSupervisor, setCreateSupervisor] = useState('');
  const [createNote, setCreateNote]             = useState('');
  const [creating, setCreating]                 = useState(false);

  // Create guest request
  const [createGuestOpen, setCreateGuestOpen]   = useState(false);
  const [guestRoom, setGuestRoom]               = useState('');
  const [guestAssignee, setGuestAssignee]       = useState('');
  const [guestPriority, setGuestPriority]       = useState('medium');
  const [guestNote, setGuestNote]               = useState('');
  const [creatingGuest, setCreatingGuest]       = useState(false);

  // Complete confirm modal
  const [completeModal, setCompleteModal]       = useState<{ id: number; type: 'task' | 'guest' } | null>(null);
  const [completing, setCompleting]             = useState(false);
  const [completeDone, setCompleteDone]         = useState(false);

  // Staff modal
  const [staffModal, setStaffModal]             = useState<'create' | 'edit' | null>(null);
  const [editingStaff, setEditingStaff]         = useState<HousekeepingStaff | null>(null);
  const [staffName, setStaffName]               = useState('');
  const [staffPhone, setStaffPhone]             = useState('');
  const [staffPhoneError, setStaffPhoneError]   = useState('');
  const [staffSaving, setStaffSaving]           = useState(false);
  const [deleteStaffId, setDeleteStaffId]       = useState<number | null>(null);
  const [deletingStaff, setDeletingStaff]       = useState(false);

  // ── Data fetching ───────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const t = await getClientBackendToken();
      if (!t) { setLoading(false); return; }

      const [taskData, guestData, staffData, typeData, roomData] = await Promise.allSettled([
        fetch(`${API_BASE}/api/cleaning-tasks/?token=${encodeURIComponent(t)}`).then((r) => r.ok ? r.json() : []),
        fetch(`${API_BASE}/api/guest-requests/?token=${encodeURIComponent(t)}`).then((r) => r.ok ? r.json() : []),
        fetch(`${API_BASE}/api/housekeeping-staff/?token=${encodeURIComponent(t)}`).then((r) => r.ok ? r.json() : []),
        fetch(`${API_BASE}/api/cleaning-types/?token=${encodeURIComponent(t)}`)
          .then((r) => r.ok ? r.json() : null)
          .then((d) => (Array.isArray(d) && d.length ? d : [
            { id: 1, name: 'Check-out cleaning' },
            { id: 2, name: 'Stay-over cleaning' },
            { id: 3, name: 'Touch-up cleaning' },
            { id: 4, name: 'Deep cleaning' },
            { id: 5, name: 'DND' },
          ])),
        fetch(`/api/rooms?token=${encodeURIComponent(t)}`).then((r) => r.ok ? r.json() : []),
      ]);

      if (taskData.status === 'fulfilled') setTasks(Array.isArray(taskData.value) ? taskData.value : []);
      if (guestData.status === 'fulfilled') setGuestRequests(Array.isArray(guestData.value) ? guestData.value : []);
      if (staffData.status === 'fulfilled') setStaff(Array.isArray(staffData.value) ? staffData.value : []);
      if (typeData.status === 'fulfilled') setCleaningTypes(typeData.value);
      if (roomData.status === 'fulfilled') {
        const raw: RoomItem[] = Array.isArray(roomData.value) ? roomData.value : [];
        // Deduplicate by room_number (the group id is shared across rooms of same type).
        // Filter out nulls and non-numeric room_numbers (e.g. group names with no rooms).
        const seen = new Set<number>();
        setRooms(
          raw
            .filter((r) => {
              const n = Number(r.room_number);
              if (!r.room_number || isNaN(n) || n <= 0) return false;
              if (seen.has(n)) return false;
              seen.add(n);
              return true;
            })
            .sort((a, b) => Number(a.room_number) - Number(b.room_number))
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Staff modal handlers ────────────────────────────────────────────────────

  function openCreateStaff() {
    setEditingStaff(null);
    setStaffName('');
    setStaffPhone('');
    setStaffPhoneError('');
    setStaffModal('create');
  }

  function openEditStaff(s: HousekeepingStaff) {
    setEditingStaff(s);
    setStaffName(s.name);
    setStaffPhone(s.phone);
    setStaffPhoneError('');
    setStaffModal('edit');
  }

  async function handleSaveStaff() {
    if (!staffName.trim()) { toast.error('Нэр оруулна уу'); return; }
    if (!staffPhone.trim()) { toast.error('Утасны дугаар оруулна уу'); return; }
    setStaffSaving(true);
    setStaffPhoneError('');
    try {
      const t = await getClientBackendToken();
      if (!t) throw new Error('No token');
      const isEdit = staffModal === 'edit' && editingStaff;
      const url = isEdit
        ? `${API_BASE}/api/housekeeping-staff/${editingStaff!.id}/?token=${encodeURIComponent(t)}`
        : `${API_BASE}/api/housekeeping-staff/?token=${encodeURIComponent(t)}`;
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: staffName.trim(), phone: staffPhone.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as Record<string, unknown>;
        const phoneErr = (err.phone as string[] | undefined)?.[0] ?? (err.non_field_errors as string[] | undefined)?.[0];
        if (phoneErr) { setStaffPhoneError('Энэ дугаар дэр бүртгэгдсэн байна.'); return; }
        throw new Error('Failed');
      }
      const saved: HousekeepingStaff = await res.json();
      if (isEdit) {
        setStaff((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
        toast.success('Мэдээлэл шинэчлэгдлээ');
      } else {
        setStaff((prev) => [...prev, saved]);
        toast.success('Цэвэрлэгч нэмэгдлээ');
      }
      setStaffModal(null);
    } catch {
      toast.error('Алдаа гарлаа');
    } finally {
      setStaffSaving(false);
    }
  }

  async function handleDeleteStaff() {
    if (!deleteStaffId) return;
    setDeletingStaff(true);
    try {
      const t = await getClientBackendToken();
      if (!t) throw new Error('No token');
      const res = await fetch(
        `${API_BASE}/api/housekeeping-staff/${deleteStaffId}/?token=${encodeURIComponent(t)}`,
        { method: 'DELETE' }
      );
      if (!res.ok && res.status !== 204) throw new Error('Failed');
      setStaff((prev) => prev.filter((s) => s.id !== deleteStaffId));
      toast.success('Устгагдлаа');
      setDeleteStaffId(null);
    } catch {
      toast.error('Алдаа гарлаа');
    } finally {
      setDeletingStaff(false);
    }
  }

  // ── Detail drawer ───────────────────────────────────────────────────────────

  function openDetail(task: CleaningTask) {
    setSelectedTask(task);
    setDrawerAssignee(task.assignee ? String(task.assignee) : '');
    setDrawerSupervisor(task.supervisor ? String(task.supervisor) : '');
    setDrawerNote('');
    setDrawerOpen(true);
  }

  async function handleAssign() {
    if (!selectedTask || !drawerAssignee) { toast.error('Ажилтан сонгоно уу'); return; }
    setDrawerSaving(true);
    try {
      const t = await getClientBackendToken();
      if (!t) throw new Error('No token');
      const res = await fetch(
        `${API_BASE}/api/cleaning-tasks/${selectedTask.id}/assign/?token=${encodeURIComponent(t)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignee: Number(drawerAssignee),
            ...(drawerSupervisor && { supervisor: Number(drawerSupervisor) }),
          }),
        }
      );
      if (!res.ok) throw new Error('Failed');
      const updated: CleaningTask = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTask(updated);
      toast.success('Ажил хуваарилагдлаа');
    } catch {
      toast.error('Алдаа гарлаа');
    } finally {
      setDrawerSaving(false);
    }
  }

  async function handleAddNote() {
    if (!selectedTask || !drawerNote.trim()) return;
    setDrawerSaving(true);
    try {
      const t = await getClientBackendToken();
      if (!t) throw new Error('No token');
      const res = await fetch(
        `${API_BASE}/api/cleaning-tasks/${selectedTask.id}/add-note/?token=${encodeURIComponent(t)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: drawerNote }),
        }
      );
      if (!res.ok) throw new Error('Failed');
      const updated: CleaningTask = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTask(updated);
      setDrawerNote('');
      toast.success('Тэмдэглэл нэмэгдлээ');
    } catch {
      toast.error('Алдаа гарлаа');
    } finally {
      setDrawerSaving(false);
    }
  }

  // ── Complete ────────────────────────────────────────────────────────────────

  async function handleComplete() {
    if (!completeModal) return;
    setCompleting(true);
    try {
      const t = await getClientBackendToken();
      if (!t) throw new Error('No token');
      const url = completeModal.type === 'task'
        ? `${API_BASE}/api/cleaning-tasks/${completeModal.id}/complete/?token=${encodeURIComponent(t)}`
        : `${API_BASE}/api/guest-requests/${completeModal.id}/complete/?token=${encodeURIComponent(t)}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      if (completeModal.type === 'task') {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        if (selectedTask?.id === updated.id) setSelectedTask(updated);
      } else {
        setGuestRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      }
      setCompleteDone(true);
    } catch {
      toast.error('Алдаа гарлаа');
      setCompleteModal(null);
    } finally {
      setCompleting(false);
    }
  }

  // ── Cancel guest request ────────────────────────────────────────────────────

  async function handleCancelRequest(id: number) {
    try {
      const t = await getClientBackendToken();
      if (!t) throw new Error('No token');
      const res = await fetch(
        `${API_BASE}/api/guest-requests/${id}/cancel/?token=${encodeURIComponent(t)}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }
      );
      if (!res.ok) throw new Error('Failed');
      const updated: GuestRequest = await res.json();
      setGuestRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast.success('Цуцлагдлаа');
    } catch {
      toast.error('Алдаа гарлаа');
    }
  }

  // ── Create task ─────────────────────────────────────────────────────────────

  async function handleCreateTask() {
    if (!createRoom) { toast.error('Өрөө сонгоно уу'); return; }
    if (!createType) { toast.error('Цэвэрлэгээний төрөл сонгоно уу'); return; }
    setCreating(true);
    try {
      const t = await getClientBackendToken();
      if (!t) throw new Error('No token');
      const body: Record<string, unknown> = {
        rooms: [Number(createRoom)],
        cleaning_type: Number(createType),
        priority: createPriority,
        note: createNote,
      };
      if (createAssignee) body.assignee = Number(createAssignee);
      if (createSupervisor) body.supervisor = Number(createSupervisor);

      const res = await fetch(`${API_BASE}/api/cleaning-tasks/?token=${encodeURIComponent(t)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err?.error ?? 'Failed');
      }
      toast.success('Цэвэрлэгээ үүслээ');
      setCreateOpen(false);
      setCreateRoom(''); setCreateType(''); setCreatePriority('medium');
      setCreateAssignee(''); setCreateSupervisor(''); setCreateNote('');
      loadAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Алдаа гарлаа');
    } finally {
      setCreating(false);
    }
  }

  // ── Create guest request ────────────────────────────────────────────────────

  async function handleCreateGuestRequest() {
    if (!guestRoom) { toast.error('Өрөө сонгоно уу'); return; }
    setCreatingGuest(true);
    try {
      const t = await getClientBackendToken();
      if (!t) throw new Error('No token');
      const body: Record<string, unknown> = {
        room: Number(guestRoom),
        priority: guestPriority,
        note: guestNote,
      };
      if (guestAssignee) body.assignee = Number(guestAssignee);
      const res = await fetch(`${API_BASE}/api/guest-requests/?token=${encodeURIComponent(t)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err?.error ?? 'Failed');
      }
      toast.success('Хүсэлт үүслээ');
      setCreateGuestOpen(false);
      setGuestRoom(''); setGuestAssignee(''); setGuestPriority('medium'); setGuestNote('');
      loadAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Алдаа гарлаа');
    } finally {
      setCreatingGuest(false);
    }
  }

  // ── Derived data ────────────────────────────────────────────────────────────

  const staffOptions = staff.filter((s) => s.is_active).map((s) => ({ id: s.id, name: s.name }));

  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.room_numbers.some((n) => String(n).includes(q)) ||
      (t.cleaning_type_name ?? '').toLowerCase().includes(q) ||
      (t.assignee_name ?? '').toLowerCase().includes(q) ||
      (t.note ?? '').toLowerCase().includes(q)
    );
  });

  const pendingReqs   = guestRequests.filter((r) => r.status === 'pending');
  const draftReqs     = guestRequests.filter((r) => r.status === 'draft');
  const completedReqs = guestRequests.filter((r) => r.status === 'completed' || r.status === 'cancelled');

  const completeRoomLabel = () => {
    if (!completeModal) return '';
    if (completeModal.type === 'task') {
      const found = tasks.find((t) => t.id === completeModal.id);
      return found?.room_numbers.join(', ') ?? '';
    }
    return String(guestRequests.find((r) => r.id === completeModal.id)?.room_number ?? '');
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="space-y-6 p-4 md:p-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Цэвэрлэгээ, нэмэлт хүсэлт</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
              <IconRefresh className={cn('h-4 w-4 mr-1.5', loading && 'animate-spin')} />
              Шинэчлэх
            </Button>
            <Button variant="outline" size="sm">
              <IconDownload className="h-4 w-4 mr-1.5" />
              Татах
            </Button>
            <Button variant="outline" size="sm">
              <IconPrinter className="h-4 w-4 mr-1.5" />
              Хэвлэх
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCreateGuestOpen(true)}>
              <IconPlus className="h-4 w-4 mr-1.5" />
              Нэмэлт хүсэлт
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <IconSparkles className="h-4 w-4 mr-1.5" />
              Цэвэрлэгээ үүсгэх
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Өрөө, ажилтны нэрээр хайх"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* ── CLEANING TASKS ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold uppercase tracking-wide text-foreground/70">
              Цэвэрлэгээний жагсаалт
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <IconCalendar className="h-4 w-4" />
                Өнөөдөр
                <IconChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <IconFilter className="h-4 w-4" />
                Шүүлтүр
              </Button>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            {/* Table */}
            <div className="flex-1 min-w-0 rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10"><Checkbox /></TableHead>
                    <TableHead className="font-medium">Өрөө №</TableHead>
                    <TableHead className="font-medium">Өрөөний төлөв</TableHead>
                    <TableHead className="font-medium">Ажилтан ба хянагч</TableHead>
                    <TableHead className="font-medium">Нэмэлт тэмдэглэл</TableHead>
                    <TableHead className="font-medium">Төлөв</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        <IconLoader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Уншиж байна...
                      </TableCell>
                    </TableRow>
                  ) : filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        Мэдээлэл олдсонгүй
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => {
                      const st     = CLEANING_STATUS[task.status] ?? { label: task.status_label, cls: 'bg-gray-100 text-gray-600' };
                      const pr     = PRIORITY_MAP[task.priority] ?? PRIORITY_MAP.medium;
                      const roomSt = ROOM_STATUS_FROM_TYPE[task.cleaning_type_name] ?? { label: 'Тодорхойгүй', cls: 'bg-gray-100 text-gray-600' };
                      const isActive = selectedTask?.id === task.id && drawerOpen;

                      return (
                        <TableRow
                          key={task.id}
                          className={cn(
                            'cursor-pointer hover:bg-muted/30 transition-colors',
                            isActive && 'bg-primary/5 border-l-2 border-l-primary'
                          )}
                          onClick={() => openDetail(task)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox />
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">{task.room_numbers.join(', ')}</div>
                            <div className="text-xs text-muted-foreground">Standard Single</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs rounded-full mb-1 font-medium', roomSt.cls)}>
                              → {roomSt.label}
                            </Badge>
                            <div className="text-xs text-muted-foreground">{task.cleaning_type_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{task.assignee_name ?? '—'}</div>
                            <div className="text-xs text-muted-foreground">
                              Хянасан: {task.supervisor_name ?? '—'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={cn('text-sm', pr.cls)}>
                              {pr.star} {pr.label}
                            </div>
                            {task.logs.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {task.logs[task.logs.length - 1]?.action_label}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs rounded-full font-medium whitespace-nowrap', st.cls)}>
                              {st.label}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => openDetail(task)}
                              className="p-1 rounded hover:bg-muted/60 text-muted-foreground transition-colors"
                            >
                              <IconEye className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Stats panel */}
            <StatsPanel tasks={tasks} />
          </div>
        </section>

        {/* ── GUEST REQUESTS ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold uppercase tracking-wide text-foreground/70">
              Зочны нэмэлт хүсэлт
            </h2>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="h-8 w-[160px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Чухлын зэрэг: Бүгд</SelectItem>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Өрөө, ажилтны нэрээр хайх"
                  className="pl-8 h-8 text-sm w-[220px]"
                />
              </div>
            </div>
          </div>

          {/* Pending */}
          {pendingReqs.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold">Хүлээгдэж бүй</span>
                <Badge className="bg-blue-100 text-blue-700 border border-blue-200 rounded-full">
                  {pendingReqs.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                {pendingReqs.map((req) => (
                  <GuestRequestCard
                    key={req.id}
                    req={req}
                    onComplete={(id) => { setCompleteModal({ id, type: 'guest' }); setCompleteDone(false); }}
                    onCancel={handleCancelRequest}
                  />
                ))}
              </div>
              <button type="button" className="mt-2 text-sm text-primary hover:underline">
                Бүгдийг харах →
              </button>
            </div>
          )}

          {/* Draft */}
          {draftReqs.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold">Драфт</span>
                <Badge variant="secondary" className="rounded-full">{draftReqs.length}</Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                {draftReqs.map((req) => (
                  <GuestRequestCard
                    key={req.id}
                    req={req}
                    onComplete={(id) => { setCompleteModal({ id, type: 'guest' }); setCompleteDone(false); }}
                    onCancel={handleCancelRequest}
                  />
                ))}
              </div>
              <button type="button" className="mt-2 text-sm text-primary hover:underline">
                Бүгдийг харах →
              </button>
            </div>
          )}

          {pendingReqs.length === 0 && draftReqs.length === 0 && !loading && (
            <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg bg-muted/20">
              Идэвхтэй хүсэлт байхгүй
            </div>
          )}
        </section>

        {/* ── COMPLETION HISTORY ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold uppercase tracking-wide text-foreground/70">
              Биелэлтийн түүх
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <IconCalendar className="h-4 w-4" />
                Өнөөдөр
                <IconChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <IconFilter className="h-4 w-4" />
                Шүүлтүр
              </Button>
              <div className="relative">
                <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Өрөө, ажилтны нэрээр хайх"
                  className="pl-8 h-8 text-sm w-[220px]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-10"><Checkbox /></TableHead>
                  <TableHead className="font-medium">Өрөө №</TableHead>
                  <TableHead className="font-medium">Хүсэлтийн төрөл</TableHead>
                  <TableHead className="font-medium">Хариуцан ажилтан</TableHead>
                  <TableHead className="font-medium">Үүсгэсэн цаг</TableHead>
                  <TableHead className="font-medium">Биелсэн цаг</TableHead>
                  <TableHead className="font-medium">Тэмдэглэл</TableHead>
                  <TableHead className="font-medium">Төлөв</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <IconLoader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {tasks.filter((t) => t.status === 'completed').map((task) => (
                      <TableRow key={`ct-${task.id}`} className="hover:bg-muted/30">
                        <TableCell><Checkbox /></TableCell>
                        <TableCell>
                          <div className="font-semibold">{task.room_numbers.join(', ')}</div>
                          <div className="text-xs text-muted-foreground">Standard Single</div>
                        </TableCell>
                        <TableCell>
                          <div className={cn('text-xs', PRIORITY_MAP[task.priority]?.cls)}>
                            {PRIORITY_MAP[task.priority]?.star} {PRIORITY_MAP[task.priority]?.label}
                          </div>
                          <div className="text-sm">{task.cleaning_type_name}</div>
                        </TableCell>
                        <TableCell className="text-sm">{task.assignee_name ?? '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(task.created_at)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(task.completed_at)}</TableCell>
                        <TableCell className="text-sm max-w-[160px] truncate text-muted-foreground">{task.note || '—'}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-50 text-green-600 border border-green-200 text-xs rounded-full">
                            Биелсэн
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button type="button" onClick={() => openDetail(task)} className="p-1 rounded hover:bg-muted/60 text-muted-foreground">
                            <IconEye className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {completedReqs.map((req) => (
                      <TableRow key={`gr-${req.id}`} className="hover:bg-muted/30">
                        <TableCell><Checkbox /></TableCell>
                        <TableCell>
                          <div className="font-semibold">{req.room_number}</div>
                          <div className="text-xs text-muted-foreground">Standard Single</div>
                        </TableCell>
                        <TableCell>
                          <div className={cn('text-xs', PRIORITY_MAP[req.priority]?.cls)}>
                            {PRIORITY_MAP[req.priority]?.star} {PRIORITY_MAP[req.priority]?.label}
                          </div>
                          <div className="text-sm">Extra-cleaning</div>
                        </TableCell>
                        <TableCell className="text-sm">{req.assignee_name ?? '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(req.created_at)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(req.completed_at)}</TableCell>
                        <TableCell className="text-sm max-w-[160px] truncate text-muted-foreground">{req.note || '—'}</TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs rounded-full', GUEST_STATUS[req.status]?.cls ?? 'bg-gray-100 text-gray-600')}>
                            {GUEST_STATUS[req.status]?.label ?? req.status_label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button type="button" className="p-1 rounded hover:bg-muted/60 text-muted-foreground">
                            <IconEye className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {tasks.filter((t) => t.status === 'completed').length === 0 && completedReqs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Биелэлтийн түүх байхгүй
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      {/* ═══ TASK DETAIL DRAWER ════════════════════════════════════════════════ */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-[420px] sm:w-[460px] p-0 flex flex-col">
          {selectedTask && (
            <>
              <SheetHeader className="px-5 pt-5 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-lg font-semibold">
                    № {selectedTask.room_numbers.join(', ')}
                  </SheetTitle>
                  <Badge className={cn(
                    'text-xs rounded-full font-medium',
                    CLEANING_STATUS[selectedTask.status]?.cls ?? 'bg-gray-100 text-gray-600'
                  )}>
                    {CLEANING_STATUS[selectedTask.status]?.label ?? selectedTask.status_label}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
                {/* Assignee */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <IconUser className="h-4 w-4 text-muted-foreground" />
                    Ажилтан
                  </Label>
                  <SearchableSelect
                    options={staffOptions}
                    value={drawerAssignee}
                    onChange={setDrawerAssignee}
                    placeholder="Select assignee"
                    label="Цэвэрлэгчийн нэрс"
                    extraAction={{ label: 'Цэвэрлэгч нэмэх', onClick: openCreateStaff }}
                    rowActions={(item) => ({
                      onEdit: () => openEditStaff(staff.find((s) => s.id === item.id)!),
                      onDelete: () => setDeleteStaffId(item.id),
                    })}
                  />
                </div>

                {/* Supervisor */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <IconUser className="h-4 w-4 text-muted-foreground" />
                    Хянах ажилтан
                  </Label>
                  <SearchableSelect
                    options={staffOptions}
                    value={drawerSupervisor}
                    onChange={setDrawerSupervisor}
                    placeholder="Select assignee"
                    label="Цэвэрлэгчийн нэрс"
                    rowActions={(item) => ({
                      onEdit: () => openEditStaff(staff.find((s) => s.id === item.id)!),
                      onDelete: () => setDeleteStaffId(item.id),
                    })}
                  />
                </div>

                {/* Cleaning type */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <IconSparkles className="h-4 w-4 text-muted-foreground" />
                    Цэвэрлэгээний төрөл
                  </Label>
                  <MultiCheckSelect
                    options={cleaningTypes}
                    value={String(selectedTask.cleaning_type)}
                    onChange={() => {}}
                    placeholder={selectedTask.cleaning_type_name}
                    label="Цэвэрлэгээний төрөл"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-yellow-500">★</span>
                    Чухлын зэрэг
                  </Label>
                  <Select value={selectedTask.priority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Бага</SelectItem>
                      <SelectItem value="medium">Дундаж</SelectItem>
                      <SelectItem value="high">Яаралтай</SelectItem>
                      <SelectItem value="urgent">Маш яаралтай</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <IconNote className="h-4 w-4 text-muted-foreground" />
                      Тэмдэглэл
                    </Label>
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={!drawerNote.trim() || drawerSaving}
                      className="h-6 w-6 flex items-center justify-center rounded border hover:bg-muted/60 disabled:opacity-40 transition-colors"
                    >
                      {drawerSaving ? (
                        <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <IconPlus className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  {selectedTask.logs
                    .filter((l) => l.note)
                    .slice(-2)
                    .map((l) => (
                      <div key={l.id} className="rounded-lg border bg-muted/30 p-3">
                        <div className="text-xs font-medium text-foreground/70 mb-0.5">
                          {l.performed_by_name} · {fmtDateTime(l.created_at)}
                        </div>
                        <div className="text-sm">{l.note}</div>
                      </div>
                    ))}
                  <Textarea
                    value={drawerNote}
                    onChange={(e) => setDrawerNote(e.target.value)}
                    placeholder="Тэмдэглэл нэмэх..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Activity log */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Ажлын үйл явц</Label>
                  <ActivityLog logs={selectedTask.logs} />
                </div>
              </div>

              <div className="px-5 py-3 border-t flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled={selectedTask.status === 'completed' || drawerSaving}
                  onClick={() => { setCompleteModal({ id: selectedTask.id, type: 'task' }); setCompleteDone(false); }}
                >
                  Шууд цэвэрхэн болгох
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleAssign}
                  disabled={drawerSaving}
                >
                  {drawerSaving && <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" />}
                  Ажил хуваарилах
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ═══ CREATE TASK DRAWER ════════════════════════════════════════════════ */}
      <Sheet
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) {
            setCreateRoom(''); setCreateType(''); setCreatePriority('medium');
            setCreateAssignee(''); setCreateSupervisor(''); setCreateNote('');
          }
        }}
      >
        <SheetContent side="right" className="w-[420px] sm:w-[460px] p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-3 border-b">
            <SheetTitle>Цэвэрлэгээ үүсгэх</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Өрөөний №</Label>
              <Select value={createRoom} onValueChange={setCreateRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Өрөө сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={String(r.room_number)} value={String(r.room_number)}>
                      Өрөө {r.room_number}
                    </SelectItem>
                  ))}
                  {rooms.length === 0 && (
                    <SelectItem value="_none" disabled>Өрөө байхгүй</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <IconUser className="h-4 w-4 text-muted-foreground" />
                Ажилтан
              </Label>
              <SearchableSelect
                options={staffOptions}
                value={createAssignee}
                onChange={setCreateAssignee}
                placeholder="Select assignee"
                label="Цэвэрлэгчийн нэрс"
                extraAction={{ label: 'Цэвэрлэгч нэмэх', onClick: openCreateStaff }}
                rowActions={(item) => ({
                  onEdit: () => openEditStaff(staff.find((s) => s.id === item.id)!),
                  onDelete: () => setDeleteStaffId(item.id),
                })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <IconUser className="h-4 w-4 text-muted-foreground" />
                Хянах ажилтан
              </Label>
              <SearchableSelect
                options={staffOptions}
                value={createSupervisor}
                onChange={setCreateSupervisor}
                placeholder="Select assignee"
                label="Цэвэрлэгчийн нэрс"
                rowActions={(item) => ({
                  onEdit: () => openEditStaff(staff.find((s) => s.id === item.id)!),
                  onDelete: () => setDeleteStaffId(item.id),
                })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <IconSparkles className="h-4 w-4 text-muted-foreground" />
                Цэвэрлэгээний төрөл
              </Label>
              <MultiCheckSelect
                options={cleaningTypes}
                value={createType}
                onChange={setCreateType}
                placeholder="Check-out cleaning"
                label="Цэвэрлэгээний төрөл"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <span className="text-yellow-500">★</span>
                Чухлын зэрэг
              </Label>
              <Select value={createPriority} onValueChange={setCreatePriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Бага</SelectItem>
                  <SelectItem value="medium">Дундаж</SelectItem>
                  <SelectItem value="high">Яаралтай</SelectItem>
                  <SelectItem value="urgent">Маш яаралтай</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <IconNote className="h-4 w-4 text-muted-foreground" />
                Тэмдэглэл
              </Label>
              <Textarea
                value={createNote}
                onChange={(e) => setCreateNote(e.target.value)}
                placeholder="Тэмдэглэл оруулах..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <div className="px-5 py-3 border-t flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCreateOpen(false)}
            >
              Буцах
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCreateTask}
              disabled={creating}
            >
              {creating && <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" />}
              Ажил хуваарилах
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ═══ CREATE GUEST REQUEST DRAWER ══════════════════════════════════════ */}
      <Sheet open={createGuestOpen} onOpenChange={setCreateGuestOpen}>
        <SheetContent side="right" className="w-[420px] sm:w-[460px] p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-3 border-b">
            <SheetTitle>Нэмэлт хүсэлт үүсгэх</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Өрөөний №</Label>
              <Select value={guestRoom} onValueChange={setGuestRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Өрөө сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={String(r.room_number)} value={String(r.room_number)}>
                      Өрөө {r.room_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <IconUser className="h-4 w-4 text-muted-foreground" />
                Ажилтан
              </Label>
              <SearchableSelect
                options={staffOptions}
                value={guestAssignee}
                onChange={setGuestAssignee}
                placeholder="Select assignee"
                label="Цэвэрлэгчийн нэрс"
                extraAction={{ label: 'Цэвэрлэгч нэмэх', onClick: openCreateStaff }}
                rowActions={(item) => ({
                  onEdit: () => openEditStaff(staff.find((s) => s.id === item.id)!),
                  onDelete: () => setDeleteStaffId(item.id),
                })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Чухлын зэрэг</Label>
              <Select value={guestPriority} onValueChange={setGuestPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <IconNote className="h-4 w-4 text-muted-foreground" />
                Тэмдэглэл
              </Label>
              <Textarea
                value={guestNote}
                onChange={(e) => setGuestNote(e.target.value)}
                placeholder="Хүсэлтийн дэлгэрэнгүй..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <div className="px-5 py-3 border-t flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setCreateGuestOpen(false)}>
              Буцах
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCreateGuestRequest}
              disabled={creatingGuest}
            >
              {creatingGuest && <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" />}
              Хадгалах
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ═══ STAFF CREATE / EDIT MODAL ══════════════════════════════════════════ */}
      <Dialog
        open={staffModal === 'create' || staffModal === 'edit'}
        onOpenChange={(o) => { if (!o) setStaffModal(null); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{staffModal === 'edit' ? 'Бүртгэл засах' : 'Цэвэрлэгч нэмэх'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Цэвэрлэгчийн нэр</Label>
              <Input
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="Нэр оруулах"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Холбогдох дугаар</Label>
              <Input
                value={staffPhone}
                onChange={(e) => { setStaffPhone(e.target.value); setStaffPhoneError(''); }}
                placeholder="99001122"
                className={staffPhoneError ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {staffPhoneError && (
                <p className="text-xs text-destructive">{staffPhoneError}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStaffModal(null)}
            >
              Буцах
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSaveStaff}
              disabled={staffSaving}
            >
              {staffSaving && <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {staffModal === 'edit' ? 'Хадгалах' : 'Бүртгэх'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ STAFF DELETE CONFIRM ══════════════════════════════════════════════ */}
      <Dialog
        open={deleteStaffId !== null}
        onOpenChange={(o) => { if (!o) setDeleteStaffId(null); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Цэвэрлэгч устгах уу?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {staff.find((s) => s.id === deleteStaffId)?.name} — нэрт цэвэрлэгчийг жагсаалтаас хасах уу?
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteStaffId(null)}>
              Үгүй
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteStaff}
              disabled={deletingStaff}
            >
              {deletingStaff && <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" />}
              Тийм, устгах
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ COMPLETE CONFIRM MODAL ════════════════════════════════════════════ */}
      <Dialog
        open={!!completeModal}
        onOpenChange={(o) => {
          if (!o) { setCompleteModal(null); setCompleteDone(false); }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader className="items-center text-center">
            {/* Step progress */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <IconSparkles className="h-5 w-5" />
              </div>
              <div className={cn('h-0.5 w-16 transition-colors', completeDone ? 'bg-primary' : 'bg-border')} />
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                completeDone
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-muted-foreground/30 text-muted-foreground'
              )}>
                <IconCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="flex gap-8 text-xs text-muted-foreground -mt-2 mb-2 w-full justify-center">
              <span>Цэвэрлэж байна...</span>
              <span>Биелсэн</span>
            </div>

            <DialogTitle className="text-base font-semibold text-center leading-snug">
              {completeDone
                ? `"№ ${completeRoomLabel()}" өрөөг биелсэн төлөв руу шилжүүлж, цэвэрхэн боллоо.`
                : 'Цэвэрлэгийг дуусгаж, өрөөг "Биелсэн" төлөв шилжүүлэх үү?'
              }
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 justify-center mt-2">
            {completeDone ? (
              <Button
                className="px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => { setCompleteModal(null); setCompleteDone(false); }}
              >
                Хаах
              </Button>
            ) : (
              <>
                <Button variant="outline" className="px-8" onClick={() => setCompleteModal(null)}>
                  Үгүй
                </Button>
                <Button
                  className="px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleComplete}
                  disabled={completing}
                >
                  {completing && <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" />}
                  Тийм, дуусгах
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
