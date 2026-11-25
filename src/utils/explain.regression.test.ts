import { describe, it, expect, vi } from 'vitest';
import { ROOM } from '@/data';
import { checkAvailability } from '@/utils/availability';
import {
  explainAvailability,
  FALLBACK_EXPLANATION,
  MAX_EXPLANATION_LENGTH,
} from '@/utils/explain';

const req = (start: number, end: number, currentTime: number, room = ROOM) => ({
  result: checkAvailability(room, start, end, currentTime),
  room,
  start,
  end,
});

describe('mock explanation adapter', () => {
  it('explains an available slot with times and room name', async () => {
    const outcome = await explainAvailability(req(11 * 60, 12 * 60, 8 * 60));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error('expected ok');
    expect(outcome.explanation).toContain('Room B204');
    expect(outcome.explanation).toContain('11:00');
    expect(outcome.explanation).toContain('12:00');
  });

  it('explains an overlap with the conflicting booking title and a suggestion', async () => {
    const outcome = await explainAvailability(req(9 * 60 + 30, 10 * 60, 8 * 60));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error('expected ok');
    expect(outcome.explanation).toContain('Algorithms Lecture');
    expect(outcome.explanation).toContain('10:30');
  });

  it('rejects an unknown reason and returns the graceful fallback', async () => {
    const bad = { ...req(11 * 60, 12 * 60, 8 * 60), result: { reason: 'mystery' } };
    const outcome = await explainAvailability(bad as never);
    expect(outcome.ok).toBe(false);
    expect(outcome.explanation).toBe(FALLBACK_EXPLANATION);
  });

  it('recovers when the transport throws, times out into a rejection, or returns junk', async () => {
    const boom = async () => {
      throw new Error('network down');
    };
    await expect(explainAvailability(req(11 * 60, 12 * 60, 8 * 60), boom)).resolves.toEqual({
      ok: false,
      explanation: FALLBACK_EXPLANATION,
    });

    await expect(
      explainAvailability(req(11 * 60, 12 * 60, 8 * 60), async () => '   ')
    ).resolves.toMatchObject({ ok: false, explanation: FALLBACK_EXPLANATION });

    const junk = vi.fn(async () => 42 as unknown as string);
    await expect(
      explainAvailability(req(11 * 60, 12 * 60, 8 * 60), junk)
    ).resolves.toMatchObject({ ok: false, explanation: FALLBACK_EXPLANATION });
  });

  it('never flips the checker verdict and truncates overlong transport output', async () => {
    const long = 'x'.repeat(MAX_EXPLANATION_LENGTH + 50);
    const outcome = await explainAvailability(req(11 * 60, 12 * 60, 8 * 60), async () => long);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error('expected ok');
    expect(outcome.explanation.length).toBe(MAX_EXPLANATION_LENGTH);

    const r = req(14 * 60, 13 * 60, 8 * 60);
    expect(r.result.available).toBe(false);
    expect(r.result.reason).toBe('invalid_interval');
    const explained = await explainAvailability(r);
    expect(explained.ok).toBe(true);
  });
});
