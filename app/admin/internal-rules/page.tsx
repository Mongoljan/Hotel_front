'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IconPencil, IconX, IconLoader2, IconInfoCircle } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  const [isSaving, setIsSaving] = useState(false);

  // Form state for editing
  const [editPolicy, setEditPolicy] = useState({
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
    breakfast_policy: 'no' as 'no' | 'free' | 'paid',
    parking_situation: 'no' as 'no' | 'free' | 'paid',
    allow_children: false,
    allow_pets: false,
  });

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
          setPropertyPolicy(data[0]);
        }
      } catch (error) {
        console.error('Error fetching policy data:', error);
        toast.error('Мэдээлэл ачаалахад алдаа гарлаа');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicyData();
  }, [user?.hotel]);

  // Initialize edit form when opening dialog
  const openEditDialog = (section: 'time' | 'cancellation' | 'children' | 'other') => {
    if (propertyPolicy) {
      setEditPolicy({
        cancel_time: propertyPolicy.cancellation_fee?.cancel_time || '',
        single_before_time_percentage: propertyPolicy.cancellation_fee?.single_before_time_percentage || '',
        single_after_time_percentage: propertyPolicy.cancellation_fee?.single_after_time_percentage || '',
        multi_5days_before_percentage: propertyPolicy.cancellation_fee?.multi_5days_before_percentage || '',
        multi_3days_before_percentage: propertyPolicy.cancellation_fee?.multi_3days_before_percentage || '',
        multi_2days_before_percentage: propertyPolicy.cancellation_fee?.multi_2days_before_percentage || '',
        multi_1day_before_percentage: propertyPolicy.cancellation_fee?.multi_1day_before_percentage || '',
        check_in_from: propertyPolicy.check_in_from || '',
        check_in_until: propertyPolicy.check_in_until || '',
        check_out_from: propertyPolicy.check_out_from || '',
        check_out_until: propertyPolicy.check_out_until || '',
        breakfast_policy: (propertyPolicy.breakfast_policy as 'no' | 'free' | 'paid') || 'no',
        parking_situation: (propertyPolicy.parking_situation as 'no' | 'free' | 'paid') || 'no',
        allow_children: propertyPolicy.allow_children || false,
        allow_pets: propertyPolicy.allow_pets || false,
      });
    }
    setEditSection(section);
    setIsEditDialogOpen(true);
  };

  // Save policy changes
  const handleSavePolicy = async () => {
    if (!user?.hotel || !propertyPolicy) return;

    setIsSaving(true);
    try {
      // Helper function to strip seconds from time
      const stripSeconds = (time: string) => time ? time.slice(0, 5) : time;

      const formattedData = {
        cancellation_fee: {
          cancel_time: stripSeconds(editPolicy.cancel_time),
          single_before_time_percentage: editPolicy.single_before_time_percentage,
          single_after_time_percentage: editPolicy.single_after_time_percentage,
          multi_5days_before_percentage: editPolicy.multi_5days_before_percentage,
          multi_3days_before_percentage: editPolicy.multi_3days_before_percentage,
          multi_2days_before_percentage: editPolicy.multi_2days_before_percentage,
          multi_1day_before_percentage: editPolicy.multi_1day_before_percentage,
          property: user.hotel,
        },
        check_in_from: stripSeconds(editPolicy.check_in_from),
        check_in_until: stripSeconds(editPolicy.check_in_until),
        check_out_from: stripSeconds(editPolicy.check_out_from),
        check_out_until: stripSeconds(editPolicy.check_out_until),
        breakfast_policy: editPolicy.breakfast_policy,
        parking_situation: editPolicy.parking_situation,
        allow_children: editPolicy.allow_children,
        allow_pets: editPolicy.allow_pets,
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
      setIsEditDialogOpen(false);
      toast.success('Мэдээлэл амжилттай хадгалагдлаа');
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error('Хадгалахад алдаа гарлаа');
    } finally {
      setIsSaving(false);
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
        {/* Left sidebar - Accordion navigation */}
        <Card className="h-fit">
          <CardContent className="p-0">
            <Accordion type="single" collapsible defaultValue="time-policy" className="w-full">
              <AccordionItem value="time-policy" className="border-b-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                  Цаг ба цуцлалтын бодлого
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="py-1 cursor-pointer hover:text-foreground">Өглөөний цай</p>
                    <p className="py-1 cursor-pointer hover:text-foreground">Зогсоол</p>
                    <p className="py-1 cursor-pointer hover:text-foreground">Хүүхэд болон нэмэлт ор</p>
                    <p className="py-1 cursor-pointer hover:text-foreground">Бусад</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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

          <div className="space-y-6 py-4">
            {editSection === 'time' && (
              <>
                {/* Check-in times */}
                <div className="space-y-4">
                  <h4 className="font-medium">Орох цаг</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkInFrom">Эхлэх</Label>
                      <Input
                        id="checkInFrom"
                        type="time"
                        value={editPolicy.check_in_from}
                        onChange={(e) => setEditPolicy({ ...editPolicy, check_in_from: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkInUntil">Дуусах</Label>
                      <Input
                        id="checkInUntil"
                        type="time"
                        value={editPolicy.check_in_until}
                        onChange={(e) => setEditPolicy({ ...editPolicy, check_in_until: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Check-out times */}
                <div className="space-y-4">
                  <h4 className="font-medium">Гарах цаг</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkOutFrom">Эхлэх</Label>
                      <Input
                        id="checkOutFrom"
                        type="time"
                        value={editPolicy.check_out_from}
                        onChange={(e) => setEditPolicy({ ...editPolicy, check_out_from: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOutUntil">Дуусах</Label>
                      <Input
                        id="checkOutUntil"
                        type="time"
                        value={editPolicy.check_out_until}
                        onChange={(e) => setEditPolicy({ ...editPolicy, check_out_until: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Cancellation Policy */}
                <div className="space-y-4">
                  <h4 className="font-medium">Цуцлалтын бодлого</h4>
                  
                  <div className="space-y-2">
                    <Label>Цуцлах боломжтой цаг</Label>
                    <Input
                      type="time"
                      value={editPolicy.cancel_time}
                      onChange={(e) => setEditPolicy({ ...editPolicy, cancel_time: e.target.value })}
                      className="w-40"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">1 өрөөний захиалгад нийт төлбөрөөс суутгах хураамжийн хувь:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">
                          Өмнөх өдрийн {editPolicy.cancel_time || '...'} цагаас өмнө (%)
                        </Label>
                        <Input
                          type="number"
                          value={editPolicy.single_before_time_percentage}
                          onChange={(e) => setEditPolicy({ ...editPolicy, single_before_time_percentage: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">
                          Өмнөх өдрийн {editPolicy.cancel_time || '...'} цагаас хойш (%)
                        </Label>
                        <Input
                          type="number"
                          value={editPolicy.single_after_time_percentage}
                          onChange={(e) => setEditPolicy({ ...editPolicy, single_after_time_percentage: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">2 болон түүнээс дээш өрөөнд нийт төлбөрөөс суутгах хураамжийн хувь:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Ирэх өдрөөсөө 5 хоногийн өмнө (%)</Label>
                        <Input
                          type="number"
                          value={editPolicy.multi_5days_before_percentage}
                          onChange={(e) => setEditPolicy({ ...editPolicy, multi_5days_before_percentage: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Ирэх өдрөөсөө 3 хоногийн өмнө (%)</Label>
                        <Input
                          type="number"
                          value={editPolicy.multi_3days_before_percentage}
                          onChange={(e) => setEditPolicy({ ...editPolicy, multi_3days_before_percentage: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Ирэх өдрөөсөө 2 хоногийн өмнө (%)</Label>
                        <Input
                          type="number"
                          value={editPolicy.multi_2days_before_percentage}
                          onChange={(e) => setEditPolicy({ ...editPolicy, multi_2days_before_percentage: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Ирэх өдрөөсөө 1 хоногийн өмнө (%)</Label>
                        <Input
                          type="number"
                          value={editPolicy.multi_1day_before_percentage}
                          onChange={(e) => setEditPolicy({ ...editPolicy, multi_1day_before_percentage: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Болих
            </Button>
            <Button onClick={handleSavePolicy} disabled={isSaving}>
              {isSaving ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Хадгалж байна...
                </>
              ) : (
                'Хадгалах'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
