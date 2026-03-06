import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildAuditOperationalVisibility,
  clearStructuredAuditEvents,
  createStructuredAuditEvent,
  partitionAuditEventsByRetention,
  recordStructuredAuditEvent,
} from './auditLogger.js';

describe('auditLogger', () => {
  beforeEach(() => {
    clearStructuredAuditEvents();
  });

  it('creates structured events with required metadata defaults', () => {
    const event = createStructuredAuditEvent({
      eventType: 'sign-in',
      actorId: 'user-1',
      subjectUserId: 'user-1',
      source: 'auth-store',
    });

    expect(event.eventId).toContain('ace-sign-in-');
    expect(event.id).toBe(event.eventId);
    expect(event.runtimeMode).toBe('unknown');
    expect(event.correlationId).toContain('corr-sign-in-');
    expect(event.outcome).toBe('success');
  });

  it('partitions retention with 180-day active history and archived remainder', () => {
    const now = new Date('2026-03-06T00:00:00.000Z');
    const withinWindow = createStructuredAuditEvent({
      eventType: 'request-approved',
      actorId: 'admin-1',
      subjectUserId: 'user-1',
      source: 'admin',
      occurredAt: '2025-12-01T00:00:00.000Z',
    });
    const olderThanWindow = createStructuredAuditEvent({
      eventType: 'request-submitted',
      actorId: 'user-1',
      subjectUserId: 'user-1',
      source: 'workflow',
      occurredAt: '2025-08-01T00:00:00.000Z',
    });

    const partition = partitionAuditEventsByRetention([withinWindow, olderThanWindow], now);

    expect(partition.active).toHaveLength(1);
    expect(partition.archived).toHaveLength(1);
    expect(partition.policy.activeWindowDays).toBe(180);
    expect(partition.policy.archiveStrategy).toBe('indefinite-archive');
  });

  it('builds operational visibility summary using newest active events', () => {
    recordStructuredAuditEvent({
      eventType: 'sign-in',
      actorId: 'user-1',
      subjectUserId: 'user-1',
      source: 'auth-store',
      occurredAt: '2026-03-06T02:00:00.000Z',
    });
    recordStructuredAuditEvent({
      eventType: 'sign-out',
      actorId: 'user-1',
      subjectUserId: 'user-1',
      source: 'auth-store',
      occurredAt: '2026-03-06T03:00:00.000Z',
    });

    const visibility = buildAuditOperationalVisibility({
      events: [
        createStructuredAuditEvent({
          eventType: 'request-submitted',
          actorId: 'user-1',
          subjectUserId: 'user-1',
          source: 'workflow',
          occurredAt: '2025-01-01T00:00:00.000Z',
        }),
        createStructuredAuditEvent({
          eventType: 'request-approved',
          actorId: 'admin-1',
          subjectUserId: 'user-1',
          source: 'admin',
          occurredAt: '2026-03-05T00:00:00.000Z',
        }),
      ],
      now: new Date('2026-03-06T00:00:00.000Z'),
      recentLimit: 1,
    });

    expect(visibility.activeCount).toBe(1);
    expect(visibility.archivedCount).toBe(1);
    expect(visibility.recentEvents).toHaveLength(1);
  });
});
