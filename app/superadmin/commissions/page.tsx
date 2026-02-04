'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
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
  IconHistory,
  IconCurrencyDollar,
  IconUser,
  IconMail,
  IconPhone,
  IconBuildingBank,
} from '@tabler/icons-react';

interface PropertyCommission {
  id: number;
  contract_file_url: string | null;
  is_active: boolean;
  company_name: string;
  company_register: string;
  hotel_discount_percent: string;
  platform_markup_percent: string;
  start_date: string;
  end_date: string;
  signer_name: string;
  signer_email: string;
  signer_phone: string;
  billing_name: string;
  billing_email: string;
  billing_phone: string;
  bank_name: string;
  bank_iban: string;
  bank_account_name: string;
  billing_day: number | null;
  contract_file: string | null;
  status: 'active' | 'draft' | 'expired' | 'pending';
  note: string;
  created_at: string;
  property_obj: number;
}

interface PricePolicy {
  id: number;
  property_obj: number;
  property_name: string;
  hotel_discount_percent: string;
  platform_markup_percent: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
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
  
  // Price policy states
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [pricePolicies, setPricePolicies] = useState<PricePolicy[]>([]);
  const [isPoliciesLoading, setIsPoliciesLoading] = useState(false);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  
  // Price form state
  const [priceFormData, setPriceFormData] = useState({
    property_obj: '',
    hotel_discount_percent: '',
    platform_markup_percent: '',
    is_active: true,
  });
  
