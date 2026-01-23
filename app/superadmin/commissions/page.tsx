'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IconLoader2,
  IconSearch,
  IconRefresh,
  IconPlus,
  IconFileText,
  IconPercentage,
  IconCalendar,
  IconBuilding,
  IconCheck,
  IconX,
  IconExternalLink,
  IconEdit,
} from '@tabler/icons-react';

interface PropertyCommission {
  id: number;
  contract_file_url: string | null;
  is_active: boolean;
  hotel_discount_percent: string;
  platform_markup_percent: string;
  contract_file: string | null;
  status: 'active' | 'draft' | 'expired' | 'pending';
  start_date: string;
  end_date: string;
  created_at: string;
  property_obj: number;
}

interface Property {
  pk: number;
  PropertyName: string;
  CompanyName: string;
}

export default function PropertyCommissionsPage() {
  const [commissions, setCommissions] = useState<PropertyCommission[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommission, setEditingCommission] = useState<PropertyCommission | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    property_obj: '',
    hotel_discount_percent: '',
    platform_markup_percent: '',
    start_date: '',
    end_date: '',
    status: 'draft' as 'active' | 'draft',
    is_active: false,
  });
  const [contractFile, setContractFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [commissionsRes, propertiesRes] = await Promise.all([
        fetch('/api/superadmin/property-commissions', { credentials: 'include' }),
        fetch('/api/superadmin/properties', { credentials: 'include' }),
      ]);

      if (!commissionsRes.ok || !propertiesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const commissionsData = await commissionsRes.json();
      const propertiesData = await propertiesRes.json();

      setCommissions(commissionsData);
      setProperties(propertiesData);
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

  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p) => p.pk === propertyId);
    return property ? `${property.pk} - ${property.PropertyName}` : `Property #${propertyId}`;
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'active' && isActive) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <IconCheck className="mr-1 h-3 w-3" />
          Идэвхтэй
        </Badge>
      );
    }
    if (status === 'expired') {
      return (
        <Badge variant="destructive">
          Дууссан
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <IconX className="mr-1 h-3 w-3" />
        Идэвхгүй
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredCommissions = commissions.filter((commission) => {
    const propertyName = getPropertyName(commission.property_obj).toLowerCase();
    return (
      propertyName.includes(searchQuery.toLowerCase()) ||
      commission.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('property_obj', formData.property_obj);
      formDataToSend.append('hotel_discount_percent', formData.hotel_discount_percent);
      formDataToSend.append('platform_markup_percent', formData.platform_markup_percent);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('is_active', String(formData.is_active));

      if (contractFile) {
        formDataToSend.append('contract_file', contractFile);
      }

      const url = editingCommission 
        ? `/api/superadmin/property-commissions/${editingCommission.id}`
        : '/api/superadmin/property-commissions';
      
      const method = editingCommission ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingCommission ? 'update' : 'create'} commission`);
      }

      toast.success(editingCommission ? 'Гэрээ амжилттай шинэчлэгдлээ' : 'Гэрээ амжилттай үүсгэлээ');
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error submitting commission:', error);
      toast.error(editingCommission ? 'Гэрээ шинэчлэхэд алдаа гарлаа' : 'Гэрээ үүсгэхэд алдаа гарлаа');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      property_obj: '',
      hotel_discount_percent: '',
      platform_markup_percent: '',
      start_date: '',
      end_date: '',
      status: 'draft',
      is_active: false,
    });
    setContractFile(null);
    setEditingCommission(null);
  };

  const handleEdit = (commission: PropertyCommission) => {
    setEditingCommission(commission);
    setFormData({
      property_obj: String(commission.property_obj),
      hotel_discount_percent: commission.hotel_discount_percent,
      platform_markup_percent: commission.platform_markup_percent,
      start_date: commission.start_date,
      end_date: commission.end_date,
      status: commission.status as 'active' | 'draft',
      is_active: commission.is_active,
    });
    setContractFile(null);
    setIsDialogOpen(true);
  };

  const stats = {
    total: commissions.length,
    active: commissions.filter((c) => c.status === 'active' && c.is_active).length,
    draft: commissions.filter((c) => c.status === 'draft' || !c.is_active).length,
    inactive: commissions.filter((c) => !c.is_active).length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Гэрээний үнэ</h1>
          <p className="text-muted-foreground">
            Зочид буудлуудын гэрээ болон үнийн тохиргоог удирдах
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" disabled={isLoading}>
            <IconRefresh className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Шинэчлэх
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Шинэ гэрээ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingCommission ? 'Гэрээ засах' : 'Шинэ гэрээ үүсгэх'}</DialogTitle>
                <DialogDescription>
                  {editingCommission ? 'Гэрээний мэдээллийг шинэчилнэ үү' : 'Зочид буудалтай шинэ гэрээ үүсгэнэ үү'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="property">Зочид буудал</Label>
                    <Select
                      value={formData.property_obj}
                      onValueChange={(value) =>
                        setFormData({ ...formData, property_obj: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Буудал сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.pk} value={String(property.pk)}>
                            {property.pk} - {property.PropertyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="hotel_discount">Буудлын хөнгөлөлт (%)</Label>
                      <Input
                        id="hotel_discount"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        value={formData.hotel_discount_percent}
                        onChange={(e) =>
                          setFormData({ ...formData, hotel_discount_percent: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="platform_markup">Платформын нэмэлт (%)</Label>
                      <Input
                        id="platform_markup"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        value={formData.platform_markup_percent}
                        onChange={(e) =>
                          setFormData({ ...formData, platform_markup_percent: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start_date">Эхлэх огноо</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({ ...formData, start_date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end_date">Дуусах огноо</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData({ ...formData, end_date: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Төлөв</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'active' | 'draft') =>
                        setFormData({ ...formData, status: value, is_active: value === 'active' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Төлөв сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Идэвхгүй</SelectItem>
                        <SelectItem value="active">Идэвхтэй</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contract_file">Гэрээний файл</Label>
                    <Input
                      id="contract_file"
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => setContractFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, эсвэл зураг файл байж болно
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Болих
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingCommission ? 'Шинэчлэх' : 'Үүсгэх'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Нийт гэрээ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Идэвхтэй</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Идэвхгүй</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Идэвхгүй</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Гэрээнүүд</CardTitle>
              <CardDescription>Бүртгэгдсэн гэрээнүүдийн жагсаалт</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCommissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconFileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Хайлтад тохирох гэрээ олдсонгүй' : 'Гэрээ бүртгэгдээгүй байна'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Буудал</TableHead>
                    <TableHead className="text-center">Буудлын хөнгөлөлт</TableHead>
                    <TableHead className="text-center">Платформын нэмэлт</TableHead>
                    <TableHead className="text-center">Хугацаа</TableHead>
                    <TableHead className="text-center">Төлөв</TableHead>
                    <TableHead className="text-center">Гэрээ</TableHead>
                    <TableHead className="text-center">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconBuilding className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {getPropertyName(commission.property_obj)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <IconPercentage className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-blue-600">
                            {commission.hotel_discount_percent}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <IconPercentage className="h-4 w-4 text-purple-500" />
                          <span className="font-medium text-purple-600">
                            {commission.platform_markup_percent}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <IconCalendar className="h-4 w-4" />
                          <span>
                            {formatDate(commission.start_date)} - {formatDate(commission.end_date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(commission.status, commission.is_active)}
                      </TableCell>
                      <TableCell className="text-center">
                        {commission.contract_file_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={commission.contract_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <IconExternalLink className="h-4 w-4 mr-1" />
                              Харах
                            </a>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(commission)}
                        >
                          <IconEdit className="h-4 w-4 mr-1" />
                          Засах
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
