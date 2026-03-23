import { describe, expect, it } from 'vitest';
import { emitActivityEvent } from './emitActivityEvent.js';
import type { IActivityEmissionInput } from '../types/index.js';

function createInput(overrides?: Partial<IActivityEmissionInput>): IActivityEmissionInput {
  return {
    type: 'field-changed',
    summary: 'Test event.',
    primaryRef: { moduleKey: 'financial', recordId: 'fc-001' },
    actor: { initiatedByUpn: 'pm@example.com', initiatedByName: 'PM' },
    ...overrides,
  };
}

describe('emitActivityEvent', () => {
  it('returns normalized event with UUID', () => {
    const event = emitActivityEvent(createInput());
    expect(event.eventId).toMatch(/^[0-9a-f]{8}-/i);
    expect(event.type).toBe('field-changed');
    expect(event.actor.initiatedByUpn).toBe('pm@example.com');
  });

  it('throws on missing summary', () => {
    expect(() => emitActivityEvent(createInput({ summary: '' }))).toThrow();
  });

  it('throws on invalid actor', () => {
    expect(() =>
      emitActivityEvent(createInput({ actor: { initiatedByUpn: '', initiatedByName: '' } })),
    ).toThrow();
  });

  it('accepts custom timestamp', () => {
    const now = new Date('2026-03-23T16:00:00Z');
    const event = emitActivityEvent(createInput(), now);
    expect(event.timestampIso).toBe('2026-03-23T16:00:00.000Z');
  });

  it('sets initial confidence and syncState', () => {
    const event = emitActivityEvent(createInput());
    expect(event.confidence).toBe('trusted-authoritative');
    expect(event.syncState).toBe('authoritative');
  });
});
