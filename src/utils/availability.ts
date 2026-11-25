import type { AvailabilityResult, AvailabilityReason, Booking, Room } from '@/types';

export const MAX_DURATION_MINUTES = 120;
export const DAY_MINUTES = 1440;

const MESSAGES: Record<AvailabilityReason, string> = {
  available: 'This time slot is available for booking.',
  invalid_interval: 'The start time must be before the end time, and both must be within 00:00–24:00.',
  start_after_now: 'The start time must be after the current time.',
  too_long: 'Bookings cannot be longer than 120 minutes (2 hours).',
  room_blocked: 'This room is currently blocked and cannot be booked.',
  overlaps_booking: 'This time slot overlaps with an existing booking.',
};

export function overlaps(booking: Booking, start: number, end: number): boolean {
  return start < booking.end && end > booking.start;
}

export function checkAvailability(
  room: Room,
  start: number,
  end: number,
  currentTime: number
): AvailabilityResult {
  // AC1: 0 ≤ start < end ≤ 1440
  if (start < 0 || end > DAY_MINUTES || start >= end) {
    return { available: false, reason: 'invalid_interval', message: MESSAGES.invalid_interval };
  }

  // AC1: start must be after the supplied current time
  if (start <= currentTime) {
    return { available: false, reason: 'start_after_now', message: MESSAGES.start_after_now };
  }

  // AC2: reject bookings longer than 120 minutes
  if (end - start > MAX_DURATION_MINUTES) {
    return { available: false, reason: 'too_long', message: MESSAGES.too_long };
  }

  // AC3: reject when room is blocked
  if (room.blocked) {
    return { available: false, reason: 'room_blocked', message: room.blockReason ?? MESSAGES.room_blocked };
  }

  // AC4: reject overlapping intervals; touching endpoints are allowed
  for (const booking of room.bookings) {
    if (overlaps(booking, start, end)) {
      return {
        available: false,
        reason: 'overlaps_booking',
        message: MESSAGES.overlaps_booking,
        conflictingBooking: booking,
      };
    }
  }

  // AC5: return clear Available decision
  return { available: true, reason: 'available', message: MESSAGES.available };
}

export function findConflictingBooking(
  room: Room,
  start: number,
  end: number
): Booking | undefined {
  return room.bookings.find((b) => overlaps(b, start, end));
}
