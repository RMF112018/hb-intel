import { describe, expect, it } from 'vitest';

import {
  APPROVAL_ACTION_OUTCOME_LABELS,
  APPROVAL_ACTION_OUTCOMES,
  APPROVAL_SEQUENCING_MODES,
  APPROVAL_SLOT_ROLE_LABELS,
  APPROVAL_SLOT_ROLES,
  APPROVAL_SLOT_STATUS_LABELS,
  APPROVAL_SLOT_STATUSES,
  AUDIT_PRESERVATION_REQUIREMENTS,
  DELEGATION_GOVERNING_RULES,
  DELEGATION_REASON_LABELS,
  DELEGATION_REASONS,
  EXCEPTION_ITERATION_STATUS_LABELS,
  EXCEPTION_ITERATION_STATUSES,
  IMMUTABILITY_GOVERNING_RULES,
  PRECEDENT_PROHIBITIONS,
  PRECEDENT_PUBLICATION_STATUS_LABELS,
  PRECEDENT_PUBLICATION_STATUSES,
  REQUIRED_APPROVAL_AUTHORITIES,
  TERMINAL_ITERATION_STATUSES,
  TERMINAL_SLOT_STATUSES,
} from '../../index.js';

describe('P3-E13-T08 Stage 4 exception-governance contract stability', () => {
  describe('ExceptionIterationStatus', () => {
    it('has exactly 5 statuses per T04 §2', () => {
      expect(EXCEPTION_ITERATION_STATUSES).toHaveLength(5);
    });
  });

  describe('ApprovalSlotStatus', () => {
    it('has exactly 5 statuses per T04 §3.1', () => {
      expect(APPROVAL_SLOT_STATUSES).toHaveLength(5);
    });
  });

  describe('ApprovalActionOutcome', () => {
    it('has exactly 4 outcomes per T04 §3.2', () => {
      expect(APPROVAL_ACTION_OUTCOMES).toHaveLength(4);
    });
  });

  describe('ApprovalSlotRole', () => {
    it('has exactly 4 roles per T04 §5.2', () => {
      expect(APPROVAL_SLOT_ROLES).toHaveLength(4);
    });
  });

  describe('ApprovalSequencingMode', () => {
    it('has exactly 2 modes per T04 §5.1', () => {
      expect(APPROVAL_SEQUENCING_MODES).toHaveLength(2);
    });
  });

  describe('PrecedentPublicationStatus', () => {
    it('has exactly 3 statuses per T04 §6', () => {
      expect(PRECEDENT_PUBLICATION_STATUSES).toHaveLength(3);
    });
  });

  describe('DelegationReason', () => {
    it('has exactly 4 reasons per T04 §4.1', () => {
      expect(DELEGATION_REASONS).toHaveLength(4);
    });
  });

  // -- Label maps
  describe('label maps', () => {
    it('EXCEPTION_ITERATION_STATUS_LABELS covers 5', () => {
      expect(Object.keys(EXCEPTION_ITERATION_STATUS_LABELS)).toHaveLength(5);
    });
    it('APPROVAL_SLOT_STATUS_LABELS covers 5', () => {
      expect(Object.keys(APPROVAL_SLOT_STATUS_LABELS)).toHaveLength(5);
    });
    it('APPROVAL_ACTION_OUTCOME_LABELS covers 4', () => {
      expect(Object.keys(APPROVAL_ACTION_OUTCOME_LABELS)).toHaveLength(4);
    });
    it('APPROVAL_SLOT_ROLE_LABELS covers 4', () => {
      expect(Object.keys(APPROVAL_SLOT_ROLE_LABELS)).toHaveLength(4);
    });
    it('PRECEDENT_PUBLICATION_STATUS_LABELS covers 3', () => {
      expect(Object.keys(PRECEDENT_PUBLICATION_STATUS_LABELS)).toHaveLength(3);
    });
    it('DELEGATION_REASON_LABELS covers 4', () => {
      expect(Object.keys(DELEGATION_REASON_LABELS)).toHaveLength(4);
    });
  });

  // -- Governed constants
  describe('REQUIRED_APPROVAL_AUTHORITIES', () => {
    it('has exactly 4 authority definitions per T04 §5.2', () => {
      expect(REQUIRED_APPROVAL_AUTHORITIES).toHaveLength(4);
    });
    it('has 3 required-by-default authorities', () => {
      expect(REQUIRED_APPROVAL_AUTHORITIES.filter((a) => a.requiredByDefault)).toHaveLength(3);
    });
  });

  describe('IMMUTABILITY_GOVERNING_RULES', () => {
    it('has exactly 4 rules per T04 §2.1', () => {
      expect(IMMUTABILITY_GOVERNING_RULES).toHaveLength(4);
    });
  });

  describe('DELEGATION_GOVERNING_RULES', () => {
    it('has exactly 4 rules per T04 §4.2', () => {
      expect(DELEGATION_GOVERNING_RULES).toHaveLength(4);
    });
  });

  describe('PRECEDENT_PROHIBITIONS', () => {
    it('has exactly 4 prohibitions per T04 §6.2', () => {
      expect(PRECEDENT_PROHIBITIONS).toHaveLength(4);
    });
  });

  describe('AUDIT_PRESERVATION_REQUIREMENTS', () => {
    it('has exactly 6 requirements per T04 §7', () => {
      expect(AUDIT_PRESERVATION_REQUIREMENTS).toHaveLength(6);
    });
  });

  describe('TERMINAL_ITERATION_STATUSES', () => {
    it('has exactly 4 terminal statuses', () => {
      expect(TERMINAL_ITERATION_STATUSES).toHaveLength(4);
    });
  });

  describe('TERMINAL_SLOT_STATUSES', () => {
    it('has exactly 3 terminal slot statuses', () => {
      expect(TERMINAL_SLOT_STATUSES).toHaveLength(3);
    });
  });
});
