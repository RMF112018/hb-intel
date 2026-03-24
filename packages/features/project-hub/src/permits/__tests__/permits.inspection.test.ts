import { describe, expect, it } from 'vitest';

import {
  calculateDaysToExpiration,
  calcExpirationRiskTier,
  getDeficiencyHealthImpact,
  isComplianceCloseoutGateMet,
  validateTemplateImportRow,
} from '../../index.js';

describe('P3-E7-T04 Inspection business rules', () => {
  // ── Expiration Risk (§4.2) ──────────────────────────────────────────

  describe('calculateDaysToExpiration', () => {
    it('returns positive for future date', () => {
      expect(calculateDaysToExpiration('2026-06-01', '2026-03-24')).toBe(69);
    });

    it('returns negative for past date', () => {
      expect(calculateDaysToExpiration('2026-03-01', '2026-03-24')).toBe(-23);
    });

    it('returns 0 for same day', () => {
      expect(calculateDaysToExpiration('2026-03-24', '2026-03-24')).toBe(0);
    });
  });

  describe('calcExpirationRiskTier', () => {
    it('returns CRITICAL for expired (negative days)', () => {
      expect(calcExpirationRiskTier('2026-03-01', '2026-03-24')).toBe('CRITICAL');
    });

    it('returns HIGH for ≤30 days', () => {
      expect(calcExpirationRiskTier('2026-04-15', '2026-03-24')).toBe('HIGH');
    });

    it('returns MEDIUM for 30–90 days', () => {
      expect(calcExpirationRiskTier('2026-06-01', '2026-03-24')).toBe('MEDIUM');
    });

    it('returns LOW for >90 days', () => {
      expect(calcExpirationRiskTier('2027-03-01', '2026-03-24')).toBe('LOW');
    });
  });

  // ── Deficiency Health Impact (§3.3) ─────────────────────────────────

  describe('getDeficiencyHealthImpact', () => {
    it('HIGH+OPEN → CRITICAL', () => {
      expect(getDeficiencyHealthImpact('HIGH', 'OPEN')).toBe('CRITICAL');
    });

    it('HIGH+ACKNOWLEDGED → CRITICAL', () => {
      expect(getDeficiencyHealthImpact('HIGH', 'ACKNOWLEDGED')).toBe('CRITICAL');
    });

    it('HIGH+REMEDIATION_IN_PROGRESS → AT_RISK', () => {
      expect(getDeficiencyHealthImpact('HIGH', 'REMEDIATION_IN_PROGRESS')).toBe('AT_RISK');
    });

    it('HIGH+RESOLVED → null', () => {
      expect(getDeficiencyHealthImpact('HIGH', 'RESOLVED')).toBeNull();
    });

    it('MEDIUM+OPEN → AT_RISK', () => {
      expect(getDeficiencyHealthImpact('MEDIUM', 'OPEN')).toBe('AT_RISK');
    });

    it('MEDIUM+REMEDIATION_IN_PROGRESS → null', () => {
      expect(getDeficiencyHealthImpact('MEDIUM', 'REMEDIATION_IN_PROGRESS')).toBeNull();
    });

    it('LOW+OPEN → null (no immediate impact)', () => {
      expect(getDeficiencyHealthImpact('LOW', 'OPEN')).toBeNull();
    });
  });

  // ── Compliance Close-Out Gate (§6) ──────────────────────────────────

  describe('isComplianceCloseoutGateMet', () => {
    const activePermit = { currentStatus: 'ACTIVE' as const, expirationDate: '2027-03-01' };

    it('passes when all conditions met', () => {
      const checkpoints = [
        { isBlockingCloseout: true, currentResult: 'PASS' as const },
        { isBlockingCloseout: true, currentResult: 'PASS' as const },
        { isBlockingCloseout: false, currentResult: 'FAIL' as const },
      ];
      const deficiencies: { resolutionStatus: 'RESOLVED' }[] = [{ resolutionStatus: 'RESOLVED' }];
      const result = isComplianceCloseoutGateMet(activePermit, checkpoints, deficiencies, '2026-03-24');
      expect(result.canClose).toBe(true);
      expect(result.unmetConditions).toHaveLength(0);
    });

    it('fails when blocking checkpoint not passed', () => {
      const checkpoints = [{ isBlockingCloseout: true, currentResult: 'FAIL' as const }];
      const result = isComplianceCloseoutGateMet(activePermit, checkpoints, [], '2026-03-24');
      expect(result.canClose).toBe(false);
      expect(result.unmetConditions).toEqual(
        expect.arrayContaining([expect.stringContaining('blocking checkpoint')]),
      );
    });

    it('fails when open deficiency exists', () => {
      const checkpoints = [{ isBlockingCloseout: true, currentResult: 'PASS' as const }];
      const deficiencies = [{ resolutionStatus: 'OPEN' as const }];
      const result = isComplianceCloseoutGateMet(activePermit, checkpoints, deficiencies, '2026-03-24');
      expect(result.canClose).toBe(false);
      expect(result.unmetConditions).toEqual(
        expect.arrayContaining([expect.stringContaining('deficiency')]),
      );
    });

    it('fails when permit is SUSPENDED', () => {
      const suspendedPermit = { currentStatus: 'SUSPENDED' as const, expirationDate: '2027-03-01' };
      const result = isComplianceCloseoutGateMet(suspendedPermit, [], [], '2026-03-24');
      expect(result.canClose).toBe(false);
      expect(result.unmetConditions).toEqual(
        expect.arrayContaining([expect.stringContaining('SUSPENDED')]),
      );
    });

    it('fails when permit is expired', () => {
      const expiredPermit = { currentStatus: 'ACTIVE' as const, expirationDate: '2026-01-01' };
      const result = isComplianceCloseoutGateMet(expiredPermit, [], [], '2026-03-24');
      expect(result.canClose).toBe(false);
      expect(result.unmetConditions).toEqual(
        expect.arrayContaining([expect.stringContaining('expired')]),
      );
    });

    it('accepts NOT_APPLICABLE as passing for blocking checkpoints', () => {
      const checkpoints = [{ isBlockingCloseout: true, currentResult: 'NOT_APPLICABLE' as const }];
      const result = isComplianceCloseoutGateMet(activePermit, checkpoints, [], '2026-03-24');
      expect(result.canClose).toBe(true);
    });
  });

  // ── Template Import Validation (§5.2) ────────────────────────────────

  describe('validateTemplateImportRow', () => {
    it('accepts valid row', () => {
      const result = validateTemplateImportRow(
        { inspection: 'Building Footer', code: 'IBC §1809', dateCalledIn: null, result: 'PENDING', comment: null, verifiedOnline: false },
        1,
      );
      expect(result.valid).toBe(true);
    });

    it('rejects empty inspection name', () => {
      const result = validateTemplateImportRow(
        { inspection: '', code: null, dateCalledIn: null, result: 'PENDING', comment: null, verifiedOnline: false },
        1,
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('checkpointName')]));
    });

    it('rejects invalid result value', () => {
      const result = validateTemplateImportRow(
        { inspection: 'Test', code: null, dateCalledIn: null, result: 'INVALID' as any, comment: null, verifiedOnline: false },
        1,
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('result')]));
    });
  });
});
