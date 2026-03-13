'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  IconCloud,
  IconLogin,
  IconLogout,
  IconCash,
  IconTrendingUp, 
  IconTrendingDown,
  IconPrinter,
  IconEye,
  IconCircleCheck,
} from "@tabler/icons-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// Mock data for guest count bar chart
const guestCountData = [
  { day: '15', count: 280 },
  { day: '16', count: 350 },
  { day: '17', count: 790 },
  { day: '18', count: 450 },
  { day: '19', count: 220 },
  { day: '20', count: 180 },
  { day: '21', count: 320 },
];

// Mock data for booking status donut
const bookingStatusData = [
  { name: 'Booked', value: 3420, percentage: 60, color: '#22c55e' },
  { name: 'Canceled', value: 1140, percentage: 20, color: '#f59e0b' },
  { name: 'Pending Confirmation', value: 1140, percentage: 20, color: '#9ca3af' },
  { name: 'No-Show', value: 570, percentage: 10, color: '#6366f1' },
];

// Mock data for booking channels
const bookingChannelsData = [
  { name: 'Booking.com', value: 44, color: '#003580' },
  { name: 'Agoda', value: 23, color: '#5542F6' },
  { name: 'Traveloka', value: 24, color: '#00AA13' },
  { name: 'Direct', value: 218, color: '#f97316' },
  { name: 'AirBNB', value: 109, color: '#FF5A5F' },
];

// Mock recent bookings data
const recentBookings = [
  { id: 1, guestName: 'Zolzaya Zorig', roomNo: '305', guestCount: 3, checkIn: '2026/01/05', checkOut: '2026/03/01', status: 'confirmed' },
  { id: 2, guestName: 'Zolzaya Zorig', roomNo: '305', guestCount: 3, checkIn: '2026/01/05', checkOut: '2026/03/01', status: 'cancelled' },
  { id: 3, guestName: 'Zolzaya Zorig', roomNo: '305', guestCount: 3, checkIn: '2026/01/05', checkOut: '2026/03/01', status: 'checked_in' },
  { id: 4, guestName: 'Zolzaya Zorig', roomNo: '305', guestCount: 3, checkIn: '2026/01/05', checkOut: '2026/03/01', status: 'confirmed' },
  { id: 5, guestName: 'Zolzaya Zorig', roomNo: '305', guestCount: 3, checkIn: '2026/01/05', checkOut: '2026/03/01', status: 'checked_in' },
  { id: 6, guestName: 'Zolzaya Zorig', roomNo: '305', guestCount: 3, checkIn: '2026/01/05', checkOut: '2026/03/01', status: 'cancelled' },
  { id: 7, guestName: 'Zolzaya Zorig', roomNo: '305', guestCount: 3, checkIn: '2026/01/05', checkOut: '2026/03/01', status: 'confirmed' },
  { id: 8, guestName: 'Zolzaya Zorig', roomNo: '305', guestCount: 3, checkIn: '2026/01/05', checkOut: '2026/03/01', status: 'confirmed' },
];

