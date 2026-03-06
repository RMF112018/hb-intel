import type {
  AccessControlAdminAuditVisibility,
  AccessControlAuditEventRecord,
  AccessControlAuditEventSource,
  AccessControlAuditEventType,
  AccessControlAuditOutcome,
  AccessControlAuditRetentionPolicy,
  AccessControlAuditRetentionSnapshot,
  CanonicalAuthMode,
} from '../types.js';

/**
 * Locked Phase 5.13 default retention policy for operational audit history.
 *
 * Traceability:
 * - PH5.13-Auth-Shell-Plan.md §5.13 item 3
 * - PH5-Auth-Shell-Plan.md locked Option C (meaningful history + archive strategy)
 */
export const DEFAULT_AUDIT_RETENTION_POLICY: AccessControlAuditRetentionPolicy = {
  activeWindowDays: 180,
  archiveStrategy: 'indefinite-archive',
  futureTieringDocumented: true,
};

const DEFAULT_RECENT_LIMIT = 25;
const auditEvents: AccessControlAuditEventRecord[] = [];

/**
 * Input shape for constructing a structured audit record.
 */
export interface CreateAuditEventInput {
  eventType: AccessControlAuditEventType;
  actorId: string;
  subjectUserId: string;
  runtimeMode?: CanonicalAuthMode | 'unknown';
  source: AccessControlAuditEventSource;
  correlationId?: string;
  overrideId?: string;
  requestId?: string;
  roleId?: string;
  featureId?: string;
  action?: string;
  outcome?: AccessControlAuditOutcome;
  details?: Record<string, unknown>;
  occurredAt?: string;
}

/**
 * Build one canonical audit event with all required Phase 5.13 metadata.
 *
 * Alignment notes:
 * - D-04: deterministic event ordering via central timestamp sort helpers.
 * - D-07: explicit payload contract prevents ambiguous/untyped logging.
 * - D-10: feature modules consume events but do not own audit schema.
 * - D-12: operational visibility is projected through hooks/utilities rather
 *   than hard-coding UI concerns into backend/workflow modules.
 */
export function createStructuredAuditEvent(input: CreateAuditEventInput): AccessControlAuditEventRecord {
  const eventId = createAuditEventId(input.eventType);
  return {
    id: eventId,
    eventId,
    eventType: input.eventType,
    actorId: normalizeActor(input.actorId),
    subjectUserId: normalizeActor(input.subjectUserId),
    runtimeMode: input.runtimeMode ?? 'unknown',
    source: input.source,
    correlationId: input.correlationId ?? createCorrelationId(input.eventType),
    overrideId: input.overrideId,
    requestId: input.requestId,
    roleId: input.roleId,
    featureId: input.featureId,
    action: input.action,
    outcome: input.outcome ?? 'success',
    details: input.details,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  };
}

/**
 * Record one structured audit event in the in-memory operational stream.
 */
export function recordStructuredAuditEvent(input: CreateAuditEventInput): AccessControlAuditEventRecord {
  const event = createStructuredAuditEvent(input);
  auditEvents.unshift(event);
  return event;
}

/**
 * Return audit events newest-first for operational readers.
 */
export function getStructuredAuditEvents(): AccessControlAuditEventRecord[] {
  return sortAuditEventsNewestFirst(auditEvents);
}

/**
 * Replace current in-memory event store for deterministic tests.
 */
export function seedStructuredAuditEvents(events: AccessControlAuditEventRecord[]): void {
  auditEvents.length = 0;
  auditEvents.push(...sortAuditEventsNewestFirst(events));
}

/**
 * Clear all in-memory events.
 */
export function clearStructuredAuditEvents(): void {
  auditEvents.length = 0;
}

/**
 * Partition events according to the active-history retention window.
 *
 * Deferred capability:
 * - Event-type tiering is intentionally deferred beyond Phase 5 and is only
 *   documented through policy metadata here.
 */
export function partitionAuditEventsByRetention(
  events: AccessControlAuditEventRecord[],
  now: Date = new Date(),
  policy: AccessControlAuditRetentionPolicy = DEFAULT_AUDIT_RETENTION_POLICY,
): AccessControlAuditRetentionSnapshot {
  const cutoffMs = now.getTime() - policy.activeWindowDays * 24 * 60 * 60 * 1000;

  const active: AccessControlAuditEventRecord[] = [];
  const archived: AccessControlAuditEventRecord[] = [];

  for (const event of sortAuditEventsNewestFirst(events)) {
    const occurredMs = new Date(event.occurredAt).getTime();
    if (!Number.isFinite(occurredMs) || occurredMs >= cutoffMs) {
      active.push(event);
      continue;
    }

    archived.push(event);
  }

  return {
    active,
    archived,
    policy,
    generatedAt: now.toISOString(),
  };
}

/**
 * Build minimal admin operational visibility from structured events.
 */
export function buildAuditOperationalVisibility(params: {
  events: AccessControlAuditEventRecord[];
  now?: Date;
  policy?: AccessControlAuditRetentionPolicy;
  recentLimit?: number;
}): AccessControlAdminAuditVisibility {
  const retention = partitionAuditEventsByRetention(
    params.events,
    params.now,
    params.policy ?? DEFAULT_AUDIT_RETENTION_POLICY,
  );

  return {
    generatedAt: retention.generatedAt,
    activeCount: retention.active.length,
    archivedCount: retention.archived.length,
    recentEvents: retention.active.slice(0, params.recentLimit ?? DEFAULT_RECENT_LIMIT),
    policy: retention.policy,
  };
}

/**
 * Keep canonical event ordering for deterministic visibility and tests.
 */
export function sortAuditEventsNewestFirst(
  events: AccessControlAuditEventRecord[],
): AccessControlAuditEventRecord[] {
  return [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

function createAuditEventId(eventType: AccessControlAuditEventType): string {
  const seed = Math.random().toString(36).slice(2, 10);
  return `ace-${eventType}-${seed}`;
}

function createCorrelationId(eventType: AccessControlAuditEventType): string {
  const seed = Math.random().toString(36).slice(2, 12);
  return `corr-${eventType}-${seed}`;
}

function normalizeActor(value: string): string {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : 'system';
}
