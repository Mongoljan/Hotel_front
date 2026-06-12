/**
 * Shared formatting helpers for property policy (Дотоод журам) data.
 * Used by admin/internal-rules and any future consumers.
 */
import { z } from 'zod';
import type { schemaHotelSteps3, schemaHotelStepsCancellation } from '@/app/schema';

export type PolicyFormFields = z.infer<typeof schemaHotelSteps3>;
export type CancellationFormFields = z.infer<typeof schemaHotelStepsCancellation>;

export const EMPTY_DASH = '—';

/** Strip seconds from a time string: "14:00:00" → "14:00". */
export const formatTime = (time: string | null | undefined): string => {
  if (!time) return EMPTY_DASH;
  return time.slice(0, 5);
};

/** Strip seconds for form binding; returns empty string / fallback if missing. */
export const normalizeTime = (time: string | null | undefined, fallback = ''): string => {
  if (!time) return fallback;
  const match = time.match(/^(\d{1,2}:\d{2})/);
  return match ? match[1] : time;
};

/** Convert a percentage value (string or number, possibly "8.00") to an integer string. */
export const normalizePercent = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '0';
  const num = parseFloat(String(val).replace(/,/g, ''));
  return Number.isNaN(num) ? '0' : String(Math.floor(num));
};

export const formatStatus = (status: string | null | undefined): string => {
  switch (status) {
    case 'no': return 'Байхгүй';
    case 'free': return 'Үнэгүй';
    case 'paid': return 'Төлбөртэй';
    default: return EMPTY_DASH;
  }
};

export const formatFeeType = (feeType: string | null | undefined): string => {
  switch (feeType) {
    case 'hour': return 'цагаар';
    case 'day': return 'хоногоор';
    default: return '';
  }
};

export const formatBreakfastType = (type: string | null | undefined): string => {
  switch (type) {
    case 'buffet': return 'Буффет';
    case 'room': return 'Өрөөнд';
    case 'plate': return 'Тавгаар';
    default: return '';
  }
};

/** Normalize a PropertyPolicy API response into form-friendly field values. */
export function normalizePolicyToForm(policy: any): PolicyFormFields {
  return {
    check_in_from: normalizeTime(policy?.check_in_from, '00:00'),
    check_in_until: normalizeTime(policy?.check_in_until, '00:00'),
    check_out_from: normalizeTime(policy?.check_out_from, '00:00'),
    check_out_until: normalizeTime(policy?.check_out_until, '00:00'),
    pet_policy: Boolean(policy?.pet_policy),
    min_guest_age: Boolean(policy?.min_guest_age),
    languages: Array.isArray(policy?.languages)
      ? policy.languages.map((l: number | string) => Number(l))
      : [],
    accepted_card_ids: Array.isArray(policy?.accepted_cards)
      ? policy.accepted_cards.map((c: { id: number | string }) => Number(c.id))
      : Array.isArray(policy?.accepted_card_ids)
        ? policy.accepted_card_ids.map((id: number | string) => Number(id))
        : [],
    breakfast_status: policy?.breakfast_policy?.status || 'no',
    breakfast_start_time: normalizeTime(policy?.breakfast_policy?.start_time),
    breakfast_end_time: normalizeTime(policy?.breakfast_policy?.end_time),
    breakfast_price: policy?.breakfast_policy?.price ?? null,
    breakfast_type: policy?.breakfast_policy?.breakfast_type ?? undefined,
    outdoor_parking: policy?.parking_policy?.outdoor_parking || 'no',
    outdoor_fee_type: policy?.parking_policy?.outdoor_fee_type ?? null,
    outdoor_price: policy?.parking_policy?.outdoor_price ?? null,
    indoor_parking: policy?.parking_policy?.indoor_parking || 'no',
    indoor_fee_type: policy?.parking_policy?.indoor_fee_type ?? null,
    indoor_price: policy?.parking_policy?.indoor_price ?? null,
    allow_children: policy?.child_policy?.allow_children ?? false,
    max_child_age: policy?.child_policy?.max_child_age ?? undefined,
    child_bed_available: policy?.child_policy?.child_bed_available ?? undefined,
    allow_extra_bed: policy?.child_policy?.allow_extra_bed ?? false,
    extra_bed_price: policy?.child_policy?.extra_bed_price ?? null,
  };
}

export function normalizeCancellationToForm(cancellation: any): CancellationFormFields {
  return {
    cancel_time: normalizeTime(cancellation?.cancel_time, '00:00'),
    single_before_time_percentage: normalizePercent(cancellation?.single_before_time_percentage),
    single_after_time_percentage: normalizePercent(cancellation?.single_after_time_percentage),
    multi_5days_before_percentage: normalizePercent(cancellation?.multi_5days_before_percentage),
    multi_3days_before_percentage: normalizePercent(cancellation?.multi_3days_before_percentage),
    multi_2days_before_percentage: normalizePercent(cancellation?.multi_2days_before_percentage),
    multi_1day_before_percentage: normalizePercent(cancellation?.multi_1day_before_percentage),
  };
}