// Mock daily tasks
const dailyTasks = [
  { id: 1, date: '2026 /01/23', room: 'Өрөө 305: Deep Clean Carpet', guest: 'Zoe Zorig', org: 'Зочин-байгууллага', completed: false },
  { id: 2, date: '2026 /01/23', room: 'Өрөө 305: Deep Clean Carpet', guest: 'Zoe Zorig', org: 'Зочин-байгууллага', completed: false },
  { id: 3, date: '2026 /01/23', room: 'Өрөө 305: Deep Clean Carpet', guest: 'Zoe Zorig', org: 'Зочин-байгууллага', completed: true },
  { id: 4, date: '2026 /01/23', room: 'Өрөө 305: Deep Clean Carpet', guest: 'Zoe Zorig', org: 'Зочин-байгууллага', completed: true },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Баталгаажсан</Badge>;
    case 'cancelled':
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Хүлээгдэж буй</Badge>;
    case 'checked_in':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Зочинирсэн</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [dateFilter, setDateFilter] = useState('today');
  const [guestFilter, setGuestFilter] = useState('all');

  const totalBookings = bookingStatusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Хянах самбар</h1>
        <Button variant="outline" size="sm">
          <IconPrinter className="mr-2 h-4 w-4" />
          Татах
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Room Occupancy */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Өрөө дүүргэлтийн хувь (56 / 90)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">87%</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">Өнгөрсөн</span>
                  <Badge className="bg-green-100 text-green-700 text-xs px-1.5 py-0 hover:bg-green-100">
                    <IconTrendingUp className="h-3 w-3 mr-0.5" />
                    +5%
                  </Badge>
                </div>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <IconCloud className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Check-in */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Өнөөдрийн Check-in</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">24</span>
                </div>
                <p className="text-xs text-muted-foreground">12 ирсэн • 12 хүлээгдэж байгаа</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <IconLogin className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Check-out */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Өнөөдрийн Check-out</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">7</span>
                </div>
                <p className="text-xs text-muted-foreground">3 үлдсэн • 4 гарсан</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <IconLogout className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Өнөөдрийн орлого</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">5,000,000 ₮</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">Өнгөрсөн</span>
                  <Badge className="bg-red-100 text-red-700 text-xs px-1.5 py-0 hover:bg-red-100">
                    <IconTrendingDown className="h-3 w-3 mr-0.5" />
                    -12%
                  </Badge>
                </div>
              </div>
              <div className="rounded-full bg-emerald-100 p-3">
                <IconCash className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - 3 columns */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Booking Status Donut */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Захиалгын төлөөр</CardTitle>
              <Select defaultValue="week">
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Сүүлийн 7 хоног" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Сүүлийн 7 хоног</SelectItem>
                  <SelectItem value="month">Энэ сар</SelectItem>
                  <SelectItem value="year">Энэ жил</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={bookingStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {bookingStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{totalBookings.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Total Bookings</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {bookingStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.value.toLocaleString()}</span>
                    <span className="text-xs" style={{ color: item.color }}>{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Guest Count Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Зочдын тоон үзүүлэлт</CardTitle>
              <Select defaultValue="week">
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Сүүлийн 7 хоног" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Сүүлийн 7 хоног</SelectItem>
                  <SelectItem value="month">Энэ сар</SelectItem>
                  <SelectItem value="year">Энэ жил</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={guestCountData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  domain={[0, 1000]}
                  ticks={[0, 200, 400, 600, 800, 1000]}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Зочид']}
                  labelFormatter={(label) => `Өдөр: ${label}`}
                />
                <Bar
                  dataKey="count"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Channels Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Захиалгын сувгаар</CardTitle>
              <Select defaultValue="week">
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Сүүлийн 7 хоног" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Сүүлийн 7 хоног</SelectItem>
                  <SelectItem value="month">Энэ сар</SelectItem>
                  <SelectItem value="year">Энэ жил</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={bookingChannelsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {bookingChannelsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center hidden">
              <span className="text-sm font-medium">43.8%</span>
              <span className="text-xs text-muted-foreground block">Most guests booked via Direct</span>
            </div>
            <div className="mt-4 space-y-1.5">
              {bookingChannelsData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table and Tasks */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Bookings Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base font-medium">Сүүлийн захиалгууд</CardTitle>
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                <Button
                  variant={dateFilter === 'today' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setDateFilter('today')}
                >
                  Өнөөдөр
                </Button>
                <Button
                  variant={dateFilter === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setDateFilter('week')}
                >
                  Энэ 7 хоног
                </Button>
                <Button
                  variant={dateFilter === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setDateFilter('month')}
                >
                  Энэ сар
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Guest Filter Tabs */}
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Бүгд', count: 55 },
                { value: 'arriving', label: 'Ирэх зочин', count: 10 },
                { value: 'departing', label: 'Гарах зочин', count: 12 },
                { value: 'staying', label: 'Байрлах байгаа зочин', count: 18 },
                { value: 'extended', label: 'Хугацаа сунгасан зочин', count: 15 },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={guestFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setGuestFilter(filter.value)}
                >
                  {filter.label}
                  <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-xs">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Зочин нэр</TableHead>
                    <TableHead className="text-center">Өрөөний №</TableHead>
                    <TableHead className="text-center">Зочны тоо</TableHead>
                    <TableHead className="text-center">Ирэх өдөр</TableHead>
                    <TableHead className="text-center">Гарах өдөр</TableHead>
                    <TableHead className="text-center">Төлөв</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">{booking.guestName}</TableCell>
                      <TableCell className="text-center">{booking.roomNo}</TableCell>
                      <TableCell className="text-center">{booking.guestCount}</TableCell>
                      <TableCell className="text-center">{booking.checkIn}</TableCell>
                      <TableCell className="text-center">{booking.checkOut}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconEye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Daily Tasks */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Өнөөдрийн гүйцэтгэх ажил</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative h-10 w-10">
                  <svg className="h-10 w-10 -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${40 * 2 * Math.PI / 100 * 101} ${101}`}
                      className="text-primary"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">40%</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {dailyTasks.map((task) => (
                <div key={task.id} className="flex gap-3">
                  <div className="mt-0.5">
                    {task.completed ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <IconCircleCheck className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  <div className={`flex-1 space-y-1 ${task.completed ? 'opacity-60' : ''}`}>
                    <p className="text-xs text-muted-foreground">{task.date}</p>
                    <p className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.room}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="h-7 w-7 rounded-full bg-green-100 ring-2 ring-green-500 flex items-center justify-center text-xs font-medium text-green-700">
                          {task.guest[0]}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{task.guest}</p>
                        <p className="text-xs text-muted-foreground">{task.org}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" className="mt-4 h-auto p-0 text-sm text-primary">
              Бүгдийг харах →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
