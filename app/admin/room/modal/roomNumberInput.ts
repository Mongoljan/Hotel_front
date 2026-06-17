import type { RoomData } from "../_lib/types";

/** Room number fields: digits only, clamped to 0–10000 */
export const ROOM_NUMBER_MIN = 0;
export const ROOM_NUMBER_MAX = 10000;

export function buildTakenRoomNumberSet(
  existingRooms: RoomData[],
  excludeGroupId?: number | null
): Set<number> {
  const taken = new Set<number>();
  for (const group of existingRooms) {
    if (excludeGroupId != null && group.id === excludeGroupId) continue;
    for (const num of group.room_numbers ?? []) {
      taken.add(num);
    }
  }
  return taken;
}

export function findRoomNumberConflicts(
  values: string[],
  taken: Set<number>
): { existing: number[]; inForm: number[] } {
  const existing: number[] = [];
  const inForm: number[] = [];
  const seen = new Set<number>();

  for (const raw of values) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const n = parseInt(trimmed, 10);
    if (isNaN(n)) continue;
    if (seen.has(n)) inForm.push(n);
    seen.add(n);
    if (taken.has(n)) existing.push(n);
  }

  return {
    existing: [...new Set(existing)],
    inForm: [...new Set(inForm)],
  };
}

export function sanitizeRoomNumberInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  const n = parseInt(digits, 10);
  if (Number.isNaN(n)) return "";
  return String(Math.min(ROOM_NUMBER_MAX, Math.max(ROOM_NUMBER_MIN, n)));
}

export function sanitizeRoomCountInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  const n = parseInt(digits, 10);
  if (Number.isNaN(n)) return "";
  return String(Math.min(ROOM_NUMBER_MAX, Math.max(ROOM_NUMBER_MIN, n)));
}
