import { describe, expect, it } from 'vitest';

import {
  calculateLessonsRelevanceScore,
  isSubIntelligenceQueryAllowed,
  canGenerateSnapshot,
  isProjectHubSurfaceReadOnly,
} from '../../index.js';

describe('P3-E10-T08 Closeout consumption business rules', () => {
  // -- Relevance Score (§2.1) ------------------------------------------------

  describe('calculateLessonsRelevanceScore', () => {
    it('returns max score when all dimensions match + high applicability', () => {
      const project = { marketSector: 'K12Education', deliveryMethod: 'GMP', sizeBand: 'FifteenToFiftyM' };
      const entry = { marketSector: 'K12Education', deliveryMethod: 'GMP', projectSizeBand: 'FifteenToFiftyM', applicability: 5 };
      // 3 + 2 + 1 + 5*0.5 = 8.5
      expect(calculateLessonsRelevanceScore(project, entry)).toBe(8.5);
    });

    it('returns only applicability when no dimensions match', () => {
      const project = { marketSector: 'K12Education', deliveryMethod: 'GMP', sizeBand: 'FifteenToFiftyM' };
      const entry = { marketSector: 'HealthcareMedical', deliveryMethod: 'DesignBuild', projectSizeBand: 'Under1M', applicability: 3 };
      // 0 + 0 + 0 + 3*0.5 = 1.5
      expect(calculateLessonsRelevanceScore(project, entry)).toBe(1.5);
    });

    it('gives 3 points for sector match', () => {
      const project = { marketSector: 'K12Education', deliveryMethod: 'GMP', sizeBand: 'FifteenToFiftyM' };
      const entry = { marketSector: 'K12Education', deliveryMethod: 'DesignBuild', projectSizeBand: 'Under1M', applicability: 1 };
      // 3 + 0 + 0 + 0.5 = 3.5
      expect(calculateLessonsRelevanceScore(project, entry)).toBe(3.5);
    });
  });

  // -- SubIntelligence Role Gating (§2.2) ------------------------------------

  describe('isSubIntelligenceQueryAllowed', () => {
    it('allows PE', () => { expect(isSubIntelligenceQueryAllowed('PE')).toBe(true); });
    it('allows PER', () => { expect(isSubIntelligenceQueryAllowed('PER')).toBe(true); });
    it('allows MOE', () => { expect(isSubIntelligenceQueryAllowed('MOE')).toBe(true); });
    it('allows SUB_INTELLIGENCE_VIEWER', () => { expect(isSubIntelligenceQueryAllowed('SUB_INTELLIGENCE_VIEWER')).toBe(true); });
    it('rejects PM', () => { expect(isSubIntelligenceQueryAllowed('PM')).toBe(false); });
    it('rejects SUPT', () => { expect(isSubIntelligenceQueryAllowed('SUPT')).toBe(false); });
  });

  // -- Snapshot Preconditions (§6.2) -----------------------------------------

  describe('canGenerateSnapshot', () => {
    it('allows PE with PE_APPROVED status', () => {
      expect(canGenerateSnapshot('PE_APPROVED', 'PE')).toBe(true);
    });

    it('allows PE with PUBLISHED status', () => {
      expect(canGenerateSnapshot('PUBLISHED', 'PE')).toBe(true);
    });

    it('rejects non-PE caller', () => {
      expect(canGenerateSnapshot('PE_APPROVED', 'PM')).toBe(false);
    });

    it('rejects DRAFT status', () => {
      expect(canGenerateSnapshot('DRAFT', 'PE')).toBe(false);
    });

    it('rejects SUBMITTED status', () => {
      expect(canGenerateSnapshot('SUBMITTED', 'PE')).toBe(false);
    });
  });

  // -- Read-Only (§1) --------------------------------------------------------

  describe('isProjectHubSurfaceReadOnly', () => {
    it('always returns true', () => {
      expect(isProjectHubSurfaceReadOnly()).toBe(true);
    });
  });
});
