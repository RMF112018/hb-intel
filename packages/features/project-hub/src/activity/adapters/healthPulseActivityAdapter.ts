/**
 * Health Pulse → Activity spine adapter.
 *
 * Publishes health-pulse events (status changes, triage bucket transitions,
 * recommendation actions) into the Activity spine.
 *
 * This is the first real adapter — establishes the pattern for other modules.
 *
 * Governing: P3-D1 §4 (Activity Adapter Contract), P3-D2 (Health Spine)
 */

import type {
  IActivitySourceAdapter,
  IActivityQuery,
  IActivityRuntimeContext,
  IActivityEventTypeMetadata,
  IProjectActivityEvent,
  ActivityCategory,
  ActivitySignificance,
} from '@hbc/models';

const MODULE_KEY = 'health-pulse';

const EVENT_TYPES: Record<string, IActivityEventTypeMetadata> = {
  'health-pulse.status-changed': {
    eventType: 'health-pulse.status-changed',
    label: 'Health status changed',
    category: 'status-change',
    defaultSignificance: 'notable',
  },
  'health-pulse.triage-escalated': {
    eventType: 'health-pulse.triage-escalated',
    label: 'Health triage escalated',
    category: 'alert',
    defaultSignificance: 'critical',
  },
  'health-pulse.recommendation-acted': {
    eventType: 'health-pulse.recommendation-acted',
    label: 'Health recommendation acted on',
    category: 'record-change',
    defaultSignificance: 'routine',
  },
  'health-pulse.dimension-updated': {
    eventType: 'health-pulse.dimension-updated',
    label: 'Health dimension score updated',
    category: 'record-change',
    defaultSignificance: 'routine',
  },
};

/**
 * Generate deterministic mock health-pulse events for a project.
 * In production, this would query the health-pulse event store.
 */
function generateHealthPulseEvents(
  projectId: string,
  query: IActivityQuery,
): IProjectActivityEvent[] {
  const now = new Date();
  const events: IProjectActivityEvent[] = [
    {
      eventId: `hp-evt-${projectId}-001`,
      projectId,
      eventType: 'health-pulse.status-changed',
      category: 'status-change' as ActivityCategory,
      sourceModule: MODULE_KEY,
      sourceRecordType: 'health-pulse',
      sourceRecordId: `pulse-${projectId}`,
      summary: 'Project health status changed from "watch" to "healthy"',
      detail: { previousStatus: 'watch', newStatus: 'healthy', overallScore: 78 },
      changedByUpn: 'system',
      changedByName: 'Health Pulse Engine',
      occurredAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      significance: 'notable' as ActivitySignificance,
      href: `/project-hub/${projectId}/health`,
      relatedEventIds: [],
    },
    {
      eventId: `hp-evt-${projectId}-002`,
      projectId,
      eventType: 'health-pulse.dimension-updated',
      category: 'record-change' as ActivityCategory,
      sourceModule: MODULE_KEY,
      sourceRecordType: 'health-dimension',
      sourceRecordId: `dim-cost-${projectId}`,
      summary: 'Cost dimension score improved to 82 (was 71)',
      detail: { dimension: 'cost', previousScore: 71, newScore: 82 },
      changedByUpn: 'system',
      changedByName: 'Health Pulse Engine',
      occurredAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      significance: 'routine' as ActivitySignificance,
      href: `/project-hub/${projectId}/health`,
      relatedEventIds: [],
    },
    {
      eventId: `hp-evt-${projectId}-003`,
      projectId,
      eventType: 'health-pulse.triage-escalated',
      category: 'alert' as ActivityCategory,
      sourceModule: MODULE_KEY,
      sourceRecordType: 'triage',
      sourceRecordId: `triage-${projectId}`,
      summary: 'Schedule risk escalated — triage bucket moved to "attention-now"',
      detail: { previousBucket: 'trending-down', newBucket: 'attention-now', driver: 'schedule' },
      changedByUpn: 'system',
      changedByName: 'Health Pulse Engine',
      occurredAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      significance: 'critical' as ActivitySignificance,
      href: `/project-hub/${projectId}/health`,
      relatedEventIds: [],
    },
  ];

  // Apply project filter
  const filtered = events.filter((e) => e.projectId === query.projectId);

  // Apply since filter
  if (query.since) {
    const sinceTime = new Date(query.since).getTime();
    return filtered.filter((e) => new Date(e.occurredAt).getTime() >= sinceTime);
  }

  return filtered;
}

export const healthPulseActivityAdapter: IActivitySourceAdapter = {
  moduleKey: MODULE_KEY,

  isEnabled(_context: IActivityRuntimeContext): boolean {
    return true;
  },

  async loadRecentActivity(query: IActivityQuery): Promise<IProjectActivityEvent[]> {
    return generateHealthPulseEvents(query.projectId, query);
  },

  getEventTypeMetadata(eventType: string): IActivityEventTypeMetadata | null {
    return EVENT_TYPES[eventType] ?? null;
  },
};

export const HEALTH_PULSE_ACTIVITY_REGISTRATION = {
  moduleKey: MODULE_KEY,
  supportedEventTypes: Object.keys(EVENT_TYPES),
  adapter: healthPulseActivityAdapter,
  enabledByDefault: true,
  significanceDefaults: {
    'health-pulse.status-changed': 'notable' as ActivitySignificance,
    'health-pulse.triage-escalated': 'critical' as ActivitySignificance,
    'health-pulse.recommendation-acted': 'routine' as ActivitySignificance,
    'health-pulse.dimension-updated': 'routine' as ActivitySignificance,
  },
} as const;
