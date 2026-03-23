import { describe, expect, it } from 'vitest';
import type {
  IActivityEvent,
  IActivityActorAttribution,
  IActivityDiffEntry,
  IActivityContextStamp,
  IActivityDedupeState,
  IActivityObjectRef,
  IActivityTimelineQuery,
  IActivityFilterState,
  IActivityTimelinePage,
  IActivityEmissionInput,
  IActivityStorageRecord,
  IActivitySourceHealthState,
  ActivityEventType,
  ActivitySyncState,
  ActivityEventConfidence,
} from './index.js';
import {
  ACTIVITY_TIMELINE_PAGE_SIZE_DEFAULT,
  ACTIVITY_TIMELINE_GROUPING_DEFAULT,
  ACTIVITY_TIMELINE_SYNC_STATES,
  ACTIVITY_TIMELINE_CONFIDENCE_STATES,
} from './index.js';

describe('SF28-T02 TypeScript Contracts', () => {
  describe('IActivityEvent', () => {
    it('satisfies all required fields', () => {
      const event: IActivityEvent = {
        eventId: 'evt-001',
        type: 'field-changed',
        actor: {
          type: 'user',
          initiatedByUpn: 'pm@example.com',
          initiatedByName: 'Jane Smith',
        },
        primaryRef: {
          moduleKey: 'financial',
          recordId: 'fc-001',
        },
        relatedRefs: [],
        timestampIso: '2026-03-23T14:00:00.000Z',
        summary: 'Q3 forecast updated.',
        details: null,
        diffEntries: [],
        context: {
          sourceModuleKey: 'financial',
          emission: 'remote',
        },
        confidence: 'trusted-authoritative',
        syncState: 'authoritative',
        recommendedOpenAction: null,
        dedupe: null,
      };

      expect(event.eventId).toBe('evt-001');
      expect(event.type).toBe('field-changed');
      expect(event.actor.initiatedByUpn).toBe('pm@example.com');
      expect(event.confidence).toBe('trusted-authoritative');
    });
  });

  describe('IActivityActorAttribution', () => {
    it('supports delegation pattern (L-05)', () => {
      const actor: IActivityActorAttribution = {
        type: 'workflow',
        initiatedByUpn: 'exec@example.com',
        initiatedByName: 'Alice Exec',
        executedByUpn: 'pm@example.com',
        executedByName: 'Jane Smith',
        onBehalfOfUpn: 'exec@example.com',
        onBehalfOfName: 'Alice Exec',
        serviceIdentity: 'publish-workflow-svc',
      };

      expect(actor.type).toBe('workflow');
      expect(actor.executedByUpn).toBe('pm@example.com');
      expect(actor.onBehalfOfUpn).toBe('exec@example.com');
      expect(actor.serviceIdentity).toBe('publish-workflow-svc');
    });

    it('supports minimal user attribution', () => {
      const actor: IActivityActorAttribution = {
        type: 'user',
        initiatedByUpn: 'user@example.com',
        initiatedByName: 'User',
      };

      expect(actor.type).toBe('user');
      expect(actor.executedByUpn).toBeUndefined();
    });
  });

  describe('IActivityDiffEntry', () => {
    it('captures field-level change', () => {
      const diff: IActivityDiffEntry = {
        fieldLabel: 'Estimated GMP',
        from: '$12,500,000',
        to: '$13,100,000',
      };

      expect(diff.fieldLabel).toBe('Estimated GMP');
      expect(diff.from).toBe('$12,500,000');
      expect(diff.to).toBe('$13,100,000');
    });

    it('supports suppressed diffs', () => {
      const diff: IActivityDiffEntry = {
        fieldLabel: 'SSN',
        from: null,
        to: null,
        suppressionReason: 'sensitive-field',
      };

      expect(diff.suppressionReason).toBe('sensitive-field');
    });
  });

  describe('IActivityDedupeState', () => {
    it('preserves raw evidence (L-07)', () => {
      const dedup: IActivityDedupeState = {
        rawEvidenceRetained: true,
        projectionAction: 'suppressed',
        reason: 'duplicate-within-threshold',
      };

      expect(dedup.rawEvidenceRetained).toBe(true);
    });
  });

  describe('IActivityTimelineQuery', () => {
    it('supports all filter dimensions', () => {
      const query: IActivityTimelineQuery = {
        projectId: 'proj-001',
        mode: 'workspace',
        eventTypes: ['field-changed', 'status-changed'],
        actorUpns: ['pm@example.com'],
        sourceModules: ['financial'],
        significance: ['notable', 'critical'],
        since: '2026-03-01T00:00:00Z',
        until: '2026-03-31T23:59:59Z',
        excludeSystemEvents: true,
        limit: 50,
      };

      expect(query.mode).toBe('workspace');
      expect(query.actorUpns).toHaveLength(1);
      expect(query.excludeSystemEvents).toBe(true);
    });
  });

  describe('IActivityEmissionInput', () => {
    it('requires minimal initiator', () => {
      const input: IActivityEmissionInput = {
        type: 'created',
        summary: 'New constraint created.',
        primaryRef: { moduleKey: 'constraints', recordId: 'c-001' },
        actor: { initiatedByUpn: 'pm@example.com', initiatedByName: 'PM' },
      };

      expect(input.type).toBe('created');
      expect(input.actor.initiatedByUpn).toBe('pm@example.com');
    });
  });

  describe('IActivityStorageRecord', () => {
    it('wraps event with storage metadata (L-02)', () => {
      const record: IActivityStorageRecord = {
        event: {
          eventId: 'evt-002', type: 'published',
          actor: { type: 'user', initiatedByUpn: 'u@e.com', initiatedByName: 'U' },
          primaryRef: { moduleKey: 'reports', recordId: 'r-001' },
          relatedRefs: [], timestampIso: '2026-03-23T15:00:00Z',
          summary: 'Report published.', details: null, diffEntries: [],
          context: { sourceModuleKey: 'reports', emission: 'remote' },
          confidence: 'trusted-authoritative', syncState: 'authoritative',
          recommendedOpenAction: null, dedupe: null,
        },
        storedAt: '2026-03-23T15:00:01Z',
        storageSystem: 'sharepoint-list',
        syncStateAtStorage: 'authoritative',
      };

      expect(record.storageSystem).toBe('sharepoint-list');
    });
  });

  describe('Reason-code enums', () => {
    it('ActivityEventType covers 18 values', () => {
      const types: ActivityEventType[] = [
        'created', 'edited', 'field-changed', 'comment-added', 'acknowledged',
        'assigned', 'reassigned', 'handoff-started', 'handoff-completed',
        'published', 'superseded', 'revoked', 'exported', 'status-changed',
        'due-date-changed', 'attachment-added', 'workflow-triggered', 'system-alert',
      ];
      expect(types).toHaveLength(18);
    });

    it('ActivitySyncState covers 4 values', () => {
      const states: ActivitySyncState[] = [
        'authoritative', 'queued-local', 'replayed', 'degraded',
      ];
      expect(states).toHaveLength(4);
    });

    it('ActivityEventConfidence covers 4 values', () => {
      const levels: ActivityEventConfidence[] = [
        'trusted-authoritative', 'queued-local-only',
        'replayed-awaiting-confirmation', 'degraded-source-context',
      ];
      expect(levels).toHaveLength(4);
    });
  });

  describe('Constants', () => {
    it('page size default is 25', () => {
      expect(ACTIVITY_TIMELINE_PAGE_SIZE_DEFAULT).toBe(25);
    });

    it('grouping default is relative-date', () => {
      expect(ACTIVITY_TIMELINE_GROUPING_DEFAULT).toBe('relative-date');
    });

    it('sync states array matches type union', () => {
      expect(ACTIVITY_TIMELINE_SYNC_STATES).toHaveLength(4);
      expect(ACTIVITY_TIMELINE_SYNC_STATES).toContain('authoritative');
    });

    it('confidence states array matches type union', () => {
      expect(ACTIVITY_TIMELINE_CONFIDENCE_STATES).toHaveLength(4);
      expect(ACTIVITY_TIMELINE_CONFIDENCE_STATES).toContain('trusted-authoritative');
    });
  });
});
