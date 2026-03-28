/**
 * Activity Spine — comprehensive tests.
 *
 * Covers: registry, adapters, aggregation, query filtering, and cross-spine contracts.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type {
  IActivitySourceRegistration,
  IProjectActivityEvent,
  IActivityQuery,
} from '@hbc/models';
import { ProjectActivityRegistry } from '../ProjectActivityRegistry.js';
import { aggregateActivityFeed } from '../aggregateActivityFeed.js';
import {
  healthPulseActivityAdapter,
  HEALTH_PULSE_ACTIVITY_REGISTRATION,
} from '../adapters/healthPulseActivityAdapter.js';
import { ALL_ACTIVITY_ADAPTERS } from '../adapters/index.js';

beforeEach(() => {
  ProjectActivityRegistry._clearForTesting();
});

// ══════════════════════════════════════════════════════════════════��
// 1. REGISTRY
// ═══════════════════════════════════════════════════════════════════

describe('ProjectActivityRegistry', () => {
  it('starts empty', () => {
    expect(ProjectActivityRegistry.size()).toBe(0);
    expect(ProjectActivityRegistry.getAll()).toHaveLength(0);
  });

  it('registers adapters', () => {
    ProjectActivityRegistry.register(ALL_ACTIVITY_ADAPTERS);
    expect(ProjectActivityRegistry.size()).toBe(ALL_ACTIVITY_ADAPTERS.length);
  });

  it('freezes after first registration', () => {
    ProjectActivityRegistry.register(ALL_ACTIVITY_ADAPTERS);
    expect(() =>
      ProjectActivityRegistry.register([{
        moduleKey: 'extra',
        supportedEventTypes: [],
        adapter: { moduleKey: 'extra', isEnabled: () => true, loadRecentActivity: async () => [], getEventTypeMetadata: () => null },
        enabledByDefault: true,
        significanceDefaults: {},
      }]),
    ).toThrow(/frozen/);
  });

  it('rejects duplicate module keys', () => {
    expect(() =>
      ProjectActivityRegistry.register([
        HEALTH_PULSE_ACTIVITY_REGISTRATION,
        HEALTH_PULSE_ACTIVITY_REGISTRATION,
      ] as unknown as IActivitySourceRegistration[]),
    ).toThrow(/Duplicate/);
  });

  it('rejects mismatched module key', () => {
    expect(() =>
      ProjectActivityRegistry.register([{
        ...HEALTH_PULSE_ACTIVITY_REGISTRATION,
        moduleKey: 'wrong-key',
      }]),
    ).toThrow(/does not match/);
  });

  it('looks up adapter by module key', () => {
    ProjectActivityRegistry.register(ALL_ACTIVITY_ADAPTERS);
    const found = ProjectActivityRegistry.getByModule('health-pulse');
    expect(found).toBeDefined();
    expect(found?.adapter.moduleKey).toBe('health-pulse');
  });

  it('returns undefined for unknown module key', () => {
    ProjectActivityRegistry.register(ALL_ACTIVITY_ADAPTERS);
    expect(ProjectActivityRegistry.getByModule('nonexistent')).toBeUndefined();
  });

  it('getEnabledSources respects isEnabled', () => {
    ProjectActivityRegistry.register(ALL_ACTIVITY_ADAPTERS);
    const enabled = ProjectActivityRegistry.getEnabledSources({
      projectId: 'proj-001',
      userUpn: 'user@test.com',
    });
    expect(enabled.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. HEALTH-PULSE ADAPTER
// ═══════════════════════════════════════════════════════════════════

describe('healthPulseActivityAdapter', () => {
  it('has the correct module key', () => {
    expect(healthPulseActivityAdapter.moduleKey).toBe('health-pulse');
  });

  it('is always enabled', () => {
    expect(healthPulseActivityAdapter.isEnabled({ projectId: 'p1', userUpn: 'u1' })).toBe(true);
  });

  it('returns events for a project', async () => {
    const events = await healthPulseActivityAdapter.loadRecentActivity({
      projectId: 'proj-001',
    });
    expect(events.length).toBeGreaterThan(0);
    for (const event of events) {
      expect(event.projectId).toBe('proj-001');
      expect(event.sourceModule).toBe('health-pulse');
      expect(event.eventId).toBeTruthy();
      expect(event.summary).toBeTruthy();
    }
  });

  it('returns events with valid categories', async () => {
    const events = await healthPulseActivityAdapter.loadRecentActivity({
      projectId: 'proj-001',
    });
    const validCategories = new Set(['record-change', 'status-change', 'milestone', 'approval', 'handoff', 'alert', 'system']);
    for (const event of events) {
      expect(validCategories.has(event.category)).toBe(true);
    }
  });

  it('returns events with valid significance', async () => {
    const events = await healthPulseActivityAdapter.loadRecentActivity({
      projectId: 'proj-001',
    });
    const validSig = new Set(['routine', 'notable', 'critical']);
    for (const event of events) {
      expect(validSig.has(event.significance)).toBe(true);
    }
  });

  it('provides event type metadata', () => {
    const meta = healthPulseActivityAdapter.getEventTypeMetadata('health-pulse.status-changed');
    expect(meta).not.toBeNull();
    expect(meta?.label).toBe('Health status changed');
    expect(meta?.category).toBe('status-change');
  });

  it('returns null for unknown event type', () => {
    expect(healthPulseActivityAdapter.getEventTypeMetadata('unknown.event')).toBeNull();
  });

  it('registration has expected event types', () => {
    expect(HEALTH_PULSE_ACTIVITY_REGISTRATION.supportedEventTypes).toContain('health-pulse.status-changed');
    expect(HEALTH_PULSE_ACTIVITY_REGISTRATION.supportedEventTypes).toContain('health-pulse.triage-escalated');
    expect(HEALTH_PULSE_ACTIVITY_REGISTRATION.supportedEventTypes).toContain('health-pulse.recommendation-acted');
    expect(HEALTH_PULSE_ACTIVITY_REGISTRATION.supportedEventTypes).toContain('health-pulse.dimension-updated');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. AGGREGATION
// ═══════════════════════════════════════════════════════════════════

describe('aggregateActivityFeed', () => {
  beforeEach(() => {
    ProjectActivityRegistry._clearForTesting();
    ProjectActivityRegistry.register(ALL_ACTIVITY_ADAPTERS);
  });

  it('returns events from registered adapters', async () => {
    const result = await aggregateActivityFeed(
      { projectId: 'proj-001' },
      { projectId: 'proj-001', userUpn: 'user@test.com' },
    );
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.totalCount).toBeGreaterThan(0);
    expect(result.lastRefreshedIso).toBeTruthy();
  });

  it('events are sorted by occurredAt descending', async () => {
    const result = await aggregateActivityFeed(
      { projectId: 'proj-001' },
      { projectId: 'proj-001', userUpn: 'user@test.com' },
    );
    for (let i = 1; i < result.events.length; i++) {
      const prev = new Date(result.events[i - 1].occurredAt).getTime();
      const curr = new Date(result.events[i].occurredAt).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it('deduplicates events by eventId', async () => {
    const result = await aggregateActivityFeed(
      { projectId: 'proj-001' },
      { projectId: 'proj-001', userUpn: 'user@test.com' },
    );
    const eventIds = result.events.map((e) => e.eventId);
    expect(new Set(eventIds).size).toBe(eventIds.length);
  });

  it('computes critical and notable counts', async () => {
    const result = await aggregateActivityFeed(
      { projectId: 'proj-001' },
      { projectId: 'proj-001', userUpn: 'user@test.com' },
    );
    const critical = result.events.filter((e) => e.significance === 'critical').length;
    const notable = result.events.filter((e) => e.significance === 'notable').length;
    expect(result.criticalCount).toBe(critical);
    expect(result.notableCount).toBe(notable);
  });

  it('respects limit parameter', async () => {
    const result = await aggregateActivityFeed(
      { projectId: 'proj-001', limit: 1 },
      { projectId: 'proj-001', userUpn: 'user@test.com' },
    );
    expect(result.events.length).toBeLessThanOrEqual(1);
  });

  it('filters by category', async () => {
    const result = await aggregateActivityFeed(
      { projectId: 'proj-001', categories: ['alert'] },
      { projectId: 'proj-001', userUpn: 'user@test.com' },
    );
    for (const event of result.events) {
      expect(event.category).toBe('alert');
    }
  });

  it('filters by significance', async () => {
    const result = await aggregateActivityFeed(
      { projectId: 'proj-001', significance: ['critical'] },
      { projectId: 'proj-001', userUpn: 'user@test.com' },
    );
    for (const event of result.events) {
      expect(event.significance).toBe('critical');
    }
  });

  it('returns empty feed when no adapters are registered', async () => {
    ProjectActivityRegistry._clearForTesting();
    // Don't register any adapters
    const result = await aggregateActivityFeed(
      { projectId: 'proj-001' },
      { projectId: 'proj-001', userUpn: 'user@test.com' },
    );
    expect(result.events).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. ALL_ACTIVITY_ADAPTERS
// ═══════════════════════════════════════════════════════════════════

describe('ALL_ACTIVITY_ADAPTERS', () => {
  it('includes health-pulse adapter', () => {
    expect(ALL_ACTIVITY_ADAPTERS.some((a) => a.moduleKey === 'health-pulse')).toBe(true);
  });

  it('all adapters have matching module keys', () => {
    for (const reg of ALL_ACTIVITY_ADAPTERS) {
      expect(reg.adapter.moduleKey).toBe(reg.moduleKey);
    }
  });

  it('all adapters have at least one supported event type', () => {
    for (const reg of ALL_ACTIVITY_ADAPTERS) {
      expect(reg.supportedEventTypes.length).toBeGreaterThan(0);
    }
  });
});
