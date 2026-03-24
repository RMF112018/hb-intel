import { describe, expect, it } from 'vitest';

import {
  ACTIVE_WORKFLOW_STATUSES,
  DOWNSTREAM_PROJECTION_FAMILIES,
  EXECUTION_READINESS_OUTCOME_LABELS,
  EXECUTION_READINESS_OUTCOMES,
  IMMUTABLE_CASE_IDENTITY_FIELDS,
  IN_CASE_CONTINUITY_DEFINITIONS,
  IN_CASE_CONTINUITY_REASONS,
  OUTCOME_REASON_CODE_LABELS,
  OUTCOME_REASON_CODES,
  PRIMARY_LEDGER_FAMILIES,
  READINESS_LEDGER_TYPES,
  READINESS_RECORD_FAMILIES,
  READINESS_RECORD_FAMILY_DEFINITIONS,
  READINESS_RECORD_FAMILY_LABELS,
  READINESS_WORKFLOW_STATUS_LABELS,
  READINESS_WORKFLOW_STATUSES,
  SUPERSEDE_VOID_TRIGGER_DEFINITIONS,
  SUPERSEDE_VOID_TRIGGER_LABELS,
  SUPERSEDE_VOID_TRIGGERS,
  TERMINAL_WORKFLOW_STATUSES,
} from '../../index.js';

