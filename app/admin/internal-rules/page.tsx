'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import {
  IconPencil,
  IconLoader2,
  IconClock,
  IconCoffee,
  IconCar,
  IconMoodKid,
} from '@tabler/icons-react';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { PropertyPolicy } from '@/app/admin/hotel/types';
import {
  formatTime,
  formatStatus,
  formatFeeType,
  formatBreakfastType,
  normalizePolicyToForm,
  buildPolicyPayload,
  getInternalRulesSectionSchema,
  pickSectionFormValues,
  mergePolicySectionUpdate,
  getFirstZodErrorMessage,
  type PolicyFormFields,
} from '@/lib/policyFormatters';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import CheckInOutSection from '@/app/auth/register/Hotel/sections/CheckInOutSection';
import BreakfastPolicySection from '@/app/auth/register/Hotel/sections/BreakfastPolicySection';
import ParkingPolicySection from '@/app/auth/register/Hotel/sections/ParkingPolicySection';
import ChildPolicySection from '@/app/auth/register/Hotel/sections/ChildPolicySection';
import AcceptedCardsSection, { type AcceptedCardType } from '@/app/auth/register/Hotel/sections/AcceptedCardsSection';
import { useCombinedData } from '@/app/hooks/useCombinedData';

const API_URL = 'https://dev.kacc.mn/api/property-policies/';

type SectionKey = 'time' | 'breakfast' | 'parking' | 'children';

const SECTION_TITLES: Record<SectionKey, string> = {
  time: 'Цаг, цуцлалтын бодлого',
  breakfast: 'Өглөөний цай',
  parking: 'Зогсоол',
  children: 'Хүүхэд болон нэмэлт ор',
};

const MENU: { key: SectionKey; label: string }[] = [
  { key: 'time', label: 'Цаг ба цуцлалтын бодлого' },
  { key: 'breakfast', label: 'Өглөөний цай' },
  { key: 'parking', label: 'Зогсоол' },
  { key: 'children', label: 'Хүүхэд, нэмэлт ор' },
];

const DEFAULT_VALUES: PolicyFormFields = {
  check_in_from: '00:00',
  check_in_until: '00:00',
  check_out_from: '00:00',
  check_out_until: '00:00',
  pet_policy: false,
  min_guest_age: 18,
  languages: [],
  accepted_card_ids: [],
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
};

// ---- small read-only display helpers ---------------------------------------

function SectionHeader({
  icon,
  title,
  onEdit,
}: {
  icon?: React.ReactNode;
  title: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {onEdit && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} aria-label="Засах">
          <IconPencil className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value ?? '—'}</div>
    </div>
  );
}

// ---- main component ---------------------------------------------------------

