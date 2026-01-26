'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { 
  IconPlus, 
  IconSearch, 
  IconX, 
  IconEdit, 
  IconTrash,
  IconDotsVertical,
  IconLoader2
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Types for the API data structure
interface ServiceType {
  id: number;
  name: string;
  property?: number;
}

interface Service {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category_name?: string;
  is_countable: boolean;
  quantity?: number;
  product_code?: string;
}

// Mock data for development - will be replaced by API
const mockServiceTypes: ServiceType[] = [
  { id: 1, name: 'Ресторан' },
  { id: 2, name: 'Цэвэрлэгээ' },
  { id: 3, name: 'Бусад' },
];

const mockServices: Service[] = [
  { id: 1, name: 'Өглөөний цай', price: 15000, category_id: 1, is_countable: false },
  { id: 2, name: 'Өглөөний цай', price: 15000, category_id: 1, is_countable: false },
  { id: 3, name: 'Өглөөний цай', price: 15000, category_id: 1, is_countable: true, quantity: 5 },
  { id: 4, name: 'Өглөөний цай', price: 15000, category_id: 1, is_countable: false },
  { id: 5, name: 'Өглөөний цай', price: 15000, category_id: 1, is_countable: false },
  { id: 6, name: 'Өглөөний цай', price: 15000, category_id: 1, is_countable: false },
];