describe('P3-E13-T08 Stage 2 record-families contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('ReadinessWorkflowStatus', () => {
    it('has exactly 11 statuses per T02 §4.1', () => {
      expect(READINESS_WORKFLOW_STATUSES).toHaveLength(11);
    });

    it('includes all 11 statuses', () => {
      const expected = [
        'DRAFT', 'ASSEMBLING', 'SUBMITTED_FOR_REVIEW', 'UNDER_EVALUATION',
        'AWAITING_RESPONSE', 'AWAITING_EXCEPTION', 'READY_FOR_ISSUANCE',
        'ISSUED', 'RENEWAL_DUE', 'SUPERSEDED', 'VOID',
      ];
      expect([...READINESS_WORKFLOW_STATUSES]).toEqual(expected);
    });
  });

  describe('ExecutionReadinessOutcome', () => {
    it('has exactly 6 outcomes per T02 §4.2', () => {
      expect(EXECUTION_READINESS_OUTCOMES).toHaveLength(6);
    });

    it('includes all 6 outcomes', () => {
      const expected = [
        'NOT_ISSUED', 'READY', 'BLOCKED',
        'READY_WITH_APPROVED_EXCEPTION', 'SUPERSEDED', 'VOID',
      ];
      expect([...EXECUTION_READINESS_OUTCOMES]).toEqual(expected);
    });
  });

  describe('ReadinessRecordFamily', () => {
    it('has exactly 15 record families per T02 §1', () => {
      expect(READINESS_RECORD_FAMILIES).toHaveLength(15);
    });
  });

  describe('ReadinessLedgerType', () => {
    it('has exactly 3 ledger types', () => {
      expect(READINESS_LEDGER_TYPES).toHaveLength(3);
    });
  });

  describe('SupersedeVoidTrigger', () => {
    it('has exactly 4 triggers per T02 §3.3', () => {
      expect(SUPERSEDE_VOID_TRIGGERS).toHaveLength(4);
    });
  });

  describe('InCaseContinuityReason', () => {
    it('has exactly 5 reasons per T02 §3.2', () => {
      expect(IN_CASE_CONTINUITY_REASONS).toHaveLength(5);
    });
  });

  describe('OutcomeReasonCode', () => {
    it('has exactly 5 reason codes per T02 §5.1', () => {
      expect(OUTCOME_REASON_CODES).toHaveLength(5);
    });
  });

  // -- Label maps --------------------------------------------------------------

  describe('label maps', () => {
    it('READINESS_WORKFLOW_STATUS_LABELS covers all 11 statuses', () => {
      expect(Object.keys(READINESS_WORKFLOW_STATUS_LABELS)).toHaveLength(11);
    });

    it('EXECUTION_READINESS_OUTCOME_LABELS covers all 6 outcomes', () => {
      expect(Object.keys(EXECUTION_READINESS_OUTCOME_LABELS)).toHaveLength(6);
    });

    it('READINESS_RECORD_FAMILY_LABELS covers all 15 families', () => {
      expect(Object.keys(READINESS_RECORD_FAMILY_LABELS)).toHaveLength(15);
    });

    it('SUPERSEDE_VOID_TRIGGER_LABELS covers all 4 triggers', () => {
      expect(Object.keys(SUPERSEDE_VOID_TRIGGER_LABELS)).toHaveLength(4);
    });

    it('OUTCOME_REASON_CODE_LABELS covers all 5 reason codes', () => {
      expect(Object.keys(OUTCOME_REASON_CODE_LABELS)).toHaveLength(5);
    });
  });

  // -- Governed constant arrays ------------------------------------------------

  describe('READINESS_RECORD_FAMILY_DEFINITIONS', () => {
    it('has exactly 15 definitions per T02 §1', () => {
      expect(READINESS_RECORD_FAMILY_DEFINITIONS).toHaveLength(15);
    });

    it('has 10 primary ledger families', () => {
      const primaryCount = READINESS_RECORD_FAMILY_DEFINITIONS.filter(
        (d) => d.ledgerType === 'PRIMARY_LEDGER',
      ).length;
      expect(primaryCount).toBe(10);
    });

    it('has 1 publication artifact family', () => {
      const pubCount = READINESS_RECORD_FAMILY_DEFINITIONS.filter(
        (d) => d.ledgerType === 'PUBLICATION_ARTIFACT',
      ).length;
      expect(pubCount).toBe(1);
    });

    it('has 4 downstream projection families', () => {
      const projCount = READINESS_RECORD_FAMILY_DEFINITIONS.filter(
        (d) => d.ledgerType === 'DOWNSTREAM_PROJECTION',
      ).length;
      expect(projCount).toBe(4);
    });

    it('every definition has a non-empty purpose', () => {
      for (const d of READINESS_RECORD_FAMILY_DEFINITIONS) {
        expect(d.purpose.length).toBeGreaterThan(0);
      }
    });
  });

  describe('SUPERSEDE_VOID_TRIGGER_DEFINITIONS', () => {
    it('has exactly 4 definitions per T02 §3.3', () => {
      expect(SUPERSEDE_VOID_TRIGGER_DEFINITIONS).toHaveLength(4);
    });
  });

  describe('IN_CASE_CONTINUITY_DEFINITIONS', () => {
    it('has exactly 5 definitions per T02 §3.2', () => {
      expect(IN_CASE_CONTINUITY_DEFINITIONS).toHaveLength(5);
    });
  });

  describe('IMMUTABLE_CASE_IDENTITY_FIELDS', () => {
    it('has exactly 4 immutable fields per T02 §2.1', () => {
      expect(IMMUTABLE_CASE_IDENTITY_FIELDS).toHaveLength(4);
    });

    it('includes readinessCaseId, projectId, subcontractorLegalEntityId, awardPathFingerprint', () => {
      expect([...IMMUTABLE_CASE_IDENTITY_FIELDS]).toEqual([
        'readinessCaseId', 'projectId', 'subcontractorLegalEntityId', 'awardPathFingerprint',
      ]);
    });
  });

  describe('TERMINAL_WORKFLOW_STATUSES', () => {
    it('has exactly 2 terminal statuses', () => {
      expect(TERMINAL_WORKFLOW_STATUSES).toHaveLength(2);
    });
  });

  describe('ACTIVE_WORKFLOW_STATUSES', () => {
    it('has exactly 9 active statuses', () => {
      expect(ACTIVE_WORKFLOW_STATUSES).toHaveLength(9);
    });

    it('active + terminal = all 11 workflow statuses', () => {
      expect(ACTIVE_WORKFLOW_STATUSES.length + TERMINAL_WORKFLOW_STATUSES.length).toBe(11);
    });
  });

  describe('PRIMARY_LEDGER_FAMILIES', () => {
    it('has exactly 10 primary ledger families', () => {
      expect(PRIMARY_LEDGER_FAMILIES).toHaveLength(10);
    });
  });

  describe('DOWNSTREAM_PROJECTION_FAMILIES', () => {
    it('has exactly 4 projection families per T02 §8', () => {
      expect(DOWNSTREAM_PROJECTION_FAMILIES).toHaveLength(4);
    });
  });
});
