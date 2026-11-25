import type { AvailabilityReason, AvailabilityResult, Booking, Room } from '@/types';
import { checkAvailability, DAY_MINUTES, MAX_DURATION_MINUTES } from '@/utils/availability';
import { minutesToTime, timeToMinutes } from '@/utils/time';

// Practice #12 — shared contract used by BOTH the code-based and the low-code solution.
//
//   Inputs : start time ("HH:MM"), duration (minutes, raw form value), blocked flag,
//            fictional bookings, simulated current time ("HH:MM").
//   Outputs: available (boolean), reasonCode, visible message.
//
// Three layers, kept separate on purpose:
//   1. validateRequest()      — input validation only (AC1, AC2, AC6)
//   2. checkAvailability()    — the UNCHANGED booking rule engine in availability.ts (AC3, AC4)
//   3. UI components          — display only; they never re-implement a rule

export type ReasonCode =
  | 'AVAILABLE'
  | 'OVERLAP'
  | 'ROOM_BLOCKED'
  | 'PAST_START'
  | 'INVALID_DURATION'
  | 'INVALID_TIME'
  | 'OUTSIDE_DAY';

export interface CheckRequest {
  start: string;
  duration: string | number;
  blocked: boolean;
  now: string;
  bookings: readonly Booking[];
}

export interface CheckResponse {
  available: boolean;
  reasonCode: ReasonCode;
  message: string;
  /** true when the request was rejected by validation before the rule engine ran */
  validationError: boolean;
  /** parsed interval in minutes (present when start and duration were valid) */
  start?: number;
  end?: number;
  /** full rule-engine result (present only when validation passed) */
  result?: AvailabilityResult;
}

export const MESSAGES = {
  INVALID_TIME_START: 'Enter a start time in HH:MM format.',
  INVALID_TIME_NOW: 'Enter the current time in HH:MM format.',
  DURATION_BLANK: 'Enter a duration in minutes.',
  DURATION_NOT_INTEGER: 'Duration must be a whole number of minutes.',
  DURATION_ZERO: 'Duration must be greater than 0 minutes.',
  DURATION_TOO_LONG: `Duration cannot be more than ${MAX_DURATION_MINUTES} minutes.`,
  OUTSIDE_DAY: 'The booking must end by 24:00 on the same day.',
  ROOM_BLOCKED: 'Room is blocked and cannot be booked.',
  AVAILABLE: 'Room is available for this time.',
} as const;

const fail = (reasonCode: ReasonCode, message: string, extra: Partial<CheckResponse> = {}): CheckResponse => ({
  available: false,
  reasonCode,
  message,
  validationError: true,
  ...extra,
});

export type Validation =
  | { ok: true; start: number; end: number; now: number }
  | { ok: false; response: CheckResponse };

/** Layer 1 — validation only. Never looks at bookings or the blocked flag. */
export function validateRequest(req: Pick<CheckRequest, 'start' | 'duration' | 'now'>): Validation {
  const start = timeToMinutes(String(req.start ?? '').trim());
  if (start === null) return { ok: false, response: fail('INVALID_TIME', MESSAGES.INVALID_TIME_START) };

  const now = timeToMinutes(String(req.now ?? '').trim());
  if (now === null) return { ok: false, response: fail('INVALID_TIME', MESSAGES.INVALID_TIME_NOW) };

  const raw = String(req.duration ?? '').trim();
  if (raw === '') return { ok: false, response: fail('INVALID_DURATION', MESSAGES.DURATION_BLANK) };
  // Digits only: rejects "1.5", "-5", "1e2", " 60abc", "<script>" before any number conversion.
  if (!/^\d{1,4}$/.test(raw)) return { ok: false, response: fail('INVALID_DURATION', MESSAGES.DURATION_NOT_INTEGER) };
  const duration = Number(raw);
  if (duration <= 0) return { ok: false, response: fail('INVALID_DURATION', MESSAGES.DURATION_ZERO) };
  if (duration > MAX_DURATION_MINUTES) {
    return { ok: false, response: fail('INVALID_DURATION', MESSAGES.DURATION_TOO_LONG) };
  }

  const end = start + duration;
  if (start <= now) {
    return {
      ok: false,
      response: fail('PAST_START', `Start time must be in the future (after the current time ${minutesToTime(now)}).`, { start, end }),
    };
  }
  if (end > DAY_MINUTES) return { ok: false, response: fail('OUTSIDE_DAY', MESSAGES.OUTSIDE_DAY, { start, end }) };

  return { ok: true, start, end, now };
}

const REASON_TO_CODE: Record<AvailabilityReason, ReasonCode> = {
  available: 'AVAILABLE',
  overlaps_booking: 'OVERLAP',
  room_blocked: 'ROOM_BLOCKED',
  // The three codes below cannot be reached after validation; mapped defensively.
  start_after_now: 'PAST_START',
  too_long: 'INVALID_DURATION',
  invalid_interval: 'OUTSIDE_DAY',
};

/** Contract entry point: validation → unchanged rule engine → reason code + visible message. */
export function checkRequest(base: Room, req: CheckRequest): CheckResponse {
  const v = validateRequest(req);
  if (!v.ok) return v.response;

  // A fresh room object: the caller's room and booking array are never touched (AC5 / T8).
  const room: Room = { ...base, blocked: req.blocked, bookings: [...req.bookings] };
  const result = checkAvailability(room, v.start, v.end, v.now);
  const reasonCode = REASON_TO_CODE[result.reason];

  let message: string;
  if (reasonCode === 'OVERLAP' && result.conflictingBooking) {
    const b = result.conflictingBooking;
    message = `Overlaps an existing booking: ${b.title} (${minutesToTime(b.start)}–${minutesToTime(b.end)}).`;
  } else if (reasonCode === 'ROOM_BLOCKED') {
    message = MESSAGES.ROOM_BLOCKED;
  } else if (reasonCode === 'AVAILABLE') {
    message = `${MESSAGES.AVAILABLE} ${minutesToTime(v.start)}–${minutesToTime(v.end)}`;
  } else {
    message = result.message;
  }

  return {
    available: result.available,
    reasonCode,
    message,
    validationError: false,
    start: v.start,
    end: v.end,
    result,
  };
}
