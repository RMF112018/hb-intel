import type { AccessControlAdminAuditVisibility, AccessControlAuditEventRecord, AccessControlAuditEventSource, AccessControlAuditEventType, AccessControlAuditOutcome, AccessControlAuditRetentionPolicy, AccessControlAuditRetentionSnapshot, CanonicalAuthMode } from '../types.js';
/**
 * Locked Phase 5.13 default retention policy for operational audit history.
 *
 * Traceability:
 * - PH5.13-Auth-Shell-Plan.md §5.13 item 3
 * - PH5-Auth-Shell-Plan.md locked Option C (meaningful history + archive strategy)
 */
export declare const DEFAULT_AUDIT_RETENTION_POLICY: AccessControlAuditRetentionPolicy;
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
export declare function createStructuredAuditEvent(input: CreateAuditEventInput): AccessControlAuditEventRecord;
/**
 * Record one structured audit event in the in-memory operational stream.
 */
export declare function recordStructuredAuditEvent(input: CreateAuditEventInput): AccessControlAuditEventRecord;
/**
 * Return audit events newest-first for operational readers.
 */
export declare function getStructuredAuditEvents(): AccessControlAuditEventRecord[];
/**
 * Replace current in-memory event store for deterministic tests.
 */
export declare function seedStructuredAuditEvents(events: AccessControlAuditEventRecord[]): void;
/**
 * Clear all in-memory events.
 */
export declare function clearStructuredAuditEvents(): void;
/**
 * Partition events according to the active-history retention window.
 *
 * Deferred capability:
 * - Event-type tiering is intentionally deferred beyond Phase 5 and is only
 *   documented through policy metadata here.
 */
export declare function partitionAuditEventsByRetention(events: AccessControlAuditEventRecord[], now?: Date, policy?: AccessControlAuditRetentionPolicy): AccessControlAuditRetentionSnapshot;
/**
 * Build minimal admin operational visibility from structured events.
 */
export declare function buildAuditOperationalVisibility(params: {
    events: AccessControlAuditEventRecord[];
    now?: Date;
    policy?: AccessControlAuditRetentionPolicy;
    recentLimit?: number;
}): AccessControlAdminAuditVisibility;
/**
 * Keep canonical event ordering for deterministic visibility and tests.
 */
export declare function sortAuditEventsNewestFirst(events: AccessControlAuditEventRecord[]): AccessControlAuditEventRecord[];
//# sourceMappingURL=auditLogger.d.ts.map