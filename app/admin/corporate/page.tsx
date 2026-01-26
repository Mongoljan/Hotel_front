'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { schemaContractOrganization } from '@/app/schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@tabler/icons-react';

type FormFields = z.infer<typeof schemaContractOrganization>;

interface ContractOrganization extends FormFields {
  id: number;
  created_at: string;
  status: 'active' | 'inactive' | 'expired';
}

// Mock data - будут заменены на API
const mockOrganizations: ContractOrganization[] = [
  {
    id: 1,
    organization_name: 'Маа Хотелс XXX',
    registration_number: '1234567',
    organization_type: 'Гэрээт',
    discount_percent: '20',
    promo_code: 'HOTEL20',
    validity_start: '2025-07-15',
    validity_end: '2025-12-31',
    contact_person_name: 'Батжаргал',
    contact_person_email: 'jagaa@myhotels.mn',
    contact_person_phone: '99992626',
    financial_person_name: '',
    financial_person_email: '',
    financial_person_phone: '',
    address: '',
    notes: '',
    created_at: '2025-07-15T10:00:00Z',
    status: 'active',
  },
  {
    id: 2,
    organization_name: 'Эм-Си-Эс XXX',
    registration_number: '1234567',
    organization_type: 'Харилцагч',
    discount_percent: '30',
    promo_code: '',
    validity_start: '2025-07-15',
    validity_end: '2025-12-31',
    contact_person_name: 'Зол',
    contact_person_email: 'szzoe1105@gmail.com',
    contact_person_phone: '99972626',
    financial_person_name: '',
    financial_person_email: '',
    financial_person_phone: '',
    address: '',
    notes: '',
    created_at: '2025-07-15T10:00:00Z',
    status: 'active',
  },
];

