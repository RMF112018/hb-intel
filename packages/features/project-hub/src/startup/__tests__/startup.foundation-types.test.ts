import { describe, expect, it } from 'vitest';

import {
  STARTUP_CERTIFICATION_STATUSES,
  STARTUP_CERTIFICATION_STATUS_LABELS,
  GATE_CRITERION_RESULTS,
  GATE_OUTCOMES,
  MOBILIZATION_AUTH_STATUSES,
  PROGRAM_BLOCKER_SCOPES,
  PROGRAM_BLOCKER_STATUSES,
  PROGRAM_BLOCKER_TYPE_LABELS,
  PROGRAM_BLOCKER_TYPES,
  PX_EXCLUSIVE_ACTIONS,
  STAGE1_ACTIVITY_EVENT_DEFINITIONS,
  STAGE1_ACTIVITY_EVENTS,
  STAGE1_HEALTH_METRIC_DEFINITIONS,
  STAGE1_HEALTH_METRICS,
  STARTUP_AUTHORITY_ROLE_LABELS,
  STARTUP_AUTHORITY_ROLES,
  STARTUP_CERT_OWNERSHIP,
  STARTUP_CROSS_CONTRACT_REFS,
  STARTUP_FUNCTIONS,
  STARTUP_GOVERNED_GATE_CRITERIA,
  STARTUP_LOCKED_DECISIONS,
  STARTUP_OPERATING_PRINCIPLES,
  STARTUP_READINESS_STATE_CODES,
  STARTUP_READINESS_STATE_LABELS,
  STARTUP_RECORD_FAMILIES,
  STARTUP_RECORD_FAMILY_DEFINITIONS,
  STARTUP_SHARED_PACKAGE_REQUIREMENTS,
  STARTUP_SOT_BOUNDARY_MATRIX,
  STARTUP_STATE_TRANSITIONS,
  STARTUP_SUB_SURFACE_DEFINITIONS,
  STARTUP_SUB_SURFACE_LABELS,
  STARTUP_SUB_SURFACES,
  STARTUP_TIER_LABELS,
  STARTUP_TIER1_RECORD_FAMILIES,
  STARTUP_TIERS,
  STARTUP_TRANSITION_TRIGGER_TYPES,
  WAIVER_STATUS_LABELS,
  WAIVER_STATUSES,
} from '../../index.js';

