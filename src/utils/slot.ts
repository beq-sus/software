import type { AvailabilityResult, Room } from '@/types';
import { checkAvailability } from '@/utils/availability';
import { timeToMinutes } from '@/utils/time';

// Single entry point used by the UI to turn raw "HH:MM" form values into an
// availability decision. The booking rules themselves stay in availability.ts.

export const DEFAULT_SLOT = { start: '11:00', end: '12:00', currentTime: '08:00' } as const;

export interface SlotInput {
  start: string;
  end: string;
  currentTime: string;
}

export interface ParsedSlot {
  start: number;
  end: number;
  currentTime: number;
}

export type SlotEvaluation =
  | { ok: true; slot: ParsedSlot; result: AvailabilityResult }
  | { ok: false; error: string };

const FIELD_LABELS: Record<keyof SlotInput, string> = {
  currentTime: 'current time',
  start: 'start time',
  end: 'end time',
};

export function parseSlot(input: SlotInput): ParsedSlot | null {
  const start = timeToMinutes(input.start);
  const end = timeToMinutes(input.end);
  const currentTime = timeToMinutes(input.currentTime);
  if (start === null || end === null || currentTime === null) return null;
  return { start, end, currentTime };
}

/** Returns a user-facing message for blank or malformed fields, or null if all fields parse. */
export function describeInputError(input: SlotInput): string | null {
  const invalid = (Object.keys(FIELD_LABELS) as (keyof SlotInput)[]).filter(
    (field) => timeToMinutes(input[field]) === null
  );
  if (invalid.length === 0) return null;
  const names = invalid.map((field) => FIELD_LABELS[field]).join(', ');
  return `Please enter a valid ${names} (HH:MM) before checking availability.`;
}

export function evaluateSlot(room: Room, input: SlotInput): SlotEvaluation {
  const slot = parseSlot(input);
  if (!slot) {
    return { ok: false, error: describeInputError(input) ?? 'Please enter valid times (HH:MM).' };
  }
  return { ok: true, slot, result: checkAvailability(room, slot.start, slot.end, slot.currentTime) };
}