/** Build the API payload for PUT/POST to /api/property-policies/. */
export function buildPolicyPayload(data: PolicyFormFields, propertyId: number | string) {
  const stripSeconds = (time: string) => (time ? time.slice(0, 5) : time);
  return {
    property: propertyId,
    check_in_from: stripSeconds(data.check_in_from),
    check_in_until: stripSeconds(data.check_in_until),
    check_out_from: stripSeconds(data.check_out_from),
    check_out_until: stripSeconds(data.check_out_until),
    pet_policy: data.pet_policy,
    min_guest_age: data.min_guest_age,
    languages: data.languages,
    accepted_card_ids: data.accepted_card_ids ?? [],
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
      max_child_age: data.allow_children ? data.max_child_age : 0,
      child_bed_available: data.allow_children ? data.child_bed_available : 'no',
      allow_extra_bed: data.allow_extra_bed || false,
      extra_bed_price: data.allow_extra_bed ? data.extra_bed_price : null,
    },
  };
}

/** Format time for /api/cancellation-fees/ — "11:00" → "11:00:00" */
export function formatCancellationTime(time: string): string {
  if (!time) return '00:00:00';
  const hhmm = time.slice(0, 5);
  return hhmm.length === 5 ? `${hhmm}:00` : time;
}

/** Format percentage for /api/cancellation-fees/ — "20" → "20.00" */
export function formatCancellationPercentage(val: string | number): string {
  const num = parseFloat(String(val).replace(/,/g, ''));
  if (Number.isNaN(num)) return '0.00';
  return num.toFixed(2);
}

export type InternalRulesSectionKey = 'time' | 'breakfast' | 'parking' | 'children' | 'general';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/** Section-only schemas for admin edit dialogs — avoids validating hidden fields. */
export const schemaInternalRulesTime = z.object({
  check_in_from: z.string()
    .min(1, { message: 'Бүртгэх цагийн эхлэх хугацааг сонгоно уу' })
    .regex(timeRegex, { message: 'Цагийн формат буруу байна (ЦЦ:ММ)' }),
  check_in_until: z.string()
    .min(1, { message: 'Бүртгэх цагийн дуусах хугацааг сонгоно уу' })
    .regex(timeRegex, { message: 'Цагийн формат буруу байна (ЦЦ:ММ)' }),
  check_out_from: z.string()
    .min(1, { message: 'Гарах цагийн эхлэх хугацааг сонгоно уу' })
    .regex(timeRegex, { message: 'Цагийн формат буруу байна (ЦЦ:ММ)' }),
  check_out_until: z.string()
    .min(1, { message: 'Гарах цагийн дуусах хугацааг сонгоно уу' })
    .regex(timeRegex, { message: 'Цагийн формат буруу байна (ЦЦ:ММ)' }),
});

export const schemaInternalRulesGeneral = z.object({
  languages: z
    .array(z.coerce.number())
    .min(1, { message: 'Хамгийн багадаа нэг хэл сонгоно уу' }),
  min_guest_age: z.boolean(),
  pet_policy: z.boolean(),
  accepted_card_ids: z.array(z.coerce.number()).default([]),
});

export const schemaInternalRulesBreakfast = z.object({
  breakfast_status: z.enum(['no', 'free', 'paid']),
  breakfast_start_time: z.string().optional(),
  breakfast_end_time: z.string().optional(),
  breakfast_price: z.string().nullable().optional(),
  breakfast_type: z.enum(['buffet', 'room', 'plate']).optional(),
}).superRefine((data, ctx) => {
  if (data.breakfast_status === 'no') return;

  if (!data.breakfast_start_time?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Өглөөний цайны эхлэх цагийг оруулна уу', path: ['breakfast_start_time'] });
  }
  if (!data.breakfast_end_time?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Өглөөний цайны дуусах цагийг оруулна уу', path: ['breakfast_end_time'] });
  }
  if (!data.breakfast_type) {
    ctx.addIssue({ code: 'custom', message: 'Өглөөний цайны төрлийг сонгоно уу', path: ['breakfast_type'] });
  }
  if (data.breakfast_status === 'paid') {
    const priceStr = (data.breakfast_price ?? '').replace(/,/g, '');
    const price = parseFloat(priceStr);
    if (!priceStr || Number.isNaN(price) || price <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Үнэ оруулах шаардлагатай', path: ['breakfast_price'] });
    }
  }
});

