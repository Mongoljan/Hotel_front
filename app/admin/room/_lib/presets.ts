/**
 * Room Type Presets
 *
 * When a user selects a room_type (ангилал) in Step 1, the form auto-fills:
 *  - allowed bed_types (locked to one or ALL)
 *  - allowed bed_size IDs (filtered dropdown)
 *  - default bed quantity
 *  - default adultQty
 *
 * For "manual" types (Family, Apartment, Triple) all options are shown and
 * adultQty MUST be entered manually — the form validates this.
 *
 * IDs are from GET /api/all-data/ (verified 2026-06-17).
 */

export interface RoomTypePreset {
  /** Whether all bed types are allowed (true for Family / Apartment / Triple) */
  manualMode: boolean;
  /** Locked bed_type ID(s). Empty array = all allowed */
  allowedBedTypeIds: number[];
  /** Allowed bed_size IDs. Empty array = all allowed */
  allowedBedSizeIds: number[];
  /**
   * Default bed rows to generate in the form.
   * Each entry = one `group_beds` row: { bed_type, bed_size, quantity }.
   * Using a single row with quantity > 1 (e.g. Twin Room = Single bed × 2)
   * rather than multiple identical rows keeps the form clean.
   */
  defaultBedRows: { bedTypeId: number; quantity: number }[];
  /** Default adult capacity — 0 means user must enter manually */
  defaultAdultQty: number;
  /** Default child capacity */
  defaultChildQty: number;
}

/**
 * Bed type IDs from /api/all-data/ → bed_types[]
 */
export const BED_TYPE_IDS = {
  EXTRA_BED: 15,
  SOFA_BED: 34,
  SUPER_KING_BED: 35,
  KING_BED: 36,
  QUEEN_BED: 37,
  DOUBLE_BED: 38,
  SEMI_DOUBLE_BED: 39,
  TWIN_BED: 40,
  SINGLE_BED: 41,
} as const;

/**
 * Bed size IDs from /api/all-data/ → bed_sizes[]
 * id:14 "200 x 200 cm"
 * id:15 "180 x 200 cm"
 * id:16 "160 x 200 cm"
 * id:17 "160 x 200 cm" (duplicate entry — include both)
 * id:18 "150 x 200 cm"
 * id:19 "140 x 200 cm"
 * id:20 "120 x 200 cm"
 * id:21 "100 x 200 cm"
 * id:22 "90 x 200 cm"
 */
export const BED_SIZE_IDS = {
  CM_200x200: 14,
  CM_180x200: 15,
  CM_160x200_A: 16,
  CM_160x200_B: 17,
  CM_150x200: 18,
  CM_140x200: 19,
  CM_120x200: 20,
  CM_100x200: 21,
  CM_90x200: 22,
} as const;

/**
 * Room type IDs from /api/all-data/ → room_types[]
 */
export const ROOM_TYPE_IDS = {
  SINGLE_ROOM: 6,
  TWIN_ROOM: 8,
  DOUBLE_ROOM: 7,
  TRIPLE_ROOM: 10,
  TWIN_DOUBLE_ROOM: 9,
  QUEEN_ROOM: 16,
  KING_ROOM: 15,
  FAMILY_ROOM: 11,
  APARTMENT: 13,
} as const;

const MANUAL_PRESET: RoomTypePreset = {
  manualMode: true,
  allowedBedTypeIds: [],
  allowedBedSizeIds: [],
  defaultBedRows: [{ bedTypeId: 0, quantity: 1 }],
  defaultAdultQty: 0,
  defaultChildQty: 0,
};

