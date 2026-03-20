'use client';

import { useMemo, useState } from 'react';
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
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Search,
  User,
  Users,
  X,
  Wallet,
  BedSingle,
  Bell,
  CircleDot,
} from 'lucide-react';

type OccupancyColor = 'green' | 'yellow' | 'red' | 'gray';

type DayColumn = {
  day: number;
  weekday: string;
  occupancyPercent: number;
  color: OccupancyColor;
};

type RoomItem = {
  code: string;
  status: 'checked-in' | 'reserved' | 'due-out' | 'checked-out' | 'blocked';
};

type RoomGroup = {
  name: string;
  freeRooms: number;
  totalRooms: number;
  rooms: RoomItem[];
};

const dayColumns: DayColumn[] = [
  { day: 19, weekday: 'Пү', occupancyPercent: 60, color: 'green' },
  { day: 20, weekday: 'Ба', occupancyPercent: 50, color: 'yellow' },
  { day: 21, weekday: 'Бя', occupancyPercent: 30, color: 'red' },
  { day: 22, weekday: 'Ня', occupancyPercent: 83, color: 'green' },
  { day: 24, weekday: 'Да', occupancyPercent: 89, color: 'green' },
  { day: 25, weekday: 'Мя', occupancyPercent: 50, color: 'yellow' },
  { day: 26, weekday: 'Лх', occupancyPercent: 30, color: 'red' },
];

const roomGroups: RoomGroup[] = [
  {
    name: 'Standard Single Room',
    freeRooms: 12,
    totalRooms: 60,
    rooms: [
      { code: '202', status: 'checked-in' },
      { code: '203', status: 'checked-out' },
      { code: '204', status: 'reserved' },
      { code: '205', status: 'blocked' },
    ],
  },
  {
    name: 'Deluxe Double Room',
    freeRooms: 12,
    totalRooms: 60,
    rooms: [
      { code: '302', status: 'checked-in' },
      { code: '303', status: 'checked-out' },
      { code: '304', status: 'reserved' },
    ],
  },
];

const modalSteps = [
  { id: 1, label: 'Огноо сонгох', icon: CalendarDays },
  { id: 2, label: 'Өрөө сонгох', icon: BedSingle },
  { id: 3, label: 'Зочны мэдээлэл', icon: User },
  { id: 4, label: 'Төлбөр', icon: Wallet },
];

const candidateRooms = [
  { id: 'suite-1', name: 'Suite Twin Room', free: 10, roomNo: '306', price: 250000, selected: true },
  { id: 'std-1', name: 'Standard Twin Room', free: 0, roomNo: '202', price: 180000, selected: false },
  { id: 'dlx-1', name: 'Deluxe Double Room', free: 5, roomNo: '404', price: 300000, selected: false },
  { id: 'dlx-2', name: 'Deluxe Double Room', free: 5, roomNo: '405', price: 300000, selected: false },
];

const occupancyColorClass: Record<OccupancyColor, string> = {
  green: 'bg-status-success',
  yellow: 'bg-status-warning',
  red: 'bg-destructive',
  gray: 'bg-muted-foreground',
};

const statusDotClass: Record<RoomItem['status'], string> = {
  'checked-in': 'bg-status-success',
  reserved: 'bg-primary',
  'due-out': 'bg-destructive',
  'checked-out': 'bg-muted-foreground',
  blocked: 'bg-black',
};

