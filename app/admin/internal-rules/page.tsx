'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { IconPencil, IconX, IconLoader2, IconInfoCircle } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { schemaHotelSteps3 } from '@/app/schema';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const API_URL = 'https://dev.kacc.mn/api/property-policies/';

// Use the same schema as the registration form
type PolicyFormFields = z.infer<typeof schemaHotelSteps3>;

interface PropertyPolicy {
  id: number;
  check_in_from: string;
  check_in_until: string;
  check_out_from: string;
  check_out_until: string;
  breakfast_policy: string;
  parking_situation: string;
  allow_children: boolean;
  allow_pets: boolean;
  cancellation_fee: {
    cancel_time: string;
    single_before_time_percentage: string;
    single_after_time_percentage: string;
    multi_5days_before_percentage: string;
    multi_3days_before_percentage: string;
    multi_2days_before_percentage: string;
    multi_1day_before_percentage: string;
  };
}

// Helper to format time (HH:MM:SS -> HH:MM)
const formatTime = (time: string | undefined) => {
  if (!time) return '—';
  return time.slice(0, 5);
};

export default function InternalRulesPage() {
  const { user } = useAuth();
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editSection, setEditSection] = useState<'time' | 'cancellation' | 'children' | 'other' | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<'time' | 'breakfast' | 'parking' | 'children' | 'other'>('time');

  // React Hook Form with Zod validation
  const form = useForm<PolicyFormFields>({
    resolver: zodResolver(schemaHotelSteps3),
    defaultValues: {
      cancel_time: '',
      single_before_time_percentage: '',
      single_after_time_percentage: '',
      multi_5days_before_percentage: '',
      multi_3days_before_percentage: '',
      multi_2days_before_percentage: '',
      multi_1day_before_percentage: '',
      check_in_from: '',
      check_in_until: '',
      check_out_from: '',
      check_out_until: '',
      breakfast_policy: 'no' as const,
      parking_situation: 'no' as const,
      allow_children: false,
      allow_pets: false,
    },
  });

  const cancelTime = form.watch('cancel_time');
  const displayCancelTime = cancelTime ? cancelTime.slice(0, 5) : '';

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
          const normalizedValues = {
            cancel_time: policy.cancellation_fee?.cancel_time || '',
            single_before_time_percentage: policy.cancellation_fee?.single_before_time_percentage || '',
            single_after_time_percentage: policy.cancellation_fee?.single_after_time_percentage || '',
            multi_5days_before_percentage: policy.cancellation_fee?.multi_5days_before_percentage || '',
            multi_3days_before_percentage: policy.cancellation_fee?.multi_3days_before_percentage || '',
            multi_2days_before_percentage: policy.cancellation_fee?.multi_2days_before_percentage || '',
            multi_1day_before_percentage: policy.cancellation_fee?.multi_1day_before_percentage || '',
            check_in_from: policy.check_in_from || '',
            check_in_until: policy.check_in_until || '',
            check_out_from: policy.check_out_from || '',
            check_out_until: policy.check_out_until || '',
            breakfast_policy: (policy.breakfast_policy as 'no' | 'free' | 'paid') || 'no',
            parking_situation: (policy.parking_situation as 'no' | 'free' | 'paid') || 'no',
            allow_children: policy.allow_children || false,
            allow_pets: policy.allow_pets || false,
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
  const openEditDialog = (section: 'time' | 'cancellation' | 'children' | 'other') => {
    setEditSection(section);
    setIsEditDialogOpen(true);
  };

  // Save policy changes with validation
  const onSubmit: SubmitHandler<PolicyFormFields> = async (data) => {
    if (!user?.hotel || !propertyPolicy) return;

    try {
      // Helper function to strip seconds from time
      const stripSeconds = (time: string) => time ? time.slice(0, 5) : time;

      const formattedData = {
        cancellation_fee: {
          cancel_time: stripSeconds(data.cancel_time),
          single_before_time_percentage: data.single_before_time_percentage,
          single_after_time_percentage: data.single_after_time_percentage,
          multi_5days_before_percentage: data.multi_5days_before_percentage,
          multi_3days_before_percentage: data.multi_3days_before_percentage,
          multi_2days_before_percentage: data.multi_2days_before_percentage,
          multi_1day_before_percentage: data.multi_1day_before_percentage,
          property: user.hotel,
        },
        check_in_from: stripSeconds(data.check_in_from),
        check_in_until: stripSeconds(data.check_in_until),
        check_out_from: stripSeconds(data.check_out_from),
        check_out_until: stripSeconds(data.check_out_until),
        breakfast_policy: data.breakfast_policy,
        parking_situation: data.parking_situation,
        allow_children: data.allow_children,
        allow_pets: data.allow_pets,
        property: user.hotel,
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
      const normalizedValues = {
        cancel_time: result.cancellation_fee?.cancel_time || '',
        single_before_time_percentage: result.cancellation_fee?.single_before_time_percentage || '',
        single_after_time_percentage: result.cancellation_fee?.single_after_time_percentage || '',
        multi_5days_before_percentage: result.cancellation_fee?.multi_5days_before_percentage || '',
        multi_3days_before_percentage: result.cancellation_fee?.multi_3days_before_percentage || '',
        multi_2days_before_percentage: result.cancellation_fee?.multi_2days_before_percentage || '',
        multi_1day_before_percentage: result.cancellation_fee?.multi_1day_before_percentage || '',
        check_in_from: result.check_in_from || '',
        check_in_until: result.check_in_until || '',
        check_out_from: result.check_out_from || '',
        check_out_until: result.check_out_until || '',
        breakfast_policy: result.breakfast_policy || 'no',
        parking_situation: result.parking_situation || 'no',
        allow_children: result.allow_children || false,
        allow_pets: result.allow_pets || false,
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
                Хүүхэд болон нэмэлт ор
              </p>
              <p
                className={cn(
                  "py-2 px-3 rounded-md cursor-pointer transition-colors",
                  activeMenuItem === 'other'
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setActiveMenuItem('other')}
              >
                Бусад
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right content area */}
        <Card>
          <CardContent className="p-6">
            {propertyPolicy ? (
              <div className="space-y-6">
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
                          <span className="text-sm">• Ирэх өдрөөсөө 1 хоногийн өмнө цуцалвал:</span>
                          <span className="font-medium">{propertyPolicy.cancellation_fee?.multi_1day_before_percentage || 0} %</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
              {editSection === 'time' && 'Цаг тохируулах'}
              {editSection === 'cancellation' && 'Цуцлалтын бодлого засах'}
              {editSection === 'children' && 'Хүүхэд болон нэмэлт ор'}
              {editSection === 'other' && 'Бусад тохиргоо'}
            </DialogTitle>
            <DialogDescription>
              Мэдээллийг шинэчилж хадгална уу
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {editSection === 'time' && (
              <>
                {/* Check-in times */}
                <div className="space-y-4">
                  <h4 className="font-medium">Орох цаг (check in)</h4>
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="check_in_from"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input type="time" {...field} className="w-32" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span>-</span>
                    <FormField
                      control={form.control}
                      name="check_in_until"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input type="time" {...field} className="w-32" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Check-out times */}
                <div className="space-y-4">
                  <h4 className="font-medium">Гарах цаг (check out)</h4>
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="check_out_from"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input type="time" {...field} className="w-32" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span>-</span>
                    <FormField
                      control={form.control}
                      name="check_out_until"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input type="time" {...field} className="w-32" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Cancellation Policy */}
                <div className="space-y-4">
                  <h4 className="font-medium">Цуцлалтын бодлого</h4>

                  <FormField
                    control={form.control}
                    name="cancel_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цуцлах боломжтой цаг</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} className="w-40" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <p className="text-sm font-medium">1 өрөөний захиалгад нийт төлбөрөөс суутгах хураамжийн хувь:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="single_before_time_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Өмнөх өдрийн <span className="text-blue-500">{displayCancelTime || '...'}</span> цагаас өмнө (%)
                            </FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="single_after_time_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Өмнөх өдрийн <span className="text-blue-500">{displayCancelTime || '...'}</span> цагаас хойш (%)
                            </FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">2 болон түүнээс дээш өрөөнд нийт төлбөрөөс суутгах хураамжийн хувь:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="multi_5days_before_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Ирэх өдрөөсөө 5 хоногийн өмнө (%)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="multi_3days_before_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Ирэх өдрөөсөө 3 хоногийн өмнө (%)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="multi_2days_before_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Ирэх өдрөөсөө 2 хоногийн өмнө (%)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="multi_1day_before_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Ирэх өдрөөсөө 1 хоногийн өмнө (%)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {editSection === 'children' && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="allow_children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Зочин хүүхэдтэй хамт үйлчлүүлэх боломжтой эсэх</FormLabel>
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

                <FormField
                  control={form.control}
                  name="allow_pets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тэжээвэр амьтан оруулах боломжтой эсэх</FormLabel>
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
              </div>
            )}

            {editSection === 'other' && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="breakfast_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Өглөөний цай</FormLabel>
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
                            onClick={() => field.onChange('free')}
                            className={cn(
                              "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                              field.value === 'free'
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            Байгаа, үнэгүй
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange('paid')}
                            className={cn(
                              "px-8 py-2 rounded-md text-sm font-medium transition-all border",
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

                <FormField
                  control={form.control}
                  name="parking_situation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Зогсоолын мэдээлэл</FormLabel>
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
                            onClick={() => field.onChange('free')}
                            className={cn(
                              "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                              field.value === 'free'
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            Байгаа, үнэгүй
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange('paid')}
                            className={cn(
                              "px-8 py-2 rounded-md text-sm font-medium transition-all border",
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