export default function InternalRulesPage() {
  const t = useTranslations('4PropertyPolicies');
  const { user } = useAuth();
  const { data: combinedData } = useCombinedData();
  const acceptedCards: AcceptedCardType[] = combinedData?.acceptedCardType ?? [];
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editSection, setEditSection] = useState<SectionKey | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<SectionKey>('time');

  const form = useForm<PolicyFormFields>({
    defaultValues: DEFAULT_VALUES,
  });

  // Fetch policy
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
          form.reset(normalizePolicyToForm(policy));
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

  const openEditDialog = useCallback(
    (section: SectionKey) => {
      if (propertyPolicy) {
        form.reset(normalizePolicyToForm(propertyPolicy));
        form.clearErrors();
      }
      setEditSection(section);
    },
    [propertyPolicy, form]
  );

  const onSaveSection = async () => {
    if (!user?.hotel || !propertyPolicy || !editSection) return;

    form.clearErrors();
    const values = form.getValues();
    const sectionSchema = getInternalRulesSectionSchema(editSection);
    const sectionInput = pickSectionFormValues(editSection, values);
    const parsed = sectionSchema.safeParse(sectionInput);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          form.setError(field as keyof PolicyFormFields, { message: issue.message });
        }
      });
      toast.error(getFirstZodErrorMessage(parsed.error));
      return;
    }

    const merged = mergePolicySectionUpdate(propertyPolicy, editSection, parsed.data);

    try {
      const payload = buildPolicyPayload(merged, user.hotel);
      const response = await fetch(`${API_URL}${propertyPolicy.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save policy');
      const result = await response.json();
      setPropertyPolicy(result);
      form.reset(normalizePolicyToForm(result));
      setEditSection(null);
      toast.success('Мэдээлэл амжилттай хадгалагдлаа');
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error('Хадгалахад алдаа гарлаа');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!propertyPolicy) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <h1 className="text-2xl font-semibold">Дотоод журам</h1>
        <Card>
          <CardContent className="py-12 text-center space-y-1">
            <p className="text-muted-foreground">Дотоод журмын мэдээлэл олдсонгүй</p>
            <p className="text-sm text-muted-foreground">
              Буудлын бүртгэлийн 4-р алхмыг дуусгана уу
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Дотоод журам</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        {/* Left sidebar */}
        <Card className="h-fit">
          <CardContent className="p-2">
            <nav className="flex flex-col gap-0.5 text-sm">
              {MENU.map((item) => {
                const active = activeMenuItem === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveMenuItem(item.key)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'w-full text-left py-2 px-3 rounded-md transition-colors',
                      active
                        ? 'bg-muted text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Right content */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {activeMenuItem === 'time' && (
              <TimeSection policy={propertyPolicy} onEdit={() => openEditDialog('time')} />
            )}
            {activeMenuItem === 'breakfast' && (
              <BreakfastSection policy={propertyPolicy} onEdit={() => openEditDialog('breakfast')} />
            )}
            {activeMenuItem === 'parking' && (
              <ParkingSection policy={propertyPolicy} onEdit={() => openEditDialog('parking')} />
            )}
            {activeMenuItem === 'children' && (
              <ChildrenSection policy={propertyPolicy} onEdit={() => openEditDialog('children')} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog — reuses the registration section components */}
      <Dialog open={editSection !== null} onOpenChange={(open) => !open && setEditSection(null)}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editSection && SECTION_TITLES[editSection]}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void onSaveSection();
              }}
              className="space-y-5"
            >
              {editSection === 'time' && (
                <>
                  <CheckInOutSection form={form} t={t} />
                  {acceptedCards.length > 0 && (
                    <AcceptedCardsSection form={form} t={t} cards={acceptedCards} />
                  )}
                </>
              )}
              {editSection === 'breakfast' && <BreakfastPolicySection form={form} t={t} />}
              {editSection === 'parking' && <ParkingPolicySection form={form} t={t} />}
              {editSection === 'children' && <ChildPolicySection form={form} t={t} />}

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditSection(null)}
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

// ---- read-only section displays --------------------------------------------

function TimeSection({ policy, onEdit }: { policy: PropertyPolicy; onEdit: () => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SectionHeader icon={<IconClock className="h-4 w-4" />} title="Орох / Гарах цаг" onEdit={onEdit} />
        <div className="grid grid-cols-2 gap-6">
          <InfoRow
            label="Орох цаг"
            value={`${formatTime(policy.check_in_from)} – ${formatTime(policy.check_in_until)}`}
          />
          <InfoRow
            label="Гарах цаг"
            value={`${formatTime(policy.check_out_from)} – ${formatTime(policy.check_out_until)}`}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <SectionHeader title="Ерөнхий бодлого" />
        <div className="grid grid-cols-2 gap-6">
          <InfoRow label="Тэжээвэр амьтан" value={policy.pet_policy ? 'Тийм' : 'Үгүй'} />
          <InfoRow label="Зочдын хамгийн бага нас" value={policy.min_guest_age ?? '—'} />
          <InfoRow
            label="Хэлнүүд"
            value={Array.isArray(policy.languages) && policy.languages.length > 0
              ? policy.languages.join(', ')
              : '—'}
          />
          <InfoRow
            label="Зөвшөөрөх төлбөрийн хэрэгсэл"
            value={
              Array.isArray(policy.accepted_cards) && policy.accepted_cards.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {[...policy.accepted_cards]
                    .sort((a, b) => a.order - b.order)
                    .map((card) => (
                      <span
                        key={card.id}
                        className="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium"
                      >
                        {card.icon ? (
                          <img src={card.icon} alt={card.name} className="h-4 w-auto object-contain" />
                        ) : null}
                        {card.name}
                      </span>
                    ))}
                </div>
              ) : '—'
            }
          />
        </div>
      </div>
    </div>
  );
}

function BreakfastSection({ policy, onEdit }: { policy: PropertyPolicy; onEdit: () => void }) {
  const bp = policy.breakfast_policy;
  return (
    <div className="space-y-4">
      <SectionHeader icon={<IconCoffee className="h-4 w-4" />} title="Өглөөний цай" onEdit={onEdit} />
      <div className="grid grid-cols-2 gap-6">
        <InfoRow label="Төлөв" value={formatStatus(bp?.status)} />
        {bp?.status !== 'no' && (
          <>
            <InfoRow
              label="Цаг"
              value={`${formatTime(bp?.start_time)} – ${formatTime(bp?.end_time)}`}
            />
            <InfoRow label="Төрөл" value={formatBreakfastType(bp?.breakfast_type)} />
            {bp?.status === 'paid' && (
              <InfoRow label="Үнэ" value={`${Number(bp?.price || 0).toLocaleString()} ₮`} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ParkingSection({ policy, onEdit }: { policy: PropertyPolicy; onEdit: () => void }) {
  const pp = policy.parking_policy;
  return (
    <div className="space-y-4">
      <SectionHeader icon={<IconCar className="h-4 w-4" />} title="Зогсоолын мэдээлэл" onEdit={onEdit} />
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Гадна зогсоол</p>
          <div className="grid grid-cols-2 gap-6 pl-4">
            <InfoRow label="Төлөв" value={formatStatus(pp?.outdoor_parking)} />
            {pp?.outdoor_parking === 'paid' && (
              <InfoRow
                label="Үнэ"
                value={`${Number(pp?.outdoor_price || 0).toLocaleString()} ₮ / ${formatFeeType(pp?.outdoor_fee_type)}`}
              />
            )}
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <p className="text-sm font-medium">Дотор зогсоол</p>
          <div className="grid grid-cols-2 gap-6 pl-4">
            <InfoRow label="Төлөв" value={formatStatus(pp?.indoor_parking)} />
            {pp?.indoor_parking === 'paid' && (
              <InfoRow
                label="Үнэ"
                value={`${Number(pp?.indoor_price || 0).toLocaleString()} ₮ / ${formatFeeType(pp?.indoor_fee_type)}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChildrenSection({ policy, onEdit }: { policy: PropertyPolicy; onEdit: () => void }) {
  const cp = policy.child_policy;
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SectionHeader icon={<IconMoodKid className="h-4 w-4" />} title="Хүүхдийн бодлого" onEdit={onEdit} />
        <div className="grid grid-cols-2 gap-6">
          <InfoRow
            label="Хүүхэдтэй үйлчлүүлэх эсэх"
            value={cp?.allow_children ? 'Тийм' : 'Үгүй'}
          />
          {cp?.allow_children && (
            <>
              <InfoRow
                label="Насны хязгаар"
                value={cp?.max_child_age ? `${cp.max_child_age} хүртэлх` : '—'}
              />
              <InfoRow
                label="Хүүхдийн ор"
                value={cp?.child_bed_available === 'yes' ? 'Байгаа' : 'Байхгүй'}
              />
            </>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <SectionHeader title="Нэмэлт ор" />
        <div className="grid grid-cols-2 gap-6">
          <InfoRow
            label="Нэмэлт ор тавих боломжтой эсэх"
            value={cp?.allow_extra_bed ? 'Тийм' : 'Үгүй'}
          />
          {cp?.allow_extra_bed && (
            <InfoRow
              label="Нэмэлт орны үнэ"
              value={`${Number(cp?.extra_bed_price || 0).toLocaleString()} ₮`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function InlineKV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">• {label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
