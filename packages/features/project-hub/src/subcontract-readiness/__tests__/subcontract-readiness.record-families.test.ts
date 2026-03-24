import { describe, expect, it } from 'vitest';

import {
  canFinancialConsumeDecision,
  canFinancialReadRawItems,
  getRecordFamilyLedgerType,
  isActiveWorkflowStatus,
  isDownstreamProjection,
  isInCaseContinuityEvent,
  isOneActiveCaseViolated,
  isRecordFamilyPrimaryLedger,
  isSupersedeVoidTrigger,
  isTerminalWorkflowStatus,
  isWorkflowOutcomeConsistent,
  shouldSupersedeOrVoid,
  READINESS_RECORD_FAMILIES,
} from '../../index.js';

import type { ISubcontractReadinessCase } from '../../index.js';

const createMockCase = (
  overrides: Partial<ISubcontractReadinessCase> = {},
): ISubcontractReadinessCase => ({
  readinessCaseId: 'case-001',
  projectId: 'proj-001',
  subcontractorLegalEntityId: 'entity-001',
  linkedBuyoutLineId: 'buyout-001',
  awardPathFingerprint: 'award-001',
  sourceCaseId: null,
  supersedesCaseId: null,
  supersededByCaseId: null,
  caseVersion: 1,
  workflowStatus: 'DRAFT',
  plannedExecutionDate: null,
  activeRequirementProfileId: null,
  activeRequirementProfileVersion: null,
  activeDecisionId: null,
  activeExceptionCaseId: null,
  lastSubmittedAt: null,
  lastEvaluatedAt: null,
  lastRenewedAt: null,
  createdAt: '2026-03-24T00:00:00Z',
  createdBy: 'user-001',
  lastModifiedAt: '2026-03-24T00:00:00Z',
  lastModifiedBy: null,
  ...overrides,
});

