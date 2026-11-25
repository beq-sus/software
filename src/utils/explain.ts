import type { AvailabilityResult, AvailabilityReason, Room } from '@/types';
import { MAX_DURATION_MINUTES } from '@/utils/availability';
import { minutesToLabel } from '@/utils/time';

// Mock adapter for an optional explanation service. The deterministic checker
// in availability.ts stays the sole authority; this only restates its verdict.

export const MAX_EXPLANATION_LENGTH = 400;

export const FALLBACK_EXPLANATION =
  'Sorry, an explanation is not available right now. The availability decision above is still accurate.';

export interface ExplanationRequest {
  result: AvailabilityResult;
  room: Room;
  start: number;
  end: number;
}

export type ExplanationOutcome =
  | { ok: true; explanation: string }
  | { ok: false; explanation: string };

export type ExplainTransport = (req: ExplanationRequest) => Promise<string>;

/**
 * Identity of the decision being explained. The Explanation component is keyed
 * by this value so a new check always discards the previous explanation text
 * instead of showing it under a different verdict (risk R01).
 */
export function explanationKey(result: AvailabilityResult, start: number, end: number): string {
  return [result.reason, start, end, result.conflictingBooking?.id ?? '-', result.message].join('|');
}

const KNOWN_REASONS: ReadonlySet<AvailabilityReason> = new Set([
  'available',
  'invalid_interval',
  'start_after_now',
  'too_long',
  'room_blocked',
  'overlaps_booking',
]);

function assertValidRequest(req: ExplanationRequest): void {
  if (typeof req !== 'object' || req === null) {
    throw new Error('explanation request is missing');
  }
  if (!req.result || !KNOWN_REASONS.has(req.result.reason)) {
    throw new Error('unknown availability reason');
  }
  if (!Number.isFinite(req.start) || !Number.isFinite(req.end)) {
    throw new Error('slot times must be finite numbers');
  }
  if (typeof req.room !== 'object' || req.room === null || !Array.isArray(req.room.bookings)) {
    throw new Error('room data is missing');
  }
}

function buildExplanation(req: ExplanationRequest): string {
  const { result, room, start, end } = req;
  const startLabel = minutesToLabel(start);
  const endLabel = minutesToLabel(end);

  switch (result.reason) {
    case 'available':
      return (
        `${room.name} is free from ${startLabel} to ${endLabel}. ` +
        `The request starts after the current time, fits within the ${MAX_DURATION_MINUTES}-minute limit, ` +
        'and does not overlap any existing booking.'
      );
    case 'invalid_interval':
      return (
        'The request was rejected because the start time must be before the end time, ' +
        'and both times must fall within 00:00–24:00.'
      );
    case 'start_after_now':
      return (
        `The request was rejected because the start time (${startLabel}) is not after ` +
        'the current time. Choose a start time later than the simulated "now".'
      );
    case 'too_long':
      return (
        `The request was rejected because it would last ${end - start} minutes, ` +
        `which is longer than the ${MAX_DURATION_MINUTES}-minute limit. ` +
        `Shorten the slot to ${MAX_DURATION_MINUTES} minutes or less.`
      );
    case 'room_blocked':
      return (
        `${room.name} is currently blocked and cannot be booked` +
        (room.blockReason ? `: ${room.blockReason}` : '.')
      );
    case 'overlaps_booking': {
      const b = result.conflictingBooking;
      if (!b) throw new Error('overlap result is missing the conflicting booking');
      return (
        `The request overlaps "${b.title}" (${minutesToLabel(b.start)}–${minutesToLabel(b.end)}), ` +
        `booked by ${b.bookedBy}. Try a slot that starts at ${minutesToLabel(b.end)} or later.`
      );
    }
  }
}

const mockTransport: ExplainTransport = async (req) => {
  assertValidRequest(req);
  return buildExplanation(req);
};

export async function explainAvailability(
  req: ExplanationRequest,
  transport: ExplainTransport = mockTransport
): Promise<ExplanationOutcome> {
  try {
    const raw = await transport(req);
    if (typeof raw !== 'string') throw new Error('explanation must be a string');
    const trimmed = raw.trim();
    if (!trimmed) throw new Error('explanation must not be empty');
    return {
      ok: true,
      explanation:
        trimmed.length > MAX_EXPLANATION_LENGTH
          ? trimmed.slice(0, MAX_EXPLANATION_LENGTH)
          : trimmed,
    };
  } catch {
    return { ok: false, explanation: FALLBACK_EXPLANATION };
  }
}
