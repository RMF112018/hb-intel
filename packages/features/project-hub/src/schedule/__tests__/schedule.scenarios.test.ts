import { describe, expect, it } from 'vitest';

import {
  countActivityOverrides,
  getEffectiveActivityDate,
  transitionScenarioStatus,
  validateScenarioPromotion,
} from '../scenarios/index.js';
import { createMockScenarioBranch } from '../../../testing/createMockScenarioBranch.js';
import { createMockScenarioActivityRecord } from '../../../testing/createMockScenarioActivityRecord.js';
import { scenarioActivityOverrides } from '../../../testing/mockScenarioScenarios.js';

describe('P3-E5-T04 schedule scenarios', () => {
  describe('transitionScenarioStatus', () => {
    it('Draft → UnderReview via submitForReview', () => {
      expect(transitionScenarioStatus('Draft', 'submitForReview')).toBe('UnderReview');
    });

    it('Draft → Archived via archive', () => {
      expect(transitionScenarioStatus('Draft', 'archive')).toBe('Archived');
    });

    it('UnderReview → Approved via approve', () => {
      expect(transitionScenarioStatus('UnderReview', 'approve')).toBe('Approved');
    });

    it('UnderReview → Rejected via reject', () => {
      expect(transitionScenarioStatus('UnderReview', 'reject')).toBe('Rejected');
    });

    it('Approved → PromotedToCommitment via promoteToCommitment', () => {
      expect(transitionScenarioStatus('Approved', 'promoteToCommitment')).toBe('PromotedToCommitment');
    });

    it('Approved → PromotedToPublication via promoteToPublication', () => {
      expect(transitionScenarioStatus('Approved', 'promoteToPublication')).toBe('PromotedToPublication');
    });

    it('Approved → Archived via archive', () => {
      expect(transitionScenarioStatus('Approved', 'archive')).toBe('Archived');
    });

    it('Rejected → Archived via archive', () => {
      expect(transitionScenarioStatus('Rejected', 'archive')).toBe('Archived');
    });

    it('throws on invalid: Draft → approve', () => {
      expect(() => transitionScenarioStatus('Draft', 'approve')).toThrow(
        "cannot 'approve' from 'Draft'",
      );
    });

    it('throws on invalid: Archived → submitForReview', () => {
      expect(() => transitionScenarioStatus('Archived', 'submitForReview')).toThrow();
    });
  });

  describe('validateScenarioPromotion (§5.4)', () => {
    it('allows PromoteToCommitment from Approved with overrides', () => {
      const scenario = createMockScenarioBranch({ status: 'Approved' });
      const result = validateScenarioPromotion(
        scenario,
        'PromoteToCommitment',
        [scenarioActivityOverrides.withDateOverride],
      );
      expect(result.canPromote).toBe(true);
    });

    it('blocks PromoteToCommitment without activity overrides', () => {
      const scenario = createMockScenarioBranch({ status: 'Approved' });
      const result = validateScenarioPromotion(
        scenario,
        'PromoteToCommitment',
        [scenarioActivityOverrides.noOverride],
      );
      expect(result.canPromote).toBe(false);
      expect(result.blockers[0]).toContain('at least one activity');
    });

    it('blocks promotion from Draft status', () => {
      const scenario = createMockScenarioBranch({ status: 'Draft' });
      const result = validateScenarioPromotion(
        scenario,
        'PromoteToCommitment',
        [scenarioActivityOverrides.withDateOverride],
      );
      expect(result.canPromote).toBe(false);
      expect(result.blockers[0]).toContain("'Approved'");
    });

    it('allows PromoteToPublication from Approved', () => {
      const scenario = createMockScenarioBranch({ status: 'Approved' });
      const result = validateScenarioPromotion(scenario, 'PromoteToPublication', []);
      expect(result.canPromote).toBe(true);
    });

    it('blocks PromoteToBaseline without PE approver', () => {
      const scenario = createMockScenarioBranch({ status: 'Approved' });
      const result = validateScenarioPromotion(scenario, 'PromoteToBaseline', []);
      expect(result.canPromote).toBe(false);
      expect(result.blockers[0]).toContain('PE approval');
    });

    it('allows PromoteToBaseline with PE approver', () => {
      const scenario = createMockScenarioBranch({ status: 'Approved' });
      const result = validateScenarioPromotion(scenario, 'PromoteToBaseline', [], 'pe-user-001');
      expect(result.canPromote).toBe(true);
    });

    it('blocks None disposition', () => {
      const scenario = createMockScenarioBranch({ status: 'Approved' });
      const result = validateScenarioPromotion(scenario, 'None', []);
      expect(result.canPromote).toBe(false);
    });
  });

  describe('getEffectiveActivityDate (§5.2)', () => {
    it('returns scenario start date when override is set', () => {
      const override = createMockScenarioActivityRecord({
        scenarioStartDate: '2026-05-01',
      });
      expect(getEffectiveActivityDate(override, '2026-04-01', 'start')).toBe('2026-05-01');
    });

    it('returns source date when override start is null', () => {
      const override = createMockScenarioActivityRecord({ scenarioStartDate: null });
      expect(getEffectiveActivityDate(override, '2026-04-01', 'start')).toBe('2026-04-01');
    });

    it('returns scenario finish date when override is set', () => {
      const override = createMockScenarioActivityRecord({
        scenarioFinishDate: '2026-08-01',
      });
      expect(getEffectiveActivityDate(override, '2026-06-01', 'finish')).toBe('2026-08-01');
    });

    it('returns source date when no override record exists', () => {
      expect(getEffectiveActivityDate(null, '2026-06-01', 'finish')).toBe('2026-06-01');
    });
  });

  describe('countActivityOverrides', () => {
    it('counts activities with date overrides', () => {
      expect(countActivityOverrides([
        scenarioActivityOverrides.withDateOverride,
        scenarioActivityOverrides.noOverride,
      ])).toBe(1);
    });

    it('counts activities with float overrides', () => {
      expect(countActivityOverrides([scenarioActivityOverrides.withFloatOverride])).toBe(1);
    });

    it('returns 0 for all-null activities', () => {
      expect(countActivityOverrides([scenarioActivityOverrides.noOverride])).toBe(0);
    });

    it('counts all when all have overrides', () => {
      expect(countActivityOverrides([
        scenarioActivityOverrides.withDateOverride,
        scenarioActivityOverrides.withFloatOverride,
      ])).toBe(2);
    });

    it('returns 0 for empty array', () => {
      expect(countActivityOverrides([])).toBe(0);
    });
  });
});
