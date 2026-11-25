export interface Room {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  blocked: boolean;
  blockReason?: string;
  bookings: Booking[];
}

export interface Booking {
  id: string;
  title: string;
  bookedBy: string;
  start: number;
  end: number;
}

export type AvailabilityReason =
  | 'available'
  | 'invalid_interval'
  | 'start_after_now'
  | 'too_long'
  | 'room_blocked'
  | 'overlaps_booking';

export interface AvailabilityResult {
  available: boolean;
  reason: AvailabilityReason;
  message: string;
  conflictingBooking?: Booking;
}

export interface TestCase {
  id: string;
  label: string;
  description: string;
  start: string;
  end: string;
  currentTime: string;
  expectedReason: AvailabilityReason;
}
