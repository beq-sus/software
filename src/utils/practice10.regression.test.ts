import { describe, it, expect } from 'vitest';
import { checkAvailability } from '@/utils/availability';
import { slotDurationLabel, timeToMinutes } from '@/utils/time';
import { ROOM, TEST_CASES } from '@/data';

const m = (hhmm: string) => timeToMinutes(hhmm) as number;

describe('R01 duration label for reversed or empty intervals', () => {
  it('14:00–13:00 (reversed) shows a dash', () => {
    expect(slotDurationLabel(m('14:00'), m('13:00'))).toBe('—');
  });

  it('12:00–12:00 (zero length) shows a dash', () => {
    expect(slotDurationLabel(m('12:00'), m('12:00'))).toBe('—');
  });

  it('11:00–12:00 shows 60 min and 11:00–13:00 shows 120 min', () => {
    expect(slotDurationLabel(m('11:00'), m('12:00'))).toBe('60 min');
    expect(slotDurationLabel(m('11:00'), m('13:00'))).toBe('120 min');
  });

  it('in-page "End before start" case stays invalid_interval and shows a dash', () => {
    const tc = TEST_CASES.find((c) => c.id === 'tc-invalid');
    if (!tc) throw new Error('tc-invalid fixture missing');
    const start = m(tc.start);
    const end = m(tc.end);
    expect(checkAvailability(ROOM, start, end, m(tc.currentTime)).reason).toBe('invalid_interval');
    expect(slotDurationLabel(start, end)).toBe('—');
  });
});
