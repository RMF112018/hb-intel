import { describe, expect, it } from 'vitest';

import type {
  IControlGateRequirement,
  IFindingToIssueSpawnRecord,
  IPlanAddendum,
  IPlanCoverageEntry,
  IPlanOverride,
  IPlanReadinessPosture,
  IReviewPackagePhase,
} from '../../index.js';

import {
  CONTROL_GATE_TERMINAL_STATUSES,
  CONTROL_GATE_VALID_TRANSITIONS,
  FINDING_TO_ISSUE_SPAWN_CONDITIONS,
  MANDATORY_COVERAGE_FLOOR_ITEMS,
  PLAN_ACTIVATION_VALID_TRANSITIONS,
  PLAN_TERMINAL_STATES,
  QC_ADDENDUM_TYPES,
  QC_CONTROL_GATE_STATUS_LABELS,
  QC_CONTROL_GATE_STATUSES,
  QC_COVERAGE_RULE_TYPES,
  QC_FINDING_TO_ISSUE_CONDITIONS,
  QC_GATE_FAILURE_CONSEQUENCE_LABELS,
  QC_GATE_FAILURE_CONSEQUENCES,
  QC_OVERRIDE_TYPES,
  QC_PLAN_ACTIVATION_DEPTHS,
  QC_PLAN_COVERAGE_ACTIONS,
  QC_PLAN_READINESS_LEVEL_LABELS,
  QC_PLAN_READINESS_LEVELS,
  QC_REVIEW_PHASE_TYPE_LABELS,
  QC_REVIEW_PHASE_TYPES,
} from '../../index.js';