describe('P3-E11-T10 Stage 1 Startup foundation contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('StartupReadinessStateCode', () => {
    it('has exactly 8 states per T01 §4.1', () => {
      expect(STARTUP_READINESS_STATE_CODES).toHaveLength(8);
    });

    it('includes all 8 states', () => {
      const expected = [
        'DRAFT', 'ACTIVE_PLANNING', 'READINESS_REVIEW', 'READY_FOR_MOBILIZATION',
        'MOBILIZED', 'STABILIZING', 'BASELINE_LOCKED', 'ARCHIVED',
      ];
      expect([...STARTUP_READINESS_STATE_CODES]).toEqual(expected);
    });
  });

  describe('StartupSubSurface', () => {
    it('has exactly 6 sub-surfaces per T01 §3.2', () => {
      expect(STARTUP_SUB_SURFACES).toHaveLength(6);
    });
  });

  describe('CertificationStatus', () => {
    it('has exactly 7 statuses per T02 §3.4', () => {
      expect(STARTUP_CERTIFICATION_STATUSES).toHaveLength(7);
    });
  });

  describe('GateOutcome', () => {
    it('has exactly 3 outcomes per T02 §3.5', () => {
      expect(GATE_OUTCOMES).toHaveLength(3);
    });
  });

  describe('GateCriterionResult', () => {
    it('has exactly 4 results per T02 §3.6', () => {
      expect(GATE_CRITERION_RESULTS).toHaveLength(4);
    });
  });

  describe('WaiverStatus', () => {
    it('has exactly 5 statuses per T02 §3.9', () => {
      expect(WAIVER_STATUSES).toHaveLength(5);
    });
  });

  describe('ProgramBlockerScope', () => {
    it('has exactly 2 scopes per T02 §3.10', () => {
      expect(PROGRAM_BLOCKER_SCOPES).toHaveLength(2);
    });
  });

  describe('ProgramBlockerType', () => {
    it('has exactly 6 types per T02 §3.10', () => {
      expect(PROGRAM_BLOCKER_TYPES).toHaveLength(6);
    });
  });

  describe('ProgramBlockerStatus', () => {
    it('has exactly 3 statuses per T02 §3.10', () => {
      expect(PROGRAM_BLOCKER_STATUSES).toHaveLength(3);
    });
  });

  describe('MobilizationAuthStatus', () => {
    it('has exactly 2 statuses per T02 §3.11', () => {
      expect(MOBILIZATION_AUTH_STATUSES).toHaveLength(2);
    });
  });

  describe('StartupTransitionTriggerType', () => {
    it('has exactly 4 trigger types per T01 §4.2', () => {
      expect(STARTUP_TRANSITION_TRIGGER_TYPES).toHaveLength(4);
    });
  });

  describe('StartupFunction', () => {
    it('has exactly 3 functions per T01 §1.1', () => {
      expect(STARTUP_FUNCTIONS).toHaveLength(3);
    });
  });

  describe('StartupTier', () => {
    it('has exactly 4 tiers per T02 §1', () => {
      expect(STARTUP_TIERS).toHaveLength(4);
    });
  });

  describe('StartupAuthorityRole', () => {
    it('has exactly 10 roles per T09 §1', () => {
      expect(STARTUP_AUTHORITY_ROLES).toHaveLength(10);
    });
  });

  describe('PXExclusiveAction', () => {
    it('has exactly 6 PX-exclusive actions', () => {
      expect(PX_EXCLUSIVE_ACTIONS).toHaveLength(6);
    });
  });

  // -- Record families -------------------------------------------------------

  describe('StartupRecordFamily', () => {
    it('has exactly 28 record families per T02 §1', () => {
      expect(STARTUP_RECORD_FAMILIES).toHaveLength(28);
    });

    it('includes all 28 record families', () => {
      expect(STARTUP_RECORD_FAMILIES).toContain('StartupProgram');
      expect(STARTUP_RECORD_FAMILIES).toContain('StartupBaseline');
      expect(STARTUP_RECORD_FAMILIES).toContain('PlanTeamSignature');
      expect(STARTUP_RECORD_FAMILIES).toContain('ExceptionWaiverRecord');
    });
  });

  describe('StartupTier1RecordFamily', () => {
    it('has exactly 9 Tier 1 families per T02 §1', () => {
      expect(STARTUP_TIER1_RECORD_FAMILIES).toHaveLength(9);
    });
  });

  describe('Record family definitions', () => {
    it('has exactly 28 definitions per T02 §1', () => {
      expect(STARTUP_RECORD_FAMILY_DEFINITIONS).toHaveLength(28);
    });

    it('each definition has family, tier, key, and notes', () => {
      for (const def of STARTUP_RECORD_FAMILY_DEFINITIONS) {
        expect(def.family).toBeTruthy();
        expect(def.tier).toBeTruthy();
        expect(def.key).toBeTruthy();
        expect(def.notes).toBeTruthy();
      }
    });

    it('Tier 1 has 9 families, Tier 2 has 3, Tier 3 has 15, Tier 4 has 1', () => {
      const tier1 = STARTUP_RECORD_FAMILY_DEFINITIONS.filter((d) => d.tier === 'ProgramCore');
      const tier2 = STARTUP_RECORD_FAMILY_DEFINITIONS.filter((d) => d.tier === 'GovernedTemplate');
      const tier3 = STARTUP_RECORD_FAMILY_DEFINITIONS.filter((d) => d.tier === 'ProjectScoped');
      const tier4 = STARTUP_RECORD_FAMILY_DEFINITIONS.filter((d) => d.tier === 'Continuity');
      expect(tier1).toHaveLength(9);
      expect(tier2).toHaveLength(3);
      expect(tier3).toHaveLength(15);
      expect(tier4).toHaveLength(1);
    });
  });

  // -- State transition table ------------------------------------------------

  describe('State transition table', () => {
    it('has exactly 9 valid transitions per T01 §4.2', () => {
      expect(STARTUP_STATE_TRANSITIONS).toHaveLength(9);
    });

    it('each transition has from, to, triggerType, condition, and requiresPE', () => {
      for (const t of STARTUP_STATE_TRANSITIONS) {
        expect(t.from).toBeTruthy();
        expect(t.to).toBeTruthy();
        expect(t.triggerType).toBeTruthy();
        expect(t.condition).toBeTruthy();
        expect(typeof t.requiresPE).toBe('boolean');
      }
    });

    it('includes the DRAFT → ACTIVE_PLANNING system transition', () => {
      const t = STARTUP_STATE_TRANSITIONS.find((tr) => tr.from === 'DRAFT' && tr.to === 'ACTIVE_PLANNING');
      expect(t).toBeDefined();
      expect(t!.triggerType).toBe('System');
      expect(t!.requiresPE).toBe(false);
    });

    it('includes the READY_FOR_MOBILIZATION → MOBILIZED PE transition', () => {
      const t = STARTUP_STATE_TRANSITIONS.find((tr) => tr.from === 'READY_FOR_MOBILIZATION' && tr.to === 'MOBILIZED');
      expect(t).toBeDefined();
      expect(t!.requiresPE).toBe(true);
    });
  });

  // -- Sub-surface definitions -----------------------------------------------

  describe('Sub-surface definitions', () => {
    it('has exactly 6 definitions per T01 §3.2', () => {
      expect(STARTUP_SUB_SURFACE_DEFINITIONS).toHaveLength(6);
    });

    it('all gate weights are Required', () => {
      expect(STARTUP_SUB_SURFACE_DEFINITIONS.every((d) => d.gateWeight === 'Required')).toBe(true);
    });
  });

  // -- SoT boundary matrix ---------------------------------------------------

  describe('SoT boundary matrix', () => {
    it('has exactly 18 rows per T01 §8.2', () => {
      expect(STARTUP_SOT_BOUNDARY_MATRIX).toHaveLength(18);
    });

    it('each row has all required fields', () => {
      for (const row of STARTUP_SOT_BOUNDARY_MATRIX) {
        expect(row.dataConcern).toBeTruthy();
        expect(row.sotOwner).toBeTruthy();
        expect(row.startupRelationship).toBeTruthy();
        expect(row.direction).toBeTruthy();
        expect(row.notes).toBeTruthy();
      }
    });
  });

  // -- Governed gate criteria ------------------------------------------------

  describe('Governed gate criteria', () => {
    it('has exactly 16 criteria across 6 surfaces per T02 §3.7', () => {
      expect(STARTUP_GOVERNED_GATE_CRITERIA).toHaveLength(16);
    });

    it('has 3 criteria for STARTUP_TASK_LIBRARY', () => {
      const criteria = STARTUP_GOVERNED_GATE_CRITERIA.filter((c) => c.subSurface === 'STARTUP_TASK_LIBRARY');
      expect(criteria).toHaveLength(3);
    });

    it('has 3 criteria for SAFETY_READINESS', () => {
      const criteria = STARTUP_GOVERNED_GATE_CRITERIA.filter((c) => c.subSurface === 'SAFETY_READINESS');
      expect(criteria).toHaveLength(3);
    });

    it('has 2 criteria for PERMIT_POSTING', () => {
      const criteria = STARTUP_GOVERNED_GATE_CRITERIA.filter((c) => c.subSurface === 'PERMIT_POSTING');
      expect(criteria).toHaveLength(2);
    });

    it('has 3 criteria for CONTRACT_OBLIGATIONS', () => {
      const criteria = STARTUP_GOVERNED_GATE_CRITERIA.filter((c) => c.subSurface === 'CONTRACT_OBLIGATIONS');
      expect(criteria).toHaveLength(3);
    });

    it('has 2 criteria for RESPONSIBILITY_MATRIX', () => {
      const criteria = STARTUP_GOVERNED_GATE_CRITERIA.filter((c) => c.subSurface === 'RESPONSIBILITY_MATRIX');
      expect(criteria).toHaveLength(2);
    });

    it('has 3 criteria for EXECUTION_BASELINE', () => {
      const criteria = STARTUP_GOVERNED_GATE_CRITERIA.filter((c) => c.subSurface === 'EXECUTION_BASELINE');
      expect(criteria).toHaveLength(3);
    });
  });

  // -- Certification ownership -----------------------------------------------

  describe('Certification ownership', () => {
    it('has exactly 6 entries per T02 §3.8', () => {
      expect(STARTUP_CERT_OWNERSHIP).toHaveLength(6);
    });
  });

  // -- Locked decisions ------------------------------------------------------

  describe('Locked decisions', () => {
    it('has exactly 10 decisions from master index', () => {
      expect(STARTUP_LOCKED_DECISIONS).toHaveLength(10);
    });

    it('has decision IDs 1 through 10', () => {
      const ids = STARTUP_LOCKED_DECISIONS.map((d) => d.decisionId);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  // -- Cross-contract refs ---------------------------------------------------

  describe('Cross-contract refs', () => {
    it('has exactly 12 references per T01 §9', () => {
      expect(STARTUP_CROSS_CONTRACT_REFS).toHaveLength(12);
    });
  });

  // -- Shared package requirements -------------------------------------------

  describe('Shared package requirements', () => {
    it('has exactly 6 hard blockers per T10 §1', () => {
      expect(STARTUP_SHARED_PACKAGE_REQUIREMENTS).toHaveLength(6);
    });

    it('all are hard blockers', () => {
      for (const req of STARTUP_SHARED_PACKAGE_REQUIREMENTS) {
        expect(req.blockerLevel).toBe('Hard blocker');
      }
    });
  });

  // -- Operating principles --------------------------------------------------

  describe('Operating principles', () => {
    it('has exactly 3 principles per T01 §1.1', () => {
      expect(STARTUP_OPERATING_PRINCIPLES).toHaveLength(3);
    });
  });

  // -- Stage 1 Spine publication ---------------------------------------------

  describe('Stage 1 Activity Spine events', () => {
    it('has exactly 6 events per T10 §2 Stage 1', () => {
      expect(STAGE1_ACTIVITY_EVENTS).toHaveLength(6);
    });

    it('has 6 event definitions', () => {
      expect(STAGE1_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(6);
    });
  });

  describe('Stage 1 Health Spine metrics', () => {
    it('has exactly 3 metrics per T10 §2 Stage 1', () => {
      expect(STAGE1_HEALTH_METRICS).toHaveLength(3);
    });

    it('has 3 metric definitions', () => {
      expect(STAGE1_HEALTH_METRIC_DEFINITIONS).toHaveLength(3);
    });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 8 readiness states', () => {
      expect(Object.keys(STARTUP_READINESS_STATE_LABELS)).toHaveLength(8);
    });

    it('labels all 6 sub-surfaces', () => {
      expect(Object.keys(STARTUP_SUB_SURFACE_LABELS)).toHaveLength(6);
    });

    it('labels all 7 certification statuses', () => {
      expect(Object.keys(STARTUP_CERTIFICATION_STATUS_LABELS)).toHaveLength(7);
    });

    it('labels all 5 waiver statuses', () => {
      expect(Object.keys(WAIVER_STATUS_LABELS)).toHaveLength(5);
    });

    it('labels all 6 blocker types', () => {
      expect(Object.keys(PROGRAM_BLOCKER_TYPE_LABELS)).toHaveLength(6);
    });

    it('labels all 4 tiers', () => {
      expect(Object.keys(STARTUP_TIER_LABELS)).toHaveLength(4);
    });

    it('labels all 10 authority roles', () => {
      expect(Object.keys(STARTUP_AUTHORITY_ROLE_LABELS)).toHaveLength(10);
    });
  });
});
