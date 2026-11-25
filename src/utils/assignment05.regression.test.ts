import { describe, it, expect } from 'vitest';
import { ROOM, TEST_CASES } from '@/data';
import { checkAvailability } from '@/utils/availability';
import { explanationKey } from '@/utils/explain';
import { timeToMinutes } from '@/utils/time';
import { DEFAULT_SLOT, describeInputError, evaluateSlot, parseSlot } from '@/utils/slot';

const m = (hhmm: string) => timeToMinutes(hhmm) as number;

describe('Refactoring: evaluateSlot gives the same decision as checkAvailability', () => {
  for (const tc of TEST_CASES) {
    it(`${tc.label}: ${tc.start}–${tc.end} (now ${tc.currentTime}) → ${tc.expectedReason}`, () => {
      const evaluation = evaluateSlot(ROOM, { start: tc.start, end: tc.end, currentTime: tc.currentTime });
      expect(evaluation.ok).toBe(true);
      if (!evaluation.ok) throw new Error('expected ok');
      expect(evaluation.result).toEqual(
        checkAvailability(ROOM, m(tc.start), m(tc.end), m(tc.currentTime))
      );
      expect(evaluation.result.reason).toBe(tc.expectedReason);
    });
  }

  it('keeps the original default times 11:00, 12:00 and 08:00', () => {
    expect(DEFAULT_SLOT).toEqual({ start: '11:00', end: '12:00', currentTime: '08:00' });
  });

  it('does not mutate the ROOM fixture', () => {
    const before = JSON.stringify(ROOM);
    for (const tc of TEST_CASES) {
      evaluateSlot(ROOM, { start: tc.start, end: tc.end, currentTime: tc.currentTime });
    }
    expect(JSON.stringify(ROOM)).toBe(before);
  });
});

describe('R02: blank or malformed input gives a message instead of a silent no-op', () => {
  it('blank start time is reported by name', () => {
    const evaluation = evaluateSlot(ROOM, { start: '', end: '12:00', currentTime: '08:00' });
    expect(evaluation.ok).toBe(false);
    if (evaluation.ok) throw new Error('expected error');
    expect(evaluation.error).toContain('start time');
    expect(evaluation.error).not.toContain('end time');
  });

  it('blank end and current time are both reported', () => {
    const error = describeInputError({ start: '11:00', end: '', currentTime: '' });
    expect(error).toContain('end time');
    expect(error).toContain('current time');
  });

  it('malformed values (9:30, 25:00) are rejected; valid values are not', () => {
    expect(parseSlot({ start: '9:30', end: '10:00', currentTime: '08:00' })).toBeNull();
    expect(parseSlot({ start: '11:00', end: '25:00', currentTime: '08:00' })).toBeNull();
    expect(describeInputError({ start: '11:00', end: '12:00', currentTime: '08:00' })).toBeNull();
  });
});

describe('R01: a new decision gets a new explanation identity', () => {
  const available = checkAvailability(ROOM, m('11:00'), m('12:00'), m('08:00'));
  const overlap = checkAvailability(ROOM, m('09:30'), m('10:00'), m('08:00'));

  it('available 11:00–12:00 and overlap 09:30–10:00 have different keys', () => {
    expect(explanationKey(available, m('11:00'), m('12:00'))).not.toBe(
      explanationKey(overlap, m('09:30'), m('10:00'))
    );
  });

  it('same verdict for a different slot also gets a different key', () => {
    const other = checkAvailability(ROOM, m('10:30'), m('11:00'), m('08:00'));
    expect(other.reason).toBe('available');
    expect(explanationKey(available, m('11:00'), m('12:00'))).not.toBe(
      explanationKey(other, m('10:30'), m('11:00'))
    );
  });

  it('re-checking the identical slot keeps the same key', () => {
    const again = checkAvailability(ROOM, m('11:00'), m('12:00'), m('08:00'));
    expect(explanationKey(again, m('11:00'), m('12:00'))).toBe(
      explanationKey(available, m('11:00'), m('12:00'))
    );
  });
});
