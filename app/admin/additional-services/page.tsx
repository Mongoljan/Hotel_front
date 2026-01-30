'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';
import { schemaServiceType, schemaService } from '@/app/schema';
import { 
  IconPlus, 
  IconSearch, 
  IconX, 
  IconEdit, 
  IconTrash,
  IconDotsVertical,
  IconLoader2,
  IconRefresh
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Types for the API data structure
interface ServiceType {
  id: number;
  name: string;
  created_at?: string;
}

interface Service {
  id: number;
  name: string;
  price: number | string;
  service_type: number;
  category?: string;
  is_countable: boolean;
  barcode?: string;
  created_at?: string;
}

export default function AdditionalServicesPage() {
  const { user } = useAuth();
  const t = useTranslations('AdditionalServices');
  
  // State for service types
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  
  // State for services
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
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
  const [serviceBarcode, setServiceBarcode] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');

  // Fetch service types and services from API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [typesRes, servicesRes] = await Promise.all([
        fetch('/api/service-types', { credentials: 'include' }),
        fetch('/api/services', { credentials: 'include' }),
      ]);

      if (!typesRes.ok) {
        const errorData = await typesRes.json().catch(() => ({}));
        console.error('Service types error:', typesRes.status, errorData);
        // If 401, show auth error, otherwise show generic error
        if (typesRes.status === 401) {
          toast.error('Дахин нэвтэрнэ үү');
        } else {
          toast.error(`Үйлчилгээний төрөл татахад алдаа: ${errorData.error || typesRes.status}`);
        }
        throw new Error(errorData.error || 'Failed to fetch service types');
      }
      if (!servicesRes.ok) {
        const errorData = await servicesRes.json().catch(() => ({}));
        console.error('Services error:', servicesRes.status, errorData);
        if (servicesRes.status === 401) {
          toast.error('Дахин нэвтэрнэ үү');
        } else {
          toast.error(`Үйлчилгээ татахад алдаа: ${errorData.error || servicesRes.status}`);
        }
        throw new Error(errorData.error || 'Failed to fetch services');
      }

      const typesData = await typesRes.json();
      const servicesData = await servicesRes.json();

      setServiceTypes(Array.isArray(typesData) ? typesData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('messages.error'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set initial selected type when types are loaded
  useEffect(() => {
    if (serviceTypes.length > 0 && selectedTypeId === null) {
      setSelectedTypeId(serviceTypes[0].id);
    }
  }, [serviceTypes, selectedTypeId]);

  // Filter services by selected type and search query
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesType = selectedTypeId === null || service.service_type === selectedTypeId;
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
    // Validate with Zod
    const validationResult = schemaServiceType.safeParse({ name: typeName });
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    setIsSaving(true);
    
    try {
      if (editingType) {
        // Update existing type
        const res = await fetch('/api/service-types', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: editingType.id, name: typeName })
        });

        if (!res.ok) throw new Error('Failed to update service type');

        setServiceTypes(prev => prev.map(t => 
          t.id === editingType.id ? { ...t, name: typeName } : t
        ));
        toast.success(t('messages.typeUpdated'));
      } else {
        // Create new type
        const res = await fetch('/api/service-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: typeName })
        });

        if (!res.ok) throw new Error('Failed to create service type');

        const newType = await res.json();
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
    try {
      const res = await fetch(`/api/service-types?id=${typeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to delete service type');

      setServiceTypes(prev => prev.filter(t => t.id !== typeId));
      // Also remove services under this type from local state
      setServices(prev => prev.filter(s => s.service_type !== typeId));
      
      if (selectedTypeId === typeId) {
        setSelectedTypeId(serviceTypes[0]?.id || null);
      }
      toast.success(t('messages.typeDeleted'));
    } catch (error) {
      console.error('Error deleting service type:', error);
      toast.error(t('messages.error'));
    }
  };

  // Service Modal handlers
  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceName(service.name);
      setServicePrice(typeof service.price === 'string' ? service.price : service.price.toString());
      setServiceCategoryId(service.service_type.toString());
      setServiceIsCountable(service.is_countable);
      setServiceBarcode(service.barcode || '');
      setServiceCategory(service.category || '');
    } else {
      setEditingService(null);
      setServiceName('');
      setServicePrice('');
      setServiceCategoryId(selectedTypeId?.toString() || '');
      setServiceIsCountable(false);
      setServiceBarcode('');
      setServiceCategory('');
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
    setServiceBarcode('');
    setServiceCategory('');
  };

  const handleSaveService = async () => {
    // Validate with Zod
    const validationResult = schemaService.safeParse({
      name: serviceName,
      price: servicePrice,
      service_type: serviceCategoryId,
      category: serviceCategory || undefined,
      is_countable: serviceIsCountable,
      barcode: serviceBarcode || undefined,
    });

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    setIsSaving(true);
    
    try {
      const serviceData = {
        service_type: parseInt(serviceCategoryId),
        name: serviceName,
        price: parseFloat(servicePrice) || 0,
        category: serviceCategory || undefined,
        is_countable: serviceIsCountable,
        barcode: serviceBarcode || undefined,
      };

      if (editingService) {
        // Update existing service
        const res = await fetch('/api/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: editingService.id, ...serviceData })
        });

        if (!res.ok) throw new Error('Failed to update service');

        const updatedService = await res.json();
        setServices(prev => prev.map(s => 
          s.id === editingService.id ? { ...s, ...updatedService } : s
        ));
        toast.success(t('messages.serviceUpdated'));
      } else {
        // Create new service
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(serviceData)
        });

        if (!res.ok) throw new Error('Failed to create service');

        const newService = await res.json();
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
    try {
      const res = await fetch(`/api/services?id=${serviceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to delete service');

      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.success(t('messages.serviceDeleted'));
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(t('messages.error'));
    }
  };

  // Format price with currency
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('mn-MN').format(numPrice) + '₮';
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('title')}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={isLoading}
        >
          <IconRefresh className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
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
              <h2 className="text-lg font-semibold text-foreground">{selectedTypeName || t('title')}</h2>
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => openServiceModal()}
                          disabled={serviceTypes.length === 0}
                        >
                          <IconPlus className="mr-2 h-4 w-4" />
                          {t('addService')}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {serviceTypes.length === 0 && (
                      <TooltipContent>
                        <p>{t('messages.createTypeFirst')}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
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
                <p className="text-sm">
                  {serviceTypes.length === 0 ? t('messages.createTypeFirst') : t('noServices')}
                </p>
                {serviceTypes.length > 0 && (
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => openServiceModal()}
                  >
                    {t('addNewService')}
                  </Button>
                )}
                {serviceTypes.length === 0 && (
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => openTypeModal()}
                  >
                    {t('addServiceType')}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Type Modal */}
      <Dialog open={isTypeModalOpen} onOpenChange={setIsTypeModalOpen}>
        <DialogContent className="sm:max-w-[400px]" preventOutsideClose hideCloseButton>
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
              variant="outline"
              onClick={() => setIsTypeModalOpen(false)}
              disabled={isSaving}
            >
              {t('actions.cancel')}
            </Button>
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
        <DialogContent className="sm:max-w-[450px]" preventOutsideClose hideCloseButton>
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
                type="text"
                placeholder="0"
                value={servicePrice ? Number(servicePrice.replace(/,/g, '')).toLocaleString('en-US') : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
                  setServicePrice(value);
                }}
              />
            </div>

            {/* Service Type (Category) */}
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

            {/* Countable - Yes/No Buttons */}
            <div className="space-y-2">
              <Label>{t('serviceModal.isCountable')}</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setServiceIsCountable(true)}
                  className={cn(
                    "px-6 py-2 rounded-md text-sm font-medium transition-all border",
                    serviceIsCountable
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {t('serviceModal.yes')}
                </button>
                <button
                  type="button"
                  onClick={() => setServiceIsCountable(false)}
                  className={cn(
                    "px-6 py-2 rounded-md text-sm font-medium transition-all border",
                    !serviceIsCountable
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {t('serviceModal.no')}
                </button>
              </div>
            </div>

            {/* Barcode / Product Code */}
            <div className="space-y-2">
              <Label>{t('serviceModal.productCode')}</Label>
              <Input
                placeholder=""
                value={serviceBarcode}
                onChange={(e) => setServiceBarcode(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsServiceModalOpen(false)}
              disabled={isSaving}
            >
              {t('actions.cancel')}
            </Button>
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
  formatPrice: (price: number | string) => string;
}

function ServiceCard({ service, onEdit, onDelete, formatPrice }: ServiceCardProps) {
  return (
    <div className="group relative flex items-start justify-between rounded-xl border border-border/60 bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground truncate">{service.name}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{formatPrice(service.price)}</p>
        {service.barcode && (
          <p className="text-xs text-muted-foreground mt-1">Code: {service.barcode}</p>
        )}
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
