import { describe, expect, it } from 'vitest';

import {
  isCAOverdue,
  getCAHealthTierImpact,
  shouldEscalateCriticalCA,
  shouldEscalatePendingVerification,
  getIncidentVisibility,
  canViewIncident,
  canEscalatePrivacyTier,
  getEvidenceSensitivityDefault,
  isLitigationHoldActive,
  escalateToLitigationHold,
} from '../../index.js';

describe('P3-E8-T05 Corrective actions business rules', () => {
  // =========================================================================
  // CA Overdue (§1.3)
  // =========================================================================

  describe('isCAOverdue', () => {
    it('past due + OPEN → overdue', () => {
      expect(isCAOverdue('2026-03-01', 'OPEN', '2026-03-05')).toBe(true);
    });

    it('past due + IN_PROGRESS → overdue', () => {
      expect(isCAOverdue('2026-03-01', 'IN_PROGRESS', '2026-03-05')).toBe(true);
    });

    it('past due + CLOSED → not overdue (terminal)', () => {
      expect(isCAOverdue('2026-03-01', 'CLOSED', '2026-03-05')).toBe(false);
    });

    it('past due + VOIDED → not overdue (terminal)', () => {
      expect(isCAOverdue('2026-03-01', 'VOIDED', '2026-03-05')).toBe(false);
    });

    it('future due → not overdue', () => {
      expect(isCAOverdue('2026-03-10', 'OPEN', '2026-03-05')).toBe(false);
    });

    it('same day → not overdue', () => {
      expect(isCAOverdue('2026-03-05', 'OPEN', '2026-03-05')).toBe(false);
    });
  });

  // =========================================================================
  // CA Health Tier Impact (§1.3)
  // =========================================================================

  describe('getCAHealthTierImpact', () => {
    it('CRITICAL → CRITICAL', () => { expect(getCAHealthTierImpact('CRITICAL')).toBe('CRITICAL'); });
    it('MAJOR → AT_RISK', () => { expect(getCAHealthTierImpact('MAJOR')).toBe('AT_RISK'); });
    it('MINOR → null', () => { expect(getCAHealthTierImpact('MINOR')).toBeNull(); });
  });

  // =========================================================================
  // Critical CA Escalation (§1.4)
  // =========================================================================

  describe('shouldEscalateCriticalCA', () => {
    it('OPEN > 4 hours → escalate', () => {
      const created = '2026-03-10T08:00:00Z';
      const now = '2026-03-10T12:30:00Z'; // 4.5 hours later
      expect(shouldEscalateCriticalCA('OPEN', created, now)).toBe(true);
    });

    it('OPEN < 4 hours → no escalation', () => {
      const created = '2026-03-10T08:00:00Z';
      const now = '2026-03-10T11:00:00Z'; // 3 hours later
      expect(shouldEscalateCriticalCA('OPEN', created, now)).toBe(false);
    });

    it('IN_PROGRESS → no escalation (already actioned)', () => {
      const created = '2026-03-10T08:00:00Z';
      const now = '2026-03-10T15:00:00Z'; // 7 hours later
      expect(shouldEscalateCriticalCA('IN_PROGRESS', created, now)).toBe(false);
    });
  });

  // =========================================================================
  // Pending Verification Escalation (§1.4)
  // =========================================================================

  describe('shouldEscalatePendingVerification', () => {
    it('PENDING_VERIFICATION > 2 days → escalate', () => {
      const transitioned = '2026-03-10T08:00:00Z';
      const now = '2026-03-13T09:00:00Z'; // ~3 days later
      expect(shouldEscalatePendingVerification('PENDING_VERIFICATION', transitioned, now)).toBe(true);
    });

    it('PENDING_VERIFICATION < 2 days → no escalation', () => {
      const transitioned = '2026-03-10T08:00:00Z';
      const now = '2026-03-11T09:00:00Z'; // ~1 day later
      expect(shouldEscalatePendingVerification('PENDING_VERIFICATION', transitioned, now)).toBe(false);
    });

    it('OPEN status → no escalation', () => {
      expect(shouldEscalatePendingVerification('OPEN', '2026-03-01T00:00:00Z', '2026-03-10T00:00:00Z')).toBe(false);
    });
  });

  // =========================================================================
  // Incident Visibility (§2.3)
  // =========================================================================

  describe('getIncidentVisibility / canViewIncident', () => {
    it('STANDARD + SafetyManager → full record', () => {
      expect(getIncidentVisibility('STANDARD', 'SafetyManager')).toBe('Full record');
      expect(canViewIncident('STANDARD', 'SafetyManager')).toBe(true);
    });

    it('STANDARD + ProjectManager → full except personsInvolved', () => {
      expect(getIncidentVisibility('STANDARD', 'ProjectManager')).toContain('except personsInvolved');
    });

    it('SENSITIVE + Superintendent → not visible', () => {
      expect(canViewIncident('SENSITIVE', 'Superintendent')).toBe(false);
    });

    it('RESTRICTED + ProjectManager → type and date only', () => {
      expect(getIncidentVisibility('RESTRICTED', 'ProjectManager')).toContain('Type and date only');
    });

    it('RESTRICTED + Superintendent → not visible', () => {
      expect(canViewIncident('RESTRICTED', 'Superintendent')).toBe(false);
    });

    it('FieldEngineer cannot view at any tier', () => {
      expect(canViewIncident('STANDARD', 'FieldEngineer')).toBe(false);
      expect(canViewIncident('SENSITIVE', 'FieldEngineer')).toBe(false);
      expect(canViewIncident('RESTRICTED', 'FieldEngineer')).toBe(false);
    });
  });

  // =========================================================================
  // Privacy Tier Escalation (§2.3)
  // =========================================================================

  describe('canEscalatePrivacyTier', () => {
    it('STANDARD → SENSITIVE: allowed', () => {
      expect(canEscalatePrivacyTier('STANDARD', 'SENSITIVE')).toBe(true);
    });

    it('STANDARD → RESTRICTED: allowed', () => {
      expect(canEscalatePrivacyTier('STANDARD', 'RESTRICTED')).toBe(true);
    });

    it('SENSITIVE → RESTRICTED: allowed', () => {
      expect(canEscalatePrivacyTier('SENSITIVE', 'RESTRICTED')).toBe(true);
    });

    it('same tier: allowed', () => {
      expect(canEscalatePrivacyTier('SENSITIVE', 'SENSITIVE')).toBe(true);
    });

    it('SENSITIVE → STANDARD: not allowed (demotion)', () => {
      expect(canEscalatePrivacyTier('SENSITIVE', 'STANDARD')).toBe(false);
    });

    it('RESTRICTED → STANDARD: not allowed (demotion)', () => {
      expect(canEscalatePrivacyTier('RESTRICTED', 'STANDARD')).toBe(false);
    });
  });

  // =========================================================================
  // Evidence Sensitivity Defaults (§3.2)
  // =========================================================================

  describe('getEvidenceSensitivityDefault', () => {
    it('INCIDENT → SENSITIVE', () => { expect(getEvidenceSensitivityDefault('INCIDENT')).toBe('SENSITIVE'); });
    it('INSPECTION → STANDARD', () => { expect(getEvidenceSensitivityDefault('INSPECTION')).toBe('STANDARD'); });
    it('JHA → STANDARD', () => { expect(getEvidenceSensitivityDefault('JHA')).toBe('STANDARD'); });
    it('GENERAL → STANDARD', () => { expect(getEvidenceSensitivityDefault('GENERAL')).toBe('STANDARD'); });
  });

  // =========================================================================
  // Litigation Hold (§2.2)
  // =========================================================================

  describe('isLitigationHoldActive', () => {
    it('LITIGATED → true', () => { expect(isLitigationHoldActive('LITIGATED')).toBe(true); });
    it('CLOSED → false', () => { expect(isLitigationHoldActive('CLOSED')).toBe(false); });
    it('REPORTED → false', () => { expect(isLitigationHoldActive('REPORTED')).toBe(false); });
  });

  describe('escalateToLitigationHold', () => {
    it('returns LITIGATION_HOLD regardless of input', () => {
      expect(escalateToLitigationHold('STANDARD_PROJECT')).toBe('LITIGATION_HOLD');
      expect(escalateToLitigationHold('EXTENDED_REGULATORY')).toBe('LITIGATION_HOLD');
      expect(escalateToLitigationHold('LITIGATION_HOLD')).toBe('LITIGATION_HOLD');
    });
  });
});