/**
 * Map of room_type.id → preset constraints.
 *
 * Constraint table from product spec (2026-06-17):
 *
 * | Room type        | API id | Bed type              | Allowed sizes            | Beds | Adults |
 * |------------------|--------|-----------------------|--------------------------|------|--------|
 * | Single Room      | 6      | Single bed (41)       | 90x200(22), 100x200(21)  |  1   |   1    |
 * | Twin Room        | 8      | Single bed (41)       | 90x200(22), 100x200(21)  |  2   |   2    |
 * | Double Room      | 7      | Double bed (38)       | 140x200(19), 150x200(18) |  1   |   2    |
 * | Two Double Room  | 9      | Double bed (38)       | 140x200(19), 150x200(18) |  2   |   4    |
 * | Queen Room       | 16     | Queen bed (37)        | 160x200(16/17)           |  1   |   2    |
 * | King Room        | 15     | King bed (36)         | 180x200(15)              |  1   |   2    |
 * | Family Room      | 11     | ALL                   | ALL                      | manual | manual |
 * | Apartment        | 13     | ALL                   | ALL                      | manual | manual |
 * | Triple Room      | 10     | ALL                   | ALL                      | manual | manual |
 *
 * Missing from API (documented in docs/room-api-gaps.md Gap D):
 *   Semi Double Room  — Semi double bed (39), 120x200 (20), 1 bed, 1 adult
 *   Two Queen Room    — Queen bed (37), 160x200 (16), 2 beds, 4 adults
 *   Super King Room   — King bed (36), 200x200 (14), 1 bed, 2 adults
 */
export const ROOM_TYPE_PRESETS: Record<number, RoomTypePreset> = {
  // Single Room: 1 single bed (90 or 100 × 200), 1 adult
  [ROOM_TYPE_IDS.SINGLE_ROOM]: {
    manualMode: false,
    allowedBedTypeIds: [BED_TYPE_IDS.SINGLE_BED],
    allowedBedSizeIds: [BED_SIZE_IDS.CM_90x200, BED_SIZE_IDS.CM_100x200],
    defaultBedRows: [{ bedTypeId: BED_TYPE_IDS.SINGLE_BED, quantity: 1 }],
    defaultAdultQty: 1,
    defaultChildQty: 0,
  },

  // Twin Room: 1 row of single bed × 2 quantity (90 or 100 × 200), 2 adults
  [ROOM_TYPE_IDS.TWIN_ROOM]: {
    manualMode: false,
    allowedBedTypeIds: [BED_TYPE_IDS.SINGLE_BED],
    allowedBedSizeIds: [BED_SIZE_IDS.CM_90x200, BED_SIZE_IDS.CM_100x200],
    defaultBedRows: [{ bedTypeId: BED_TYPE_IDS.SINGLE_BED, quantity: 2 }],
    defaultAdultQty: 2,
    defaultChildQty: 0,
  },

  // Double Room: 1 double bed (140 or 150 × 200), 2 adults
  [ROOM_TYPE_IDS.DOUBLE_ROOM]: {
    manualMode: false,
    allowedBedTypeIds: [BED_TYPE_IDS.DOUBLE_BED],
    allowedBedSizeIds: [BED_SIZE_IDS.CM_140x200, BED_SIZE_IDS.CM_150x200],
    defaultBedRows: [{ bedTypeId: BED_TYPE_IDS.DOUBLE_BED, quantity: 1 }],
    defaultAdultQty: 2,
    defaultChildQty: 0,
  },

  // Two Double Room (Twin/Double): 1 row of double bed × 2 quantity, 4 adults
  [ROOM_TYPE_IDS.TWIN_DOUBLE_ROOM]: {
    manualMode: false,
    allowedBedTypeIds: [BED_TYPE_IDS.DOUBLE_BED],
    allowedBedSizeIds: [BED_SIZE_IDS.CM_140x200, BED_SIZE_IDS.CM_150x200],
    defaultBedRows: [{ bedTypeId: BED_TYPE_IDS.DOUBLE_BED, quantity: 2 }],
    defaultAdultQty: 4,
    defaultChildQty: 0,
  },

  // Queen Room: 1 queen bed (160 × 200), 2 adults
  [ROOM_TYPE_IDS.QUEEN_ROOM]: {
    manualMode: false,
    allowedBedTypeIds: [BED_TYPE_IDS.QUEEN_BED],
    allowedBedSizeIds: [BED_SIZE_IDS.CM_160x200_A, BED_SIZE_IDS.CM_160x200_B],
    defaultBedRows: [{ bedTypeId: BED_TYPE_IDS.QUEEN_BED, quantity: 1 }],
    defaultAdultQty: 2,
    defaultChildQty: 0,
  },

  // King Room: 1 king bed (180 × 200), 2 adults
  [ROOM_TYPE_IDS.KING_ROOM]: {
    manualMode: false,
    allowedBedTypeIds: [BED_TYPE_IDS.KING_BED],
    allowedBedSizeIds: [BED_SIZE_IDS.CM_180x200],
    defaultBedRows: [{ bedTypeId: BED_TYPE_IDS.KING_BED, quantity: 1 }],
    defaultAdultQty: 2,
    defaultChildQty: 0,
  },

  // Family Room: all bed types, user fills capacity manually (required)
  [ROOM_TYPE_IDS.FAMILY_ROOM]: MANUAL_PRESET,

  // Apartment: all bed types, user fills capacity manually (required)
  [ROOM_TYPE_IDS.APARTMENT]: MANUAL_PRESET,

  // Triple Room: all bed types, user fills capacity manually (required)
  [ROOM_TYPE_IDS.TRIPLE_ROOM]: MANUAL_PRESET,
};

