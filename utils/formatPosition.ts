export type PositionValue =
  | string
  | number
  | null
  | undefined
  | { id?: number; name_en?: string; name_mn?: string };

export function formatPosition(
  position: PositionValue,
  locale: 'en' | 'mn' = 'mn'
): string {
  if (position == null || position === '') return '—';
  if (typeof position === 'string') return position;
  if (typeof position === 'number') return String(position);
  if (typeof position === 'object') {
    const label = locale === 'en' ? position.name_en : position.name_mn;
    return label || position.name_mn || position.name_en || '—';
  }
  return '—';
}

export function normalizePosition(position: PositionValue): string {
  return formatPosition(position, 'mn');
}
