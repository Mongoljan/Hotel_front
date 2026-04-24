/**
 * Shared formatting helpers for property policy (Дотоод журам) data.
 * Used by admin/internal-rules and any future consumers.
 */
import type { z } from 'zod';
import type { schemaHotelSteps3 } from '@/app/schema';

export type PolicyFormFields = z.infer<typeof schemaHotelSteps3>;

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
    cancel_time: normalizeTime(policy?.cancellation_fee?.cancel_time, '00:00'),
    single_before_time_percentage: normalizePercent(policy?.cancellation_fee?.single_before_time_percentage),
    single_after_time_percentage: normalizePercent(policy?.cancellation_fee?.single_after_time_percentage),
    multi_5days_before_percentage: normalizePercent(policy?.cancellation_fee?.multi_5days_before_percentage),
    multi_3days_before_percentage: normalizePercent(policy?.cancellation_fee?.multi_3days_before_percentage),
    multi_2days_before_percentage: normalizePercent(policy?.cancellation_fee?.multi_2days_before_percentage),
    multi_1day_before_percentage: normalizePercent(policy?.cancellation_fee?.multi_1day_before_percentage),
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

/** Build the API payload for PUT/POST to /api/property-policies/. */
export function buildPolicyPayload(data: PolicyFormFields, propertyId: number | string) {
  const stripSeconds = (time: string) => (time ? time.slice(0, 5) : time);
  return {
    property: propertyId,
    check_in_from: stripSeconds(data.check_in_from),
    check_in_until: stripSeconds(data.check_in_until),
    check_out_from: stripSeconds(data.check_out_from),
    check_out_until: stripSeconds(data.check_out_until),
    cancellation_fee: {
      property: propertyId,
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
      max_child_age: data.allow_children ? data.max_child_age : 0,
      child_bed_available: data.allow_children ? data.child_bed_available : 'no',
      allow_extra_bed: data.allow_extra_bed || false,
      extra_bed_price: data.allow_extra_bed ? data.extra_bed_price : null,
    },
  };
}
