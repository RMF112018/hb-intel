import { describe, expect, it } from 'vitest';

import {
  canApproveJha,
  isCompetentPersonRequirementMet,
  canCreateDailyPreTask,
  validatePreTaskCompletion,
  validatePromptClosure,
  isHighRiskProofSatisfied,
  getRequiredClosureProofLevel,
} from '../../index.js';

describe('P3-E8-T06 JHA/toolbox business rules', () => {
  // =========================================================================
  // JHA Approval (§2.2-2.4)
  // =========================================================================

  describe('canApproveJha', () => {
    it('PENDING_APPROVAL + no competent person required → valid', () => {
      const result = canApproveJha('PENDING_APPROVAL', false, null);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('PENDING_APPROVAL + competent person ACTIVE → valid', () => {
      const result = canApproveJha('PENDING_APPROVAL', true, 'ACTIVE');
      expect(result.valid).toBe(true);
    });

    it('DRAFT → invalid', () => {
      const result = canApproveJha('DRAFT', false, null);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('PENDING_APPROVAL')]),
      );
    });

    it('PENDING_APPROVAL + competent person EXPIRED → invalid', () => {
      const result = canApproveJha('PENDING_APPROVAL', true, 'EXPIRED');
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('ACTIVE designation')]),
      );
    });

    it('PENDING_APPROVAL + competent person required but none → invalid', () => {
      const result = canApproveJha('PENDING_APPROVAL', true, null);
      expect(result.valid).toBe(false);
    });
  });

  describe('isCompetentPersonRequirementMet', () => {
    it('not required → always met', () => {
      expect(isCompetentPersonRequirementMet(false, null)).toBe(true);
    });

    it('required + ACTIVE → met', () => {
      expect(isCompetentPersonRequirementMet(true, 'ACTIVE')).toBe(true);
    });

    it('required + EXPIRED → not met', () => {
      expect(isCompetentPersonRequirementMet(true, 'EXPIRED')).toBe(false);
    });

    it('required + null → not met', () => {
      expect(isCompetentPersonRequirementMet(true, null)).toBe(false);
    });
  });

  // =========================================================================
  // Daily Pre-Task Plan (§3.1-3.3)
  // =========================================================================

  describe('canCreateDailyPreTask', () => {
    it('APPROVED JHA → allowed', () => { expect(canCreateDailyPreTask('APPROVED')).toBe(true); });
    it('DRAFT JHA → blocked', () => { expect(canCreateDailyPreTask('DRAFT')).toBe(false); });
    it('PENDING_APPROVAL → blocked', () => { expect(canCreateDailyPreTask('PENDING_APPROVAL')).toBe(false); });
    it('SUPERSEDED → blocked', () => { expect(canCreateDailyPreTask('SUPERSEDED')).toBe(false); });
    it('VOIDED → blocked', () => { expect(canCreateDailyPreTask('VOIDED')).toBe(false); });
  });

  describe('validatePreTaskCompletion', () => {
    it('all fields met → valid', () => {
      const result = validatePreTaskCompletion({
        controlsConfirmed: true,
        ppeVerified: true,
        attendeeCount: 5,
        completedAt: '2026-03-24T16:00:00Z',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('controlsConfirmed false → invalid', () => {
      const result = validatePreTaskCompletion({
        controlsConfirmed: false,
        ppeVerified: true,
        attendeeCount: 5,
        completedAt: '2026-03-24T16:00:00Z',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('Controls')]));
    });

    it('ppeVerified false → invalid', () => {
      const result = validatePreTaskCompletion({
        controlsConfirmed: true,
        ppeVerified: false,
        attendeeCount: 5,
        completedAt: '2026-03-24T16:00:00Z',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('PPE')]));
    });

    it('attendeeCount 0 → invalid', () => {
      const result = validatePreTaskCompletion({
        controlsConfirmed: true,
        ppeVerified: true,
        attendeeCount: 0,
        completedAt: '2026-03-24T16:00:00Z',
      });
      expect(result.valid).toBe(false);
    });

    it('completedAt null → invalid', () => {
      const result = validatePreTaskCompletion({
        controlsConfirmed: true,
        ppeVerified: true,
        attendeeCount: 5,
        completedAt: null,
      });
      expect(result.valid).toBe(false);
    });

    it('multiple failures → multiple errors', () => {
      const result = validatePreTaskCompletion({
        controlsConfirmed: false,
        ppeVerified: false,
        attendeeCount: 0,
        completedAt: null,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(4);
    });
  });

  // =========================================================================
  // Prompt Closure (§4.3)
  // =========================================================================

  describe('validatePromptClosure', () => {
    const baseTalk = {
      attendeeCount: 5,
      namedAttendees: [{ workerId: null, workerName: 'John', subcontractorId: null, acknowledgedAt: null }],
      signInSheetEvidenceId: 'evi-001',
      acknowledgmentBatchId: null,
      status: 'COMPLETE' as const,
    };

    it('STANDARD: talk with attendeeCount > 0 → valid', () => {
      const result = validatePromptClosure('STANDARD', { ...baseTalk, namedAttendees: [], signInSheetEvidenceId: null });
      expect(result.valid).toBe(true);
    });

    it('STANDARD: attendeeCount 0 → invalid', () => {
      const result = validatePromptClosure('STANDARD', { ...baseTalk, attendeeCount: 0, namedAttendees: [], signInSheetEvidenceId: null });
      expect(result.valid).toBe(false);
    });

    it('HIGH_RISK: named attendees + proof → valid', () => {
      const result = validatePromptClosure('HIGH_RISK', baseTalk);
      expect(result.valid).toBe(true);
    });

    it('HIGH_RISK: no named attendees → invalid', () => {
      const result = validatePromptClosure('HIGH_RISK', { ...baseTalk, namedAttendees: [] });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('Named attendee')]));
    });

    it('HIGH_RISK: no proof element → invalid', () => {
      const result = validatePromptClosure('HIGH_RISK', { ...baseTalk, signInSheetEvidenceId: null });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('proof element')]));
    });

    it('CRITICAL: all HIGH_RISK + verification → valid', () => {
      const result = validatePromptClosure('CRITICAL', baseTalk, 'safety-mgr-001');
      expect(result.valid).toBe(true);
    });

    it('CRITICAL: missing verification → invalid', () => {
      const result = validatePromptClosure('CRITICAL', baseTalk, null);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('Safety Manager verification')]));
    });

    it('DRAFT status → invalid for any closure type', () => {
      const result = validatePromptClosure('STANDARD', { ...baseTalk, status: 'DRAFT' as const });
      expect(result.valid).toBe(false);
    });
  });

  // =========================================================================
  // High-Risk Proof (§5.3)
  // =========================================================================

  describe('isHighRiskProofSatisfied', () => {
    it('named attendees + sign-in → satisfied', () => {
      expect(isHighRiskProofSatisfied({
        namedAttendees: [{ workerId: null, workerName: 'J', subcontractorId: null, acknowledgedAt: null }],
        signInSheetEvidenceId: 'evi-001',
        acknowledgmentBatchId: null,
      })).toBe(true);
    });

    it('named attendees + acknowledgment → satisfied', () => {
      expect(isHighRiskProofSatisfied({
        namedAttendees: [{ workerId: null, workerName: 'J', subcontractorId: null, acknowledgedAt: null }],
        signInSheetEvidenceId: null,
        acknowledgmentBatchId: 'batch-001',
      })).toBe(true);
    });

    it('no named attendees → not satisfied', () => {
      expect(isHighRiskProofSatisfied({
        namedAttendees: [],
        signInSheetEvidenceId: 'evi-001',
        acknowledgmentBatchId: null,
      })).toBe(false);
    });

    it('no proof element → not satisfied', () => {
      expect(isHighRiskProofSatisfied({
        namedAttendees: [{ workerId: null, workerName: 'J', subcontractorId: null, acknowledgedAt: null }],
        signInSheetEvidenceId: null,
        acknowledgmentBatchId: null,
      })).toBe(false);
    });
  });

  // =========================================================================
  // Closure Proof Level Description
  // =========================================================================

  describe('getRequiredClosureProofLevel', () => {
    it('returns description for each type', () => {
      expect(getRequiredClosureProofLevel('STANDARD')).toBeTruthy();
      expect(getRequiredClosureProofLevel('HIGH_RISK')).toBeTruthy();
      expect(getRequiredClosureProofLevel('CRITICAL')).toBeTruthy();
    });

    it('CRITICAL mentions Safety Manager', () => {
      expect(getRequiredClosureProofLevel('CRITICAL')).toContain('Safety Manager');
    });
  });
});
