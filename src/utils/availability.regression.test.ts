import { describe, it, expect } from 'vitest';
import { checkAvailability, MAX_DURATION_MINUTES, overlaps } from '@/utils/availability';
import { timeToMinutes } from '@/utils/time';
import { ROOM, TEST_CASES } from '@/data';

const m = (hhmm: string) => timeToMinutes(hhmm) as number;
const NOW = m('08:00');

describe('Regression on the real ROOM fixture (AC1–AC5)', () => {
  it('AC1: start before the current time (past) → start_after_now', () => {
    const r = checkAvailability(ROOM, m('07:00'), m('07:30'), m('08:30'));
    expect(r.available).toBe(false);
    expect(r.reason).toBe('start_after_now');
  });
  it('AC1: reversed interval 14:00–13:00 → invalid_interval', () => {
    expect(checkAvailability(ROOM, m('14:00'), m('13:00'), NOW).reason).toBe('invalid_interval');
  });
  it('AC2: exactly 120 min → available; 121 min → too_long', () => {
    expect(MAX_DURATION_MINUTES).toBe(120);
    expect(checkAvailability(ROOM, m('11:00'), m('13:00'), NOW).reason).toBe('available');
    expect(checkAvailability(ROOM, m('11:00'), m('13:01'), NOW).reason).toBe('too_long');
  });
  it('AC3: blocked copy of ROOM → room_blocked (fixture stays unblocked)', () => {
    const blocked = { ...ROOM, blocked: true };
    expect(checkAvailability(blocked, m('11:00'), m('12:00'), NOW).reason).toBe('room_blocked');
    expect(ROOM.blocked).toBe(false);
  });
  it('AC4: overlap with Algorithms Lecture → overlaps_booking', () => {
    const r = checkAvailability(ROOM, m('10:00'), m('11:00'), NOW);
    expect(r.reason).toBe('overlaps_booking');
    expect(r.conflictingBooking?.id).toBe('bk-1');
  });
  it('AC4: touching endpoints → available', () => {
    expect(checkAvailability(ROOM, m('10:30'), m('11:30'), NOW).reason).toBe('available');
    expect(checkAvailability(ROOM, m('12:00'), m('13:00'), NOW).reason).toBe('available');
    expect(overlaps(ROOM.bookings[0], m('10:30'), m('11:00'))).toBe(false);
  });
  it('AC5: ROOM fixture is unchanged after many checks', () => {
    const before = JSON.stringify(ROOM);
    for (const tc of TEST_CASES) checkAvailability(ROOM, m(tc.start), m(tc.end), m(tc.currentTime));
    expect(JSON.stringify(ROOM)).toBe(before);
  });
});

describe('In-page TEST_CASES produce their expected reasons (AC6 feedback)', () => {
  for (const tc of TEST_CASES) {
    it(`${tc.label}: ${tc.start}–${tc.end} → ${tc.expectedReason}`, () => {
      const r = checkAvailability(ROOM, m(tc.start), m(tc.end), m(tc.currentTime));
      expect(r.reason).toBe(tc.expectedReason);
      expect(r.message.length).toBeGreaterThan(0);
    });
  }
});

describe('time.ts input parsing', () => {
  it('parses HH:MM and rejects malformed input', () => {
    expect(timeToMinutes('09:30')).toBe(570);
    expect(timeToMinutes('')).toBe(null);
    expect(timeToMinutes('25:00')).toBe(null);
    expect(timeToMinutes('9:30')).toBe(null);
  });
});