export default function AdditionalServicesPage() {
  const { user } = useAuth();
  const t = useTranslations('AdditionalServices');
  
  // State for service types
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(mockServiceTypes);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  
  // State for services
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ServiceType | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Form states for service type modal
  const [typeName, setTypeName] = useState('');
  
  // Form states for service modal
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceCategoryId, setServiceCategoryId] = useState<string>('');
  const [serviceIsCountable, setServiceIsCountable] = useState(false);
  const [serviceQuantity, setServiceQuantity] = useState('');
  const [serviceProductCode, setServiceProductCode] = useState('');

  // Set initial selected type
  useEffect(() => {
    if (serviceTypes.length > 0 && selectedTypeId === null) {
      setSelectedTypeId(serviceTypes[0].id);
    }
  }, [serviceTypes, selectedTypeId]);

  // Filter services by selected type and search query
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesType = selectedTypeId === null || service.category_id === selectedTypeId;
      const matchesSearch = searchQuery === '' || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [services, selectedTypeId, searchQuery]);

  // Get selected type name
  const selectedTypeName = useMemo(() => {
    const type = serviceTypes.find(t => t.id === selectedTypeId);
    return type?.name || '';
  }, [serviceTypes, selectedTypeId]);

  // Service Type Modal handlers
  const openTypeModal = (type?: ServiceType) => {
    if (type) {
      setEditingType(type);
      setTypeName(type.name);
    } else {
      setEditingType(null);
      setTypeName('');
    }
    setIsTypeModalOpen(true);
  };

  const closeTypeModal = () => {
    setIsTypeModalOpen(false);
    setEditingType(null);
    setTypeName('');
  };

  const handleSaveType = async () => {
    if (!typeName.trim()) {
      toast.error(t('messages.typeNameRequired'));
      return;
    }

    setIsSaving(true);
    
    try {
      // TODO: Replace with actual API call
      // const res = await fetch('/api/service-types', {
      //   method: editingType ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ id: editingType?.id, name: typeName, property: user?.hotel })
      // });

      if (editingType) {
        // Update existing type
        setServiceTypes(prev => prev.map(t => 
          t.id === editingType.id ? { ...t, name: typeName } : t
        ));
        toast.success(t('messages.typeUpdated'));
      } else {
        // Create new type
        const newType: ServiceType = {
          id: Date.now(), // Temporary ID for mock
          name: typeName,
          property: user?.hotel ? parseInt(user.hotel) : undefined,
        };
        setServiceTypes(prev => [...prev, newType]);
        toast.success(t('messages.typeCreated'));
      }
      
      closeTypeModal();
    } catch (error) {
      console.error('Error saving service type:', error);
      toast.error(t('messages.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteType = async (typeId: number) => {
    // TODO: Replace with actual API call
    setServiceTypes(prev => prev.filter(t => t.id !== typeId));
    // Also remove services under this type
    setServices(prev => prev.filter(s => s.category_id !== typeId));
    
    if (selectedTypeId === typeId) {
      setSelectedTypeId(serviceTypes[0]?.id || null);
    }
    toast.success(t('messages.typeDeleted'));
  };

  // Service Modal handlers
  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceName(service.name);
      setServicePrice(service.price.toString());
      setServiceCategoryId(service.category_id.toString());
      setServiceIsCountable(service.is_countable);
      setServiceQuantity(service.quantity?.toString() || '');
      setServiceProductCode(service.product_code || '');
    } else {
      setEditingService(null);
      setServiceName('');
      setServicePrice('');
      setServiceCategoryId(selectedTypeId?.toString() || '');
      setServiceIsCountable(false);
      setServiceQuantity('');
      setServiceProductCode('');
    }
    setIsServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsServiceModalOpen(false);
    setEditingService(null);
    setServiceName('');
    setServicePrice('');
    setServiceCategoryId('');
    setServiceIsCountable(false);
    setServiceQuantity('');
    setServiceProductCode('');
  };

  const handleSaveService = async () => {
    if (!serviceName.trim()) {
      toast.error(t('messages.serviceNameRequired'));
      return;
    }

    setIsSaving(true);
    
    try {
      // TODO: Replace with actual API call
      const serviceData = {
        name: serviceName,
        price: parseFloat(servicePrice) || 0,
        category_id: parseInt(serviceCategoryId),
        is_countable: serviceIsCountable,
        quantity: serviceIsCountable ? parseInt(serviceQuantity) || undefined : undefined,
        product_code: serviceProductCode || undefined,
      };

      if (editingService) {
        // Update existing service
        setServices(prev => prev.map(s => 
          s.id === editingService.id ? { ...s, ...serviceData } : s
        ));
        toast.success(t('messages.serviceUpdated'));
      } else {
        // Create new service
        const newService: Service = {
          id: Date.now(), // Temporary ID for mock
          ...serviceData,
        };
        setServices(prev => [...prev, newService]);
        toast.success(t('messages.serviceCreated'));
      }
      
      closeServiceModal();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(t('messages.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    // TODO: Replace with actual API call
    setServices(prev => prev.filter(s => s.id !== serviceId));
    toast.success(t('messages.serviceDeleted'));
  };

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('mn-MN').format(price) + '₮';
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Left Panel - Service Types */}
        <Card className="w-[280px] shrink-0">
          <CardContent className="p-4">
            {/* Add Type Button */}
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-dashed border-primary text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => openTypeModal()}
            >
              <IconPlus className="h-4 w-4" />
              {t('addServiceType')}
            </Button>

            {/* Type List */}
            <div className="mt-4 flex flex-col gap-1">
              {serviceTypes.map((type) => (
                <div
                  key={type.id}
                  className={cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-colors',
                    selectedTypeId === type.id
                      ? 'bg-muted text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/50'
                  )}
                  onClick={() => setSelectedTypeId(type.id)}
                >
                  <span className="text-sm">{type.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openTypeModal(type)}>
                        <IconEdit className="h-4 w-4 mr-2" />
                        {t('actions.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteType(type.id)}
                      >
                        <IconTrash className="h-4 w-4 mr-2" />
                        {t('actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Services */}
        <Card className="flex-1">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">{selectedTypeName}</h2>
              <div className="flex items-center gap-3">
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => openServiceModal()}
                >
                  <IconPlus className="mr-2 h-4 w-4" />
                  {t('addService')}
                </Button>
                {/* Search */}
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={() => openServiceModal(service)}
                    onDelete={() => handleDeleteService(service.id)}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-sm">{t('noServices')}</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => openServiceModal()}
                >
                  {t('addNewService')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Type Modal */}
      <Dialog open={isTypeModalOpen} onOpenChange={setIsTypeModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingType ? t('serviceTypeModal.editTitle') : t('serviceTypeModal.title')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder={t('serviceTypeModal.placeholder')}
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={handleSaveType}
              disabled={isSaving || !typeName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving && <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Modal */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {editingService ? `${selectedTypeName} ${t('actions.edit').toLowerCase()}` : selectedTypeName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* Service Name */}
            <div className="space-y-2">
              <Label>
                {t('serviceModal.serviceName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder={t('serviceModal.serviceNamePlaceholder')}
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>{t('serviceModal.price')}</Label>
              <Input
                type="number"
                placeholder=""
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>{t('serviceModal.category')}</Label>
              <Select
                value={serviceCategoryId}
                onValueChange={setServiceCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('serviceModal.categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Countable Checkbox */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="countable"
                  checked={serviceIsCountable}
                  onCheckedChange={(checked) => setServiceIsCountable(checked === true)}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <Label htmlFor="countable" className="cursor-pointer">
                  {t('serviceModal.isCountable')}
                </Label>
              </div>
              
              {/* Quantity Field - shown when countable is checked */}
              {serviceIsCountable && (
                <Input
                  type="number"
                  placeholder={t('serviceModal.quantity')}
                  value={serviceQuantity}
                  onChange={(e) => setServiceQuantity(e.target.value)}
                />
              )}
            </div>

            {/* Product Code */}
            <div className="space-y-2">
              <Label>{t('serviceModal.productCode')}</Label>
              <Input
                placeholder=""
                value={serviceProductCode}
                onChange={(e) => setServiceProductCode(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSaveService}
              disabled={isSaving || !serviceName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving && <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Service Card Component
interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
  formatPrice: (price: number) => string;
}

function ServiceCard({ service, onEdit, onDelete, formatPrice }: ServiceCardProps) {
  return (
    <div className="group relative flex items-start justify-between rounded-xl border border-border/60 bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground truncate">{service.name}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{formatPrice(service.price)}</p>
      </div>
      
      <div className="flex items-center gap-1 ml-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onEdit}
        >
          <IconEdit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <IconX className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