export default function ContractOrganizationsPage() {
  const [organizations, setOrganizations] = useState<ContractOrganization[]>(mockOrganizations);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<ContractOrganization | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaContractOrganization),
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
    try {
      // TODO: API integration here
      console.log('Form data:', data);
      
      if (editingOrg) {
        toast.success('Байгууллага амжилттай шинэчлэгдлээ');
      } else {
        toast.success('Байгууллага амжилттай бүртгэгдлээ');
      }
      
      setIsDialogOpen(false);
      form.reset();
      setEditingOrg(null);
    } catch (error) {
      toast.error('Алдаа гарлаа');
    }
  };

  const handleEdit = (org: ContractOrganization) => {
    setEditingOrg(org);
    form.reset(org);
    setIsDialogOpen(true);
  };

  const handleNewOrg = () => {
    setEditingOrg(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Идэвхтэй</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Идэвхгүй</Badge>;
      case 'expired':
        return <Badge variant="destructive">Дууссан</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
      org.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.registration_number.includes(searchQuery) ||
      org.contact_person_email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && org.status === 'active') ||
      (activeTab === 'inactive' && org.status !== 'active');

    return matchesSearch && matchesTab;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Гэрээт байгууллага</h1>
        </div>
        <Button onClick={handleNewOrg} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <IconPlus className="mr-2 h-4 w-4" />
          Нэмэх
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOrg ? 'Байгууллага засах' : 'Гэрээт байгууллага'}</DialogTitle>
                <DialogDescription>
                  {editingOrg ? 'Байгууллагын мэдээллийг шинэчилнэ үү' : 'Шинэ гэрээт байгууллага бүртгэх'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6 py-4">
                  {/* Гэрээт байгууллагын мэдээлэл */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Байгууллагын мэдээлэл</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="organization_name">Байгууллагын нэр *</Label>
                        <Input
                          id="organization_name"
                          {...form.register('organization_name')}
                          placeholder="Байгууллагын нэр"
                        />
                        {form.formState.errors.organization_name && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.organization_name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="registration_number">ААН-ийн регистрийн № *</Label>
                        <Input
                          id="registration_number"
                          {...form.register('registration_number')}
                          placeholder="1234567"
                        />
                        {form.formState.errors.registration_number && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.registration_number.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="organization_type">Төрөл *</Label>
                        <Select
                          value={form.watch('organization_type')}
                          onValueChange={(value) => form.setValue('organization_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Төрөл сонгох" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Гэрээт">Гэрээт</SelectItem>
                            <SelectItem value="Харилцагч">Харилцагч</SelectItem>
                            <SelectItem value="Зочид буудал">Зочид буудал</SelectItem>
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
                    <h3 className="font-medium">Хүчинтэй хугацаа</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="validity_start">Эхлэх огноо *</Label>
                        <Input
                          id="validity_start"
                          type="date"
                          {...form.register('validity_start')}
                        />
                        {form.formState.errors.validity_start && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.validity_start.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="validity_end">Дуусах огноо *</Label>
                        <Input
                          id="validity_end"
                          type="date"
                          {...form.register('validity_end')}
                        />
                        {form.formState.errors.validity_end && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.validity_end.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="discount_percent">Хөнгөлөлт (%) *</Label>
                        <Input
                          id="discount_percent"
                          type="number"
                          step="0.01"
                          placeholder="20.00"
                          {...form.register('discount_percent')}
                        />
                        {form.formState.errors.discount_percent && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.discount_percent.message}
                          </p>
                        )}
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor="promo_code">Промо дугаар</Label>
                        <Input
                          id="promo_code"
                          {...form.register('promo_code')}
                          placeholder="SUMMER2026"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Холбогдох хүний мэдээлэл */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Холбогдох хүний мэдээлэл</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="contact_person_name">Нэр, албан тушаал *</Label>
                        <Input
                          id="contact_person_name"
                          {...form.register('contact_person_name')}
                          placeholder="Батжаргал - Менежер"
                        />
                        {form.formState.errors.contact_person_name && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.contact_person_name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="contact_person_email">И-мэйл хаяг *</Label>
                        <Input
                          id="contact_person_email"
                          type="email"
                          {...form.register('contact_person_email')}
                          placeholder="contact@company.mn"
                        />
                        {form.formState.errors.contact_person_email && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.contact_person_email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="contact_person_phone">Утасны дугаар *</Label>
                        <Input
                          id="contact_person_phone"
                          {...form.register('contact_person_phone')}
                          placeholder="99001234"
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
                    <h3 className="font-medium">Ерөнхий Нягтлан Бодогч</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="financial_person_name">Нэр, албан тушаал</Label>
                        <Input
                          id="financial_person_name"
                          {...form.register('financial_person_name')}
                          placeholder="Нэр"
                        />
                      </div>
                      <div>
                        <Label htmlFor="financial_person_email">И-мэйл хаяг</Label>
                        <Input
                          id="financial_person_email"
                          type="email"
                          {...form.register('financial_person_email')}
                          placeholder="finance@company.mn"
                        />
                        {form.formState.errors.financial_person_email && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.financial_person_email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="financial_person_phone">Утасны дугаар</Label>
                        <Input
                          id="financial_person_phone"
                          {...form.register('financial_person_phone')}
                          placeholder="99001234"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Тооцооны Нягтлан Бодогч */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Тооцооны Нягтлан Бодогч</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="accountant_person_name">Нэр, албан тушаал</Label>
                        <Input
                          id="accountant_person_name"
                          {...form.register('accountant_person_name')}
                          placeholder="Нэр"
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountant_person_email">И-мэйл хаяг</Label>
                        <Input
                          id="accountant_person_email"
                          type="email"
                          {...form.register('accountant_person_email')}
                          placeholder="accountant@company.mn"
                        />
                        {form.formState.errors.accountant_person_email && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.accountant_person_email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="accountant_person_phone">Утасны дугаар</Label>
                        <Input
                          id="accountant_person_phone"
                          {...form.register('accountant_person_phone')}
                          placeholder="99001234"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Хаяг ба Тайлбар */}
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="address">Хаяг</Label>
                        <Textarea
                          id="address"
                          {...form.register('address')}
                          placeholder="Байгууллагын хаяг"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Тайлбар</Label>
                        <Textarea
                          id="notes"
                          {...form.register('notes')}
                          placeholder="Нэмэлт тайлбар"
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
                  >
                    Болих
                  </Button>
                  <Button type="submit">
                    {editingOrg ? 'Шинэчлэх' : 'Хадгалах'}
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
                <TabsTrigger value="all">Бүгд</TabsTrigger>
                <TabsTrigger value="active">Хүчинтэй</TabsTrigger>
                <TabsTrigger value="inactive">Хүчингүй дууссан</TabsTrigger>
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
                  placeholder="Хайх..."
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
                {searchQuery ? 'Хайлтад тохирох байгууллага олдсонгүй' : 'Байгууллага бүртгэгдээгүй байна'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>№</TableHead>
                    <TableHead>Байгууллагын нэр</TableHead>
                    <TableHead className="text-center">Төрөл</TableHead>
                    <TableHead className="text-center">ААН-ын регистрийн №</TableHead>
                    <TableHead className="text-center">Хөнгөлөлт (%)</TableHead>
                    <TableHead className="text-center">Харилцах хүн</TableHead>
                    <TableHead className="text-center">Утасны дугаар</TableHead>
                    <TableHead className="text-center">И-мэйл хаяг</TableHead>
                    <TableHead className="text-center">Хүчинтэй хугацаа</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.map((org, index) => (
                    <TableRow key={org.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{org.organization_name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{org.organization_type}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{org.registration_number}</TableCell>
                      <TableCell className="text-center">{org.discount_percent}%</TableCell>
                      <TableCell className="text-center">{org.contact_person_name}</TableCell>
                      <TableCell className="text-center">{org.contact_person_phone}</TableCell>
                      <TableCell className="text-center">{org.contact_person_email}</TableCell>
                      <TableCell className="text-center">
                        {formatDate(org.validity_start)} - {formatDate(org.validity_end)}
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
