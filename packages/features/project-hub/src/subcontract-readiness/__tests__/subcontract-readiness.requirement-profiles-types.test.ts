import { describe, expect, it } from 'vitest';

import {
  ARTIFACT_STATE_LABELS,
  ARTIFACT_STATES,
  BLOCKING_SEVERITIES,
  BLOCKING_SEVERITY_LABELS,
  COMPLIANCE_EVALUATION_STATE_LABELS,
  COMPLIANCE_EVALUATION_STATES,
  DUAL_STATE_INDEPENDENCE_EXAMPLES,
  METADATA_FIELD_TYPES,
  PM_OVERRIDE_PROHIBITED_ACTIONS,
  PROFILE_INPUT_DIMENSION_DEFINITIONS,
  PROFILE_INPUT_DIMENSION_LABELS,
  PROFILE_INPUT_DIMENSIONS,
  RENEWAL_STATUS_LABELS,
  RENEWAL_STATUSES,
  SDI_BLOCKING_OUTCOMES,
  SDI_PREQUALIFICATION_OUTCOME_LABELS,
  SDI_PREQUALIFICATION_OUTCOMES,
  SDI_SATISFIED_OUTCOMES,
} from '../../index.js';

describe('P3-E13-T08 Stage 3 requirement-profiles contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('ArtifactState', () => {
    it('has exactly 8 states per T03 §4.1', () => {
      expect(ARTIFACT_STATES).toHaveLength(8);
    });

    it('includes all 8 states', () => {
      const expected = [
        'NOT_PROVIDED', 'REQUESTED', 'RECEIVED_PENDING_REVIEW',
        'RECEIVED_ACCEPTED', 'RECEIVED_DEFICIENT', 'REPLACED',
        'EXTERNAL_REFERENCE_ONLY', 'NOT_REQUIRED_BY_RULE',
      ];
      expect([...ARTIFACT_STATES]).toEqual(expected);
    });
  });

  describe('ComplianceEvaluationState', () => {
    it('has exactly 8 states per T03 §5.1', () => {
      expect(COMPLIANCE_EVALUATION_STATES).toHaveLength(8);
    });

    it('includes all 8 states', () => {
      const expected = [
        'NOT_STARTED', 'UNDER_REVIEW', 'SATISFIED',
        'SATISFIED_WITH_CONDITIONS', 'NOT_REQUIRED_BY_RULE',
        'DEFICIENT', 'EXCEPTION_REQUIRED', 'REJECTED',
      ];
      expect([...COMPLIANCE_EVALUATION_STATES]).toEqual(expected);
    });
  });

  describe('SDIPrequalificationOutcome', () => {
    it('has exactly 5 outcomes per T03 §7.1', () => {
      expect(SDI_PREQUALIFICATION_OUTCOMES).toHaveLength(5);
    });
  });

  describe('BlockingSeverity', () => {
    it('has exactly 4 severities per T03 §3.1', () => {
      expect(BLOCKING_SEVERITIES).toHaveLength(4);
    });
  });

  describe('RenewalStatus', () => {
    it('has exactly 5 statuses per T03 §3.1', () => {
      expect(RENEWAL_STATUSES).toHaveLength(5);
    });
  });

  describe('MetadataFieldType', () => {
    it('has exactly 6 types per T03 §3.2', () => {
      expect(METADATA_FIELD_TYPES).toHaveLength(6);
    });
  });

  describe('ProfileInputDimension', () => {
    it('has exactly 9 dimensions per T03 §1.2', () => {
      expect(PROFILE_INPUT_DIMENSIONS).toHaveLength(9);
    });
  });

  // -- Label maps --------------------------------------------------------------

  describe('label maps', () => {
    it('ARTIFACT_STATE_LABELS covers all 8 states', () => {
      expect(Object.keys(ARTIFACT_STATE_LABELS)).toHaveLength(8);
    });

    it('COMPLIANCE_EVALUATION_STATE_LABELS covers all 8 states', () => {
      expect(Object.keys(COMPLIANCE_EVALUATION_STATE_LABELS)).toHaveLength(8);
    });

    it('SDI_PREQUALIFICATION_OUTCOME_LABELS covers all 5 outcomes', () => {
      expect(Object.keys(SDI_PREQUALIFICATION_OUTCOME_LABELS)).toHaveLength(5);
    });

    it('BLOCKING_SEVERITY_LABELS covers all 4 severities', () => {
      expect(Object.keys(BLOCKING_SEVERITY_LABELS)).toHaveLength(4);
    });

    it('RENEWAL_STATUS_LABELS covers all 5 statuses', () => {
      expect(Object.keys(RENEWAL_STATUS_LABELS)).toHaveLength(5);
    });

    it('PROFILE_INPUT_DIMENSION_LABELS covers all 9 dimensions', () => {
      expect(Object.keys(PROFILE_INPUT_DIMENSION_LABELS)).toHaveLength(9);
    });
  });

  // -- Governed constant arrays ------------------------------------------------

  describe('PROFILE_INPUT_DIMENSION_DEFINITIONS', () => {
    it('has exactly 9 definitions per T03 §1.2', () => {
      expect(PROFILE_INPUT_DIMENSION_DEFINITIONS).toHaveLength(9);
    });
  });

  describe('DUAL_STATE_INDEPENDENCE_EXAMPLES', () => {
    it('has exactly 4 examples per T03 §5.2', () => {
      expect(DUAL_STATE_INDEPENDENCE_EXAMPLES).toHaveLength(4);
    });

    it('each example has an explanation', () => {
      for (const ex of DUAL_STATE_INDEPENDENCE_EXAMPLES) {
        expect(ex.explanation.length).toBeGreaterThan(0);
      }
    });
  });

  describe('PM_OVERRIDE_PROHIBITED_ACTIONS', () => {
    it('has exactly 4 prohibited actions per T03 §6', () => {
      expect(PM_OVERRIDE_PROHIBITED_ACTIONS).toHaveLength(4);
    });
  });

  describe('SDI outcome classification', () => {
    it('SDI_BLOCKING_OUTCOMES has exactly 2 outcomes', () => {
      expect(SDI_BLOCKING_OUTCOMES).toHaveLength(2);
    });

    it('SDI_SATISFIED_OUTCOMES has exactly 3 outcomes', () => {
      expect(SDI_SATISFIED_OUTCOMES).toHaveLength(3);
    });

    it('blocking + satisfied = all 5 SDI outcomes', () => {
      expect(SDI_BLOCKING_OUTCOMES.length + SDI_SATISFIED_OUTCOMES.length).toBe(5);
    });
  });
});
