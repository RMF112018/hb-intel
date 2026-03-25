import { describe, expect, it } from 'vitest';

import {
  canOverrideReduceWithoutDeviation,
  canPlanSkipPreliminaryActivation,
  canResponsiblePartySelfCloseGate,
  doesGateFailureDegradePlanReadiness,
  isControlGateTerminal,
  isGateFailureConsequence,
  isGateSoftGated,
  isMandatoryCoverageRemovable,
  isPlanReadinessComplete,
  isPlanTerminal,
  isProjectAdditionAdditive,
  isValidControlGateTransition,
  isValidPlanActivationTransition,
  requiresBothActivationDepths,
  shouldFindingSpawnIssue,
} from '../../index.js';

import type { IPlanReadinessPosture } from '../../index.js';

describe('P3-E15-T10 Stage 4 QC plans-reviews business rules', () => {
  // -- Control gate transitions -------------------------------------------------

  describe('isValidControlGateTransition', () => {
    it('NOT_READY → READY_WITH_CONDITIONS is valid', () => {
      expect(isValidControlGateTransition('NOT_READY', 'READY_WITH_CONDITIONS')).toBe(true);
    });
    it('NOT_READY → ACCEPTED is invalid', () => {
      expect(isValidControlGateTransition('NOT_READY', 'ACCEPTED')).toBe(false);
    });
    it('READY_FOR_REVIEW → ACCEPTED is valid', () => {
      expect(isValidControlGateTransition('READY_FOR_REVIEW', 'ACCEPTED')).toBe(true);
    });
    it('ACCEPTED → NOT_READY is invalid', () => {
      expect(isValidControlGateTransition('ACCEPTED', 'NOT_READY')).toBe(false);
    });
  });

  // -- Plan activation transitions ----------------------------------------------

  describe('isValidPlanActivationTransition', () => {
    it('DRAFT → IN_REVIEW is valid', () => {
      expect(isValidPlanActivationTransition('DRAFT', 'IN_REVIEW')).toBe(true);
    });
    it('DRAFT → ACTIVE is invalid', () => {
      expect(isValidPlanActivationTransition('DRAFT', 'ACTIVE')).toBe(false);
    });
    it('IN_REVIEW → PRELIMINARILY_ACTIVE is valid', () => {
      expect(isValidPlanActivationTransition('IN_REVIEW', 'PRELIMINARILY_ACTIVE')).toBe(true);
    });
    it('PRELIMINARILY_ACTIVE → ACTIVE is valid', () => {
      expect(isValidPlanActivationTransition('PRELIMINARILY_ACTIVE', 'ACTIVE')).toBe(true);
    });
  });

  // -- Preliminary activation guard ---------------------------------------------

  describe('canPlanSkipPreliminaryActivation', () => {
    it('returns true when no unresolved dependencies', () => {
      expect(canPlanSkipPreliminaryActivation(false)).toBe(true);
    });
    it('returns false when dependencies are unresolved', () => {
      expect(canPlanSkipPreliminaryActivation(true)).toBe(false);
    });
  });

  // -- Mandatory coverage -------------------------------------------------------

  describe('isMandatoryCoverageRemovable', () => {
    it('always returns false', () => {
      expect(isMandatoryCoverageRemovable()).toBe(false);
    });
  });

  // -- Project addition additive ------------------------------------------------

  describe('isProjectAdditionAdditive', () => {
    it('returns true for ADD_HIGH_RISK', () => { expect(isProjectAdditionAdditive('ADD_HIGH_RISK')).toBe(true); });
    it('returns true for ADD_EXTRA_GATE', () => { expect(isProjectAdditionAdditive('ADD_EXTRA_GATE')).toBe(true); });
    it('returns true for ADD_EXTRA_EVIDENCE', () => { expect(isProjectAdditionAdditive('ADD_EXTRA_EVIDENCE')).toBe(true); });
    it('returns true for ADD_EXTRA_APPROVAL', () => { expect(isProjectAdditionAdditive('ADD_EXTRA_APPROVAL')).toBe(true); });
  });

  // -- Override constraint ------------------------------------------------------

  describe('canOverrideReduceWithoutDeviation', () => {
    it('always returns false', () => {
      expect(canOverrideReduceWithoutDeviation()).toBe(false);
    });
  });

  // -- Finding spawn ------------------------------------------------------------

  describe('shouldFindingSpawnIssue', () => {
    it('returns true for CREATES_OPERATIONAL_FOLLOWUP', () => { expect(shouldFindingSpawnIssue('CREATES_OPERATIONAL_FOLLOWUP')).toBe(true); });
    it('returns true for BLOCKS_GATE', () => { expect(shouldFindingSpawnIssue('BLOCKS_GATE')).toBe(true); });
    it('returns true for UNRESOLVABLE_IN_REVIEW', () => { expect(shouldFindingSpawnIssue('UNRESOLVABLE_IN_REVIEW')).toBe(true); });
    it('returns true for REVIEWER_MARKS_TRACKED', () => { expect(shouldFindingSpawnIssue('REVIEWER_MARKS_TRACKED')).toBe(true); });
  });

  // -- Gate failure consequences ------------------------------------------------

  describe('isGateFailureConsequence', () => {
    it('BLOCKED + SPAWN_ISSUE is true', () => { expect(isGateFailureConsequence('BLOCKED', 'SPAWN_ISSUE')).toBe(true); });
    it('BLOCKED + ESCALATE is false', () => { expect(isGateFailureConsequence('BLOCKED', 'ESCALATE')).toBe(false); });
    it('ESCALATED + ESCALATE is true', () => { expect(isGateFailureConsequence('ESCALATED', 'ESCALATE')).toBe(true); });
  });

  // -- Verifier separation ------------------------------------------------------

  describe('canResponsiblePartySelfCloseGate', () => {
    it('always returns false', () => {
      expect(canResponsiblePartySelfCloseGate()).toBe(false);
    });
  });

  // -- Plan readiness -----------------------------------------------------------

  describe('isPlanReadinessComplete', () => {
    const makePosture = (overrides: Partial<IPlanReadinessPosture> = {}): IPlanReadinessPosture => ({
      workPackageQualityPlanId: 'plan-1',
      projectId: 'proj-1',
      activationDepth: 'FULL',
      readinessLevel: 'COMPLETE',
      totalGateCount: 5,
      gatesReady: 5,
      gatesBlocked: 0,
      gatesEscalated: 0,
      openExceptionCount: 0,
      blockedSignals: [],
      escalatedSignals: [],
      ...overrides,
    });

    it('returns true when all gates ready and no issues', () => {
      expect(isPlanReadinessComplete(makePosture())).toBe(true);
    });
    it('returns false when gatesBlocked > 0', () => {
      expect(isPlanReadinessComplete(makePosture({ gatesBlocked: 1 }))).toBe(false);
    });
  });

  // -- Terminal checks ----------------------------------------------------------

  describe('isControlGateTerminal', () => {
    it('ACCEPTED is terminal', () => { expect(isControlGateTerminal('ACCEPTED')).toBe(true); });
    it('NOT_READY is not terminal', () => { expect(isControlGateTerminal('NOT_READY')).toBe(false); });
    it('BLOCKED is not terminal', () => { expect(isControlGateTerminal('BLOCKED')).toBe(false); });
  });

  describe('isPlanTerminal', () => {
    it('SUPERSEDED is terminal', () => { expect(isPlanTerminal('SUPERSEDED')).toBe(true); });
    it('CLOSED is terminal', () => { expect(isPlanTerminal('CLOSED')).toBe(true); });
    it('ACTIVE is not terminal', () => { expect(isPlanTerminal('ACTIVE')).toBe(false); });
  });

  // -- Boolean invariants -------------------------------------------------------

  describe('isGateSoftGated', () => {
    it('always returns true', () => { expect(isGateSoftGated()).toBe(true); });
  });

  describe('doesGateFailureDegradePlanReadiness', () => {
    it('always returns true', () => { expect(doesGateFailureDegradePlanReadiness()).toBe(true); });
  });

  describe('requiresBothActivationDepths', () => {
    it('always returns true', () => { expect(requiresBothActivationDepths()).toBe(true); });
  });
});