describe('P3-E15-T10 Stage 4 QC plans-reviews contract stability', () => {
  // -- Enum array lengths -------------------------------------------------------

  describe('enum arrays', () => {
    it('QC_CONTROL_GATE_STATUSES has 6', () => { expect(QC_CONTROL_GATE_STATUSES).toHaveLength(6); });
    it('QC_PLAN_ACTIVATION_DEPTHS has 2', () => { expect(QC_PLAN_ACTIVATION_DEPTHS).toHaveLength(2); });
    it('QC_COVERAGE_RULE_TYPES has 2', () => { expect(QC_COVERAGE_RULE_TYPES).toHaveLength(2); });
    it('QC_ADDENDUM_TYPES has 4', () => { expect(QC_ADDENDUM_TYPES).toHaveLength(4); });
    it('QC_OVERRIDE_TYPES has 2', () => { expect(QC_OVERRIDE_TYPES).toHaveLength(2); });
    it('QC_GATE_FAILURE_CONSEQUENCES has 4', () => { expect(QC_GATE_FAILURE_CONSEQUENCES).toHaveLength(4); });
    it('QC_FINDING_TO_ISSUE_CONDITIONS has 4', () => { expect(QC_FINDING_TO_ISSUE_CONDITIONS).toHaveLength(4); });
    it('QC_PLAN_READINESS_LEVELS has 5', () => { expect(QC_PLAN_READINESS_LEVELS).toHaveLength(5); });
    it('QC_REVIEW_PHASE_TYPES has 5', () => { expect(QC_REVIEW_PHASE_TYPES).toHaveLength(5); });
    it('QC_PLAN_COVERAGE_ACTIONS has 4', () => { expect(QC_PLAN_COVERAGE_ACTIONS).toHaveLength(4); });
  });

  // -- Label maps ---------------------------------------------------------------

  describe('label maps', () => {
    it('QC_CONTROL_GATE_STATUS_LABELS covers 6', () => { expect(Object.keys(QC_CONTROL_GATE_STATUS_LABELS)).toHaveLength(6); });
    it('QC_PLAN_READINESS_LEVEL_LABELS covers 5', () => { expect(Object.keys(QC_PLAN_READINESS_LEVEL_LABELS)).toHaveLength(5); });
    it('QC_REVIEW_PHASE_TYPE_LABELS covers 5', () => { expect(Object.keys(QC_REVIEW_PHASE_TYPE_LABELS)).toHaveLength(5); });
    it('QC_GATE_FAILURE_CONSEQUENCE_LABELS covers 4', () => { expect(Object.keys(QC_GATE_FAILURE_CONSEQUENCE_LABELS)).toHaveLength(4); });
  });

  // -- Transition tables --------------------------------------------------------

  describe('transition tables', () => {
    it('CONTROL_GATE_VALID_TRANSITIONS has 10', () => { expect(CONTROL_GATE_VALID_TRANSITIONS).toHaveLength(10); });
    it('PLAN_ACTIVATION_VALID_TRANSITIONS has 13', () => { expect(PLAN_ACTIVATION_VALID_TRANSITIONS).toHaveLength(13); });
  });

  // -- Terminal / classification constants --------------------------------------

  describe('terminal and classification constants', () => {
    it('CONTROL_GATE_TERMINAL_STATUSES has 1', () => { expect(CONTROL_GATE_TERMINAL_STATUSES).toHaveLength(1); });
    it('PLAN_TERMINAL_STATES has 2', () => { expect(PLAN_TERMINAL_STATES).toHaveLength(2); });
    it('FINDING_TO_ISSUE_SPAWN_CONDITIONS has 4', () => { expect(FINDING_TO_ISSUE_SPAWN_CONDITIONS).toHaveLength(4); });
    it('MANDATORY_COVERAGE_FLOOR_ITEMS has 6', () => { expect(MANDATORY_COVERAGE_FLOOR_ITEMS).toHaveLength(6); });
  });

  // -- Type contract stability --------------------------------------------------

  describe('type contract stability', () => {
    it('IControlGateRequirement can be typed correctly', () => {
      const gate: IControlGateRequirement = {
        controlGateRequirementId: 'gate-1',
        projectId: 'proj-1',
        workPackageQualityPlanId: 'plan-1',
        gateType: 'HOLD_POINT',
        title: 'Hold Point A',
        workPackageRef: 'wp-1',
        prerequisites: ['prereq-1'],
        responsibleOrganization: 'org-1',
        responsibleIndividual: null,
        designatedVerifierRef: null,
        evidenceMinimums: ['ev-1'],
        acceptanceCriteriaSummary: 'All clear',
        readinessEffectIfNotSatisfied: 'Blocks readiness',
        relatedReviewPackageRefs: [],
        relatedTestRefs: [],
        status: 'NOT_READY',
        gateReadyAt: null,
        gateAcceptedAt: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      } satisfies IControlGateRequirement;
      expect(gate.status).toBe('NOT_READY');
    });

    it('IPlanCoverageEntry can be typed correctly', () => {
      const entry: IPlanCoverageEntry = {
        coverageEntryId: 'cov-1',
        workPackageQualityPlanId: 'plan-1',
        coverageRuleType: 'MANDATORY_FLOOR',
        governedSourceRef: 'gov-1',
        projectAdditionRef: null,
        description: 'Mandatory floor coverage',
        provenance: null,
        addedByUserId: 'user-1',
        addedAt: '2026-01-01T00:00:00Z',
        isRemovable: false,
      } satisfies IPlanCoverageEntry;
      expect(entry.coverageRuleType).toBe('MANDATORY_FLOOR');
    });

    it('IPlanReadinessPosture can be typed correctly', () => {
      const posture: IPlanReadinessPosture = {
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
      } satisfies IPlanReadinessPosture;
      expect(posture.readinessLevel).toBe('COMPLETE');
    });

    it('IFindingToIssueSpawnRecord can be typed correctly', () => {
      const record: IFindingToIssueSpawnRecord = {
        spawnRecordId: 'spawn-1',
        reviewFindingId: 'finding-1',
        spawnedQcIssueId: 'issue-1',
        spawnCondition: 'BLOCKS_GATE',
        originReviewPackageId: 'pkg-1',
        findingSeverity: 'HIGH',
        governedRequirementRefs: ['req-1'],
        originResponsiblePartyContext: 'org-context',
        spawnedAt: '2026-01-01T00:00:00Z',
        spawnedByUserId: 'user-1',
      } satisfies IFindingToIssueSpawnRecord;
      expect(record.spawnCondition).toBe('BLOCKS_GATE');
    });

    it('IPlanAddendum can be typed correctly', () => {
      const addendum: IPlanAddendum = {
        addendumId: 'add-1',
        workPackageQualityPlanId: 'plan-1',
        addendumType: 'EXTRA_GATE',
        governedParentRef: 'parent-1',
        projectRiskBasis: 'High risk zone',
        description: 'Extra gate for high risk',
        extraGateOrReviewRefs: ['gate-2'],
        addedByUserId: 'user-1',
        addedAt: '2026-01-01T00:00:00Z',
        approvedByUserId: null,
      } satisfies IPlanAddendum;
      expect(addendum.addendumType).toBe('EXTRA_GATE');
    });

    it('IPlanOverride can be typed correctly', () => {
      const override: IPlanOverride = {
        overrideId: 'ovr-1',
        workPackageQualityPlanId: 'plan-1',
        overrideType: 'EQUIVALENT_METHOD',
        originalRequirementRef: 'req-1',
        replacementDescription: 'Equivalent method used',
        equivalenceJustification: 'Meets same standard',
        deviationRef: null,
        addedByUserId: 'user-1',
        addedAt: '2026-01-01T00:00:00Z',
        approvedByUserId: null,
      } satisfies IPlanOverride;
      expect(override.overrideType).toBe('EQUIVALENT_METHOD');
    });

    it('IReviewPackagePhase can be typed correctly', () => {
      const phase: IReviewPackagePhase = {
        phaseId: 'phase-1',
        reviewPackageId: 'pkg-1',
        phaseType: 'PRECONSTRUCTION',
        disciplineSet: ['structural'],
        acceptanceCriteriaSummary: 'All disciplines reviewed',
        status: 'active',
      } satisfies IReviewPackagePhase;
      expect(phase.phaseType).toBe('PRECONSTRUCTION');
    });
  });
});
