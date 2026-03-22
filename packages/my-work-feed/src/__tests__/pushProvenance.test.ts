import { describe, expect, it } from 'vitest';
import {
  createPushToTeamSourceMeta,
  isPushToTeamItem,
  getPushProvenance,
} from '../utils/pushProvenance.js';
import { createMockMyWorkItem } from '../../testing/createMockMyWorkItem.js';

describe('pushProvenance', () => {
  describe('createPushToTeamSourceMeta', () => {
    it('produces source meta with module source and push event type', () => {
      const meta = createPushToTeamSourceMeta({
        originRole: 'portfolio-executive-reviewer',
        originAnnotationId: 'ann-001',
        pushedAtIso: '2026-03-22T14:30:00.000Z',
      });

      expect(meta.source).toBe('module');
      expect(meta.sourceEventType).toBe('push-to-project-team');
      expect(meta.originRole).toBe('portfolio-executive-reviewer');
      expect(meta.originAnnotationId).toBe('ann-001');
      expect(meta.pushTimestamp).toBe('2026-03-22T14:30:00.000Z');
      expect(meta.sourceUpdatedAtIso).toBe('2026-03-22T14:30:00.000Z');
    });

    it('includes optional originReviewRunId when provided', () => {
      const meta = createPushToTeamSourceMeta({
        originRole: 'portfolio-executive-reviewer',
        originAnnotationId: 'ann-002',
        originReviewRunId: 'run-123',
        pushedAtIso: '2026-03-22T15:00:00.000Z',
      });

      expect(meta.originReviewRunId).toBe('run-123');
    });

    it('uses originAnnotationId as sourceItemId by default', () => {
      const meta = createPushToTeamSourceMeta({
        originRole: 'portfolio-executive-reviewer',
        originAnnotationId: 'ann-003',
        pushedAtIso: '2026-03-22T15:00:00.000Z',
      });

      expect(meta.sourceItemId).toBe('ann-003');
    });

    it('allows custom sourceItemId override', () => {
      const meta = createPushToTeamSourceMeta({
        originRole: 'portfolio-executive-reviewer',
        originAnnotationId: 'ann-004',
        pushedAtIso: '2026-03-22T15:00:00.000Z',
        sourceItemId: 'custom-id',
      });

      expect(meta.sourceItemId).toBe('custom-id');
    });
  });

  describe('isPushToTeamItem', () => {
    it('returns true for push-to-team items', () => {
      const item = createMockMyWorkItem({
        sourceMeta: [
          createPushToTeamSourceMeta({
            originRole: 'portfolio-executive-reviewer',
            originAnnotationId: 'ann-005',
            pushedAtIso: '2026-03-22T14:30:00.000Z',
          }),
        ],
      });

      expect(isPushToTeamItem(item)).toBe(true);
    });

    it('returns false for regular work items', () => {
      const item = createMockMyWorkItem();
      expect(isPushToTeamItem(item)).toBe(false);
    });

    it('returns false for module source without push event type', () => {
      const item = createMockMyWorkItem({
        sourceMeta: [
          {
            source: 'module',
            sourceEventType: 'report-approval',
            sourceItemId: 'report-001',
            sourceUpdatedAtIso: '2026-03-22T14:30:00.000Z',
          },
        ],
      });

      expect(isPushToTeamItem(item)).toBe(false);
    });
  });

  describe('getPushProvenance', () => {
    it('extracts push source meta from a push-to-team item', () => {
      const pushMeta = createPushToTeamSourceMeta({
        originRole: 'portfolio-executive-reviewer',
        originAnnotationId: 'ann-006',
        originReviewRunId: 'run-456',
        pushedAtIso: '2026-03-22T14:30:00.000Z',
      });

      const item = createMockMyWorkItem({
        sourceMeta: [pushMeta],
      });

      const provenance = getPushProvenance(item);
      expect(provenance).toBeDefined();
      expect(provenance?.originRole).toBe('portfolio-executive-reviewer');
      expect(provenance?.originAnnotationId).toBe('ann-006');
      expect(provenance?.originReviewRunId).toBe('run-456');
      expect(provenance?.pushTimestamp).toBe('2026-03-22T14:30:00.000Z');
    });

    it('returns undefined for non-push items', () => {
      const item = createMockMyWorkItem();
      expect(getPushProvenance(item)).toBeUndefined();
    });

    it('finds push meta even when mixed with other source entries', () => {
      const pushMeta = createPushToTeamSourceMeta({
        originRole: 'portfolio-executive-reviewer',
        originAnnotationId: 'ann-007',
        pushedAtIso: '2026-03-22T14:30:00.000Z',
      });

      const item = createMockMyWorkItem({
        sourceMeta: [
          {
            source: 'bic-next-move',
            sourceItemId: 'bic-001',
            sourceUpdatedAtIso: '2026-03-22T10:00:00.000Z',
          },
          pushMeta,
        ],
      });

      const provenance = getPushProvenance(item);
      expect(provenance?.originAnnotationId).toBe('ann-007');
    });
  });
});