  // Form state for commission
  const [formData, setFormData] = useState({
    property_obj: '',
    company_name: '',
    company_register: '',
    hotel_discount_percent: '',
    platform_markup_percent: '',
    start_date: '',
    end_date: '',
    signer_name: '',
    signer_email: '',
    signer_phone: '',
    billing_name: '',
    billing_email: '',
    billing_phone: '',
    bank_name: '',
    bank_iban: '',
    bank_account_name: '',
    billing_day: '',
    note: '',
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

  const fetchPricePolicies = useCallback(async (propertyId: number) => {
    setIsPoliciesLoading(true);
    try {
      const response = await fetch(`/api/superadmin/price-policies?hotel=${propertyId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch price policies');
      }

      const data = await response.json();
      setPricePolicies(data);
    } catch (error) {
      console.error('Error fetching price policies:', error);
      toast.error('Үнийн түүх ачаалахад алдаа гарлаа');
    } finally {
      setIsPoliciesLoading(false);
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredCommissions = commissions.filter((commission) => {
    const propertyName = getPropertyName(commission.property_obj).toLowerCase();
    const companyName = commission.company_name?.toLowerCase() || '';
    return (
      propertyName.includes(searchQuery.toLowerCase()) ||
      companyName.includes(searchQuery.toLowerCase()) ||
      commission.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('property_obj', formData.property_obj);
      formDataToSend.append('company_name', formData.company_name);
      formDataToSend.append('company_register', formData.company_register);
      formDataToSend.append('hotel_discount_percent', formData.hotel_discount_percent);
      formDataToSend.append('platform_markup_percent', formData.platform_markup_percent);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('signer_name', formData.signer_name);
      formDataToSend.append('signer_email', formData.signer_email);
      formDataToSend.append('signer_phone', formData.signer_phone);
      formDataToSend.append('billing_name', formData.billing_name);
      formDataToSend.append('billing_email', formData.billing_email);
      formDataToSend.append('billing_phone', formData.billing_phone);
      formDataToSend.append('bank_name', formData.bank_name);
      formDataToSend.append('bank_iban', formData.bank_iban);
      formDataToSend.append('bank_account_name', formData.bank_account_name);
      if (formData.billing_day) {
        formDataToSend.append('billing_day', formData.billing_day);
      }
      formDataToSend.append('note', formData.note);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('is_active', String(formData.is_active));

      if (contractFile) {
        formDataToSend.append('contract_file', contractFile);
      }

      const url = editingCommission 
        ? `/api/superadmin/property-commissions/${editingCommission.id}`
        : '/api/superadmin/property-commissions';
      
      const method = editingCommission ? 'PATCH' : 'POST';

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

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/superadmin/price-policies', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_obj: parseInt(priceFormData.property_obj),
          hotel_discount_percent: parseFloat(priceFormData.hotel_discount_percent),
          platform_markup_percent: parseFloat(priceFormData.platform_markup_percent),
          is_active: priceFormData.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create price policy');
      }

      toast.success('Үнийн бодлого амжилттай үүсгэлээ');
      setIsPriceDialogOpen(false);
      resetPriceForm();
      
      // Refresh price policies if we're viewing them
      if (selectedPropertyId) {
        fetchPricePolicies(selectedPropertyId);
      }
    } catch (error) {
      console.error('Error creating price policy:', error);
      toast.error('Үнийн бодлого үүсгэхэд алдаа гарлаа');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      property_obj: '',
      company_name: '',
      company_register: '',
      hotel_discount_percent: '',
      platform_markup_percent: '',
      start_date: '',
      end_date: '',
      signer_name: '',
      signer_email: '',
      signer_phone: '',
      billing_name: '',
      billing_email: '',
      billing_phone: '',
      bank_name: '',
      bank_iban: '',
      bank_account_name: '',
      billing_day: '',
      note: '',
      status: 'draft',
      is_active: false,
    });
    setContractFile(null);
    setEditingCommission(null);
  };

  const resetPriceForm = () => {
    setPriceFormData({
      property_obj: '',
      hotel_discount_percent: '',
      platform_markup_percent: '',
      is_active: true,
    });
  };

  const handleEdit = (commission: PropertyCommission) => {
    setEditingCommission(commission);
    setFormData({
      property_obj: String(commission.property_obj),
      company_name: commission.company_name || '',
      company_register: commission.company_register || '',
      hotel_discount_percent: commission.hotel_discount_percent,
      platform_markup_percent: commission.platform_markup_percent,
      start_date: commission.start_date,
      end_date: commission.end_date,
      signer_name: commission.signer_name || '',
      signer_email: commission.signer_email || '',
      signer_phone: commission.signer_phone || '',
      billing_name: commission.billing_name || '',
      billing_email: commission.billing_email || '',
      billing_phone: commission.billing_phone || '',
      bank_name: commission.bank_name || '',
      bank_iban: commission.bank_iban || '',
      bank_account_name: commission.bank_account_name || '',
      billing_day: commission.billing_day ? String(commission.billing_day) : '',
      note: commission.note || '',
      status: commission.status as 'active' | 'draft',
      is_active: commission.is_active,
    });
    setContractFile(null);
    setIsDialogOpen(true);
  };

  const handleViewHistory = (commission: PropertyCommission) => {
    setSelectedPropertyId(commission.property_obj);
    fetchPricePolicies(commission.property_obj);
    setIsHistorySheetOpen(true);
  };

  const handleEditPrice = (commission: PropertyCommission) => {
    setPriceFormData({
      property_obj: String(commission.property_obj),
      hotel_discount_percent: commission.hotel_discount_percent,
      platform_markup_percent: commission.platform_markup_percent,
      is_active: true,
    });
    setIsPriceDialogOpen(true);
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
          
          {/* Price Policy Dialog */}
          <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <IconCurrencyDollar className="mr-2 h-4 w-4" />
                Үнэ засах
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Үнийн бодлого засах</DialogTitle>
                <DialogDescription>
                  Буудлын хөнгөлөлт болон платформын нэмэлт хувийг шинэчлэх
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePriceSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price_property">Зочид буудал</Label>
                    <Select
                      value={priceFormData.property_obj}
                      onValueChange={(value) =>
                        setPriceFormData({ ...priceFormData, property_obj: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Буудал сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        {commissions.map((commission) => (
                          <SelectItem key={commission.id} value={String(commission.property_obj)}>
                            {getPropertyName(commission.property_obj)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price_hotel_discount">Буудлын хөнгөлөлт (%)</Label>
                      <Input
                        id="price_hotel_discount"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        value={priceFormData.hotel_discount_percent}
                        onChange={(e) =>
                          setPriceFormData({ ...priceFormData, hotel_discount_percent: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price_platform_markup">Платформын нэмэлт (%)</Label>
                      <Input
                        id="price_platform_markup"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        value={priceFormData.platform_markup_percent}
                        onChange={(e) =>
                          setPriceFormData({ ...priceFormData, platform_markup_percent: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="price_is_active"
                      checked={priceFormData.is_active}
                      onCheckedChange={(checked) =>
                        setPriceFormData({ ...priceFormData, is_active: checked })
                      }
                    />
                    <Label htmlFor="price_is_active">Идэвхтэй болгох</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsPriceDialogOpen(false);
                      resetPriceForm();
                    }}
                  >
                    Болих
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Хадгалах
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Commission Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Шинэ гэрээ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCommission ? 'Гэрээ засах' : 'Шинэ гэрээ үүсгэх'}</DialogTitle>
                <DialogDescription>
                  {editingCommission ? 'Гэрээний мэдээллийг шинэчилнэ үү' : 'Зочид буудалтай шинэ гэрээ үүсгэнэ үү'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Үндсэн</TabsTrigger>
                    <TabsTrigger value="signer">Гарын үсэг</TabsTrigger>
                    <TabsTrigger value="billing">Төлбөр</TabsTrigger>
                    <TabsTrigger value="bank">Банк</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="property">Зочид буудал</Label>
                        <Select
                          value={formData.property_obj}
                          onValueChange={(value) =>
                            setFormData({ ...formData, property_obj: value })
                          }
                          disabled={!!editingCommission}
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
                          <Label htmlFor="company_name">Компанийн нэр</Label>
                          <Input
                            id="company_name"
                            placeholder="Компанийн нэр"
                            value={formData.company_name}
                            onChange={(e) =>
                              setFormData({ ...formData, company_name: e.target.value })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="company_register">Регистрийн дугаар</Label>
                          <Input
                            id="company_register"
                            placeholder="Регистрийн дугаар"
                            value={formData.company_register}
                            onChange={(e) =>
                              setFormData({ ...formData, company_register: e.target.value })
                            }
                          />
                        </div>
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
                            <SelectItem value="draft">Ноорог</SelectItem>
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

                      <div className="grid gap-2">
                        <Label htmlFor="note">Тэмдэглэл</Label>
                        <Textarea
                          id="note"
                          placeholder="Тэмдэглэл..."
                          value={formData.note}
                          onChange={(e) =>
                            setFormData({ ...formData, note: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="signer" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="signer_name">
                          <IconUser className="inline h-4 w-4 mr-1" />
                          Гарын үсэг зурах хүний нэр
                        </Label>
                        <Input
                          id="signer_name"
                          placeholder="Нэр"
                          value={formData.signer_name}
                          onChange={(e) =>
                            setFormData({ ...formData, signer_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="signer_email">
                          <IconMail className="inline h-4 w-4 mr-1" />
                          И-мэйл
                        </Label>
                        <Input
                          id="signer_email"
                          type="email"
                          placeholder="email@example.com"
                          value={formData.signer_email}
                          onChange={(e) =>
                            setFormData({ ...formData, signer_email: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="signer_phone">
                          <IconPhone className="inline h-4 w-4 mr-1" />
                          Утасны дугаар
                        </Label>
                        <Input
                          id="signer_phone"
                          placeholder="Утасны дугаар"
                          value={formData.signer_phone}
                          onChange={(e) =>
                            setFormData({ ...formData, signer_phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="billing" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="billing_name">
                          <IconUser className="inline h-4 w-4 mr-1" />
                          Төлбөр хариуцагчийн нэр
                        </Label>
                        <Input
                          id="billing_name"
                          placeholder="Нэр"
                          value={formData.billing_name}
                          onChange={(e) =>
                            setFormData({ ...formData, billing_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="billing_email">
                          <IconMail className="inline h-4 w-4 mr-1" />
                          И-мэйл
                        </Label>
                        <Input
                          id="billing_email"
                          type="email"
                          placeholder="billing@example.com"
                          value={formData.billing_email}
                          onChange={(e) =>
                            setFormData({ ...formData, billing_email: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="billing_phone">
                          <IconPhone className="inline h-4 w-4 mr-1" />
                          Утасны дугаар
                        </Label>
                        <Input
                          id="billing_phone"
                          placeholder="Утасны дугаар"
                          value={formData.billing_phone}
                          onChange={(e) =>
                            setFormData({ ...formData, billing_phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="billing_day">Төлбөрийн өдөр (сар бүр)</Label>
                        <Input
                          id="billing_day"
                          type="number"
                          min="1"
                          max="31"
                          placeholder="1-31"
                          value={formData.billing_day}
                          onChange={(e) =>
                            setFormData({ ...formData, billing_day: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="bank" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bank_name">
                          <IconBuildingBank className="inline h-4 w-4 mr-1" />
                          Банкны нэр
                        </Label>
                        <Input
                          id="bank_name"
                          placeholder="Банкны нэр"
                          value={formData.bank_name}
                          onChange={(e) =>
                            setFormData({ ...formData, bank_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bank_iban">Дансны дугаар / IBAN</Label>
                        <Input
                          id="bank_iban"
                          placeholder="Дансны дугаар"
                          value={formData.bank_iban}
                          onChange={(e) =>
                            setFormData({ ...formData, bank_iban: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bank_account_name">Данс эзэмшигчийн нэр</Label>
                        <Input
                          id="bank_account_name"
                          placeholder="Данс эзэмшигчийн нэр"
                          value={formData.bank_account_name}
                          onChange={(e) =>
                            setFormData({ ...formData, bank_account_name: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6">
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
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Идэвхтэй</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ноорог</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Идэвхгүй</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Гэрээнүүд</CardTitle>
              <CardDescription>Батлагдсан буудлуудын гэрээний жагсаалт</CardDescription>
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
                    <TableHead>Буудал / Компани</TableHead>
                    <TableHead className="text-center">Хөнгөлөлт</TableHead>
                    <TableHead className="text-center">Платформ</TableHead>
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
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <IconBuilding className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {getPropertyName(commission.property_obj)}
                            </span>
                          </div>
                          {commission.company_name && (
                            <span className="text-sm text-muted-foreground">
                              {commission.company_name} ({commission.company_register})
                            </span>
                          )}
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
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(commission)}
                            title="Гэрээ засах"
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPrice(commission)}
                            title="Үнэ засах"
                          >
                            <IconCurrencyDollar className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewHistory(commission)}
                            title="Түүх харах"
                          >
                            <IconHistory className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price History Sheet */}
      <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Үнийн бодлогын түүх</SheetTitle>
            <SheetDescription>
              {selectedPropertyId && getPropertyName(selectedPropertyId)}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {isPoliciesLoading ? (
              <div className="flex justify-center items-center py-12">
                <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pricePolicies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <IconHistory className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Үнийн бодлогын түүх олдсонгүй</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pricePolicies.map((policy, index) => (
                  <Card key={policy.id} className={index === 0 ? 'border-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={policy.is_active ? 'default' : 'outline'}>
                              {policy.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                            </Badge>
                            {index === 0 && (
                              <Badge variant="secondary">Сүүлийн</Badge>
                            )}
                          </div>
                          <div className="flex gap-4 mt-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Буудал: </span>
                              <span className="font-medium text-blue-600">
                                {policy.hotel_discount_percent}%
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Платформ: </span>
                              <span className="font-medium text-purple-600">
                                {policy.platform_markup_percent}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Үүсгэсэн: {policy.created_by}</span>
                          <span>{formatDateTime(policy.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
