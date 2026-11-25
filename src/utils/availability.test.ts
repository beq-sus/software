import { describe, it, expect, beforeEach } from 'vitest';
import { checkAvailability } from '@/utils/availability';
import type { Booking, Room } from '@/types';

// Default fixture values (from the spec):
//   Current time    = 540  (09:00)
//   Existing booking = 600–660 (10:00–11:00)
//   Room blocked    = false
const DEFAULT_CURRENT_TIME = 540;
const DEFAULT_BOOKING: Booking = {
  id: 'b1',
  title: 'Existing Meeting',
  bookedBy: 'alice',
  start: 600,
  end: 660,
};

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    name: 'Study Room A',
    building: 'Main',
    floor: '2',
    capacity: 8,
    blocked: false,
    bookings: [structuredClone(DEFAULT_BOOKING)],
    ...overrides,
  };
}

// Deep clone of the fixture before each test, plus a reference copy for the
// "unchanged" assertion so we can verify the original booking data is not
// mutated by checkAvailability().
function freshFixture(overrides: Partial<Room> = {}) {
  const room = makeRoom(overrides);
  const snapshot = structuredClone(room);
  return { room, snapshot };
}

// Helper: assert the booking data on `room` is byte-for-byte identical to the
// pre-call `snapshot`.
function expectUnchanged(room: Room, snapshot: Room) {
  expect(room).toEqual(snapshot);
  expect(room.bookings).toEqual(snapshot.bookings);
  expect(room.bookings[0]).toEqual(snapshot.bookings[0]);
}

describe('checkAvailability (AC1–AC6)', () => {
  let room: Room;
  let snapshot: Room;

  beforeEach(() => {
    const f = freshFixture();
    room = f.room;
    snapshot = f.snapshot;
  });

  // --- AC1: valid interval & start-after-now -----------------------------

  it('T01: 11:00–12:00, touching after existing booking → Available', () => {
    const result = checkAvailability(room, 660, 720, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(result.reason).toBe('available');
    expectUnchanged(room, snapshot);
  });

  it('T02: 09:00–09:30, starts at current time → Unavailable (start_after_now)', () => {
    const result = checkAvailability(room, 540, 570, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('start_after_now');
    expectUnchanged(room, snapshot);
  });

  it('T03: 12:00–12:00, zero duration → Unavailable (invalid_interval)', () => {
    const result = checkAvailability(room, 720, 720, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('invalid_interval');
    expectUnchanged(room, snapshot);
  });

  it('T04: 12:30–12:00, reversed interval → Unavailable (invalid_interval)', () => {
    const result = checkAvailability(room, 750, 720, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('invalid_interval');
    expectUnchanged(room, snapshot);
  });

  it('T05: 23:00–24:01, end past day end (1441) → Unavailable (invalid_interval)', () => {
    const result = checkAvailability(room, 1380, 1441, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('invalid_interval');
    expectUnchanged(room, snapshot);
  });

  it('T16: 09:01–09:30, starts one minute after now → Available', () => {
    const result = checkAvailability(room, 541, 570, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(result.reason).toBe('available');
    expectUnchanged(room, snapshot);
  });

  it('T17: 00:00–00:30, current time 00:00 → Unavailable (start_after_now)', () => {
    // Per the default fixture semantics, "current time 00:00" means start (0)
    // must be strictly after 0, which it is not.
    const result = checkAvailability(room, 0, 30, 0);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('start_after_now');
    expectUnchanged(room, snapshot);
  });

  // --- AC2: max 120 minutes ---------------------------------------------

  it('T06: 12:00–14:00, exactly 120 minutes → Available', () => {
    const result = checkAvailability(room, 720, 840, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(result.reason).toBe('available');
    expectUnchanged(room, snapshot);
  });

  it('T07: 12:00–14:01, 121 minutes → Unavailable (too_long)', () => {
    const result = checkAvailability(room, 720, 841, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('too_long');
    expectUnchanged(room, snapshot);
  });

  // --- AC3: blocked room ------------------------------------------------

  it('T13: 11:00–12:00, blocked room → Unavailable (room_blocked)', () => {
    const blockedRoom = makeRoom({ blocked: true, blockReason: 'Maintenance' });
    const blockedSnapshot = structuredClone(blockedRoom);
    const result = checkAvailability(blockedRoom, 660, 720, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('room_blocked');
    expectUnchanged(blockedRoom, blockedSnapshot);
  });

  // --- AC4: overlaps / touching -----------------------------------------

  it('T08: 09:30–10:00, touching before existing booking → Available', () => {
    const result = checkAvailability(room, 570, 600, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(result.reason).toBe('available');
    expectUnchanged(room, snapshot);
  });

  it('T09: 10:30–11:30, partial overlap → Unavailable (overlaps_booking)', () => {
    const result = checkAvailability(room, 630, 690, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('overlaps_booking');
    expect(result.conflictingBooking).toEqual(snapshot.bookings[0]);
    expectUnchanged(room, snapshot);
  });

  it('T10: 09:30–11:30, contains existing booking → Unavailable (overlaps_booking)', () => {
    const result = checkAvailability(room, 570, 690, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('overlaps_booking');
    expect(result.conflictingBooking).toEqual(snapshot.bookings[0]);
    expectUnchanged(room, snapshot);
  });

  it('T11: 10:15–10:45, inside existing booking → Unavailable (overlaps_booking)', () => {
    const result = checkAvailability(room, 615, 645, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('overlaps_booking');
    expect(result.conflictingBooking).toEqual(snapshot.bookings[0]);
    expectUnchanged(room, snapshot);
  });

  it('T12: 10:00–11:00, identical interval → Unavailable (overlaps_booking)', () => {
    const result = checkAvailability(room, 600, 660, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('overlaps_booking');
    expect(result.conflictingBooking).toEqual(snapshot.bookings[0]);
    expectUnchanged(room, snapshot);
  });

  // --- AC5: empty schedule ---------------------------------------------

  it('T14: 10:30–11:30, no existing bookings → Available', () => {
    const emptyRoom = makeRoom({ bookings: [] });
    const emptySnapshot = structuredClone(emptyRoom);
    const result = checkAvailability(emptyRoom, 630, 690, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(result.reason).toBe('available');
    expectUnchanged(emptyRoom, emptySnapshot);
  });

  // --- AC6: data integrity ----------------------------------------------

  it('T15: existing booking data is unchanged after checking availability', () => {
    // Exercise a path that touches bookings (overlap) and one that does not,
    // then assert the fixture was not mutated.
    checkAvailability(room, 600, 660, DEFAULT_CURRENT_TIME);
    checkAvailability(room, 660, 720, DEFAULT_CURRENT_TIME);
    checkAvailability(room, 541, 570, DEFAULT_CURRENT_TIME);
    expectUnchanged(room, snapshot);
  });
});
