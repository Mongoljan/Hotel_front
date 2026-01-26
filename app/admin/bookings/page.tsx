'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  IconFilter,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
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

// Types
interface Booking {
  id: string;
  guestName: string;
  roomType: string;
  roomNumber: string;
  bookingDate: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  source: string;
  status: 'confirmed' | 'cancelled' | 'pending' | 'checked-in' | 'checked-out';
}

// Mock data
const mockBookings: Booking[] = [
  {
    id: '12345678',
    guestName: 'Zolzaya Zorig, Jack Bat',
    roomType: 'Standard double',
    roomNumber: '301, 303',
    bookingDate: '2025-03-10 12:00:45',
    checkIn: '15/03/2025',
    checkOut: '20/03/2025',
    totalAmount: 500000,
    source: 'Booking.com',
    status: 'confirmed'
  },
  {
    id: '12345689',
    guestName: 'Zolzaya Zorig',
    roomType: 'Standard double',
    roomNumber: '201',
    bookingDate: '2025-03-10 12:00:45',
    checkIn: '15/03/2025',
    checkOut: '20/03/2025',
    totalAmount: 1500000,
    source: 'MyHotels',
    status: 'pending'
  },
  {
    id: '12345690',
    guestName: 'Zolzaya Zorig',
    roomType: 'Standard double',
    roomNumber: '201',
    bookingDate: '2025-03-10 12:00:45',
    checkIn: '15/03/2025',
    checkOut: '20/03/2025',
    totalAmount: 0,
    source: 'Tapatrip',
    status: 'cancelled'
  },
  {
    id: '12345691',
    guestName: 'Zolzaya Zorig',
    roomType: 'Standard double',
    roomNumber: '201',
    bookingDate: '2025-03-10 12:00:45',
    checkIn: '15/03/2025',
    checkOut: '20/03/2025',
    totalAmount: 0,
    source: 'Tapatrip',
    status: 'checked-in'
  },
  {
    id: '12345692',
    guestName: 'Zolzaya Zorig',
    roomType: 'Standard double',
    roomNumber: '201',
    bookingDate: '2025-03-10 12:00:45',
    checkIn: '15/03/2025',
    checkOut: '20/03/2025',
    totalAmount: 250000,
    source: 'Direct',
    status: 'checked-out'
  }
];

const statusColors = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  'checked-in': 'bg-blue-100 text-blue-700',
  'checked-out': 'bg-gray-100 text-gray-700'
};

type TabType = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'checked-in' | 'checked-out';

export default function BookingsPage() {
  const t = useTranslations('Bookings');

  // State
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hotelFilter, setHotelFilter] = useState('7');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('2025-04-10');

  // Filter bookings based on active tab and search
  const filteredBookings = useMemo(() => {
    let filtered = mockBookings;

    if (activeTab !== 'all') {
      filtered = filtered.filter(booking => booking.status === activeTab);
    }

    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.id.includes(searchQuery) ||
        booking.roomNumber.includes(searchQuery)
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      confirmed: t('statuses.confirmed'),
      pending: t('statuses.pending'), 
      cancelled: t('statuses.cancelled'),
      'checked-in': t('statuses.checkedIn'),
      'checked-out': t('statuses.checkedOut')
    };
    
    return (
      <Badge className={cn('text-xs font-medium', statusColors[status as keyof typeof statusColors])}>
        {statusMap[status as keyof typeof statusMap] || status}
      </Badge>
    );
  };

  const tabs = [
    { key: 'all', label: t('tabs.all'), count: mockBookings.length },
    { key: 'confirmed', label: t('tabs.confirmed'), count: mockBookings.filter(b => b.status === 'confirmed').length },
    { key: 'pending', label: t('tabs.pending'), count: mockBookings.filter(b => b.status === 'pending').length },
    { key: 'cancelled', label: t('tabs.cancelled'), count: mockBookings.filter(b => b.status === 'cancelled').length },
    { key: 'checked-in', label: t('tabs.checkedIn'), count: mockBookings.filter(b => b.status === 'checked-in').length },
    { key: 'checked-out', label: t('tabs.checkedOut'), count: mockBookings.filter(b => b.status === 'checked-out').length }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <Select value={hotelFilter} onValueChange={setHotelFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.hotel')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t('filters.hotel7')}</SelectItem>
                <SelectItem value="other">Other Hotel</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.roomType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('filters.allRoomTypes')}</SelectItem>
                <SelectItem value="standard">Standard Double</SelectItem>
                <SelectItem value="deluxe">Deluxe Suite</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'border-b-2 border-primary text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <span>{tab.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
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
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      {t('messages.noBookings')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>{booking.guestName}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.roomType} - {booking.roomNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.bookingDate}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>Check-in: {booking.checkIn}</div>
                          <div>Check-out: {booking.checkOut}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.totalAmount > 0 ? 
                          `${booking.totalAmount.toLocaleString()}₮` : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>{booking.source}</TableCell>
                      <TableCell>
                        {getStatusBadge(booking.status)}
                      </TableCell>
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