import { describe, expect, it } from 'vitest';
import type {
  ActivityCategory,
  ActivitySignificance,
  IProjectActivityEvent,
  IActivitySourceAdapter,
  IActivitySourceRegistration,
  IActivityQuery,
  IActivityRuntimeContext,
} from './IActivitySpine.js';

describe('Activity spine type contracts', () => {
  it('IProjectActivityEvent satisfies canonical shape', () => {
    const event: IProjectActivityEvent = {
      eventId: 'evt-001',
      projectId: 'proj-001',
      eventType: 'financial.forecast-updated',
      category: 'record-change',
      sourceModule: 'financial',
      sourceRecordType: 'forecast',
      sourceRecordId: 'fc-001',
      summary: 'Q3 forecast updated with revised GC/GR model.',
      detail: { previousValue: 12500000, newValue: 13100000 },
      changedByUpn: 'pm@example.com',
      changedByName: 'Jane Smith',
      occurredAt: '2026-03-22T14:00:00.000Z',
      publishedAt: '2026-03-22T14:00:01.000Z',
      significance: 'notable',
      href: '/project-hub/proj-001/financial',
      relatedEventIds: [],
    };

    expect(event.eventId).toBe('evt-001');
    expect(event.category).toBe('record-change');
    expect(event.significance).toBe('notable');
    expect(event.detail).not.toBeNull();
  });

  it('ActivityCategory covers all 7 categories', () => {
    const categories: ActivityCategory[] = [
      'record-change', 'status-change', 'milestone',
      'approval', 'handoff', 'alert', 'system',
    ];
    expect(categories).toHaveLength(7);
  });

  it('ActivitySignificance covers all 3 tiers', () => {
    const tiers: ActivitySignificance[] = ['routine', 'notable', 'critical'];
    expect(tiers).toHaveLength(3);
  });

  it('IActivityQuery supports all filter dimensions', () => {
    const query: IActivityQuery = {
      projectId: 'proj-001',
      categories: ['milestone', 'approval'],
      sourceModules: ['financial', 'schedule'],
      significance: ['notable', 'critical'],
      since: '2026-03-01T00:00:00.000Z',
      limit: 50,
    };
    expect(query.projectId).toBe('proj-001');
    expect(query.categories).toHaveLength(2);
  });

  it('IActivitySourceAdapter contract shape', () => {
    const adapter: IActivitySourceAdapter = {
      moduleKey: 'financial',
      isEnabled: (_ctx: IActivityRuntimeContext) => true,
      loadRecentActivity: async (_query: IActivityQuery) => [],
      getEventTypeMetadata: (_type: string) => null,
    };
    expect(adapter.moduleKey).toBe('financial');
    expect(adapter.isEnabled({ projectId: 'p1', userUpn: 'u@e.com' })).toBe(true);
  });

  it('IActivitySourceRegistration contract shape', () => {
    const registration: IActivitySourceRegistration = {
      moduleKey: 'schedule',
      supportedEventTypes: ['schedule.milestone-completed', 'schedule.forecast-override'],
      adapter: {
        moduleKey: 'schedule',
        isEnabled: () => true,
        loadRecentActivity: async () => [],
        getEventTypeMetadata: () => null,
      },
      enabledByDefault: true,
      significanceDefaults: {
        'schedule.milestone-completed': 'notable',
        'schedule.forecast-override': 'routine',
      },
    };
    expect(registration.moduleKey).toBe('schedule');
    expect(registration.supportedEventTypes).toHaveLength(2);
    expect(registration.enabledByDefault).toBe(true);
  });

  it('event detail can be null for system events', () => {
    const event: IProjectActivityEvent = {
      eventId: 'evt-sys',
      projectId: 'proj-001',
      eventType: 'system.spine-refresh',
      category: 'system',
      sourceModule: 'system',
      sourceRecordType: 'spine',
      sourceRecordId: 'activity',
      summary: 'Activity spine refreshed.',
      detail: null,
      changedByUpn: 'system',
      changedByName: 'System',
      occurredAt: '2026-03-22T14:00:00.000Z',
      publishedAt: '2026-03-22T14:00:00.000Z',
      significance: 'routine',
      href: null,
      relatedEventIds: [],
    };
    expect(event.detail).toBeNull();
    expect(event.href).toBeNull();
  });
});
