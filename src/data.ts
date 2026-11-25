import type { Room, TestCase } from '@/types';

export const ROOM: Room = {
  id: 'room-b204',
  name: 'Room B204',
  building: 'Science Block',
  floor: '2nd Floor',
  capacity: 30,
  blocked: false,
  bookings: [
    {
      id: 'bk-1',
      title: 'Algorithms Lecture',
      bookedBy: 'Dr. Chen',
      start: 9 * 60,      // 09:00
      end: 10 * 60 + 30,  // 10:30
    },
    {
      id: 'bk-2',
      title: 'Study Group — Calculus',
      bookedBy: 'Student Union',
      start: 13 * 60,     // 13:00
      end: 14 * 60,       // 14:00
    },
    {
      id: 'bk-3',
      title: 'Faculty Meeting',
      bookedBy: 'Dept. Office',
      start: 16 * 60,     // 16:00
      end: 17 * 60 + 30,  // 17:30
    },
  ],
};

export const TEST_CASES: TestCase[] = [
  {
    id: 'tc-valid',
    label: 'Valid slot',
    description: '11:00–12:00 — gap between two bookings, should be Available.',
    start: '11:00',
    end: '12:00',
    currentTime: '08:00',
    expectedReason: 'available',
  },
  {
    id: 'tc-touching',
    label: 'Touching endpoints',
    description: '10:30–11:00 — touches the end of the 09:00–10:30 booking, should be Available.',
    start: '10:30',
    end: '11:00',
    currentTime: '08:00',
    expectedReason: 'available',
  },
  {
    id: 'tc-overlap',
    label: 'Overlapping booking',
    description: '09:30–10:00 — overlaps the Algorithms Lecture, should be Unavailable.',
    start: '09:30',
    end: '10:00',
    currentTime: '08:00',
    expectedReason: 'overlaps_booking',
  },
  {
    id: 'tc-too-long',
    label: 'Exceeds 120 min',
    description: '11:00–13:30 — 150 minutes, should be Unavailable.',
    start: '11:00',
    end: '13:30',
    currentTime: '08:00',
    expectedReason: 'too_long',
  },
  {
    id: 'tc-past',
    label: 'Start before now',
    description: '07:00–08:00 with current time 08:30 — start is in the past, should be Unavailable.',
    start: '07:00',
    end: '08:00',
    currentTime: '08:30',
    expectedReason: 'start_after_now',
  },
  {
    id: 'tc-invalid',
    label: 'End before start',
    description: '14:00–13:00 — end is before start, should be Unavailable.',
    start: '14:00',
    end: '13:00',
    currentTime: '08:00',
    expectedReason: 'invalid_interval',
  },
];
