'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BedSingle,
  CalendarDays,
  Check,
  Clock,
  Minus,
  Plus,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ApiNeededLabel } from '@/components/ApiNeededLabel';

const SHEET_WIDTH = 640;

const STEPS = [
  { id: 1, label: 'Огноо сонгох', icon: CalendarDays },
  { id: 2, label: 'Өрөө сонгох', icon: BedSingle },
  { id: 3, label: 'Захиалагч', icon: User },
  { id: 4, label: 'Төлбөр', icon: Wallet },
];

const CHANNELS = [
  { value: 'reception', label: 'Ресепшн' },
  { value: 'online', label: 'Онлайн' },
  { value: 'phone', label: 'Утас' },
];

const CHECK_IN_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
const CHECK_OUT_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00'];

function nights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000));
}

interface NewBookingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewBookingSheet({ open, onOpenChange }: NewBookingSheetProps) {
  const tNav = useTranslations('Navigation');

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState('2026-01-01');
  const [checkOut, setCheckOut] = useState('2026-01-07');
  const [inTime, setInTime] = useState('14:00');
  const [outTime, setOutTime] = useState('12:00');
  const [channel, setChannel] = useState('reception');
  const [corporate, setCorporate] = useState('none');
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(1);

  const nightCount = useMemo(() => nights(checkIn, checkOut), [checkIn, checkOut]);

  useEffect(() => {
    if (!open) {
      setStep(1);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        fallbackTitle={tNav('newBooking')}
        className="flex h-full flex-col gap-0 p-0 sm:max-w-none z-[60] [&>button]:hidden"
        style={{ width: SHEET_WIDTH, maxWidth: SHEET_WIDTH }}
      >
        <SheetHeader className="border-b px-6 pb-4 pt-6 space-y-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <SheetTitle className="text-xl font-semibold">{tNav('newBooking')}</SheetTitle>
              <ApiNeededLabel />
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Хаах"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {STEPS.map((item, idx) => {
              const Icon = item.icon;
              const done = step > item.id;
              const active = step === item.id;
              return (
                <div key={item.id} className="relative">
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-1/2 top-4 z-0 h-px w-full',
                        done ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                        done || active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground'
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span
                      className={cn(
                        'text-[11px] leading-tight',
                        active ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="space-y-4 rounded-2xl border border-border p-4">
              <Field label="Огноо сонгох">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2.5 text-sm">
                    <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent outline-none text-sm"
                    />
                    <span className="text-muted-foreground shrink-0">—</span>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent outline-none text-sm"
                    />
                  </div>
                  {nightCount > 0 && (
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs shrink-0">
                      {nightCount} шөнө
                    </Badge>
                  )}
                </div>
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Орох цаг">
                  <Select value={inTime} onValueChange={setInTime}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {CHECK_IN_TIMES.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Гарах цаг">
                  <Select value={outTime} onValueChange={setOutTime}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {CHECK_OUT_TIMES.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Захиалгын суваг">
                  <Select value={channel} onValueChange={setChannel}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNELS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Гэрээт байгууллага">
                  <Select value={corporate} onValueChange={setCorporate}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Сонгох</SelectItem>
                      <SelectItem value="mongol-bank">Монгол Банк</SelectItem>
                      <SelectItem value="erdenes">Эрдэнэс Монгол</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="Зочдын тоо">
                <div className="grid gap-2 sm:grid-cols-2">
                  <GuestCounter
                    label="Том хүн"
                    value={adultCount}
                    onDecrement={() => setAdultCount((v) => Math.max(1, v - 1))}
                    onIncrement={() => setAdultCount((v) => v + 1)}
                  />
                  <GuestCounter
                    label="Хүүхэд"
                    value={childCount}
                    onDecrement={() => setChildCount((v) => Math.max(0, v - 1))}
                    onIncrement={() => setChildCount((v) => v + 1)}
                  />
                </div>
              </Field>
            </div>
          )}

          {step > 1 && (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center">
              <ApiNeededLabel className="mb-2 block" />
              <p className="text-sm text-muted-foreground">{STEPS[step - 1]?.label}</p>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card px-6 py-3">
          {nightCount > 0 && (
            <div className="mb-3 flex items-center justify-between rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-medium text-white">
              <div className="flex items-center gap-2">
                <span>{nightCount} шөнө</span>
                <span className="opacity-60">|</span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> x {adultCount + childCount}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              className="min-w-[100px] rounded-xl"
              onClick={() => {
                if (step === 1) handleClose();
                else setStep((p) => p - 1);
              }}
            >
              Буцах
            </Button>
            <Button
              className="min-w-[130px] rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => {
                if (step < 4) setStep((p) => p + 1);
                else handleClose();
              }}
            >
              {step < 4 ? 'Үргэлжлүүлэх' : 'Дуусгах'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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

function GuestCounter({
  label,
  value,
  onIncrement,
  onDecrement,
}: {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
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
