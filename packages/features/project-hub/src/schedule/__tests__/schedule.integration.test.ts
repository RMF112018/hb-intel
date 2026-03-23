import { describe, expect, it } from 'vitest';

import {
  getAnnotatableFields,
  getComplexityTierFeatures,
  getDefaultAssigneeForWorkItem,
  isAnnotatableSurface,
} from '../integration/index.js';

describe('P3-E5-T09 schedule integration', () => {
  describe('getComplexityTierFeatures (§18.5)', () => {
    it('returns features for Essential tier', () => {
      const features = getComplexityTierFeatures('Essential');
      expect(features.length).toBeGreaterThan(0);
      expect(features).toContain('Milestone status');
    });

    it('returns features for Standard tier', () => {
      const features = getComplexityTierFeatures('Standard');
      expect(features).toContain('Activity list');
    });

    it('returns features for Expert tier', () => {
      const features = getComplexityTierFeatures('Expert');
      expect(features).toContain('Full analytics');
      expect(features.length).toBeGreaterThan(5);
    });
  });

  describe('isAnnotatableSurface (§23)', () => {
    it('returns true for PublishedActivitySnapshot', () => {
      expect(isAnnotatableSurface('PublishedActivitySnapshot')).toBe(true);
    });

    it('returns true for MilestoneRecord', () => {
      expect(isAnnotatableSurface('MilestoneRecord')).toBe(true);
    });

    it('returns false for non-annotatable surface', () => {
      expect(isAnnotatableSurface('FieldWorkPackage')).toBe(false);
    });

    it('returns false for arbitrary string', () => {
      expect(isAnnotatableSurface('NonExistent')).toBe(false);
    });
  });

  describe('getAnnotatableFields (§23)', () => {
    it('returns fields for PublishedActivitySnapshot', () => {
      const fields = getAnnotatableFields('PublishedActivitySnapshot');
      expect(fields).toContain('publishedFinishDate');
      expect(fields).toContain('varianceFromBaselineDays');
    });

    it('returns fields for PublicationRecord', () => {
      const fields = getAnnotatableFields('PublicationRecord');
      expect(fields).toContain('reconciliationSummary');
    });

    it('returns fields for ScheduleSummaryProjection', () => {
      const fields = getAnnotatableFields('ScheduleSummaryProjection');
      expect(fields).toContain('overallStatus');
    });
  });

  describe('getDefaultAssigneeForWorkItem (§18.3)', () => {
    it('returns PM for MilestoneAtRisk', () => {
      expect(getDefaultAssigneeForWorkItem('MilestoneAtRisk')).toBe('PM');
    });

    it('returns PM + PE for MilestoneDelayed', () => {
      expect(getDefaultAssigneeForWorkItem('MilestoneDelayed')).toBe('PM + PE');
    });

    it('returns PE for PublicationPendingReview', () => {
      expect(getDefaultAssigneeForWorkItem('PublicationPendingReview')).toBe('PE');
    });

    it('returns Responsible party for CommitmentPendingAcknowledgement', () => {
      expect(getDefaultAssigneeForWorkItem('CommitmentPendingAcknowledgement')).toBe('Responsible party');
    });
  });
});
