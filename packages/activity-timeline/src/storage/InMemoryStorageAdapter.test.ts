import { describe, expect, it, beforeEach } from 'vitest';
import { InMemoryStorageAdapter } from './InMemoryStorageAdapter.js';
import { normalizeActivityEvent } from '../model/normalize.js';

function makeEvent(moduleKey = 'financial', projectId = 'proj-001', timestampOverride?: string) {
  const event = normalizeActivityEvent({
    type: 'field-changed',
    summary: `Event from ${moduleKey}.`,
    primaryRef: { moduleKey, recordId: `${moduleKey}-001`, projectId },
    actor: { initiatedByUpn: 'pm@example.com', initiatedByName: 'PM' },
  });
  if (timestampOverride) return { ...event, timestampIso: timestampOverride };
  return event;
}

describe('InMemoryStorageAdapter', () => {
  let adapter: InMemoryStorageAdapter;

  beforeEach(() => {
    adapter = new InMemoryStorageAdapter();
  });

  it('has storageSystemId "in-memory"', () => {
    expect(adapter.storageSystemId).toBe('in-memory');
  });

  describe('append', () => {
    it('stores event and returns storage record', async () => {
      const event = makeEvent();
      const record = await adapter.append(event);

      expect(record.event.eventId).toBe(event.eventId);
      expect(record.storageSystem).toBe('in-memory');
      expect(record.storedAt).toBeTruthy();
      expect(adapter.size()).toBe(1);
    });
  });

  describe('query', () => {
    it('returns events for project', async () => {
      await adapter.append(makeEvent('financial', 'proj-001'));
      await adapter.append(makeEvent('schedule', 'proj-001'));
      await adapter.append(makeEvent('financial', 'proj-002'));

      const result = await adapter.query({ projectId: 'proj-001', mode: 'workspace' });
      // In workspace mode, all events are returned
      expect(result.events.length).toBeGreaterThanOrEqual(2);
    });

    it('filters by event type', async () => {
      const e1 = makeEvent();
      const e2 = { ...makeEvent(), type: 'status-changed' as const };
      await adapter.append(e1);
      await adapter.append(e2);

      const result = await adapter.query({
        projectId: 'proj-001',
        mode: 'workspace',
        eventTypes: ['status-changed'],
      });
      expect(result.events.every(e => e.type === 'status-changed')).toBe(true);
    });

    it('filters by actor', async () => {
      await adapter.append(makeEvent());
      const otherEvent = normalizeActivityEvent({
        type: 'field-changed',
        summary: 'Other.',
        primaryRef: { moduleKey: 'financial', recordId: 'fc-002', projectId: 'proj-001' },
        actor: { initiatedByUpn: 'other@example.com', initiatedByName: 'Other' },
      });
      await adapter.append(otherEvent);

      const result = await adapter.query({
        projectId: 'proj-001',
        mode: 'workspace',
        actorUpns: ['other@example.com'],
      });
      expect(result.events.every(e => e.actor.initiatedByUpn === 'other@example.com')).toBe(true);
    });

    it('excludes system events when flag set', async () => {
      const userEvent = makeEvent();
      const systemEvent = {
        ...makeEvent(),
        actor: { ...makeEvent().actor, type: 'system' as const },
      };
      await adapter.append(userEvent);
      await adapter.append(systemEvent);

      const result = await adapter.query({
        projectId: 'proj-001',
        mode: 'workspace',
        excludeSystemEvents: true,
      });
      expect(result.events.every(e => e.actor.type !== 'system')).toBe(true);
    });

    it('applies limit and hasMore', async () => {
      for (let i = 0; i < 30; i++) {
        await adapter.append(makeEvent('financial', 'proj-001'));
      }

      const result = await adapter.query({
        projectId: 'proj-001',
        mode: 'workspace',
        limit: 10,
      });
      expect(result.events).toHaveLength(10);
      expect(result.hasMore).toBe(true);
      expect(result.pageSize).toBe(10);
    });

    it('sorts by timestamp descending', async () => {
      await adapter.append(makeEvent('financial', 'proj-001', '2026-03-20T10:00:00Z'));
      await adapter.append(makeEvent('financial', 'proj-001', '2026-03-23T10:00:00Z'));
      await adapter.append(makeEvent('financial', 'proj-001', '2026-03-21T10:00:00Z'));

      const result = await adapter.query({ projectId: 'proj-001', mode: 'workspace' });
      const timestamps = result.events.map(e => e.timestampIso);
      expect(timestamps[0] >= timestamps[1]).toBe(true);
      expect(timestamps[1] >= timestamps[2]).toBe(true);
    });
  });

  describe('getHealth', () => {
    it('returns healthy state', () => {
      const health = adapter.getHealth();
      expect(health.confidence).toBe('trusted-authoritative');
      expect(health.consecutiveFailures).toBe(0);
    });
  });

  describe('clear', () => {
    it('removes all records', async () => {
      await adapter.append(makeEvent());
      adapter.clear();
      expect(adapter.size()).toBe(0);
    });
  });
});
