import { describe, expect, it } from 'vitest';
import { applyDeduplication, markDeduped } from './dedupe.js';
import { normalizeActivityEvent } from './normalize.js';
import type { IActivityEvent, IActivityEmissionInput } from '../types/index.js';

function makeEvent(overrides: Partial<IActivityEmissionInput> & { timestampOverride?: string }): IActivityEvent {
  const { timestampOverride, ...inputOverrides } = overrides;
  const event = normalizeActivityEvent({
    type: 'field-changed',
    summary: 'Test event.',
    primaryRef: { moduleKey: 'financial', recordId: 'fc-001' },
    actor: { initiatedByUpn: 'pm@example.com', initiatedByName: 'PM' },
    ...inputOverrides,
  });
  if (timestampOverride) {
    return { ...event, timestampIso: timestampOverride };
  }
  return event;
}

describe('applyDeduplication', () => {
  it('returns single event unchanged', () => {
    const events = [makeEvent({})];
    const result = applyDeduplication(events);
    expect(result).toHaveLength(1);
    expect(result[0].dedupe).toBeNull();
  });

  it('marks duplicate within threshold as suppressed', () => {
    const events = [
      makeEvent({ timestampOverride: '2026-03-23T14:00:00.000Z' }),
      makeEvent({ timestampOverride: '2026-03-23T14:02:00.000Z' }),
    ];
    const result = applyDeduplication(events);

    // Earlier event survives
    expect(result[0].dedupe).toBeNull();
    // Later event within 5 min is suppressed
    expect(result[1].dedupe).not.toBeNull();
    expect(result[1].dedupe?.projectionAction).toBe('suppressed');
    expect(result[1].dedupe?.rawEvidenceRetained).toBe(true);
    expect(result[1].dedupe?.reason).toBe('duplicate-within-threshold');
  });

  it('does not dedup events outside threshold', () => {
    const events = [
      makeEvent({ timestampOverride: '2026-03-23T14:00:00.000Z' }),
      makeEvent({ timestampOverride: '2026-03-23T14:10:00.000Z' }), // 10 min apart
    ];
    const result = applyDeduplication(events);
    expect(result[0].dedupe).toBeNull();
    expect(result[1].dedupe).toBeNull();
  });

  it('does not dedup events with different types', () => {
    const events = [
      makeEvent({ type: 'field-changed', timestampOverride: '2026-03-23T14:00:00.000Z' }),
      makeEvent({ type: 'status-changed', timestampOverride: '2026-03-23T14:01:00.000Z' }),
    ];
    const result = applyDeduplication(events);
    expect(result.filter(e => e.dedupe !== null)).toHaveLength(0);
  });

  it('does not dedup events with different actors', () => {
    const events = [
      makeEvent({ actor: { initiatedByUpn: 'a@e.com', initiatedByName: 'A' }, timestampOverride: '2026-03-23T14:00:00.000Z' }),
      makeEvent({ actor: { initiatedByUpn: 'b@e.com', initiatedByName: 'B' }, timestampOverride: '2026-03-23T14:01:00.000Z' }),
    ];
    const result = applyDeduplication(events);
    expect(result.filter(e => e.dedupe !== null)).toHaveLength(0);
  });

  it('handles empty array', () => {
    expect(applyDeduplication([])).toEqual([]);
  });

  it('supports custom threshold', () => {
    const events = [
      makeEvent({ timestampOverride: '2026-03-23T14:00:00.000Z' }),
      makeEvent({ timestampOverride: '2026-03-23T14:01:00.000Z' }),
    ];
    // 30 second threshold — 1 min apart → not deduped
    const result = applyDeduplication(events, 30_000);
    expect(result.filter(e => e.dedupe !== null)).toHaveLength(0);
  });
});

describe('markDeduped', () => {
  it('marks event with dedup state', () => {
    const event = makeEvent({});
    const deduped = markDeduped(event, 'merge-parent-child', 'merged');

    expect(deduped.dedupe).not.toBeNull();
    expect(deduped.dedupe?.rawEvidenceRetained).toBe(true);
    expect(deduped.dedupe?.projectionAction).toBe('merged');
    expect(deduped.dedupe?.reason).toBe('merge-parent-child');
  });

  it('does not mutate original event', () => {
    const event = makeEvent({});
    markDeduped(event, 'identical-field-value');
    expect(event.dedupe).toBeNull();
  });
});
