'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { IconPencil, IconX, IconLoader2, IconInfoCircle, IconCoffee, IconCar, IconMoodKid, IconBed } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { schemaHotelSteps3 } from '@/app/schema';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { PropertyPolicy } from '@/app/admin/hotel/types';
import { NumericFormat } from 'react-number-format';

// Generate time options for dropdowns (00:00 to 23:00)
const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour} : 00` };
});

const API_URL = 'https://dev.kacc.mn/api/property-policies/';

// Use the same schema as the registration form
type PolicyFormFields = z.infer<typeof schemaHotelSteps3>;

// Helper to format time (HH:MM:SS -> HH:MM)
const formatTime = (time: string | undefined | null) => {
  if (!time) return '—';
  return time.slice(0, 5);
};

// Helper to format status
const formatStatus = (status: string | undefined | null) => {
  if (!status) return '—';
  switch (status) {
    case 'no': return 'Байхгүй';
    case 'free': return 'Үнэгүй';
    case 'paid': return 'Төлбөртэй';
    default: return status;
  }
};

// Helper to format fee type
const formatFeeType = (feeType: string | undefined | null) => {
  if (!feeType) return '';
  switch (feeType) {
    case 'hour': return 'цагаар';
    case 'day': return 'хоногоор';
    default: return feeType;
  }
};

// Helper to format breakfast type
const formatBreakfastType = (type: string | undefined | null) => {
  if (!type) return '';
  switch (type) {
    case 'buffet': return 'Buffet';
    case 'room': return 'Өрөөнд';
    case 'plate': return 'Тавгаар';
    default: return type;
  }
};

export default function InternalRulesPage() {
  const { user } = useAuth();
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editSection, setEditSection] = useState<'time' | 'breakfast' | 'parking' | 'children' | 'extrabed' | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<'time' | 'breakfast' | 'parking' | 'children' | 'extrabed'>('time');

  // React Hook Form with Zod validation
  const form = useForm<PolicyFormFields>({
    resolver: zodResolver(schemaHotelSteps3),
    defaultValues: {
      check_in_from: '',
      check_in_until: '',
      check_out_from: '',
      check_out_until: '',
      cancel_time: '',
      single_before_time_percentage: '',
      single_after_time_percentage: '',
      multi_5days_before_percentage: '',
      multi_3days_before_percentage: '',
      multi_2days_before_percentage: '',
      multi_1day_before_percentage: '',
      breakfast_status: 'no',
      breakfast_start_time: '',
      breakfast_end_time: '',
      breakfast_price: null,
      breakfast_type: undefined,
      outdoor_parking: 'no',
      outdoor_fee_type: null,
      outdoor_price: null,
      indoor_parking: 'no',
      indoor_fee_type: null,
      indoor_price: null,
      allow_children: false,
      max_child_age: undefined,
      child_bed_available: undefined,
      allow_extra_bed: false,
      extra_bed_price: null,
    },
  });

  const cancelTime = form.watch('cancel_time');
  const displayCancelTime = cancelTime ? cancelTime.slice(0, 5) : '';
  const breakfastStatus = form.watch('breakfast_status');
  const outdoorParking = form.watch('outdoor_parking');
  const indoorParking = form.watch('indoor_parking');
  const allowChildren = form.watch('allow_children');
  const allowExtraBed = form.watch('allow_extra_bed');

  // Fetch policy data
  useEffect(() => {
    const fetchPolicyData = async () => {
      if (!user?.hotel) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}?property=${user.hotel}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const policy = data[0];
          setPropertyPolicy(policy);

          // Populate form with existing data
          const normalizedValues: PolicyFormFields = {
            check_in_from: policy.check_in_from || '',
            check_in_until: policy.check_in_until || '',
            check_out_from: policy.check_out_from || '',
            check_out_until: policy.check_out_until || '',
            cancel_time: policy.cancellation_fee?.cancel_time || '',
            single_before_time_percentage: policy.cancellation_fee?.single_before_time_percentage || '',
            single_after_time_percentage: policy.cancellation_fee?.single_after_time_percentage || '',
            multi_5days_before_percentage: policy.cancellation_fee?.multi_5days_before_percentage || '',
            multi_3days_before_percentage: policy.cancellation_fee?.multi_3days_before_percentage || '',
            multi_2days_before_percentage: policy.cancellation_fee?.multi_2days_before_percentage || '',
            multi_1day_before_percentage: policy.cancellation_fee?.multi_1day_before_percentage || '',
            breakfast_status: policy.breakfast_policy?.status || 'no',
            breakfast_start_time: policy.breakfast_policy?.start_time || '',
            breakfast_end_time: policy.breakfast_policy?.end_time || '',
            breakfast_price: policy.breakfast_policy?.price || null,
            breakfast_type: policy.breakfast_policy?.breakfast_type || undefined,
            outdoor_parking: policy.parking_policy?.outdoor_parking || 'no',
            outdoor_fee_type: policy.parking_policy?.outdoor_fee_type || null,
            outdoor_price: policy.parking_policy?.outdoor_price || null,
            indoor_parking: policy.parking_policy?.indoor_parking || 'no',
            indoor_fee_type: policy.parking_policy?.indoor_fee_type || null,
            indoor_price: policy.parking_policy?.indoor_price || null,
            allow_children: policy.child_policy?.allow_children || false,
            max_child_age: policy.child_policy?.max_child_age || undefined,
            child_bed_available: policy.child_policy?.child_bed_available || undefined,
            allow_extra_bed: policy.child_policy?.allow_extra_bed || false,
            extra_bed_price: policy.child_policy?.extra_bed_price || null,
          };
          form.reset(normalizedValues);
        }
      } catch (error) {
        console.error('Error fetching policy data:', error);
        toast.error('Мэдээлэл ачаалахад алдаа гарлаа');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicyData();
  }, [user?.hotel, form]);

  // Initialize edit form when opening dialog
  const openEditDialog = (section: 'time' | 'breakfast' | 'parking' | 'children' | 'extrabed') => {
    setEditSection(section);
    setIsEditDialogOpen(true);
  };

  // Save policy changes with validation
  const onSubmit: SubmitHandler<PolicyFormFields> = async (data) => {
    if (!user?.hotel || !propertyPolicy) return;

    try {
      const stripSeconds = (time: string) => time ? time.slice(0, 5) : time;

      const formattedData = {
        property: user.hotel,
        check_in_from: stripSeconds(data.check_in_from),
        check_in_until: stripSeconds(data.check_in_until),
        check_out_from: stripSeconds(data.check_out_from),
        check_out_until: stripSeconds(data.check_out_until),
        
        cancellation_fee: {
          property: user.hotel,
          cancel_time: stripSeconds(data.cancel_time),
          single_before_time_percentage: data.single_before_time_percentage,
          single_after_time_percentage: data.single_after_time_percentage,
          multi_5days_before_percentage: data.multi_5days_before_percentage,
          multi_3days_before_percentage: data.multi_3days_before_percentage,
          multi_2days_before_percentage: data.multi_2days_before_percentage,
          multi_1day_before_percentage: data.multi_1day_before_percentage,
        },
        
        breakfast_policy: {
          status: data.breakfast_status,
          start_time: data.breakfast_status !== 'no' ? stripSeconds(data.breakfast_start_time || '') : null,
          end_time: data.breakfast_status !== 'no' ? stripSeconds(data.breakfast_end_time || '') : null,
          price: data.breakfast_status === 'paid' ? data.breakfast_price : null,
          breakfast_type: data.breakfast_status !== 'no' ? data.breakfast_type : null,
        },
        
        parking_policy: {
          outdoor_parking: data.outdoor_parking,
          outdoor_fee_type: data.outdoor_parking === 'paid' ? data.outdoor_fee_type : null,
          outdoor_price: data.outdoor_parking === 'paid' ? data.outdoor_price : null,
          indoor_parking: data.indoor_parking,
          indoor_fee_type: data.indoor_parking === 'paid' ? data.indoor_fee_type : null,
          indoor_price: data.indoor_parking === 'paid' ? data.indoor_price : null,
        },
        
        child_policy: {
          allow_children: data.allow_children,
          max_child_age: data.allow_children ? data.max_child_age : null,
          child_bed_available: data.allow_children ? data.child_bed_available : null,
          allow_extra_bed: data.allow_extra_bed || false,
          extra_bed_price: data.allow_extra_bed ? data.extra_bed_price : null,
        },
      };

      const response = await fetch(`${API_URL}${propertyPolicy.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) throw new Error('Failed to save policy');

      const result = await response.json();
      setPropertyPolicy(result);

      // Update form with new values
      const normalizedValues: PolicyFormFields = {
        check_in_from: result.check_in_from || '',
        check_in_until: result.check_in_until || '',
        check_out_from: result.check_out_from || '',
        check_out_until: result.check_out_until || '',
        cancel_time: result.cancellation_fee?.cancel_time || '',
        single_before_time_percentage: result.cancellation_fee?.single_before_time_percentage || '',
        single_after_time_percentage: result.cancellation_fee?.single_after_time_percentage || '',
        multi_5days_before_percentage: result.cancellation_fee?.multi_5days_before_percentage || '',
        multi_3days_before_percentage: result.cancellation_fee?.multi_3days_before_percentage || '',
        multi_2days_before_percentage: result.cancellation_fee?.multi_2days_before_percentage || '',
        multi_1day_before_percentage: result.cancellation_fee?.multi_1day_before_percentage || '',
        breakfast_status: result.breakfast_policy?.status || 'no',
        breakfast_start_time: result.breakfast_policy?.start_time || '',
        breakfast_end_time: result.breakfast_policy?.end_time || '',
        breakfast_price: result.breakfast_policy?.price || null,
        breakfast_type: result.breakfast_policy?.breakfast_type || undefined,
        outdoor_parking: result.parking_policy?.outdoor_parking || 'no',
        outdoor_fee_type: result.parking_policy?.outdoor_fee_type || null,
        outdoor_price: result.parking_policy?.outdoor_price || null,
        indoor_parking: result.parking_policy?.indoor_parking || 'no',
        indoor_fee_type: result.parking_policy?.indoor_fee_type || null,
        indoor_price: result.parking_policy?.indoor_price || null,
        allow_children: result.child_policy?.allow_children || false,
        max_child_age: result.child_policy?.max_child_age || undefined,
        child_bed_available: result.child_policy?.child_bed_available || undefined,
        allow_extra_bed: result.child_policy?.allow_extra_bed || false,
        extra_bed_price: result.child_policy?.extra_bed_price || null,
      };
      form.reset(normalizedValues);

      setIsEditDialogOpen(false);
      toast.success('Мэдээлэл амжилттай хадгалагдлаа');
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error('Хадгалахад алдаа гарлаа');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Дотоод журам</h1>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Left sidebar - Menu navigation */}
        <Card className="h-fit">
          <CardContent className="p-4">
            <div className="space-y-1 text-sm">
              <p
                className={cn(
                  "py-2 px-3 rounded-md cursor-pointer transition-colors",
                  activeMenuItem === 'time'
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setActiveMenuItem('time')}
              >
                Цаг ба цуцлалтын бодлого
              </p>
              <p
                className={cn(
                  "py-2 px-3 rounded-md cursor-pointer transition-colors",
                  activeMenuItem === 'breakfast'
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setActiveMenuItem('breakfast')}
              >
                Өглөөний цай
              </p>
              <p
                className={cn(
                  "py-2 px-3 rounded-md cursor-pointer transition-colors",
                  activeMenuItem === 'parking'
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setActiveMenuItem('parking')}
              >
                Зогсоол
              </p>
              <p
                className={cn(
                  "py-2 px-3 rounded-md cursor-pointer transition-colors",
                  activeMenuItem === 'children'
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setActiveMenuItem('children')}
              >
                Хүүхдийн бодлого
              </p>
              <p
                className={cn(
                  "py-2 px-3 rounded-md cursor-pointer transition-colors",
                  activeMenuItem === 'extrabed'
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setActiveMenuItem('extrabed')}
              >
                Нэмэлт ор
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right content area */}
        <Card>
          <CardContent className="p-6">
            {propertyPolicy ? (
              <div className="space-y-6">
                {/* Time & Cancellation Section */}
                {activeMenuItem === 'time' && (
                  <>
                    {/* Check-in / Check-out times */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Орох / Гарах цаг</h3>
                          <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog('time')}
                        >
                          <IconPencil className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-lg font-medium">
                            {formatTime(propertyPolicy.check_in_from)} - {formatTime(propertyPolicy.check_in_until)}
                          </p>
                          <p className="text-sm text-muted-foreground">Орох цаг</p>
                        </div>
                        <div>
                          <p className="text-lg font-medium">
                            {formatTime(propertyPolicy.check_out_from)} - {formatTime(propertyPolicy.check_out_until)}
                          </p>
                          <p className="text-sm text-muted-foreground">Гарах цаг</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Cancellation Policy */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Цуцлалтын бодлого</h3>
                          <IconX className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Single room policy */}
                        <div>
                          <p className="text-sm font-medium mb-3">
                            1 өрөөний захиалгад нийт төлбөрөөс суутгах хураамжийн хувь:
                          </p>
                          <div className="space-y-2 pl-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                • Өмнөх өдрийн {formatTime(propertyPolicy.cancellation_fee?.cancel_time)} цагаас өмнө:
                              </span>
                              <span className="font-medium">{propertyPolicy.cancellation_fee?.single_before_time_percentage || 0} %</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                • Өмнөх өдрийн {formatTime(propertyPolicy.cancellation_fee?.cancel_time)} цагаас хойш:
                              </span>
                              <span className="font-medium">{propertyPolicy.cancellation_fee?.single_after_time_percentage || 0} %</span>
                            </div>
                          </div>
                        </div>

                        {/* Multi room policy */}
                        <div>
                          <p className="text-sm font-medium mb-3">
                            2 болон түүнээс дээш өрөөнд нийт төлбөрөөс суутгах хураамжийн хувь:
                          </p>
                          <div className="space-y-2 pl-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">• Ирэх өдрөөсөө 5 хоногийн өмнө цуцалвал:</span>
                              <span className="font-medium">{propertyPolicy.cancellation_fee?.multi_5days_before_percentage || 0} %</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">• Ирэх өдрөөсөө 3 хоногийн өмнө цуцалвал:</span>
                              <span className="font-medium">{propertyPolicy.cancellation_fee?.multi_3days_before_percentage || 0} %</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">• Ирэх өдрөөсөө 2 хоногийн өмнө цуцалвал:</span>
                              <span className="font-medium">{propertyPolicy.cancellation_fee?.multi_2days_before_percentage || 0} %</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">• Ирэх өдрөөсөө 1 хоногийн өмнө цуцалвал:</span>
                              <span className="font-medium">{propertyPolicy.cancellation_fee?.multi_1day_before_percentage || 0} %</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Breakfast Section */}
                {activeMenuItem === 'breakfast' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <IconCoffee className="h-5 w-5" />
                        <h3 className="font-semibold">Өглөөний цай</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog('breakfast')}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Төлөв</p>
                          <p className="font-medium">{formatStatus(propertyPolicy.breakfast_policy?.status)}</p>
                        </div>
                        {propertyPolicy.breakfast_policy?.status !== 'no' && (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">Цаг</p>
                              <p className="font-medium">
                                {formatTime(propertyPolicy.breakfast_policy?.start_time)} - {formatTime(propertyPolicy.breakfast_policy?.end_time)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Төрөл</p>
                              <p className="font-medium">{formatBreakfastType(propertyPolicy.breakfast_policy?.breakfast_type)}</p>
                            </div>
                            {propertyPolicy.breakfast_policy?.status === 'paid' && (
                              <div>
                                <p className="text-sm text-muted-foreground">Үнэ</p>
                                <p className="font-medium">{propertyPolicy.breakfast_policy?.price} ₮</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Parking Section */}
                {activeMenuItem === 'parking' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <IconCar className="h-5 w-5" />
                        <h3 className="font-semibold">Зогсоолын мэдээлэл</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog('parking')}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Outdoor Parking */}
                      <div>
                        <p className="text-sm font-medium mb-2">Гадна зогсоол</p>
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Төлөв</p>
                            <p className="font-medium">{formatStatus(propertyPolicy.parking_policy?.outdoor_parking)}</p>
                          </div>
                          {propertyPolicy.parking_policy?.outdoor_parking === 'paid' && (
                            <div>
                              <p className="text-sm text-muted-foreground">Үнэ</p>
                              <p className="font-medium">
                                {propertyPolicy.parking_policy?.outdoor_price} ₮ / {formatFeeType(propertyPolicy.parking_policy?.outdoor_fee_type)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Indoor Parking */}
                      <div>
                        <p className="text-sm font-medium mb-2">Дотор зогсоол</p>
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Төлөв</p>
                            <p className="font-medium">{formatStatus(propertyPolicy.parking_policy?.indoor_parking)}</p>
                          </div>
                          {propertyPolicy.parking_policy?.indoor_parking === 'paid' && (
                            <div>
                              <p className="text-sm text-muted-foreground">Үнэ</p>
                              <p className="font-medium">
                                {propertyPolicy.parking_policy?.indoor_price} ₮ / {formatFeeType(propertyPolicy.parking_policy?.indoor_fee_type)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Children Section */}
                {activeMenuItem === 'children' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <IconMoodKid className="h-5 w-5" />
                        <h3 className="font-semibold">Хүүхдийн бодлого</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog('children')}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Зочин хүүхдийн хамт үйлчлүүлэх боломжтой эсэх</p>
                          <p className="font-medium">{propertyPolicy.child_policy?.allow_children ? 'Тийм' : 'Үгүй'}</p>
                        </div>
                        {propertyPolicy.child_policy?.allow_children && (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">Хүүхдийн насны хязгаар</p>
                              <p className="font-medium">{propertyPolicy.child_policy?.max_child_age ? `${propertyPolicy.child_policy.max_child_age} хүртэлх` : '—'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Хүүхдийн ор байгаа эсэх</p>
                              <p className="font-medium">{propertyPolicy.child_policy?.child_bed_available === 'yes' ? 'Байгаа' : 'Байхгүй'}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Extra Bed Section */}
                {activeMenuItem === 'extrabed' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <IconBed className="h-5 w-5" />
                        <h3 className="font-semibold">Нэмэлт ор</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog('extrabed')}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Зочдод нэмэлт ороор үйлчлэх боломжтой юу?</p>
                          <p className="font-medium">{propertyPolicy.child_policy?.allow_extra_bed ? 'Тийм' : 'Үгүй'}</p>
                        </div>
                        {propertyPolicy.child_policy?.allow_extra_bed && (
                          <div>
                            <p className="text-sm text-muted-foreground">Нэмэлт орны үнэ</p>
                            <p className="font-medium">{Number(propertyPolicy.child_policy?.extra_bed_price || 0).toLocaleString()} ₮</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Дотоод журмын мэдээлэл олдсонгүй</p>
                <p className="text-sm text-muted-foreground mt-1">Буудлын бүртгэлийн 4-р алхмыг дуусгана уу</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editSection === 'time' && 'Цаг, цуцлалтын бодлого'}
              {editSection === 'breakfast' && 'Өглөөний цай'}
              {editSection === 'parking' && 'Зогсоол'}
              {editSection === 'children' && 'Хүүхдийн бодлого'}
              {editSection === 'extrabed' && 'Нэмэлт ор'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              {/* Time & Cancellation Edit */}
              {editSection === 'time' && (
                <>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Та өөрийн буудлын дотоод журмын дагуу өрөөнд орох болон гарах цагийг тохируулна уу.</p>
                    
                    <div className="flex items-center gap-4">
                      <FormLabel className="min-w-[140px]">Орох цаг / Check-in :</FormLabel>
                      <FormField
                        control={form.control}
                        name="check_in_from"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value?.slice(0, 5) || ''}>
                              <FormControl>
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="00:00" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <span>-</span>
                      <FormField
                        control={form.control}
                        name="check_in_until"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value?.slice(0, 5) || ''}>
                              <FormControl>
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="00:00" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <FormLabel className="min-w-[140px]">Гарах цаг / Check-out :</FormLabel>
                      <FormField
                        control={form.control}
                        name="check_out_from"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value?.slice(0, 5) || ''}>
                              <FormControl>
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="00:00" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <span>-</span>
                      <FormField
                        control={form.control}
                        name="check_out_until"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value?.slice(0, 5) || ''}>
                              <FormControl>
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="00:00" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Цуцлалтын бодлого</h4>

                    <div className="flex items-center gap-4">
                      <FormLabel className="min-w-[140px]">Цуцлах боломжтой цаг:</FormLabel>
                      <FormField
                        control={form.control}
                        name="cancel_time"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value?.slice(0, 5) || ''}>
                              <FormControl>
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="00:00" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium">1 өрөөний захиалгад нийт төлбөрөөс суутгах хураамжийн хувь:</p>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="single_before_time_percentage"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm">• Өмнөх өдрийн {displayCancelTime || '12:00'} цагаас өмнө цуцалвал:</span>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <Input type="number" placeholder="0" {...field} className="w-20 text-right" />
                                  </FormControl>
                                  <span className="text-sm text-muted-foreground">%</span>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="single_after_time_percentage"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm">• Өмнөх өдрийн {displayCancelTime || '12:00'} цагаас хойш цуцалвал:</span>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <Input type="number" placeholder="0" {...field} className="w-20 text-right" />
                                  </FormControl>
                                  <span className="text-sm text-muted-foreground">%</span>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium">2 болон түүнээс дээш өрөөнд нийт төлбөрөөс суутгах хураамжийн хувь:</p>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="multi_5days_before_percentage"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm">• Ирэх өдрөөсөө <strong>5</strong> хоногийн өмнө цуцалвал:</span>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <Input type="number" placeholder="0" {...field} className="w-20 text-right" />
                                  </FormControl>
                                  <span className="text-sm text-muted-foreground">%</span>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="multi_3days_before_percentage"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm">• Ирэх өдрөөсөө <strong>3</strong> хоногийн өмнө цуцалвал:</span>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <Input type="number" placeholder="0" {...field} className="w-20 text-right" />
                                  </FormControl>
                                  <span className="text-sm text-muted-foreground">%</span>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="multi_1day_before_percentage"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm">• Ирэх өдрөөсөө <strong>1</strong> хоногийн өмнө цуцалвал:</span>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <Input type="number" placeholder="0" {...field} className="w-20 text-right" />
                                  </FormControl>
                                  <span className="text-sm text-muted-foreground">%</span>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Breakfast Edit */}
              {editSection === 'breakfast' && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="breakfast_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Өглөөний цай байгаа эсэх</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => field.onChange('no')}
                              className={cn(
                                "px-6 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === 'no'
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              Байхгүй
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange('free')}
                              className={cn(
                                "px-6 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === 'free'
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              Байгаа, үнэд багтсан
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange('paid')}
                              className={cn(
                                "px-6 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === 'paid'
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              Байгаа, төлбөртэй
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {breakfastStatus !== 'no' && (
                    <>
                      <div className="space-y-2">
                        <FormLabel>Өглөөний цайны цаг</FormLabel>
                        <div className="flex items-center gap-4">
                          <FormField
                            control={form.control}
                            name="breakfast_start_time"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} value={field.value?.slice(0, 5) || ''}>
                                  <FormControl>
                                    <SelectTrigger className="w-[100px]">
                                      <SelectValue placeholder="00:00" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <span>-</span>
                          <FormField
                            control={form.control}
                            name="breakfast_end_time"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} value={field.value?.slice(0, 5) || ''}>
                                  <FormControl>
                                    <SelectTrigger className="w-[100px]">
                                      <SelectValue placeholder="00:00" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {breakfastStatus === 'paid' && (
                        <FormField
                          control={form.control}
                          name="breakfast_price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Өглөөний цайны үнэ</FormLabel>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <NumericFormat
                                    thousandSeparator=","
                                    placeholder="0"
                                    value={field.value || ''}
                                    onValueChange={(values) => field.onChange(values.value || null)}
                                    customInput={Input}
                                    className="w-48"
                                  />
                                </FormControl>
                                <span className="text-sm text-muted-foreground">₮</span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="breakfast_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Өглөөний цайны төрөл</FormLabel>
                            <FormControl>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => field.onChange('buffet')}
                                  className={cn(
                                    "px-6 py-2 rounded-md text-sm font-medium transition-all border",
                                    field.value === 'buffet'
                                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                  )}
                                >
                                  Буффет
                                </button>
                                <button
                                  type="button"
                                  onClick={() => field.onChange('room')}
                                  className={cn(
                                    "px-6 py-2 rounded-md text-sm font-medium transition-all border",
                                    field.value === 'room'
                                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                  )}
                                >
                                  Өрөөнд
                                </button>
                                <button
                                  type="button"
                                  onClick={() => field.onChange('plate')}
                                  className={cn(
                                    "px-6 py-2 rounded-md text-sm font-medium transition-all border",
                                    field.value === 'plate'
                                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                  )}
                                >
                                  Тавгаар
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Parking Edit */}
              {editSection === 'parking' && (
                <div className="space-y-6">
                  {/* Outdoor */}
                  <div className="space-y-4">
                    <FormLabel>Гадна зогсоол байгаа эсэх</FormLabel>
                    <FormField
                      control={form.control}
                      name="outdoor_parking"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-3">
                              {(['no', 'free', 'paid'] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => field.onChange(value)}
                                  className={cn(
                                    "px-6 py-2 rounded-md text-sm font-medium transition-all border",
                                    field.value === value
                                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                  )}
                                >
                                  {value === 'no' ? 'Байхгүй' : value === 'free' ? 'Үнэгүй' : 'Төлбөртэй'}
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {outdoorParking === 'paid' && (
                      <div className="space-y-2">
                        <FormLabel>Гадна зогсоолын төлбөр</FormLabel>
                        <div className="flex items-center gap-4">
                          <FormField
                            control={form.control}
                            name="outdoor_fee_type"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                  <FormControl>
                                    <SelectTrigger className="w-[100px]">
                                      <SelectValue placeholder="Сонгох" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="hour">Цагийн</SelectItem>
                                    <SelectItem value="day">Хоногийн</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="outdoor_price"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <NumericFormat
                                      thousandSeparator=","
                                      placeholder="0"
                                      value={field.value || ''}
                                      onValueChange={(values) => field.onChange(values.value || null)}
                                      customInput={Input}
                                      className="w-24"
                                    />
                                  </FormControl>
                                  <span className="text-sm text-muted-foreground">₮</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <FormLabel>Дотор зогсоол байгаа эсэх</FormLabel>
                    <FormField
                      control={form.control}
                      name="indoor_parking"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-3">
                              {(['no', 'free', 'paid'] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => field.onChange(value)}
                                  className={cn(
                                    "px-6 py-2 rounded-md text-sm font-medium transition-all border",
                                    field.value === value
                                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                  )}
                                >
                                  {value === 'no' ? 'Байхгүй' : value === 'free' ? 'Үнэгүй' : 'Төлбөртэй'}
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {indoorParking === 'paid' && (
                      <div className="space-y-2">
                        <FormLabel>Дотор зогсоолын төлбөр</FormLabel>
                        <div className="flex items-center gap-4">
                          <FormField
                            control={form.control}
                            name="indoor_fee_type"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                  <FormControl>
                                    <SelectTrigger className="w-[100px]">
                                      <SelectValue placeholder="Сонгох" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="hour">Цагийн</SelectItem>
                                    <SelectItem value="day">Хоногийн</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="indoor_price"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <NumericFormat
                                      thousandSeparator=","
                                      placeholder="0"
                                      value={field.value || ''}
                                      onValueChange={(values) => field.onChange(values.value || null)}
                                      customInput={Input}
                                      className="w-24"
                                    />
                                  </FormControl>
                                  <span className="text-sm text-muted-foreground">₮</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Children Edit */}
              {editSection === 'children' && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="allow_children"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Зочин хүүхдийн хамт үйлчлүүлэх боломжтой эсэх</FormLabel>
                        <FormControl>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => field.onChange(true)}
                              className={cn(
                                "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === true
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              Тийм
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange(false)}
                              className={cn(
                                "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === false
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              Үгүй
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {allowChildren && (
                    <>
                      <FormField
                        control={form.control}
                        name="max_child_age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Хүүхдийн насны хязгаар</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(Number(value))} 
                              value={field.value?.toString() || ''}
                            >
                              <FormControl>
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Сонгоно уу" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 18 }, (_, i) => i + 1).map((age) => (
                                  <SelectItem key={age} value={age.toString()}>
                                    {age} хүртэлх
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="child_bed_available"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Хүүхдийн ор байгаа эсэх</FormLabel>
                            <FormControl>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => field.onChange('no')}
                                  className={cn(
                                    "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                    field.value === 'no'
                                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                  )}
                                >
                                  Байхгүй
                                </button>
                                <button
                                  type="button"
                                  onClick={() => field.onChange('yes')}
                                  className={cn(
                                    "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                    field.value === 'yes'
                                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                  )}
                                >
                                  Байгаа
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Extra Bed Edit */}
              {editSection === 'extrabed' && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="allow_extra_bed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Зочдод нэмэлт ороор үйлчлэх боломжтой юу?</FormLabel>
                        <FormControl>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => field.onChange(true)}
                              className={cn(
                                "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === true
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              Тийм
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange(false)}
                              className={cn(
                                "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === false
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              Үгүй
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {allowExtraBed && (
                    <FormField
                      control={form.control}
                      name="extra_bed_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Нэмэлт орны үнэ</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <NumericFormat
                                thousandSeparator=","
                                placeholder="0"
                                value={field.value || ''}
                                onValueChange={(values) => field.onChange(values.value || null)}
                                customInput={Input}
                                className="w-32"
                              />
                            </FormControl>
                            <span className="text-sm text-muted-foreground">₮</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Болих
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Хадгалж байна...
                    </>
                  ) : (
                    'Хадгалах'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