describe('P3-E13-T08 Stage 2 record-families business rules', () => {
  // -- One-Active-Case Enforcement (T02 §3.1) ---------------------------------

  describe('isOneActiveCaseViolated', () => {
    it('returns true when an active case with same identity exists', () => {
      const existing = [createMockCase()];
      const newIdentity = {
        projectId: 'proj-001',
        subcontractorLegalEntityId: 'entity-001',
        awardBuyoutIntent: 'award-001',
      };
      expect(isOneActiveCaseViolated(existing, newIdentity)).toBe(true);
    });

    it('returns false when no matching active case exists', () => {
      const existing = [createMockCase({ projectId: 'proj-999' })];
      const newIdentity = {
        projectId: 'proj-001',
        subcontractorLegalEntityId: 'entity-001',
        awardBuyoutIntent: 'award-001',
      };
      expect(isOneActiveCaseViolated(existing, newIdentity)).toBe(false);
    });

    it('returns false when matching case is SUPERSEDED (terminal)', () => {
      const existing = [createMockCase({ workflowStatus: 'SUPERSEDED' })];
      const newIdentity = {
        projectId: 'proj-001',
        subcontractorLegalEntityId: 'entity-001',
        awardBuyoutIntent: 'award-001',
      };
      expect(isOneActiveCaseViolated(existing, newIdentity)).toBe(false);
    });

    it('returns false when matching case is VOID (terminal)', () => {
      const existing = [createMockCase({ workflowStatus: 'VOID' })];
      const newIdentity = {
        projectId: 'proj-001',
        subcontractorLegalEntityId: 'entity-001',
        awardBuyoutIntent: 'award-001',
      };
      expect(isOneActiveCaseViolated(existing, newIdentity)).toBe(false);
    });

    it('returns false when no existing cases', () => {
      expect(isOneActiveCaseViolated([], {
        projectId: 'proj-001',
        subcontractorLegalEntityId: 'entity-001',
        awardBuyoutIntent: 'award-001',
      })).toBe(false);
    });
  });

  // -- In-Case Continuity (T02 §3.2) -----------------------------------------

  describe('isInCaseContinuityEvent', () => {
    it('returns true for ROUTINE_RESUBMISSION', () => {
      expect(isInCaseContinuityEvent('ROUTINE_RESUBMISSION')).toBe(true);
    });

    it('returns true for DEFICIENCY_CORRECTION', () => {
      expect(isInCaseContinuityEvent('DEFICIENCY_CORRECTION')).toBe(true);
    });

    it('returns true for CORRECTED_UPLOAD', () => {
      expect(isInCaseContinuityEvent('CORRECTED_UPLOAD')).toBe(true);
    });

    it('returns true for EXPIRATION_RENEWAL', () => {
      expect(isInCaseContinuityEvent('EXPIRATION_RENEWAL')).toBe(true);
    });

    it('returns true for RE_REVIEW_AFTER_REJECTION', () => {
      expect(isInCaseContinuityEvent('RE_REVIEW_AFTER_REJECTION')).toBe(true);
    });

    it('returns false for invalid reason', () => {
      expect(isInCaseContinuityEvent('INVALID' as never)).toBe(false);
    });
  });

  // -- Supersede / Void Triggers (T02 §3.3) ----------------------------------

  describe('isSupersedeVoidTrigger', () => {
    it('returns true for all 4 triggers', () => {
      expect(isSupersedeVoidTrigger('LEGAL_ENTITY_CHANGE')).toBe(true);
      expect(isSupersedeVoidTrigger('BUYOUT_LINE_REPLACEMENT')).toBe(true);
      expect(isSupersedeVoidTrigger('SCOPE_RISK_POSTURE_CHANGE')).toBe(true);
      expect(isSupersedeVoidTrigger('AWARD_PATH_ABANDONMENT')).toBe(true);
    });

    it('returns false for invalid trigger', () => {
      expect(isSupersedeVoidTrigger('INVALID' as never)).toBe(false);
    });
  });

  describe('shouldSupersedeOrVoid', () => {
    it('returns true for LEGAL_ENTITY_CHANGE', () => {
      expect(shouldSupersedeOrVoid('LEGAL_ENTITY_CHANGE')).toBe(true);
    });

    it('returns false for non-material change', () => {
      expect(shouldSupersedeOrVoid('ROUTINE_RESUBMISSION')).toBe(false);
    });
  });

  // -- Workflow Status Helpers (T02 §4) ----------------------------------------

  describe('isTerminalWorkflowStatus', () => {
    it('returns true for SUPERSEDED', () => {
      expect(isTerminalWorkflowStatus('SUPERSEDED')).toBe(true);
    });

    it('returns true for VOID', () => {
      expect(isTerminalWorkflowStatus('VOID')).toBe(true);
    });

    it('returns false for DRAFT', () => {
      expect(isTerminalWorkflowStatus('DRAFT')).toBe(false);
    });

    it('returns false for ISSUED', () => {
      expect(isTerminalWorkflowStatus('ISSUED')).toBe(false);
    });
  });

  describe('isActiveWorkflowStatus', () => {
    it('returns true for DRAFT', () => {
      expect(isActiveWorkflowStatus('DRAFT')).toBe(true);
    });

    it('returns true for ISSUED', () => {
      expect(isActiveWorkflowStatus('ISSUED')).toBe(true);
    });

    it('returns false for SUPERSEDED', () => {
      expect(isActiveWorkflowStatus('SUPERSEDED')).toBe(false);
    });

    it('returns false for VOID', () => {
      expect(isActiveWorkflowStatus('VOID')).toBe(false);
    });
  });

  // -- Workflow / Outcome Independence (T02 §4.3) -----------------------------

  describe('isWorkflowOutcomeConsistent', () => {
    it('DRAFT + NOT_ISSUED is consistent', () => {
      expect(isWorkflowOutcomeConsistent('DRAFT', 'NOT_ISSUED')).toBe(true);
    });

    it('DRAFT + READY is inconsistent (no outcome before review)', () => {
      expect(isWorkflowOutcomeConsistent('DRAFT', 'READY')).toBe(false);
    });

    it('ASSEMBLING + BLOCKED is inconsistent', () => {
      expect(isWorkflowOutcomeConsistent('ASSEMBLING', 'BLOCKED')).toBe(false);
    });

    it('READY_FOR_ISSUANCE + NOT_ISSUED is consistent (T02 §4.3 example)', () => {
      expect(isWorkflowOutcomeConsistent('READY_FOR_ISSUANCE', 'NOT_ISSUED')).toBe(true);
    });

    it('ISSUED + BLOCKED is consistent (T02 §4.3 example)', () => {
      expect(isWorkflowOutcomeConsistent('ISSUED', 'BLOCKED')).toBe(true);
    });

    it('AWAITING_EXCEPTION + NOT_ISSUED is consistent (T02 §4.3 example)', () => {
      expect(isWorkflowOutcomeConsistent('AWAITING_EXCEPTION', 'NOT_ISSUED')).toBe(true);
    });

    it('ISSUED + READY is consistent', () => {
      expect(isWorkflowOutcomeConsistent('ISSUED', 'READY')).toBe(true);
    });

    it('SUPERSEDED + SUPERSEDED is consistent', () => {
      expect(isWorkflowOutcomeConsistent('SUPERSEDED', 'SUPERSEDED')).toBe(true);
    });

    it('SUPERSEDED + READY is inconsistent', () => {
      expect(isWorkflowOutcomeConsistent('SUPERSEDED', 'READY')).toBe(false);
    });

    it('VOID + VOID is consistent', () => {
      expect(isWorkflowOutcomeConsistent('VOID', 'VOID')).toBe(true);
    });

    it('VOID + NOT_ISSUED is inconsistent', () => {
      expect(isWorkflowOutcomeConsistent('VOID', 'NOT_ISSUED')).toBe(false);
    });

    it('ISSUED + SUPERSEDED is inconsistent (non-terminal workflow + terminal outcome)', () => {
      expect(isWorkflowOutcomeConsistent('ISSUED', 'SUPERSEDED')).toBe(false);
    });
  });

  // -- Financial Consumption Boundary (T02 §5.2) ------------------------------

  describe('canFinancialConsumeDecision', () => {
    it('returns true when a decision ID exists', () => {
      expect(canFinancialConsumeDecision('decision-001')).toBe(true);
    });

    it('returns false when decision ID is null', () => {
      expect(canFinancialConsumeDecision(null)).toBe(false);
    });

    it('returns false when decision ID is empty string', () => {
      expect(canFinancialConsumeDecision('')).toBe(false);
    });
  });

  describe('canFinancialReadRawItems', () => {
    it('always returns false', () => {
      expect(canFinancialReadRawItems()).toBe(false);
    });
  });

  // -- Record Family Classification (T02 §1) ----------------------------------

  describe('isRecordFamilyPrimaryLedger', () => {
    it('returns true for SubcontractReadinessCase', () => {
      expect(isRecordFamilyPrimaryLedger('SubcontractReadinessCase')).toBe(true);
    });

    it('returns true for ExecutionReadinessDecision', () => {
      expect(isRecordFamilyPrimaryLedger('ExecutionReadinessDecision')).toBe(true);
    });

    it('returns false for ReadinessHealthProjection', () => {
      expect(isRecordFamilyPrimaryLedger('ReadinessHealthProjection')).toBe(false);
    });

    it('returns false for GlobalPrecedentReference', () => {
      expect(isRecordFamilyPrimaryLedger('GlobalPrecedentReference')).toBe(false);
    });
  });

  describe('isDownstreamProjection', () => {
    it('returns true for ReadinessHealthProjection', () => {
      expect(isDownstreamProjection('ReadinessHealthProjection')).toBe(true);
    });

    it('returns true for ReadinessWorkQueueProjection', () => {
      expect(isDownstreamProjection('ReadinessWorkQueueProjection')).toBe(true);
    });

    it('returns true for ReadinessRelatedItemProjection', () => {
      expect(isDownstreamProjection('ReadinessRelatedItemProjection')).toBe(true);
    });

    it('returns true for ReadinessActivityProjection', () => {
      expect(isDownstreamProjection('ReadinessActivityProjection')).toBe(true);
    });

    it('returns false for SubcontractReadinessCase', () => {
      expect(isDownstreamProjection('SubcontractReadinessCase')).toBe(false);
    });
  });

  describe('getRecordFamilyLedgerType', () => {
    it('returns PRIMARY_LEDGER for SubcontractReadinessCase', () => {
      expect(getRecordFamilyLedgerType('SubcontractReadinessCase')).toBe('PRIMARY_LEDGER');
    });

    it('returns PUBLICATION_ARTIFACT for GlobalPrecedentReference', () => {
      expect(getRecordFamilyLedgerType('GlobalPrecedentReference')).toBe('PUBLICATION_ARTIFACT');
    });

    it('returns DOWNSTREAM_PROJECTION for ReadinessHealthProjection', () => {
      expect(getRecordFamilyLedgerType('ReadinessHealthProjection')).toBe('DOWNSTREAM_PROJECTION');
    });

    it('returns a type for every record family', () => {
      for (const family of READINESS_RECORD_FAMILIES) {
        expect(getRecordFamilyLedgerType(family)).toBeDefined();
      }
    });
  });
});
