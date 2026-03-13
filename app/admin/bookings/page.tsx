'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  IconSettings,
  IconFilter,
  IconCalendar,
  IconChevronDown,
  IconEdit,
} from "@tabler/icons-react";

// Mock data for bookings
const bookingsData = [
  { id: 1, guestName: 'Zolzaya Zorig', roomNo: '305', bookingId: 'G-12345', checkIn: '2026/01/05', checkOut: '2026/03/01', totalAmount: 1500000, paid: 0, balance: 1500000, channel: 'Booking.com', status: 'confirmed' },
  { id: 2, guestName: 'Zolzaya Zorig', roomNo: '305', bookingId: 'G-12345', checkIn: '2026/01/05', checkOut: '2026/03/01', totalAmount: 1500000, paid: 0, balance: 1500000, channel: 'MyRoom.mn', status: 'pending' },
  { id: 3, guestName: 'Zolzaya Zorig', roomNo: '305', bookingId: 'G-12345', checkIn: '2026/01/05', checkOut: '2026/03/01', totalAmount: 1500000, paid: 0, balance: 1500000, channel: 'MyRoom.mn', status: 'checked_in' },
  { id: 4, guestName: 'Zolzaya Zorig', roomNo: '305', bookingId: 'G-12345', checkIn: '2026/01/05', checkOut: '2026/03/01', totalAmount: 1500000, paid: 0, balance: 1500000, channel: 'MyRoom.mn', status: 'pending' },
  { id: 5, guestName: 'Zolzaya Zorig', roomNo: '305', bookingId: 'G-12345', checkIn: '2026/01/05', checkOut: '2026/03/01', totalAmount: 1500000, paid: 0, balance: 1500000, channel: 'MyRoom.mn', status: 'checked_in' },
  { id: 6, guestName: 'Zolzaya Zorig', roomNo: '305', bookingId: 'G-12345', checkIn: '2026/01/05', checkOut: '2026/03/01', totalAmount: 1500000, paid: 0, balance: 1500000, channel: 'Booking.com', status: 'confirmed' },
  { id: 7, guestName: 'Zolzaya Zorig', roomNo: '305', bookingId: 'G-12345', checkIn: '2026/01/05', checkOut: '2026/03/01', totalAmount: 1500000, paid: 0, balance: 1500000, channel: 'MyRoom.mn', status: 'checked_in' },
  { id: 8, guestName: 'Zolzaya Zorig', roomNo: '305', bookingId: 'G-12345', checkIn: '2026/01/05', checkOut: '2026/03/01', totalAmount: 1500000, paid: 0, balance: 1500000, channel: 'Booking.com', status: 'confirmed' },
  { id: 9, guestName: 'Zolzaya Zorig', roomNo: '305', bookingId: 'G-12345', checkIn: '2026/01/05', checkOut: '2026/03/01', totalAmount: 1500000, paid: 0, balance: 1500000, channel: 'MyRoom.mn', status: 'pending' },
  { id: 10, guestName: 'Zolzaya Zorig', roomNo: '305', bookingId: 'G-12345', checkIn: '2026/01/05', checkOut: '2026/03/01', totalAmount: 1500000, paid: 0, balance: 1500000, channel: 'MyRoom.mn', status: 'checked_in' },
  { id: 11, guestName: 'Zolzaya Zorig', roomNo: '305', bookingId: 'G-12345', checkIn: '2026/01/05', checkOut: '2026/03/01', totalAmount: 1500000, paid: 0, balance: 1500000, channel: 'MyRoom.mn', status: 'checked_in' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Badge variant="successMuted">Баталгаажсан</Badge>;
    case 'pending':
      return <Badge variant="warningMuted">Хүлээгдэж буй</Badge>;
    case 'checked_in':
      return <Badge variant="infoMuted">Зочин ирсэн</Badge>;
    case 'no_show':
      return <Badge variant="destructiveMuted">Зочин ирээгүй</Badge>;
    case 'cancelled':
      return <Badge variant="muted">Цуцалсан</Badge>;
    case 'completed':
      return <Badge variant="default">Биелсэн</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getChannelBadge = (channel: string) => {
  if (channel === 'Booking.com') {
    return <span className="text-primary font-medium">Booking.com</span>;
  }
  return <span className="text-muted-foreground">{channel}</span>;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('mn-MN').format(amount) + ' ₮';
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [checkInDate, setCheckInDate] = useState('2026/01/01');
  const [checkOutDate, setCheckOutDate] = useState('2026/01/07');
  const itemsPerPage = 12;

  const tabs = [
    { value: 'all', label: 'Бүгд', count: 16 },
    { value: 'pending', label: 'Хүлээгдэж буй', count: 10 },
    { value: 'confirmed', label: 'Батлагдажсан', count: 10 },
    { value: 'staying', label: 'Зочин байрлаж байгаа', count: 10 },
    { value: 'no_show', label: 'Зочин ирээгүй', count: 10 },
    { value: 'completed', label: 'Биелсэн', count: 10 },
    { value: 'cancelled', label: 'Цуцалсан', count: 10 },
  ];

  const filteredData = bookingsData.filter(item => {
    if (activeTab !== 'all') {
      if (activeTab === 'staying' && item.status !== 'checked_in') return false;
      else if (activeTab !== 'staying' && item.status !== activeTab) return false;
    }
    if (searchQuery && !item.guestName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Row highlighting based on status
  const getRowClassName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-50/50';
      case 'checked_in':
        return 'bg-green-50/50';
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Захиалгын жагсаалт</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <IconDownload className="mr-2 h-4 w-4" />
            Татах
          </Button>
          <Button variant="outline" size="sm">
            <IconPrinter className="mr-2 h-4 w-4" />
            Хавлах
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <IconPlus className="mr-2 h-4 w-4" />
            Шинэ захиалга
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Хайх"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Check-in:</span>
            <Input 
              type="text" 
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="h-7 w-[100px] border-0 p-0 text-sm focus-visible:ring-0"
            />
            <IconChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Check-out:</span>
            <Input 
              type="text" 
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="h-7 w-[100px] border-0 p-0 text-sm focus-visible:ring-0"
            />
            <IconChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm">
            <IconFilter className="mr-2 h-4 w-4" />
            Шүүлтүүр
          </Button>
        </div>
      </div>

      {/* Tab Filters */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? 'default' : 'outline'}
            size="sm"
            className={`h-8 ${activeTab === tab.value && tab.value === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
            {tab.count !== null && (
              <Badge 
                variant="secondary" 
                className={`ml-1.5 h-5 px-1.5 text-xs ${activeTab === tab.value && tab.value === 'all' ? 'bg-green-700 text-white' : ''}`}
              >
                {tab.count}
              </Badge>
            )}
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
              <TableHead className="text-center">Өрөө №</TableHead>
              <TableHead className="text-center">Захиалгын ID</TableHead>
              <TableHead className="text-center">Check-in</TableHead>
              <TableHead className="text-center">Check-out</TableHead>
              <TableHead className="text-center">Нийт дүн</TableHead>
              <TableHead className="text-center">Төлсөн</TableHead>
              <TableHead className="text-center">Үлдэгдэл</TableHead>
              <TableHead className="text-center">Захиалгын суваг</TableHead>
              <TableHead className="text-center">Төлөв</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((booking) => (
              <TableRow key={booking.id} className={`hover:bg-muted/50 ${getRowClassName(booking.status)}`}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium text-primary">{booking.guestName}</TableCell>
                <TableCell className="text-center">{booking.roomNo}</TableCell>
                <TableCell className="text-center text-primary">{booking.bookingId}</TableCell>
                <TableCell className="text-center">{booking.checkIn}</TableCell>
                <TableCell className="text-center">{booking.checkOut}</TableCell>
                <TableCell className="text-center">{formatCurrency(booking.totalAmount)}</TableCell>
                <TableCell className="text-center">{booking.paid} ₮</TableCell>
                <TableCell className="text-center">{formatCurrency(booking.balance)}</TableCell>
                <TableCell className="text-center">{getChannelBadge(booking.channel)}</TableCell>
                <TableCell className="text-center">{getStatusBadge(booking.status)}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Хуудас 1: 1-{Math.min(itemsPerPage, filteredData.length)} ({filteredData.length})
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Өмнөх
          </Button>
          {[1, 2, 3].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              className="w-8"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <span className="px-2 text-muted-foreground">...</span>
          {[8, 9, 10].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              className="w-8"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Дараагийнх →
          </Button>
        </div>
      </div>
    </div>
  );
}
