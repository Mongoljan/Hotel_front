'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { schemaContractOrganization } from '@/app/schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerWithValue } from '@/components/ui/date-picker';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  IconLoader2,
  IconSearch,
  IconRefresh,
  IconPlus,
  IconBuilding,
  IconPercentage,
  IconCalendar,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconEdit,
  IconEye,
  IconTrash,
} from '@tabler/icons-react';

type FormFields = z.infer<ReturnType<typeof schemaContractOrganization>>;

// API response structure
interface PartnerOrganization {
  id: number;
  name: string;
  register_no: string;
  org_type: string;
  discount_percent: number;
  promo: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  finance1_name: string;
  finance1_phone: string;
  finance1_email: string;
  finance2_name: string;
  finance2_phone: string;
  finance2_email: string;
  address: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
}

export default function ContractOrganizationsPage() {
  const t = useTranslations('Corporate');
  const tv = useTranslations('Corporate.validation');

  const getOrgTypeLabel = (orgType: string): string => {
    const labels: Record<string, string> = {
      company: t('type_contract'),
      partner: t('type_partner'),
      hotel: t('type_hotel'),
    };
    return labels[orgType] || orgType;
  };
  const [organizations, setOrganizations] = useState<PartnerOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<PartnerOrganization | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<PartnerOrganization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch organizations from API
  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/partner-organizations', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOrganizations(Array.isArray(data) ? data : []);
      } else {
        toast.error(t('toast_fetch_error'));
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error(t('toast_fetch_error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaContractOrganization(tv)),
    defaultValues: {
      organization_name: '',
      registration_number: '',
      organization_type: '',
      discount_percent: '',
      promo_code: '',
      validity_start: '',
      validity_end: '',
      contact_person_name: '',
      contact_person_email: '',
      contact_person_phone: '',
      financial_person_name: '',
      financial_person_email: '',
      financial_person_phone: '',
      accountant_person_name: '',
      accountant_person_email: '',
      accountant_person_phone: '',
      address: '',
      notes: '',
    },
  });

  const onSubmit = async (data: FormFields) => {
    setIsSaving(true);
    try {
      // Transform form data to API structure
      const apiData = {
        name: data.organization_name,
        register_no: data.registration_number,
        org_type: data.organization_type,
        discount_percent: parseFloat(data.discount_percent) || 0,
        promo: data.promo_code || '',
        contact_name: data.contact_person_name,
        contact_phone: data.contact_person_phone,
        contact_email: data.contact_person_email,
        finance1_name: data.financial_person_name || '',
        finance1_phone: data.financial_person_phone || '',
        finance1_email: data.financial_person_email || '',
        finance2_name: data.accountant_person_name || '',
        finance2_phone: data.accountant_person_phone || '',
        finance2_email: data.accountant_person_email || '',
        address: data.address || '',
        description: data.notes || '',
        start_date: data.validity_start,
        end_date: data.validity_end,
        is_active: true,
      };

      const url = '/api/partner-organizations';
      const method = editingOrg ? 'PUT' : 'POST';
      const body = editingOrg ? { id: editingOrg.id, ...apiData } : apiData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingOrg ? t('toast_updated') : t('toast_created'));
        setIsDialogOpen(false);
        form.reset();
        setEditingOrg(null);
        fetchOrganizations();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || t('toast_save_error'));
      }
    } catch (error) {
      console.error('Error saving organization:', error);
      toast.error(t('toast_save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (org: PartnerOrganization) => {
    setEditingOrg(org);
    // Map API fields to form fields
    form.reset({
      organization_name: org.name,
      registration_number: org.register_no,
      organization_type: org.org_type,
      discount_percent: org.discount_percent?.toString() || '',
      promo_code: org.promo || '',
      validity_start: org.start_date || '',
      validity_end: org.end_date || '',
      contact_person_name: org.contact_name || '',
      contact_person_email: org.contact_email || '',
      contact_person_phone: org.contact_phone || '',
      financial_person_name: org.finance1_name || '',
      financial_person_email: org.finance1_email || '',
      financial_person_phone: org.finance1_phone || '',
      accountant_person_name: org.finance2_name || '',
      accountant_person_email: org.finance2_email || '',
      accountant_person_phone: org.finance2_phone || '',
      address: org.address || '',
      notes: org.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleNewOrg = () => {
    setEditingOrg(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleDelete = (org: PartnerOrganization) => {
    setOrgToDelete(org);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orgToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner-organizations?id=${orgToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('toast_deleted'));
        fetchOrganizations();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || t('toast_delete_error'));
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error(t('toast_delete_error'));
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setOrgToDelete(null);
    }
  };

  const getStatusBadge = (org: PartnerOrganization) => {
    const now = new Date();
    const endDate = org.end_date ? new Date(org.end_date) : null;
    const isExpired = endDate && endDate < now;

    if (isExpired) {
      return <Badge variant="destructive">Дууссан</Badge>;
    }
    if (org.is_active) {
      return <Badge className="bg-green-500">Идэвхтэй</Badge>;
    }
    return <Badge variant="secondary">Идэвхгүй</Badge>;
  };

  const getOrgStatus = (org: PartnerOrganization): 'active' | 'inactive' | 'expired' => {
    const now = new Date();
    const endDate = org.end_date ? new Date(org.end_date) : null;
    if (endDate && endDate < now) return 'expired';
    return org.is_active ? 'active' : 'inactive';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.register_no?.includes(searchQuery) ||
      org.contact_email?.toLowerCase().includes(searchQuery.toLowerCase());

    const status = getOrgStatus(org);
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && status === 'active') ||
      (activeTab === 'inactive' && status !== 'active');

    return matchesSearch && matchesTab;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        </div>
        <Button onClick={handleNewOrg} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <IconPlus className="mr-2 h-4 w-4" />
          {t('add_button')}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" preventOutsideClose hideCloseButton>
              <DialogHeader>
                <DialogTitle>{editingOrg ? t('dialog_title_edit') : t('dialog_title_new')}</DialogTitle>
                <DialogDescription>
                  {editingOrg ? t('dialog_desc_edit') : t('dialog_desc_new')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6 py-4">
                  {/* Гэрээт байгууллагын мэдээлэл */}
                  <div className="space-y-4">
                    <h3 className="font-medium">{t('org_info_section')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="organization_name">{t('org_name_label')}</Label>
                        <Input
                          id="organization_name"
                          {...form.register('organization_name')}
                          placeholder={t('org_name_placeholder')}
                        />
                        {form.formState.errors.organization_name && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.organization_name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="registration_number">{t('reg_no_label')}</Label>
                        <Input
                          id="registration_number"
                          {...form.register('registration_number')}
                          placeholder={t('reg_no_placeholder')}
                        />
                        {form.formState.errors.registration_number && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.registration_number.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="organization_type">{t('type_label')}</Label>
                        <Select
                          value={form.watch('organization_type')}
                          onValueChange={(value) => form.setValue('organization_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('type_placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="company">{t('type_contract')}</SelectItem>
                            <SelectItem value="partner">{t('type_partner')}</SelectItem>
                            <SelectItem value="hotel">{t('type_hotel')}</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.organization_type && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.organization_type.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Хүчинтэй хугацаа */}
                  <div className="space-y-4">
                    <h3 className="font-medium">{t('validity_section')}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="validity_start">{t('start_date_label')}</Label>
                        <DatePickerWithValue
                          value={form.watch('validity_start')}
                          onChange={(value) => form.setValue('validity_start', value)}
                          placeholder={t('start_date_placeholder')}
                        />
                        {form.formState.errors.validity_start && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.validity_start.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="validity_end">{t('end_date_label')}</Label>
                        <DatePickerWithValue
                          value={form.watch('validity_end')}
                          onChange={(value) => form.setValue('validity_end', value)}
                          placeholder={t('end_date_placeholder')}
                        />
                        {form.formState.errors.validity_end && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.validity_end.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="discount_percent">{t('discount_label')}</Label>
                        <Input
                          id="discount_percent"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...form.register('discount_percent')}
                        />
                        {form.formState.errors.discount_percent && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.discount_percent.message}
                          </p>
                        )}
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor="promo_code">{t('promo_label')}</Label>
                        <Input
                          id="promo_code"
                          {...form.register('promo_code')}
                          placeholder={t('promo_placeholder')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Холбогдох хүний мэдээлэл */}
                  <div className="space-y-4">
                    <h3 className="font-medium">{t('contact_section')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="contact_person_name">{t('contact_name_label')}</Label>
                        <Input
                          id="contact_person_name"
                          {...form.register('contact_person_name')}
                          placeholder={t('contact_name_placeholder')}
                        />
                        {form.formState.errors.contact_person_name && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.contact_person_name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="contact_person_email">{t('email_label')}</Label>
                        <Input
                          id="contact_person_email"
                          type="email"
                          {...form.register('contact_person_email')}
                          placeholder={t('email_placeholder')}
                        />
                        {form.formState.errors.contact_person_email && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.contact_person_email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="contact_person_phone">{t('phone_label')}</Label>
                        <Input
                          id="contact_person_phone"
                          {...form.register('contact_person_phone')}
                          placeholder={t('phone_placeholder')}
                        />
                        {form.formState.errors.contact_person_phone && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.contact_person_phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Санхүүгийн албаны */}
                  <div className="space-y-4">
                    <h3 className="font-medium">{t('finance_section')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="financial_person_name">{t('finance_name_label')}</Label>
                        <Input
                          id="financial_person_name"
                          {...form.register('financial_person_name')}
                          placeholder={t('finance_name_placeholder')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="financial_person_email">{t('email_label')}</Label>
                        <Input
                          id="financial_person_email"
                          type="email"
                          {...form.register('financial_person_email')}
                          placeholder={t('email_placeholder')}
                        />
                        {form.formState.errors.financial_person_email && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.financial_person_email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="financial_person_phone">{t('phone_label')}</Label>
                        <Input
                          id="financial_person_phone"
                          {...form.register('financial_person_phone')}
                          placeholder={t('phone_placeholder')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Тооцооны Нягтлан Бодогч */}
                  <div className="space-y-4">
                    <h3 className="font-medium">{t('accountant_section')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="accountant_person_name">{t('accountant_name_label')}</Label>
                        <Input
                          id="accountant_person_name"
                          {...form.register('accountant_person_name')}
                          placeholder={t('accountant_name_placeholder')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountant_person_email">{t('email_label')}</Label>
                        <Input
                          id="accountant_person_email"
                          type="email"
                          {...form.register('accountant_person_email')}
                          placeholder={t('email_placeholder')}
                        />
                        {form.formState.errors.accountant_person_email && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.accountant_person_email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="accountant_person_phone">{t('phone_label')}</Label>
                        <Input
                          id="accountant_person_phone"
                          {...form.register('accountant_person_phone')}
                          placeholder={t('phone_placeholder')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Хаяг ба Тайлбар */}
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="address">{t('address_label')}</Label>
                        <Textarea
                          id="address"
                          {...form.register('address')}
                          placeholder={t('address_placeholder')}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">{t('notes_label')}</Label>
                        <Textarea
                          id="notes"
                          {...form.register('notes')}
                          placeholder={t('notes_placeholder')}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      form.reset();
                      setEditingOrg(null);
                    }}
                    disabled={isSaving}
                  >
                    {t('cancel_button')}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('saving_button')}
                      </>
                    ) : t('save_button')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="all">{t('tab_all')}</TabsTrigger>
                <TabsTrigger value="active">{t('tab_active')}</TabsTrigger>
                <TabsTrigger value="inactive">{t('tab_inactive')}</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-4">
              <Select value="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Төрөл: Бүгд" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Төрөл: Бүгд</SelectItem>
                  <SelectItem value="Гэрээт">Гэрээт</SelectItem>
                  <SelectItem value="Харилцагч">Харилцагч</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full md:w-72">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconBuilding className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {t('no_results')}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>№</TableHead>
                    <TableHead>{t('table_name')}</TableHead>
                    <TableHead className="text-center">{t('table_type')}</TableHead>
                    <TableHead className="text-center">{t('reg_no_label')}</TableHead>
                    <TableHead className="text-center">{t('table_discount')}</TableHead>
                    <TableHead className="text-center">{t('table_contact')}</TableHead>
                    <TableHead className="text-center">{t('phone_label')}</TableHead>
                    <TableHead className="text-center">{t('email_label')}</TableHead>
                    <TableHead className="text-center">{t('table_date')}</TableHead>
                    <TableHead className="text-center">{t('table_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.map((org, index) => (
                    <TableRow key={org.id} className="hover:bg-muted/50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{org.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{getOrgTypeLabel(org.org_type)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{org.register_no}</TableCell>
                      <TableCell className="text-center">{org.discount_percent}%</TableCell>
                      <TableCell className="text-center">{org.contact_name}</TableCell>
                      <TableCell className="text-center">{org.contact_phone}</TableCell>
                      <TableCell className="text-center">{org.contact_email}</TableCell>
                      <TableCell className="text-center">
                        {org.start_date && org.end_date ? `${formatDate(org.start_date)} - ${formatDate(org.end_date)}` : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(org)}
                            title="Засах"
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(org)}
                            title="Устгах"
                            className="text-destructive hover:text-destructive"
                          >
                            <IconTrash className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" preventOutsideClose hideCloseButton>
          <DialogHeader>
            <DialogTitle>{t('delete_title')}</DialogTitle>
            <DialogDescription>
              {t('delete_confirm')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t('cancel_button')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('deleting_button')}
                </>
              ) : t('delete_button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
