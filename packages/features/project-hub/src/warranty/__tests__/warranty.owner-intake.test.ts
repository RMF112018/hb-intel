import { describe, expect, it } from 'vitest';

import {
  canLayer2CreateParallelStore,
  getCommunicationPromptText,
  getOwnerFacingStatusText,
  isCommunicationCadenceOverdue,
  isCommunicationPromptTriggered,
  isOwnerIntakePmProxyOnly,
} from '../../index.js';

describe('P3-E14-T10 Stage 5 owner-intake business rules', () => {
  describe('isOwnerIntakePmProxyOnly', () => {
    it('always returns true per T05 §1.1', () => { expect(isOwnerIntakePmProxyOnly()).toBe(true); });
  });

  describe('getOwnerFacingStatusText', () => {
    it('Open → Under review', () => { expect(getOwnerFacingStatusText('Open')).toBe('Under review'); });
    it('Closed → Resolved and closed', () => { expect(getOwnerFacingStatusText('Closed')).toBe('Resolved and closed'); });
    it('AwaitingOwner → owner input text', () => { expect(getOwnerFacingStatusText('AwaitingOwner')).toContain('input or site access'); });
    it('all 16 statuses have mappings', () => {
      const statuses = ['Open', 'PendingCoverageDecision', 'NotCovered', 'Denied', 'Duplicate',
        'Assigned', 'AwaitingSubcontractor', 'AwaitingOwner', 'Scheduled', 'InProgress',
        'Corrected', 'PendingVerification', 'Verified', 'Closed', 'Reopened', 'Voided'];
      for (const s of statuses) {
        expect(getOwnerFacingStatusText(s as never)).toBeDefined();
      }
    });
  });

  describe('isCommunicationPromptTriggered', () => {
    it('PendingCoverageDecision → NotCovered triggers prompt', () => {
      expect(isCommunicationPromptTriggered('PendingCoverageDecision', 'NotCovered')).toBe(true);
    });
    it('PendingCoverageDecision → Denied triggers prompt', () => {
      expect(isCommunicationPromptTriggered('PendingCoverageDecision', 'Denied')).toBe(true);
    });
    it('Verified → Closed triggers prompt', () => {
      expect(isCommunicationPromptTriggered('Verified', 'Closed')).toBe(true);
    });
    it('Open → PendingCoverageDecision does NOT trigger prompt', () => {
      expect(isCommunicationPromptTriggered('Open', 'PendingCoverageDecision')).toBe(false);
    });
  });

  describe('getCommunicationPromptText', () => {
    it('PendingCoverageDecision → Assigned returns consider notifying text', () => {
      expect(getCommunicationPromptText('PendingCoverageDecision', 'Assigned')).toContain('accepted and assigned');
    });
    it('Open → PendingCoverageDecision returns undefined', () => {
      expect(getCommunicationPromptText('Open', 'PendingCoverageDecision')).toBeUndefined();
    });
  });

  describe('isCommunicationCadenceOverdue', () => {
    it('returns true when no communication has been logged', () => {
      expect(isCommunicationCadenceOverdue(null, 'Standard')).toBe(true);
    });
    it('returns true when Standard threshold exceeded (>7 days)', () => {
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
      expect(isCommunicationCadenceOverdue(eightDaysAgo.toISOString(), 'Standard')).toBe(true);
    });
    it('returns false when Standard within threshold', () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      expect(isCommunicationCadenceOverdue(oneDayAgo.toISOString(), 'Standard')).toBe(false);
    });
    it('Expedited triggers at 3 days', () => {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      expect(isCommunicationCadenceOverdue(fourDaysAgo.toISOString(), 'Expedited')).toBe(true);
    });
  });

  describe('canLayer2CreateParallelStore', () => {
    it('always returns false per T05 §6', () => { expect(canLayer2CreateParallelStore()).toBe(false); });
  });
});