/** Returns the preset for a given room_type id, falling back to MANUAL_PRESET */
export function getPreset(roomTypeId: number | null | undefined): RoomTypePreset {
  if (!roomTypeId) return MANUAL_PRESET;
  return ROOM_TYPE_PRESETS[roomTypeId] ?? MANUAL_PRESET;
}

/** Dropdown display order: Single bed → Super King bed (smallest → largest) */
export const BED_TYPE_SORT_ORDER: Record<number, number> = {
  [BED_TYPE_IDS.SINGLE_BED]: 1,
  [BED_TYPE_IDS.TWIN_BED]: 2,
  [BED_TYPE_IDS.SEMI_DOUBLE_BED]: 3,
  [BED_TYPE_IDS.DOUBLE_BED]: 4,
  [BED_TYPE_IDS.QUEEN_BED]: 5,
  [BED_TYPE_IDS.KING_BED]: 6,
  [BED_TYPE_IDS.SUPER_KING_BED]: 7,
  [BED_TYPE_IDS.SOFA_BED]: 8,
  [BED_TYPE_IDS.EXTRA_BED]: 9,
};

/** Bed size display order: 90×200 cm → 200×200 cm */
export const BED_SIZE_SORT_ORDER: Record<number, number> = {
  [BED_SIZE_IDS.CM_90x200]: 1,
  [BED_SIZE_IDS.CM_100x200]: 2,
  [BED_SIZE_IDS.CM_120x200]: 3,
  [BED_SIZE_IDS.CM_140x200]: 4,
  [BED_SIZE_IDS.CM_150x200]: 5,
  [BED_SIZE_IDS.CM_160x200_A]: 6,
  [BED_SIZE_IDS.CM_160x200_B]: 7,
  [BED_SIZE_IDS.CM_180x200]: 8,
  [BED_SIZE_IDS.CM_200x200]: 9,
};

export function sortBedTypes<T extends { id: number }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => (BED_TYPE_SORT_ORDER[a.id] ?? 999) - (BED_TYPE_SORT_ORDER[b.id] ?? 999)
  );
}

export function sortBedSizes<T extends { id: number }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => (BED_SIZE_SORT_ORDER[a.id] ?? 999) - (BED_SIZE_SORT_ORDER[b.id] ?? 999)
  );
}

/** Smallest allowed bed size (used as default auto-fill) */
export function getSmallestBedSizeId(allowedIds: number[]): number | undefined {
  if (!allowedIds.length) return undefined;
  return [...allowedIds].sort(
    (a, b) => (BED_SIZE_SORT_ORDER[a] ?? 999) - (BED_SIZE_SORT_ORDER[b] ?? 999)
  )[0];
}
