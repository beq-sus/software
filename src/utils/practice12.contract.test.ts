import { describe, it, expect } from 'vitest';
import { ROOM } from '@/data';
import { CONTRACT_CASES, CONTRACT_NOW } from '@/contractCases';
import { checkRequest, validateRequest } from '@/utils/contract';

const run = (start: string, duration: string | number, blocked = false, now = CONTRACT_NOW) =>
  checkRequest(ROOM, { start, duration, blocked, now, bookings: ROOM.bookings });

describe('Practice #12 shared test set T1–T7', () => {
  for (const tc of CONTRACT_CASES) {
    it(`${tc.id}: ${tc.label} -> ${tc.expectedCode}`, () => {
      const r = checkRequest(ROOM, { start: tc.start, duration: tc.duration, blocked: tc.blocked, now: tc.now, bookings: ROOM.bookings });
      expect(r.available).toBe(tc.expectedAvailable);
      expect(r.reasonCode).toBe(tc.expectedCode);
      expect(r.validationError).toBe(tc.validation);
      expect(r.message.length).toBeGreaterThan(0);
    });
  }
});

describe('T8: booking data unchanged after checks (AC5)', () => {
  it('fixture bookings and blocked flag are identical before and after running T1–T7', () => {
    const before = JSON.stringify(ROOM);
    const arrayRef = ROOM.bookings;
    for (const tc of CONTRACT_CASES) {
      checkRequest(ROOM, { start: tc.start, duration: tc.duration, blocked: tc.blocked, now: tc.now, bookings: ROOM.bookings });
    }
    expect(JSON.stringify(ROOM)).toBe(before);
    expect(ROOM.bookings).toBe(arrayRef);
    expect(ROOM.blocked).toBe(false);
  });
});

describe('Validation edge cases (AC1, AC2, AC6)', () => {
  it('accepts the boundaries 1 and 120 minutes', () => {
    expect(run('11:00', '1').reasonCode).toBe('AVAILABLE');
    expect(run('14:00', '120').reasonCode).toBe('AVAILABLE'); // 14:00–16:00 touches both neighbours
  });
  it('rejects blank, decimal, negative and non-numeric durations with a message', () => {
    for (const d of ['', '   ', '1.5', '-5', '1e2', '60abc', '<script>alert(1)</script>']) {
      const r = run('11:00', d);
      expect(r.reasonCode).toBe('INVALID_DURATION');
      expect(r.validationError).toBe(true);
    }
    expect(run('11:00', '').message).toBe('Enter a duration in minutes.');
  });
  it('gives distinct messages for 0 and 121', () => {
    expect(run('11:00', '0').message).toContain('greater than 0');
    expect(run('11:00', '121').message).toContain('120');
  });
  it('start equal to now is not in the future', () => {
    expect(run('08:00', '30').reasonCode).toBe('PAST_START');
  });
  it('blank or malformed start time is a validation error, not 00:00', () => {
    expect(run('', '30').reasonCode).toBe('INVALID_TIME');
    expect(run('25:00', '30').reasonCode).toBe('INVALID_TIME');
  });
  it('a booking that would run past midnight is rejected', () => {
    expect(run('23:30', '60').reasonCode).toBe('OUTSIDE_DAY');
  });
  it('validation never depends on bookings or the blocked flag', () => {
    const v = validateRequest({ start: '11:00', duration: '60', now: '08:00' });
    expect(v.ok).toBe(true);
    expect(run('11:00', '0', true).reasonCode).toBe('INVALID_DURATION');
  });
  it('overlap message names the conflicting booking; blocked beats overlap', () => {
    expect(run('09:30', '30').message).toContain('Algorithms Lecture');
    expect(run('09:30', '30', true).reasonCode).toBe('ROOM_BLOCKED');
  });
});
