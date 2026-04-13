/**
 * Mock in-memory data store for Front Desk development.
 * Mirrors the structure of dev.kacc.mn API.
 * All data is mutable: get, create, update, delete.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoomType {
  id: number;
  hotel: number;
  name: string;
  base_price: number;
  max_occupancy: number;
  image_url: string;
}

export interface Room {
  id: number;
  hotel: number;
  room_number: string;
  room_type: number;
  floor: number;
  status: 'available' | 'maintenance' | 'blocked';
}

export interface Guest {
  id: number;
  hotel: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  notes: string;
  created_at: string;
}

export interface ExtraService {
  name: string;
  price: number;
}

export type BookingStatus = 'confirmed' | 'draft' | 'checked_in' | 'checked_out' | 'cancelled';
export type BookingChannel = 'reception' | 'online' | 'phone' | 'agency' | 'corp';

export type CleaningStatus = 'needs_cleaning' | 'in_progress' | 'clean' | 'dirty' | 'replace';
export type CleaningPriority = 'urgent' | 'normal' | 'low';

export interface HousekeepingTask {
  id: number;
  hotel: number;
  room_id: number;
  room_number: string;
  room_type_id: number;
  room_type_name: string;
  floor: number;
  cleaning_status: CleaningStatus;
  priority: CleaningPriority;
  booking_status: string;
  notes: string;
  assigned_to: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  hotel: number;
  room_ids: number[];
  guest_id: number;
  check_in: string;      // 'YYYY-MM-DD'
  check_out: string;     // 'YYYY-MM-DD'
  check_in_time: string; // 'HH:MM'
  check_out_time: string;
  adults: number;
  children: number;
  status: BookingStatus;
  channel: BookingChannel;
  corporate_id: number | null;
  extra_services: ExtraService[];
  discount_percent: number;
  notes: string;
  total_price: number;
  created_at: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const HOTEL_ID = 1;

const roomTypes: RoomType[] = [
  { id: 1, hotel: HOTEL_ID, name: 'Standard Single Room', base_price: 120000, max_occupancy: 2, image_url: '/images/room-standard.jpg' },
  { id: 2, hotel: HOTEL_ID, name: 'Deluxe Double Room',   base_price: 180000, max_occupancy: 3, image_url: '/images/room-deluxe.jpg'   },
  { id: 3, hotel: HOTEL_ID, name: 'Suite Twin Room',       base_price: 250000, max_occupancy: 4, image_url: '/images/room-suite.jpg'    },
  { id: 4, hotel: HOTEL_ID, name: 'Family Room',           base_price: 320000, max_occupancy: 5, image_url: '/images/room-family.jpg'   },
];

// 24 rooms across 4 types
const rooms: Room[] = [
  // Standard Single – floor 2
  { id: 101, hotel: HOTEL_ID, room_number: '201', room_type: 1, floor: 2, status: 'available' },
  { id: 102, hotel: HOTEL_ID, room_number: '202', room_type: 1, floor: 2, status: 'available' },
  { id: 103, hotel: HOTEL_ID, room_number: '203', room_type: 1, floor: 2, status: 'available' },
  { id: 104, hotel: HOTEL_ID, room_number: '204', room_type: 1, floor: 2, status: 'available' },
  { id: 105, hotel: HOTEL_ID, room_number: '205', room_type: 1, floor: 2, status: 'maintenance' },
  { id: 106, hotel: HOTEL_ID, room_number: '206', room_type: 1, floor: 2, status: 'available' },
  // Deluxe Double – floor 3
  { id: 201, hotel: HOTEL_ID, room_number: '301', room_type: 2, floor: 3, status: 'available' },
  { id: 202, hotel: HOTEL_ID, room_number: '302', room_type: 2, floor: 3, status: 'available' },
  { id: 203, hotel: HOTEL_ID, room_number: '303', room_type: 2, floor: 3, status: 'available' },
  { id: 204, hotel: HOTEL_ID, room_number: '304', room_type: 2, floor: 3, status: 'available' },
  { id: 205, hotel: HOTEL_ID, room_number: '305', room_type: 2, floor: 3, status: 'available' },
  { id: 206, hotel: HOTEL_ID, room_number: '306', room_type: 2, floor: 3, status: 'available' },
  // Suite Twin – floor 4
  { id: 301, hotel: HOTEL_ID, room_number: '401', room_type: 3, floor: 4, status: 'available' },
  { id: 302, hotel: HOTEL_ID, room_number: '402', room_type: 3, floor: 4, status: 'available' },
  { id: 303, hotel: HOTEL_ID, room_number: '403', room_type: 3, floor: 4, status: 'available' },
  { id: 304, hotel: HOTEL_ID, room_number: '404', room_type: 3, floor: 4, status: 'available' },
  { id: 305, hotel: HOTEL_ID, room_number: '405', room_type: 3, floor: 4, status: 'blocked' },
  // Family – floor 5
  { id: 401, hotel: HOTEL_ID, room_number: '501', room_type: 4, floor: 5, status: 'available' },
  { id: 402, hotel: HOTEL_ID, room_number: '502', room_type: 4, floor: 5, status: 'available' },
  { id: 403, hotel: HOTEL_ID, room_number: '503', room_type: 4, floor: 5, status: 'available' },
];

const guests: Guest[] = [
  { id: 1, hotel: HOTEL_ID, first_name: 'Zolzaya',  last_name: 'Zorig',   phone: '99954644', email: 'zolzaya@gmail.com',   notes: '',               created_at: '2026-03-01T10:00:00Z' },
  { id: 2, hotel: HOTEL_ID, first_name: 'Bayaraa',  last_name: 'Gantulga',phone: '88112233', email: 'bayaraa@gmail.com',   notes: 'VIP guest',      created_at: '2026-03-05T09:30:00Z' },
  { id: 3, hotel: HOTEL_ID, first_name: 'Enkhjin',  last_name: 'Gantulga',phone: '99001122', email: 'enkhjin@mail.mn',     notes: '',               created_at: '2026-03-10T14:00:00Z' },
  { id: 4, hotel: HOTEL_ID, first_name: 'Tserenpuntsag', last_name: 'Bold', phone: '99887766', email: '',               notes: 'Late check-out',  created_at: '2026-03-12T11:00:00Z' },
  { id: 5, hotel: HOTEL_ID, first_name: 'Otgonbayar', last_name: 'Munkh', phone: '88334455', email: 'otgon@corp.mn',      notes: 'Corp booking',   created_at: '2026-03-15T08:00:00Z' },
  { id: 6, hotel: HOTEL_ID, first_name: 'Narantuya', last_name: 'Davaajav', phone: '99223344',email: 'narantuya@yg.mn', notes: '',               created_at: '2026-04-01T12:00:00Z' },
];

const bookings: Booking[] = [
  {
    id: 1001,
    hotel: HOTEL_ID,
    room_ids: [101, 102],
    guest_id: 1,
    check_in: '2026-04-10',
    check_out: '2026-04-14',
    check_in_time: '14:00',
    check_out_time: '12:00',
    adults: 2,
    children: 0,
    status: 'checked_in',
    channel: 'reception',
    corporate_id: null,
    extra_services: [{ name: 'Өглөөний цай', price: 20000 }],
    discount_percent: 0,
    notes: '',
    total_price: 480000,
    created_at: '2026-04-09T10:00:00Z',
  },
  {
    id: 1002,
    hotel: HOTEL_ID,
    room_ids: [201],
    guest_id: 2,
    check_in: '2026-04-12',
    check_out: '2026-04-16',
    check_in_time: '15:00',
    check_out_time: '12:00',
    adults: 1,
    children: 1,
    status: 'confirmed',
    channel: 'online',
    corporate_id: null,
    extra_services: [],
    discount_percent: 10,
    notes: 'VIP – хамгийн дээд давхар',
    total_price: 648000,
    created_at: '2026-04-08T14:30:00Z',
  },
  {
    id: 1003,
    hotel: HOTEL_ID,
    room_ids: [301],
    guest_id: 3,
    check_in: '2026-04-13',
    check_out: '2026-04-15',
    check_in_time: '14:00',
    check_out_time: '11:00',
    adults: 2,
    children: 1,
    status: 'confirmed',
    channel: 'phone',
    corporate_id: null,
    extra_services: [{ name: 'Усан сан', price: 15000 }, { name: 'Буфет', price: 25000 }],
    discount_percent: 0,
    notes: '',
    total_price: 540000,
    created_at: '2026-04-10T09:00:00Z',
  },
  {
    id: 1004,
    hotel: HOTEL_ID,
    room_ids: [202, 203],
    guest_id: 4,
    check_in: '2026-04-11',
    check_out: '2026-04-13',
    check_in_time: '14:00',
    check_out_time: '12:00',
    adults: 3,
    children: 0,
    status: 'checked_in',
    channel: 'corp',
    corporate_id: 1,
    extra_services: [],
    discount_percent: 15,
    notes: 'Гэрээт байгууллага – Монгол Банк',
    total_price: 612000,
    created_at: '2026-04-07T16:00:00Z',
  },
  {
    id: 1005,
    hotel: HOTEL_ID,
    room_ids: [103],
    guest_id: 5,
    check_in: '2026-04-08',
    check_out: '2026-04-13',
    check_in_time: '14:00',
    check_out_time: '12:00',
    adults: 1,
    children: 0,
    status: 'checked_in',
    channel: 'online',
    corporate_id: null,
    extra_services: [],
    discount_percent: 0,
    notes: '',
    total_price: 600000,
    created_at: '2026-04-06T11:00:00Z',
  },
  {
    id: 1006,
    hotel: HOTEL_ID,
    room_ids: [401],
    guest_id: 6,
    check_in: '2026-04-14',
    check_out: '2026-04-18',
    check_in_time: '14:00',
    check_out_time: '12:00',
    adults: 2,
    children: 2,
    status: 'confirmed',
    channel: 'reception',
    corporate_id: null,
    extra_services: [{ name: 'Хүүхдийн ор', price: 30000 }],
    discount_percent: 0,
    notes: '',
    total_price: 1310000,
    created_at: '2026-04-11T10:00:00Z',
  },
  {
    id: 1007,
    hotel: HOTEL_ID,
    room_ids: [302, 303],
    guest_id: 1,
    check_in: '2026-04-15',
    check_out: '2026-04-20',
    check_in_time: '14:00',
    check_out_time: '12:00',
    adults: 4,
    children: 0,
    status: 'confirmed',
    channel: 'reception',
    corporate_id: null,
    extra_services: [],
    discount_percent: 5,
    notes: '',
    total_price: 2375000,
    created_at: '2026-04-12T08:30:00Z',
  },
  {
    id: 1008,
    hotel: HOTEL_ID,
    room_ids: [104],
    guest_id: 3,
    check_in: '2026-04-16',
    check_out: '2026-04-19',
    check_in_time: '14:00',
    check_out_time: '12:00',
    adults: 2,
    children: 0,
    status: 'draft',
    channel: 'reception',
    corporate_id: null,
    extra_services: [],
    discount_percent: 0,
    notes: 'Түр хадгалсан',
    total_price: 360000,
    created_at: '2026-04-13T09:00:00Z',
  },
];

// ─── Housekeeping seed ────────────────────────────────────────────────────────

const housekeepingTasks: HousekeepingTask[] = [
  { id: 1,  hotel: HOTEL_ID, room_id: 101, room_number: '201', room_type_id: 1, room_type_name: 'Standard Single Room', floor: 2, cleaning_status: 'clean',          priority: 'normal', booking_status: 'checked_in',  notes: 'Өдөр тутмын цэвэрлэгээ',   assigned_to: 'Болормаа',  updated_at: '2026-04-13T08:00:00Z' },
  { id: 2,  hotel: HOTEL_ID, room_id: 102, room_number: '202', room_type_id: 1, room_type_name: 'Standard Single Room', floor: 2, cleaning_status: 'needs_cleaning', priority: 'urgent', booking_status: 'checked_out', notes: 'Зочин гарлаа',              assigned_to: 'Болормаа',  updated_at: '2026-04-13T09:00:00Z' },
  { id: 3,  hotel: HOTEL_ID, room_id: 103, room_number: '203', room_type_id: 1, room_type_name: 'Standard Single Room', floor: 2, cleaning_status: 'dirty',          priority: 'urgent', booking_status: 'checked_in',  notes: 'Агааржуулагч ажиллахгүй',   assigned_to: 'Сарнай',    updated_at: '2026-04-13T07:30:00Z' },
  { id: 4,  hotel: HOTEL_ID, room_id: 104, room_number: '204', room_type_id: 1, room_type_name: 'Standard Single Room', floor: 2, cleaning_status: 'replace',        priority: 'normal', booking_status: 'confirmed',   notes: 'Дэрний хавтас солих',       assigned_to: 'Сарнай',    updated_at: '2026-04-13T10:00:00Z' },
  { id: 5,  hotel: HOTEL_ID, room_id: 105, room_number: '205', room_type_id: 1, room_type_name: 'Standard Single Room', floor: 2, cleaning_status: 'needs_cleaning', priority: 'low',    booking_status: 'available',   notes: 'Их цэвэрлэгээ',             assigned_to: '',          updated_at: '2026-04-13T11:00:00Z' },
  { id: 6,  hotel: HOTEL_ID, room_id: 106, room_number: '206', room_type_id: 1, room_type_name: 'Standard Single Room', floor: 2, cleaning_status: 'clean',          priority: 'normal', booking_status: 'confirmed',   notes: 'Өдөр тутмын цэвэрлэгээ',   assigned_to: 'Болормаа',  updated_at: '2026-04-13T08:30:00Z' },
  { id: 7,  hotel: HOTEL_ID, room_id: 201, room_number: '301', room_type_id: 2, room_type_name: 'Deluxe Double Room',   floor: 3, cleaning_status: 'in_progress',    priority: 'normal', booking_status: 'checked_in',  notes: 'Цэвэрлэж байна',            assigned_to: 'Оюунаа',   updated_at: '2026-04-13T09:30:00Z' },
  { id: 8,  hotel: HOTEL_ID, room_id: 202, room_number: '302', room_type_id: 2, room_type_name: 'Deluxe Double Room',   floor: 3, cleaning_status: 'dirty',          priority: 'urgent', booking_status: 'checked_out', notes: 'Зочин гарлаа, яаралтай',   assigned_to: 'Оюунаа',   updated_at: '2026-04-13T10:30:00Z' },
  { id: 9,  hotel: HOTEL_ID, room_id: 203, room_number: '303', room_type_id: 2, room_type_name: 'Deluxe Double Room',   floor: 3, cleaning_status: 'needs_cleaning', priority: 'normal', booking_status: 'confirmed',   notes: 'Стандарт цэвэрлэгээ',       assigned_to: '',          updated_at: '2026-04-13T11:30:00Z' },
  { id: 10, hotel: HOTEL_ID, room_id: 204, room_number: '304', room_type_id: 2, room_type_name: 'Deluxe Double Room',   floor: 3, cleaning_status: 'clean',          priority: 'low',    booking_status: 'available',   notes: '',                          assigned_to: 'Сарнай',    updated_at: '2026-04-13T08:00:00Z' },
  { id: 11, hotel: HOTEL_ID, room_id: 205, room_number: '305', room_type_id: 2, room_type_name: 'Deluxe Double Room',   floor: 3, cleaning_status: 'replace',        priority: 'normal', booking_status: 'checked_in',  notes: 'Алчуур солих',              assigned_to: 'Болормаа',  updated_at: '2026-04-13T12:00:00Z' },
  { id: 12, hotel: HOTEL_ID, room_id: 206, room_number: '306', room_type_id: 2, room_type_name: 'Deluxe Double Room',   floor: 3, cleaning_status: 'needs_cleaning', priority: 'urgent', booking_status: 'checked_in',  notes: 'Ор дарчин солих',           assigned_to: 'Оюунаа',   updated_at: '2026-04-13T09:00:00Z' },
  { id: 13, hotel: HOTEL_ID, room_id: 301, room_number: '401', room_type_id: 3, room_type_name: 'Suite Twin Room',       floor: 4, cleaning_status: 'clean',          priority: 'normal', booking_status: 'confirmed',   notes: 'VIP зочин ирнэ',           assigned_to: 'Сарнай',    updated_at: '2026-04-13T07:00:00Z' },
  { id: 14, hotel: HOTEL_ID, room_id: 302, room_number: '402', room_type_id: 3, room_type_name: 'Suite Twin Room',       floor: 4, cleaning_status: 'in_progress',    priority: 'urgent', booking_status: 'checked_in',  notes: 'Их цэвэрлэгээ',            assigned_to: 'Болормаа',  updated_at: '2026-04-13T10:00:00Z' },
  { id: 15, hotel: HOTEL_ID, room_id: 303, room_number: '403', room_type_id: 3, room_type_name: 'Suite Twin Room',       floor: 4, cleaning_status: 'dirty',          priority: 'low',    booking_status: 'available',   notes: '',                          assigned_to: '',          updated_at: '2026-04-13T11:00:00Z' },
  { id: 16, hotel: HOTEL_ID, room_id: 401, room_number: '501', room_type_id: 4, room_type_name: 'Family Room',           floor: 5, cleaning_status: 'needs_cleaning', priority: 'normal', booking_status: 'confirmed',   notes: 'Хүүхдийн ор нэмэх',        assigned_to: 'Оюунаа',   updated_at: '2026-04-13T13:00:00Z' },
  { id: 17, hotel: HOTEL_ID, room_id: 402, room_number: '502', room_type_id: 4, room_type_name: 'Family Room',           floor: 5, cleaning_status: 'clean',          priority: 'normal', booking_status: 'available',   notes: '',                          assigned_to: 'Сарнай',    updated_at: '2026-04-13T08:00:00Z' },
  { id: 18, hotel: HOTEL_ID, room_id: 403, room_number: '503', room_type_id: 4, room_type_name: 'Family Room',           floor: 5, cleaning_status: 'replace',        priority: 'low',    booking_status: 'checked_out', notes: 'Гэр бүлийн иж бүрэн',      assigned_to: '',          updated_at: '2026-04-13T14:00:00Z' },
];

// ─── Counters (auto-increment IDs) ────────────────────────────────────────────

let nextBookingId = 2000;
let nextGuestId    = 100;
let nextTaskId     = 100;

// ─── Store API ────────────────────────────────────────────────────────────────

export const store = {
  // ── Room Types ─────────────────────────────────────────────────────────────

  getRoomTypes(): RoomType[] {
    return roomTypes;
  },

  getRoomTypeById(id: number): RoomType | undefined {
    return roomTypes.find((rt) => rt.id === id);
  },

  // ── Rooms ──────────────────────────────────────────────────────────────────

  getRooms(): Room[] {
    return rooms;
  },

  getRoomById(id: number): Room | undefined {
    return rooms.find((r) => r.id === id);
  },

  /** Returns rooms grouped by type, with availability count for a date range */
  getRoomsAvailability(checkIn: string, checkOut: string): { room_type: RoomType; rooms: Room[]; available: number }[] {
    const occupiedRoomIds = new Set<number>();
    bookings.forEach((b) => {
      if (b.status === 'cancelled') return;
      // Overlap: booking starts before checkout AND booking ends after checkin
      if (b.check_in < checkOut && b.check_out > checkIn) {
        b.room_ids.forEach((rid) => occupiedRoomIds.add(rid));
      }
    });

    return roomTypes.map((rt) => {
      const typeRooms = rooms.filter((r) => r.room_type === rt.id);
      const available = typeRooms.filter(
        (r) => r.status === 'available' && !occupiedRoomIds.has(r.id)
      ).length;
      return { room_type: rt, rooms: typeRooms, available };
    });
  },

  // ── Guests ─────────────────────────────────────────────────────────────────

  getGuests(): Guest[] {
    return guests;
  },

  getGuestById(id: number): Guest | undefined {
    return guests.find((g) => g.id === id);
  },

  createGuest(data: Omit<Guest, 'id' | 'hotel' | 'created_at'>): Guest {
    const guest: Guest = {
      ...data,
      id: nextGuestId++,
      hotel: HOTEL_ID,
      created_at: new Date().toISOString(),
    };
    guests.push(guest);
    return guest;
  },

  updateGuest(id: number, data: Partial<Omit<Guest, 'id' | 'hotel' | 'created_at'>>): Guest | null {
    const idx = guests.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    guests[idx] = { ...guests[idx], ...data };
    return guests[idx];
  },

  deleteGuest(id: number): boolean {
    const idx = guests.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    guests.splice(idx, 1);
    return true;
  },

  // ── Bookings ───────────────────────────────────────────────────────────────

  getBookings(filters?: { status?: BookingStatus; date?: string }): Booking[] {
    let result = [...bookings];
    if (filters?.status) result = result.filter((b) => b.status === filters.status);
    if (filters?.date) {
      result = result.filter(
        (b) => b.check_in <= filters.date! && b.check_out > filters.date!
      );
    }
    return result;
  },

  getBookingById(id: number): Booking | undefined {
    return bookings.find((b) => b.id === id);
  },

  createBooking(data: Omit<Booking, 'id' | 'hotel' | 'created_at'>): Booking {
    const booking: Booking = {
      ...data,
      id: nextBookingId++,
      hotel: HOTEL_ID,
      created_at: new Date().toISOString(),
    };
    bookings.push(booking);
    return booking;
  },

  updateBooking(id: number, data: Partial<Omit<Booking, 'id' | 'hotel' | 'created_at'>>): Booking | null {
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    bookings[idx] = { ...bookings[idx], ...data };
    return bookings[idx];
  },

  deleteBooking(id: number): boolean {
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    bookings.splice(idx, 1);
    return true;
  },

  // ── Occupancy Stats ────────────────────────────────────────────────────────

  /** Returns daily occupancy % for a date range (exclusive end) */
  getOccupancy(startDate: string, endDate: string): { date: string; percent: number; occupied: number; total: number }[] {
    const totalRooms = rooms.filter((r) => r.status !== 'maintenance').length;
    const result: { date: string; percent: number; occupied: number; total: number }[] = [];

    const cursor = new Date(startDate);
    const end    = new Date(endDate);

    while (cursor < end) {
      const dateStr = cursor.toISOString().split('T')[0];
      const occupied = bookings.filter((b) => {
        if (b.status === 'cancelled') return false;
        return b.check_in <= dateStr && b.check_out > dateStr;
      }).reduce((sum, b) => sum + b.room_ids.length, 0);

      result.push({
        date: dateStr,
        occupied,
        total: totalRooms,
        percent: totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  },

  /** Summary stats for "today" bar */
  getTodayStats(today: string) {
    const activeBookings = bookings.filter(
      (b) => b.status !== 'cancelled' && b.check_in <= today && b.check_out > today
    );
    const occupiedRoomIds = new Set<number>(activeBookings.flatMap((b) => b.room_ids));
    const totalGuests = activeBookings.reduce((sum, b) => sum + b.adults + b.children, 0);
    const totalRooms  = rooms.filter((r) => r.status !== 'maintenance').length;
    const revenue     = bookings
      .filter((b) => b.status === 'checked_in' || b.status === 'checked_out')
      .filter((b) => b.check_in <= today && b.check_out > today)
      .reduce((sum, b) => sum + b.total_price, 0);

    return {
      total_bookings: activeBookings.length,
      occupied_rooms: occupiedRoomIds.size,
      total_guests:   totalGuests,
      free_rooms:     totalRooms - occupiedRoomIds.size,
      revenue,
    };
  },

  // ── Housekeeping ───────────────────────────────────────────────────────────

  getHousekeepingTasks(filters?: {
    cleaning_status?: CleaningStatus;
    priority?: CleaningPriority;
    floor?: number;
  }): HousekeepingTask[] {
    let result = [...housekeepingTasks];
    if (filters?.cleaning_status) result = result.filter((t) => t.cleaning_status === filters.cleaning_status);
    if (filters?.priority)        result = result.filter((t) => t.priority === filters.priority);
    if (filters?.floor != null)   result = result.filter((t) => t.floor === filters.floor);
    return result;
  },

  getHousekeepingTaskById(id: number): HousekeepingTask | undefined {
    return housekeepingTasks.find((t) => t.id === id);
  },

  createHousekeepingTask(data: Omit<HousekeepingTask, 'id' | 'hotel' | 'updated_at'>): HousekeepingTask {
    const task: HousekeepingTask = {
      ...data,
      id: nextTaskId++,
      hotel: HOTEL_ID,
      updated_at: new Date().toISOString(),
    };
    housekeepingTasks.push(task);
    return task;
  },

  updateHousekeepingTask(
    id: number,
    data: Partial<Omit<HousekeepingTask, 'id' | 'hotel'>>
  ): HousekeepingTask | null {
    const idx = housekeepingTasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    housekeepingTasks[idx] = {
      ...housekeepingTasks[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return housekeepingTasks[idx];
  },

  deleteHousekeepingTask(id: number): boolean {
    const idx = housekeepingTasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    housekeepingTasks.splice(idx, 1);
    return true;
  },
};
