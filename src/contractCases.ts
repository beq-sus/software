import type { ReasonCode } from '@/utils/contract';

// Practice #12 — the common test set, written BEFORE either implementation.
// The low-code solution is tested with exactly the same inputs.
// Fixture bookings (src/data.ts): 09:00–10:30, 13:00–14:00, 16:00–17:30. Simulated now = 08:00.

export interface ContractCase {
  id: string;
  label: string;
  start: string;
  duration: string;
  blocked: boolean;
  now: string;
  expectedAvailable: boolean;
  expectedCode: ReasonCode;
  validation: boolean;
}

export const CONTRACT_NOW = '08:00';

export const CONTRACT_CASES: ContractCase[] = [
  { id: 'T1', label: 'Valid free interval', start: '11:00', duration: '60', blocked: false, now: CONTRACT_NOW, expectedAvailable: true, expectedCode: 'AVAILABLE', validation: false },
  { id: 'T2', label: 'Overlap with existing booking', start: '09:30', duration: '30', blocked: false, now: CONTRACT_NOW, expectedAvailable: false, expectedCode: 'OVERLAP', validation: false },
  { id: 'T3', label: 'Blocked room', start: '11:00', duration: '60', blocked: true, now: CONTRACT_NOW, expectedAvailable: false, expectedCode: 'ROOM_BLOCKED', validation: false },
  { id: 'T4', label: 'Duration = 0', start: '11:00', duration: '0', blocked: false, now: CONTRACT_NOW, expectedAvailable: false, expectedCode: 'INVALID_DURATION', validation: true },
  { id: 'T5', label: 'Duration = 121', start: '11:00', duration: '121', blocked: false, now: CONTRACT_NOW, expectedAvailable: false, expectedCode: 'INVALID_DURATION', validation: true },
  { id: 'T6', label: 'Past start time', start: '07:00', duration: '60', blocked: false, now: CONTRACT_NOW, expectedAvailable: false, expectedCode: 'PAST_START', validation: true },
  { id: 'T7', label: 'Adjacent, non-overlapping', start: '10:30', duration: '30', blocked: false, now: CONTRACT_NOW, expectedAvailable: true, expectedCode: 'AVAILABLE', validation: false },
];
// T8 (booking data unchanged after T1–T7) is a property check, run by the panel and the unit tests.
