'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  IconCheck,
  IconX,
  IconLoader2,
  IconSearch,
  IconBuilding,
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconRefresh,
} from '@tabler/icons-react';

interface Owner {
  owner_pk: number;
  user_name: string;
  hotel_name: string;
  hotel_address: string;
  user_mail: string;
  user_phone: string;
  user_type: number;
  approved: boolean;
  created_at: string;
}

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    owner: Owner | null;
    action: 'approve' | 'revoke';
  }>({ isOpen: false, owner: null, action: 'approve' });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchOwners = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/superadmin/owners', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch owners');
      }

      const data = await response.json();
      setOwners(data);
    } catch (error) {
      console.error('Error fetching owners:', error);
      toast.error('Эзэд ачаалахад алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const handleApprovalChange = async (owner: Owner, approved: boolean) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/superadmin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          owner_pk: owner.owner_pk,
          approved,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update approval status');
      }

      toast.success(approved ? 'Хэрэглэгчийг зөвшөөрлөө' : 'Зөвшөөрлийг цуцаллаа');
      
      // Update local state
      setOwners((prev) =>
        prev.map((o) =>
          o.owner_pk === owner.owner_pk ? { ...o, approved } : o
        )
      );
    } catch (error) {
      console.error('Error updating approval:', error);
      toast.error('Алдаа гарлаа');
    } finally {
      setIsProcessing(false);
      setConfirmDialog({ isOpen: false, owner: null, action: 'approve' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter owners based on search and tab
  const filteredOwners = owners.filter((owner) => {
    const matchesSearch =
      owner.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.hotel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.user_mail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.hotel_address.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'pending') return matchesSearch && !owner.approved;
    if (activeTab === 'approved') return matchesSearch && owner.approved;
    return matchesSearch;
  });

  const pendingCount = owners.filter((o) => !o.approved).length;
  const approvedCount = owners.filter((o) => o.approved).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Эзэдийн удирдлага</h1>
          <p className="text-muted-foreground">
            Зочид буудлын эзэдийн бүртгэл болон зөвшөөрөл удирдах
          </p>
        </div>
        <Button onClick={fetchOwners} variant="outline" disabled={isLoading}>
          <IconRefresh className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Шинэчлэх
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт эзэд</CardTitle>
            <IconUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{owners.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Хүлээгдэж буй</CardTitle>
            <IconLoader2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Зөвшөөрөгдсөн</CardTitle>
            <IconCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Эзэдийн жагсаалт</CardTitle>
              <CardDescription>
                Бүртгүүлсэн зочид буудлын эзэдийг зөвшөөрөх эсвэл цуцлах
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="gap-2">
                Хүлээгдэж буй
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Зөвшөөрөгдсөн</TabsTrigger>
              <TabsTrigger value="all">Бүгд</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredOwners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <IconUser className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-lg font-medium">Эзэд олдсонгүй</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? 'Хайлтын үр дүн олдсонгүй'
                      : activeTab === 'pending'
                      ? 'Хүлээгдэж буй хүсэлт байхгүй байна'
                      : 'Эзэд бүртгэгдээгүй байна'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Эзэн</TableHead>
                        <TableHead>Зочид буудал</TableHead>
                        <TableHead>Холбоо барих</TableHead>
                        <TableHead>Бүртгүүлсэн</TableHead>
                        <TableHead>Төлөв</TableHead>
                        <TableHead className="text-right">Үйлдэл</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOwners.map((owner) => (
                        <TableRow key={owner.owner_pk}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <IconUser className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{owner.user_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  ID: {owner.owner_pk}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <IconBuilding className="mt-0.5 h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{owner.hotel_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {owner.hotel_address}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <IconMail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{owner.user_mail}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <IconPhone className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{owner.user_phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <IconCalendar className="h-3.5 w-3.5" />
                              <span>{formatDate(owner.created_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {owner.approved ? (
                              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                <IconCheck className="mr-1 h-3 w-3" />
                                Зөвшөөрөгдсөн
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                <IconLoader2 className="mr-1 h-3 w-3" />
                                Хүлээгдэж буй
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {owner.approved ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setConfirmDialog({
                                    isOpen: true,
                                    owner,
                                    action: 'revoke',
                                  })
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <IconX className="mr-1 h-4 w-4" />
                                Цуцлах
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  setConfirmDialog({
                                    isOpen: true,
                                    owner,
                                    action: 'approve',
                                  })
                                }
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <IconCheck className="mr-1 h-4 w-4" />
                                Зөвшөөрөх
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) =>
          !open && setConfirmDialog({ isOpen: false, owner: null, action: 'approve' })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'approve'
                ? 'Хэрэглэгчийг зөвшөөрөх үү?'
                : 'Зөвшөөрлийг цуцлах уу?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.owner && (
                <>
                  <strong>{confirmDialog.owner.user_name}</strong> ({confirmDialog.owner.hotel_name})
                  {confirmDialog.action === 'approve'
                    ? ' хэрэглэгчийг зөвшөөрөхөд тухайн хэрэглэгч системд нэвтрэх боломжтой болно.'
                    : ' хэрэглэгчийн зөвшөөрлийг цуцлахад тухайн хэрэглэгч системд нэвтрэх боломжгүй болно.'}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Буцах</AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              onClick={() =>
                confirmDialog.owner &&
                handleApprovalChange(confirmDialog.owner, confirmDialog.action === 'approve')
              }
              className={
                confirmDialog.action === 'approve'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }
            >
              {isProcessing && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmDialog.action === 'approve' ? 'Зөвшөөрөх' : 'Цуцлах'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
