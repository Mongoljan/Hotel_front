import { cn } from "@/lib/utils";

/**
 * Hotel_front typography scale
 * - Body / labels / errors: 14px (text-sm)
 * - Section headers: 16px (text-base)
 * - Page / panel titles: 18px (text-lg)
 * - Compact (hints, badges): 12px (text-xs) — use sparingly
 */

/** 14px — default body, field labels, errors, table text */
export function bodyTextClass(extra?: string) {
  return cn("text-sm", extra);
}

export function fieldLabelClass(hasError: boolean) {
  return cn("text-sm", hasError ? "text-red font-medium" : "text-muted-foreground");
}

export function fieldBorderClass(hasError: boolean, className?: string) {
  return cn(className, hasError && "border-red focus-visible:ring-red/30");
}

export function fieldErrorTextClass() {
  return "text-sm font-medium mt-1 text-red";
}

/** 16px — card section headers, form group titles */
export function sectionHeaderTextClass() {
  return "text-base font-semibold tracking-wide";
}

/** 18px — sheet/modal/page titles */
export function pageTitleTextClass() {
  return "text-lg font-semibold";
}

/** 12px — hints, badges, secondary captions only */
export function compactTextClass(extra?: string) {
  return cn("text-xs", extra);
}

/** Icons paired with 16px section headers */
export const sectionHeaderIconClass = "h-5 w-5 shrink-0";

/** Icons paired with 14px inline text */
export const inlineIconClass = "h-4 w-4 shrink-0";

/** Icons paired with 18px titles */
export const pageTitleIconClass = "h-5 w-5 shrink-0";
