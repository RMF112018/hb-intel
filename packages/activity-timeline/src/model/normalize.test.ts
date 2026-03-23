import { describe, expect, it } from 'vitest';
import { normalizeActivityEvent } from './normalize.js';
import type { IActivityEmissionInput } from '../types/index.js';

function createMockInput(overrides?: Partial<IActivityEmissionInput>): IActivityEmissionInput {
  return {
    type: 'field-changed',
    summary: 'Q3 forecast updated with revised GC/GR model.',
    primaryRef: { moduleKey: 'financial', recordId: 'fc-001' },
    actor: { initiatedByUpn: 'pm@example.com', initiatedByName: 'Jane Smith' },
    ...overrides,
  };
}

describe('normalizeActivityEvent', () => {
  it('generates UUID v4 eventId', () => {
    const event = normalizeActivityEvent(createMockInput());
    expect(event.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('sets type from input', () => {
    const event = normalizeActivityEvent(createMockInput({ type: 'status-changed' }));
    expect(event.type).toBe('status-changed');
  });

  it('completes actor attribution', () => {
    const event = normalizeActivityEvent(createMockInput());
    expect(event.actor.type).toBe('user');
    expect(event.actor.initiatedByUpn).toBe('pm@example.com');
    expect(event.actor.initiatedByName).toBe('Jane Smith');
  });

  it('sets context from primary ref', () => {
    const event = normalizeActivityEvent(createMockInput());
    expect(event.context.sourceModuleKey).toBe('financial');
    expect(event.context.emission).toBe('remote');
  });

  it('sets initial confidence and sync state', () => {
    const event = normalizeActivityEvent(createMockInput());
    expect(event.confidence).toBe('trusted-authoritative');
    expect(event.syncState).toBe('authoritative');
  });

  it('sets timestamp from now parameter', () => {
    const now = new Date('2026-03-23T14:00:00.000Z');
    const event = normalizeActivityEvent(createMockInput(), now);
    expect(event.timestampIso).toBe('2026-03-23T14:00:00.000Z');
  });

  it('initializes dedupe as null', () => {
    const event = normalizeActivityEvent(createMockInput());
    expect(event.dedupe).toBeNull();
  });

  it('includes diff entries when provided', () => {
    const event = normalizeActivityEvent(createMockInput({
      diffEntries: [{ fieldLabel: 'GMP', from: '$12M', to: '$13M' }],
    }));
    expect(event.diffEntries).toHaveLength(1);
    expect(event.diffEntries[0].fieldLabel).toBe('GMP');
  });

  it('includes correlation ID in context', () => {
    const event = normalizeActivityEvent(createMockInput({ correlationId: 'wf-001' }));
    expect(event.context.correlationId).toBe('wf-001');
  });

  it('throws for summary exceeding 280 characters', () => {
    expect(() => normalizeActivityEvent(createMockInput({ summary: 'x'.repeat(281) }))).toThrow('280');
  });

  it('throws for empty summary', () => {
    expect(() => normalizeActivityEvent(createMockInput({ summary: '' }))).toThrow('Summary');
  });

  it('throws for missing primaryRef.recordId', () => {
    expect(() => normalizeActivityEvent(createMockInput({
      primaryRef: { moduleKey: 'financial', recordId: '' },
    }))).toThrow('recordId');
  });

  it('throws for missing actor initiatedByUpn', () => {
    expect(() => normalizeActivityEvent(createMockInput({
      actor: { initiatedByUpn: '', initiatedByName: 'Name' },
    }))).toThrow('initiatedByUpn');
  });

  it('generates unique eventIds', () => {
    const a = normalizeActivityEvent(createMockInput());
    const b = normalizeActivityEvent(createMockInput());
    expect(a.eventId).not.toBe(b.eventId);
  });
});
