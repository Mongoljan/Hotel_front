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
  IconCalendar,
} from "@tabler/icons-react";

// Mock data for housekeeping
const housekeepingData = [
  { id: 1, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'needs_cleaning', priority: 'normal', floor: 1, bookingStatus: 'confirmed', notes: 'Өдөр тутмын цэвэрлэгээ' },
  { id: 2, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'in_progress', priority: 'urgent', floor: 1, bookingStatus: 'pending', notes: 'Өдөр тутмын цэвэрлэгээ' },
  { id: 3, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'dirty', priority: 'low', floor: 1, bookingStatus: 'confirmed', notes: 'Өр дарчны харагсал солих' },
  { id: 4, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'replace', priority: 'normal', floor: 1, bookingStatus: 'checked_in', notes: 'Их цэвэрлэгээ' },
  { id: 5, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'needs_cleaning', priority: 'normal', floor: 1, bookingStatus: 'confirmed', notes: 'Өдөр тутмын цэвэрлэгээ' },
  { id: 6, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'dirty', priority: 'urgent', floor: 1, bookingStatus: 'checked_in', notes: 'Агааржуулагч ажиллахгүй байгаа' },
  { id: 7, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'in_progress', priority: 'urgent', floor: 1, bookingStatus: 'confirmed', notes: 'Их цэвэрлэгээ' },
  { id: 8, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'replace', priority: 'normal', floor: 1, bookingStatus: 'pending', notes: 'Өдөр тутмын цэвэрлэгээ' },
  { id: 9, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'dirty', priority: 'low', floor: 1, bookingStatus: 'confirmed', notes: 'Өдөр тутмын цэвэрлэгээ' },
  { id: 10, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'needs_cleaning', priority: 'normal', floor: 1, bookingStatus: 'pending', notes: 'Өдөр тутмын цэвэрлэгээ' },
  { id: 11, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'needs_cleaning', priority: 'low', floor: 1, bookingStatus: 'checked_in', notes: 'Өдөр тутмын цэвэрлэгээ' },
  { id: 12, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'dirty', priority: 'urgent', floor: 1, bookingStatus: 'checked_in', notes: 'Өдөр тутмын цэвэрлэгээ' },
  { id: 13, roomNo: '305', roomType: 'Standard Single Room', cleaningStatus: 'needs_cleaning', priority: 'normal', floor: 1, bookingStatus: 'confirmed', notes: 'Өдөр тутмын цэвэрлэгээ' },
];

const cleaningStatusOptions = [
  { value: 'needs_cleaning', label: 'Цэвэрлэх байгаа', color: 'bg-[hsl(var(--info-muted))] text-[hsl(var(--info))]' },
  { value: 'in_progress', label: 'Цэвэрхэн', color: 'bg-[hsl(var(--success-muted))] text-[hsl(var(--success))]' },
  { value: 'dirty', label: 'Бохир', color: 'bg-[hsl(var(--destructive-muted))] text-[hsl(var(--destructive))]' },
  { value: 'replace', label: 'Солих', color: 'bg-muted text-muted-foreground' },
];

const priorityOptions = [
  { value: 'urgent', label: 'Яаралтай', icon: '⚡', color: 'text-[hsl(var(--warning))]' },
  { value: 'normal', label: 'Өндөр', icon: '⭐', color: 'text-[hsl(var(--warning))]' },
  { value: 'low', label: 'Бага', icon: '🟢', color: 'text-[hsl(var(--success))]' },
];

const getCleaningStatusBadge = (status: string) => {
  const option = cleaningStatusOptions.find(o => o.value === status);
  if (!option) return <Badge variant="secondary">{status}</Badge>;
  return (
    <Select defaultValue={status}>
      <SelectTrigger className={`h-7 w-[140px] text-xs ${option.color} border-0`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {cleaningStatusOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const getPriorityBadge = (priority: string) => {
  const option = priorityOptions.find(o => o.value === priority);
  return (
    <div className="flex items-center gap-1.5">
      <span>{option?.icon}</span>
      <span className={`text-sm ${option?.color || ''}`}>{option?.label}</span>
    </div>
  );
};

const getBookingStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Баталгаажсан</Badge>;
    case 'pending':
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Хүлээгдэж буй</Badge>;
    case 'checked_in':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Зочин ирсэн</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function HousekeepingPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const tabs = [
    { value: 'all', label: 'Бүгд', count: 16 },
    { value: 'needs_cleaning', label: 'Цэвэрлэх байгаа', count: 10 },
    { value: 'dirty', label: 'Бохир', count: 10 },
    { value: 'clean', label: 'Цэвэрхэн', count: 10 },
    { value: 'replace', label: 'Солих', count: 10 },
  ];

  const filteredData = housekeepingData.filter(item => {
    if (activeTab !== 'all' && item.cleaningStatus !== activeTab) return false;
    if (searchQuery && !item.roomNo.includes(searchQuery)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Өрөө цэвэрлэгээ</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <IconPrinter className="mr-2 h-4 w-4" />
            Татах
          </Button>
          <Button variant="outline" size="sm">
            <IconDownload className="mr-2 h-4 w-4" />
            Хэвлэх
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
          <Select>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Өрөө №" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="305">305</SelectItem>
              <SelectItem value="306">306</SelectItem>
              <SelectItem value="307">307</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Давхар" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Өрөөний төрөл" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Room</SelectItem>
              <SelectItem value="double">Double Room</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ач холбогдол" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Яаралтай</SelectItem>
              <SelectItem value="normal">Яндах</SelectItem>
              <SelectItem value="low">Бага</SelectItem>
            </SelectContent>
          </Select>
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
            <Badge 
              variant="secondary" 
              className={`ml-1.5 h-5 px-1.5 text-xs ${activeTab === tab.value && tab.value === 'all' ? 'bg-green-700 text-white' : ''}`}
            >
              {tab.count}
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
              <TableHead>Өрөө №</TableHead>
              <TableHead>Өрөөний төрөл</TableHead>
              <TableHead className="text-center">Цэвэрлэгээ төлөв</TableHead>
              <TableHead className="text-center">Ач холбогдол</TableHead>
              <TableHead className="text-center">Давхар</TableHead>
              <TableHead className="text-center">Захиалгын төлөв</TableHead>
              <TableHead>Нэмэлт тэмдэглэл</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((room) => (
              <TableRow key={room.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">{room.roomNo}</TableCell>
                <TableCell>{room.roomType}</TableCell>
                <TableCell className="text-center">
                  {getCleaningStatusBadge(room.cleaningStatus)}
                </TableCell>
                <TableCell className="text-center">
                  {getPriorityBadge(room.priority)}
                </TableCell>
                <TableCell className="text-center">{room.floor}</TableCell>
                <TableCell className="text-center">
                  {getBookingStatusBadge(room.bookingStatus)}
                </TableCell>
                <TableCell>{room.notes}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <IconCalendar className="h-4 w-4" />
                  </Button>
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