export const schemaInternalRulesParking = z.object({
  outdoor_parking: z.enum(['no', 'free', 'paid']),
  outdoor_fee_type: z.enum(['hour', 'day']).nullable().optional(),
  outdoor_price: z.string().nullable().optional(),
  indoor_parking: z.enum(['no', 'free', 'paid']),
  indoor_fee_type: z.enum(['hour', 'day']).nullable().optional(),
  indoor_price: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.outdoor_parking === 'paid') {
    if (!data.outdoor_fee_type) {
      ctx.addIssue({ code: 'custom', message: 'Гадна зогсоолын төлбөрийн мэдээллийг бүрэн оруулна уу', path: ['outdoor_fee_type'] });
    }
    const priceStr = (data.outdoor_price ?? '').replace(/,/g, '');
    const price = parseFloat(priceStr);
    if (!priceStr || Number.isNaN(price) || price <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Гадна зогсоолын төлбөрийн мэдээллийг бүрэн оруулна уу', path: ['outdoor_price'] });
    }
  }
  if (data.indoor_parking === 'paid') {
    if (!data.indoor_fee_type) {
      ctx.addIssue({ code: 'custom', message: 'Дотор зогсоолын төлбөрийн мэдээллийг бүрэн оруулна уу', path: ['indoor_fee_type'] });
    }
    const priceStr = (data.indoor_price ?? '').replace(/,/g, '');
    const price = parseFloat(priceStr);
    if (!priceStr || Number.isNaN(price) || price <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Дотор зогсоолын төлбөрийн мэдээллийг бүрэн оруулна уу', path: ['indoor_price'] });
    }
  }
});

export const schemaInternalRulesChildren = z.object({
  allow_children: z.boolean(),
  max_child_age: z.number()
    .min(0, { message: 'Хүүхдийн нас 0-с их байх ёстой' })
    .max(18, { message: 'Хүүхдийн нас 18-аас бага байх ёстой' })
    .optional(),
  child_bed_available: z.enum(['yes', 'no']).optional(),
  allow_extra_bed: z.boolean().optional(),
  extra_bed_price: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.allow_children) {
    if (data.max_child_age === undefined || data.max_child_age === null) {
      ctx.addIssue({ code: 'custom', message: 'Хүүхдийн дээд насыг оруулна уу', path: ['max_child_age'] });
    }
    if (!data.child_bed_available) {
      ctx.addIssue({ code: 'custom', message: 'Хүүхдийн ор байгаа эсэхийг сонгоно уу', path: ['child_bed_available'] });
    }
  }
  if (data.allow_extra_bed) {
    const priceStr = (data.extra_bed_price ?? '').replace(/,/g, '');
    const price = parseFloat(priceStr);
    if (!priceStr || Number.isNaN(price) || price <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Нэмэлт орны үнийг оруулна уу', path: ['extra_bed_price'] });
    }
  }
});

export function getInternalRulesSectionSchema(section: InternalRulesSectionKey) {
  switch (section) {
    case 'time':
      return schemaInternalRulesTime;
    case 'breakfast':
      return schemaInternalRulesBreakfast;
    case 'parking':
      return schemaInternalRulesParking;
    case 'children':
      return schemaInternalRulesChildren;
    case 'general':
      return schemaInternalRulesGeneral;
    default:
      return schemaInternalRulesTime;
  }
}

export function pickSectionFormValues(
  section: InternalRulesSectionKey,
  values: PolicyFormFields
): Record<string, unknown> {
  switch (section) {
    case 'time':
      return {
        check_in_from: values.check_in_from,
        check_in_until: values.check_in_until,
        check_out_from: values.check_out_from,
        check_out_until: values.check_out_until,
      };
    case 'general':
      return {
        languages: values.languages,
        min_guest_age: values.min_guest_age,
        pet_policy: values.pet_policy,
        accepted_card_ids: values.accepted_card_ids ?? [],
      };
    case 'breakfast':
      return {
        breakfast_status: values.breakfast_status,
        breakfast_start_time: values.breakfast_start_time,
        breakfast_end_time: values.breakfast_end_time,
        breakfast_price: values.breakfast_price,
        breakfast_type: values.breakfast_type,
      };
    case 'parking':
      return {
        outdoor_parking: values.outdoor_parking,
        outdoor_fee_type: values.outdoor_fee_type,
        outdoor_price: values.outdoor_price,
        indoor_parking: values.indoor_parking,
        indoor_fee_type: values.indoor_fee_type,
        indoor_price: values.indoor_price,
      };
    case 'children':
      return {
        allow_children: values.allow_children,
        max_child_age: values.max_child_age,
        child_bed_available: values.child_bed_available,
        allow_extra_bed: values.allow_extra_bed,
        extra_bed_price: values.extra_bed_price,
      };
    default:
      return {};
  }
}

export function mergePolicySectionUpdate(
  policy: unknown,
  section: InternalRulesSectionKey,
  sectionValues: Record<string, unknown>
): PolicyFormFields {
  const base = normalizePolicyToForm(policy);
  return { ...base, ...sectionValues } as PolicyFormFields;
}

export function getFirstZodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Өгөгдөл буруу байна';
}

export function buildCancellationPayload(data: CancellationFormFields, propertyId: number | string) {
  return {
    cancel_time: formatCancellationTime(data.cancel_time),
    single_before_time_percentage: formatCancellationPercentage(data.single_before_time_percentage),
    single_after_time_percentage: formatCancellationPercentage(data.single_after_time_percentage),
    multi_5days_before_percentage: formatCancellationPercentage(data.multi_5days_before_percentage),
    multi_3days_before_percentage: formatCancellationPercentage(data.multi_3days_before_percentage),
    multi_2days_before_percentage: formatCancellationPercentage(data.multi_2days_before_percentage),
    multi_1day_before_percentage: formatCancellationPercentage(data.multi_1day_before_percentage),
    property: Number(propertyId),
  };
}