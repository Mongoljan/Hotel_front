'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  IconChevronDown,
  IconChevronRight,
  IconLoader2,
  IconSearch,
  IconRefresh,
  IconUser,
  IconBuilding,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconCalendar,
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

interface Property {
  pk: number;
  register: string;
  CompanyName: string;
  PropertyName: string;
  location: string;
  property_type: number;
  phone: string;
  mail: string;
  is_approved: boolean;
  created_at: string;
}

interface CombinedApproval {
  owner: Owner;
  property: Property | null;
  status: 'both-pending' | 'both-approved' | 'owner-pending' | 'property-pending' | 'orphan';
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<CombinedApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'both' | 'owner' | 'property';
    approval: CombinedApproval | null;
    action: boolean;
  }>({ isOpen: false, type: 'both', approval: null, action: true });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ownersRes, propertiesRes] = await Promise.all([
        fetch('/api/superadmin/owners', { credentials: 'include' }),
        fetch('/api/superadmin/properties', { credentials: 'include' }),
      ]);

      if (!ownersRes.ok || !propertiesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const owners: Owner[] = await ownersRes.json();
      const properties: Property[] = await propertiesRes.json();

      // Match owners with properties by hotel name
      const combined: CombinedApproval[] = owners.map((owner) => {
        const property = properties.find(
          (p) => p.PropertyName.toLowerCase() === owner.hotel_name.toLowerCase()
        ) || null;

        let status: CombinedApproval['status'];
        if (!property) {
          status = 'orphan';
        } else if (!owner.approved && !property.is_approved) {
          status = 'both-pending';
        } else if (owner.approved && property.is_approved) {
          status = 'both-approved';
        } else if (!owner.approved) {
          status = 'owner-pending';
        } else {
          status = 'property-pending';
        }

        return { owner, property, status };
      });

      setApprovals(combined);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Мэдээлэл ачаалахад алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleExpand = (ownerPk: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ownerPk)) {
        newSet.delete(ownerPk);
      } else {
        newSet.add(ownerPk);
      }
      return newSet;
    });
  };

  const handleApprove = async (type: 'both' | 'owner' | 'property', approval: CombinedApproval, action: boolean) => {
    setIsProcessing(true);
    try {
      const promises = [];

      if (type === 'both' || type === 'owner') {
        promises.push(
          fetch('/api/superadmin/approve-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              owner_pk: approval.owner.owner_pk,
              approved: action,
            }),
          })
        );
      }

      if ((type === 'both' || type === 'property') && approval.property) {
        promises.push(
          fetch('/api/superadmin/approve-property', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              property_pk: approval.property.pk,
              is_approved: action,
            }),
          })
        );
      }

      const results = await Promise.all(promises);
      const failedResponses = results.filter((r) => !r.ok);

      if (failedResponses.length === 0) {
        toast.success(
          action
            ? type === 'both'
              ? 'Эзэн болон буудлыг зөвшөөрлөө'
              : type === 'owner'
              ? 'Эзнийг зөвшөөрлөө'
              : 'Буудлыг зөвшөөрлөө'
            : 'Зөвшөөрлийг цуцаллаа'
        );
        fetchData();
      } else {
        // Extract error message from failed response
        const errorData = await failedResponses[0].json().catch(() => null);
        const errorMessage = errorData?.error || errorData?.message || errorData?.detail || 'Зөвшөөрөл амжилтгүй боллоо';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error approving:', error);
      const errorMessage = error instanceof Error ? error.message : 'Алдаа гарлаа';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setConfirmDialog({ isOpen: false, type: 'both', approval: null, action: true });
    }
  };

  const getStatusBadge = (status: CombinedApproval['status']) => {
    switch (status) {
      case 'both-approved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <IconCheck className="mr-1 h-3 w-3" />
            Бүгд зөвшөөрөгдсөн
          </Badge>
        );
      case 'both-pending':
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            <IconAlertCircle className="mr-1 h-3 w-3" />
            Хүлээгдэж буй
          </Badge>
        );
      case 'owner-pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <IconUser className="mr-1 h-3 w-3" />
            Эзэн хүлээгдэж буй
          </Badge>
        );
      case 'property-pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <IconBuilding className="mr-1 h-3 w-3" />
            Буудал хүлээгдэж буй
          </Badge>
        );
      case 'orphan':
        return (
          <Badge variant="destructive">
            <IconX className="mr-1 h-3 w-3" />
            Буудал олдсонгүй
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredApprovals = approvals.filter((approval) =>
    approval.owner.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    approval.owner.hotel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    approval.owner.user_mail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    approval.property?.PropertyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: approvals.length,
    bothPending: approvals.filter((a) => a.status === 'both-pending').length,
    bothApproved: approvals.filter((a) => a.status === 'both-approved').length,
    partial: approvals.filter((a) => a.status === 'owner-pending' || a.status === 'property-pending').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Зөвшөөрлийн удирдлага</h1>
          <p className="text-muted-foreground">
            Эзэд болон зочид буудлын зөвшөөрлийг нэг дор удирдах
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" disabled={isLoading}>
          <IconRefresh className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Шинэчлэх
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Нийт</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Хүлээгдэж буй</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.bothPending}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Хэсэгчлэн</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Зөвшөөрөгдсөн</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.bothApproved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-96">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Хайх..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Approvals List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredApprovals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconAlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">Хүсэлт олдсонгүй</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredApprovals.map((approval) => {
            const isExpanded = expandedItems.has(approval.owner.owner_pk);
            return (
              <Card key={approval.owner.owner_pk}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(approval.owner.owner_pk)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <IconUser className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{approval.owner.user_name}</h3>
                              {getStatusBadge(approval.status)}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <IconBuilding className="h-4 w-4" />
                                {approval.owner.hotel_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <IconMail className="h-4 w-4" />
                                {approval.owner.user_mail}
                              </span>
                            </div>
                          </div>
                          {isExpanded ? (
                            <IconChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <IconChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="space-y-6 pt-0">
                      {/* Owner Details */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <IconUser className="h-5 w-5" />
                            Эзний мэдээлэл
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Нэр:</span>
                              <span className="font-medium">{approval.owner.user_name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">И-мэйл:</span>
                              <span className="font-medium">{approval.owner.user_mail}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Утас:</span>
                              <span className="font-medium">{approval.owner.user_phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Бүртгүүлсэн:</span>
                              <span className="font-medium">{formatDate(approval.owner.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Төлөв:</span>
                              {approval.owner.approved ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <IconCheck className="mr-1 h-3 w-3" />
                                  Зөвшөөрөгдсөн
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                  <IconX className="mr-1 h-3 w-3" />
                                  Хүлээгдэж буй
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Property Details */}
                        {approval.property ? (
                          <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                              <IconBuilding className="h-5 w-5" />
                              Буудлын мэдээлэл
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Нэр:</span>
                                <span className="font-medium">{approval.property.PropertyName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Компани:</span>
                                <span className="font-medium">{approval.property.CompanyName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">РД:</span>
                                <span className="font-medium">{approval.property.register}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Байршил:</span>
                                <span className="font-medium">{approval.property.location}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Бүртгүүлсэн:</span>
                                <span className="font-medium">{formatDate(approval.property.created_at)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Төлөв:</span>
                                {approval.property.is_approved ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <IconCheck className="mr-1 h-3 w-3" />
                                    Зөвшөөрөгдсөн
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    <IconX className="mr-1 h-3 w-3" />
                                    Хүлээгдэж буй
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg">
                            <div className="text-center">
                              <IconBuilding className="h-12 w-12 mx-auto text-muted-foreground/50" />
                              <p className="mt-2 text-sm font-medium">Буудал олдсонгүй</p>
                              <p className="text-xs text-muted-foreground">Энэ эзэнд буудал бүртгэгдээгүй байна</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {approval.status !== 'both-approved' && (
                        <div className="flex flex-wrap gap-3 pt-4 border-t">
                          {approval.status === 'both-pending' && (
                            <Button
                              onClick={() =>
                                setConfirmDialog({ isOpen: true, type: 'both', approval, action: true })
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <IconCheck className="mr-2 h-4 w-4" />
                              Бүгдийг зөвшөөрөх
                            </Button>
                          )}
                          {!approval.owner.approved && (
                            <Button
                              onClick={() =>
                                setConfirmDialog({ isOpen: true, type: 'owner', approval, action: true })
                              }
                              variant="outline"
                            >
                              <IconUser className="mr-2 h-4 w-4" />
                              Эзнийг зөвшөөрөх
                            </Button>
                          )}
                          {approval.property && !approval.property.is_approved && (
                            <Button
                              onClick={() =>
                                setConfirmDialog({ isOpen: true, type: 'property', approval, action: true })
                              }
                              variant="outline"
                            >
                              <IconBuilding className="mr-2 h-4 w-4" />
                              Буудлыг зөвшөөрөх
                            </Button>
                          )}
                          {approval.owner.approved && (
                            <Button
                              onClick={() =>
                                setConfirmDialog({ isOpen: true, type: 'owner', approval, action: false })
                              }
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <IconX className="mr-2 h-4 w-4" />
                              Эзнийг цуцлах
                            </Button>
                          )}
                          {approval.property?.is_approved && (
                            <Button
                              onClick={() =>
                                setConfirmDialog({ isOpen: true, type: 'property', approval, action: false })
                              }
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <IconX className="mr-2 h-4 w-4" />
                              Буудлыг цуцлах
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, isOpen: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action ? 'Зөвшөөрөх үү?' : 'Цуцлах уу?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.approval && (
                <>
                  {confirmDialog.type === 'both' && 'Эзэн болон буудлыг '}
                  {confirmDialog.type === 'owner' && 'Эзнийг '}
                  {confirmDialog.type === 'property' && 'Буудлыг '}
                  {confirmDialog.action ? 'зөвшөөрөх' : 'цуцлах'} гэж байна.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Буцах</AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              onClick={() =>
                confirmDialog.approval &&
                handleApprove(confirmDialog.type, confirmDialog.approval, confirmDialog.action)
              }
              className={confirmDialog.action ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isProcessing && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmDialog.action ? 'Зөвшөөрөх' : 'Цуцлах'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