export default function ReceptionPage() {
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [nightCount, setNightCount] = useState(6);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(1);

  const occupancyAverage = useMemo(() => {
    const total = dayColumns.reduce((sum, col) => sum + col.occupancyPercent, 0);
    return Math.round(total / dayColumns.length);
  }, []);

  const openModal = () => {
    setStep(1);
    setIsOrderOpen(true);
  };

  const nextStep = () => setStep((prev) => Math.min(4, prev + 1));
  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Front desk</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <Bell className="h-4 w-4" />
          </Button>
          <Button onClick={openModal} className="h-10 rounded-full px-5">
            <Plus className="mr-1 h-4 w-4" />
            Шинэ захиалга
          </Button>
        </div>
      </div>

      <Card className="border-border/80 bg-card shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">7 хоногоор</Badge>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">Сараар</Button>
              <Select defaultValue="type-1">
                <SelectTrigger className="w-[170px] rounded-full">
                  <SelectValue placeholder="Өрөөний төрөл" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type-1">Өрөөний төрөл</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="channel-1">
                <SelectTrigger className="w-[180px] rounded-full">
                  <SelectValue placeholder="Захиалгын төрөл" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="channel-1">Захиалгын төрөл</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Хайх" className="rounded-full pl-9" />
            </div>
          </div>

          <div className="overflow-auto rounded-2xl border border-border">
            <div className="min-w-[1050px] bg-muted/20">
              <div className="grid" style={{ gridTemplateColumns: '200px repeat(7, minmax(120px, 1fr))' }}>
                <div className="border-b border-r border-border/70 bg-background p-3 text-sm text-muted-foreground">Нийт өрөө:120</div>
                <div className="col-span-7 flex items-center justify-center gap-6 border-b border-border/70 bg-background p-3 text-sm">
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">2026</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="border-r border-border/70 bg-background p-3 text-sm text-muted-foreground">
                  Өрөө дүүргэлт %
                  <div className="mt-2 text-xl font-semibold text-foreground">{occupancyAverage}%</div>
                </div>

                {dayColumns.map((column, index) => (
                  <div
                    key={column.day}
                    className={`border-b border-border/70 bg-background p-3 text-center ${index === 0 ? 'outline outline-1 outline-primary' : ''}`}
                  >
                    <p className="text-xs text-muted-foreground">{column.day}</p>
                    <p className="text-xs text-muted-foreground">{column.weekday}</p>
                    <p className="mt-1 text-xs font-semibold text-foreground">{column.occupancyPercent}%</p>
                    <div className="mx-auto mt-2 h-1.5 w-full max-w-[84px] rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${occupancyColorClass[column.color]}`}
                        style={{ width: `${column.occupancyPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {roomGroups.map((group) => (
                <div key={group.name}>
                  <div className="grid bg-muted/30" style={{ gridTemplateColumns: '200px repeat(7, minmax(120px, 1fr))' }}>
                    <div className="border-b border-r border-border bg-muted px-3 py-2 text-sm font-medium text-foreground">
                      {group.name}
                    </div>
                    {dayColumns.map((column) => (
                      <div key={`${group.name}-${column.day}-header`} className="border-b border-border bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
                        Сул • {group.freeRooms}/{group.totalRooms}
                      </div>
                    ))}
                  </div>

                  {group.rooms.map((room) => (
                    <div key={`${group.name}-${room.code}`} className="grid" style={{ gridTemplateColumns: '200px repeat(7, minmax(120px, 1fr))' }}>
                      <div className="flex items-center gap-2 border-b border-r border-border bg-background px-3 py-2 text-sm">
                        <span className={`h-2.5 w-2.5 rounded-full ${statusDotClass[room.status]}`} />
                        <span>{room.code}</span>
                        <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      {dayColumns.map((column, index) => (
                        <div
                          key={`${room.code}-${column.day}`}
                          className={`border-b border-border bg-background ${index === 0 ? 'border-l border-l-primary/60' : ''}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="rounded-full px-3 py-1"><span className="mr-1 h-2 w-2 rounded-full bg-status-success" />Checked-in</Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1"><span className="mr-1 h-2 w-2 rounded-full bg-primary" />Захиалагатай өрөө</Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1"><span className="mr-1 h-2 w-2 rounded-full bg-destructive" />Due out</Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1"><span className="mr-1 h-2 w-2 rounded-full bg-status-warning" />Сунгалт хийсэн</Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1"><span className="mr-1 h-2 w-2 rounded-full bg-muted-foreground" />Checked-out</Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1"><span className="mr-1 h-2 w-2 rounded-full bg-black" />Өрөө блок</Badge>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/70 pt-4 text-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <span>Өнөөдрийн байдал:</span>
              <span>25 захиалга</span>
              <span>38 өрөө захиалгатай</span>
              <span>76 зочин</span>
              <span>12 сул өрөө</span>
            </div>
            <Button className="h-10 rounded-xl px-6 text-base font-semibold">12,600,000 ₮</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
        <DialogContent className="max-h-[90vh] max-w-[920px] overflow-hidden rounded-3xl border-border p-0">
          <DialogHeader className="px-6 pb-3 pt-6">
            <div className="flex items-start justify-between">
              <DialogTitle className="text-2xl">Шинэ захиалга</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOrderOpen(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {modalSteps.map((item, idx) => {
                const Icon = item.icon;
                const done = step > item.id;
                const active = step === item.id;
                return (
                  <div key={item.id} className="relative">
                    {idx !== modalSteps.length - 1 && (
                      <div className={`absolute left-[50%] top-5 h-[1px] w-full ${done ? 'bg-primary' : 'bg-border'}`} />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                          done || active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground'
                        }`}
                      >
                        {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={`text-xs ${active ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogHeader>

          <div className="max-h-[58vh] space-y-4 overflow-auto px-6 pb-4">
            {step === 1 && (
              <div className="space-y-4 rounded-2xl border border-border p-4">
                <div>
                  <p className="mb-1 text-sm font-medium">Check-in & Check-out</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" className="justify-start rounded-xl">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      2026/01/01 - 2026/01/07
                    </Button>
                    <Badge variant="secondary">{nightCount} шөнө</Badge>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Орох цаг</p>
                    <Select defaultValue="14:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="14:00">14:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Гарах цаг</p>
                    <Select defaultValue="12:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12:00">12:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Захиалгын суваг</p>
                    <Select defaultValue="reception">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reception">Ресепшн</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Гэрээт байгууллага</p>
                    <Select defaultValue="none">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Сонгох</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Зочдын тоо</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    <GuestCounter label="Том хүн" value={adultCount} onDecrement={() => setAdultCount((v) => Math.max(1, v - 1))} onIncrement={() => setAdultCount((v) => v + 1)} />
                    <GuestCounter label="Хүүхэд" value={childCount} onDecrement={() => setChildCount((v) => Math.max(0, v - 1))} onIncrement={() => setChildCount((v) => v + 1)} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Боломжит өрөөнүүд</h3>
                  <p className="text-sm text-muted-foreground">70 / 100</p>
                </div>

                {candidateRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`rounded-2xl border p-3 ${room.selected ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{room.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Үлдэгдэл: <span className="font-semibold text-foreground">{room.free}</span>
                        </p>
                      </div>
                      <Button variant="outline" className="h-8 rounded-xl px-3">
                        {room.selected ? '2' : '0'}
                        <ChevronDown className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <Badge>{room.roomNo}</Badge>
                      <Select defaultValue={String(room.price)}>
                        <SelectTrigger className="h-8 w-[170px] rounded-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={String(room.price)}>Үндсэн үнэ / {room.price.toLocaleString('mn-MN')} ₮</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Switch /> Нэмэлт ор
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Switch /> Хүүхдийн ор
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 rounded-2xl border border-border p-4">
                <Field label="Зочны овог">
                  <Input defaultValue="Zorig" />
                </Field>
                <Field label="Зочны нэр">
                  <Input defaultValue="Zolzaya" />
                </Field>
                <Field label="Утасны дугаар">
                  <Input defaultValue="MN  +976 0000-0000" />
                </Field>
                <Field label="Нэмэлт хүсэлт, тайлбар">
                  <Textarea rows={4} placeholder="Enter a description..." />
                </Field>
                <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                  <Switch /> Одоо бүртгэх
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-muted p-4">
                  <Badge className="mb-3 rounded-full bg-foreground text-background">Захиалгын хуураангуй</Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Захиалагч мэдээлэл</span>
                      <span>Zolzaya Zorig</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Холбогдох утас</span>
                      <span>9995-4644</span>
                    </div>
                    <div className="grid gap-2 pt-1 md:grid-cols-3">
                      <div className="rounded-lg bg-background p-2 text-xs">2026/01/01 - 2026/01/07</div>
                      <div className="rounded-lg bg-background p-2 text-xs">14:00</div>
                      <div className="rounded-lg bg-background p-2 text-xs">12:00</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">Төлбөр тооцоо</h3>
                    <Select defaultValue="mnt">
                      <SelectTrigger className="h-9 w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mnt">MNT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="Өрөө үйлчилгээ" value="600,000 ₮" hint="2 өрөө x 6 шөнө" />
                    <Row label="Нэмэлт үйлчилгээ" value="120,000 ₮" />
                    <Row label="Хөнгөлөлт" value="0 ₮" hint="Гэрээт -10%" />
                  </div>

                  <div className="mt-3 rounded-xl bg-primary/15 px-3 py-2 text-sm font-semibold text-foreground">
                    <div className="flex items-center justify-between">
                      <span>Нийт дүн</span>
                      <span>720,000 ₮</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Switch /> Одоо төлөх
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border bg-card px-6 py-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
              <div className="flex items-center gap-3">
                <span>7 шөнө</span>
                <CircleDot className="h-3 w-3" />
                <span>х 1</span>
                <CircleDot className="h-3 w-3" />
                <span>2 өрөө</span>
              </div>
              <span>500,000 ₮</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" onClick={prevStep} disabled={step === 1} className="min-w-[120px] rounded-xl">
                Буцах
              </Button>
              <div className="ml-auto flex items-center gap-2">
                {step === 4 ? (
                  <>
                    <Button variant="secondary" className="rounded-xl">Түр хадгалах</Button>
                    <Button className="rounded-xl">Баталгаажуулах</Button>
                  </>
                ) : (
                  <Button onClick={nextStep} className="min-w-[140px] rounded-xl">
                    Үргэлжлүүлэх
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
    <div className="flex items-center justify-between rounded-xl border border-border p-2">
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onDecrement}>
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="min-w-4 text-center text-sm font-medium">{value}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onIncrement}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, hint, value }: { label: string; hint?: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 pb-2 last:border-0">
      <div>
        <p>{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <p className="font-medium">{value}</p>
    </div>
  );
}
