'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconX,
  IconLoader2,
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { cn } from '@/lib/utils';

// Types
interface RoomBlock {
  id: string;
  roomNumber: string;
  roomType: string;
  startDate: string;
  endDate: string;
  reason: string;
  lastUpdate: string;
  updatedBy: string;
  status: 'blocked' | 'available' | 'maintenance';
}

// Mock data
const mockRoomBlocks: RoomBlock[] = [
  {
    id: '1',
    roomNumber: '306',
    roomType: 'Standard Double Room',
    startDate: '2025-03-10 12:00:00',
    endDate: '2025-04-10 12:00:00',
    reason: 'Засвартай байгаа',
    lastUpdate: '2025-03-10 12:00:00',
    updatedBy: 'Admin Bat',
    status: 'blocked'
  },
  {
    id: '2',
    roomNumber: '205',
    roomType: 'Deluxe Twin Room',
    startDate: '2025-03-10 12:00:00',
    endDate: '2025-04-10 12:00:00',
    reason: 'Засвартай байгаа',
    lastUpdate: '2025-03-10 12:00:00',
    updatedBy: 'Reception',
    status: 'maintenance'
  },
  {
    id: '3',
    roomNumber: '306',
    roomType: 'Standard Double Room',
    startDate: '2025-03-10 12:00:00',
    endDate: '2025-04-10 12:00:00',
    reason: 'Засвартай байгаа',
    lastUpdate: '2025-03-10 12:00:00',
    updatedBy: 'Reception',
    status: 'blocked'
  },
  {
    id: '4',
    roomNumber: '205',
    roomType: 'Deluxe Twin Room',
    startDate: '2025-03-10 12:00:00',
    endDate: '2025-04-10 12:00:00',
    reason: 'Засвартай байгаа',
    lastUpdate: '2025-03-10 12:00:00',
    updatedBy: 'Reception',
    status: 'blocked'
  },
  {
    id: '5',
    roomNumber: '306',
    roomType: 'Standard Double Room',
    startDate: '2025-03-10 12:00:00',
    endDate: '2025-04-10 12:00:00',
    reason: 'Засвартай байгаа',
    lastUpdate: '2025-03-10 12:00:00',
    updatedBy: 'Reception',
    status: 'blocked'
  },
  {
    id: '6',
    roomNumber: '205',
    roomType: 'Deluxe Twin Room',
    startDate: '2025-03-10 12:00:00',
    endDate: '2025-04-10 12:00:00',
    reason: 'Засвартай байгаа',
    lastUpdate: '2025-03-10 12:00:00',
    updatedBy: 'Reception',
    status: 'available'
  }
];

type TabType = 'all' | 'blocked' | 'available' | 'maintenance';

export default function ReceptionPage() {
  const t = useTranslations('RoomBlocks');

  // State
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formRoomType, setFormRoomType] = useState('');
  const [formRoomNumber, setFormRoomNumber] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formReason, setFormReason] = useState('');

  // Filter room blocks based on active tab and search
  const filteredRoomBlocks = useMemo(() => {
    let filtered = mockRoomBlocks;

    if (activeTab !== 'all') {
      filtered = filtered.filter(block => block.status === activeTab);
    }

    if (searchQuery) {
      filtered = filtered.filter(block =>
        block.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  const tabs = [
    { 
      key: 'all', 
      label: t('tabs.all'), 
      count: mockRoomBlocks.length 
    },
    { 
      key: 'blocked', 
      label: t('tabs.blocked'), 
      count: mockRoomBlocks.filter(b => b.status === 'blocked').length 
    },
    { 
      key: 'maintenance', 
      label: t('tabs.maintenance'), 
      count: mockRoomBlocks.filter(b => b.status === 'maintenance').length 
    },
    { 
      key: 'available', 
      label: t('tabs.available'), 
      count: mockRoomBlocks.filter(b => b.status === 'available').length 
    }
  ];

  const handleSaveRoomBlock = async () => {
    if (!formRoomType || !formRoomNumber || !formStartDate || !formEndDate || !formReason) {
      return;
    }

    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Here you would normally make an API call to save the room block
    console.log('Saving room block:', {
      roomType: formRoomType,
      roomNumber: formRoomNumber,
      startDate: formStartDate,
      endDate: formEndDate,
      reason: formReason
    });

    setIsSaving(false);
    setIsAddModalOpen(false);
    
    // Reset form
    setFormRoomType('');
    setFormRoomNumber('');
    setFormStartDate('');
    setFormEndDate('');
    setFormReason('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          {t('addBlock')}
        </Button>
      </div>

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
                <span className="text-xs text-muted-foreground">({tab.count})</span>
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
                  <TableHead className="font-medium">{t('table.roomNumber')}</TableHead>
                  <TableHead className="font-medium">{t('table.roomType')}</TableHead>
                  <TableHead className="font-medium">{t('table.startDate')}</TableHead>
                  <TableHead className="font-medium">{t('table.endDate')}</TableHead>
                  <TableHead className="font-medium">{t('table.reason')}</TableHead>
                  <TableHead className="font-medium">{t('table.lastUpdate')}</TableHead>
                  <TableHead className="font-medium">{t('table.updatedBy')}</TableHead>
                  <TableHead className="font-medium w-24">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoomBlocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      {t('messages.noBlocks')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoomBlocks.map((block) => (
                    <TableRow key={block.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{block.roomNumber}</TableCell>
                      <TableCell>{block.roomType}</TableCell>
                      <TableCell>{block.startDate}</TableCell>
                      <TableCell>{block.endDate}</TableCell>
                      <TableCell>{block.reason}</TableCell>
                      <TableCell>{block.lastUpdate}</TableCell>
                      <TableCell>{block.updatedBy}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
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

      {/* Add Room Block Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addBlockModal')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('form.roomType')}</Label>
                <Select value={formRoomType} onValueChange={setFormRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectRoomType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Double Room</SelectItem>
                    <SelectItem value="deluxe">Deluxe Twin Room</SelectItem>
                    <SelectItem value="suite">Executive Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('form.roomNumber')}</Label>
                <Select value={formRoomNumber} onValueChange={setFormRoomNumber}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectRoom')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="205">205</SelectItem>
                    <SelectItem value="306">306</SelectItem>
                    <SelectItem value="401">401</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('form.startDate')} *</Label>
                <Input
                  type="datetime-local"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('form.endDate')} *</Label>
                <Input
                  type="datetime-local"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('form.reason')}</Label>
              <Textarea
                placeholder={t('form.reasonPlaceholder')}
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSaveRoomBlock}
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}