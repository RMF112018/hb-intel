import { describe, expect, it } from 'vitest';

import {
  canWarrantyCreateFinancialCommitment,
  canWarrantyWriteToCloseout,
  canWarrantyWriteToFinancial,
  canWarrantyWriteToStartup,
  isLayer2Deferred,
  isLayer2SeamFieldOptional,
  isOutOfScopeForPhase3,
  isWarrantyOwnedConcern,
  mustLayer2UsePhase3RecordModel,
} from '../../index.js';

describe('P3-E14-T10 Stage 1 Warranty foundation business rules', () => {
  describe('isWarrantyOwnedConcern', () => {
    it('returns true for Warranty coverage definitions', () => {
      expect(isWarrantyOwnedConcern('Warranty coverage definitions')).toBe(true);
    });
    it('returns true for Active warranty case lifecycle', () => {
      expect(isWarrantyOwnedConcern('Active warranty case lifecycle')).toBe(true);
    });
    it('returns true for Subcontractor scope acknowledgment and resolution', () => {
      expect(isWarrantyOwnedConcern('Subcontractor scope acknowledgment and resolution')).toBe(true);
    });
    it('returns true for Owner communication history (Phase 3)', () => {
      expect(isWarrantyOwnedConcern('Owner communication history (Phase 3)')).toBe(true);
    });
    it('returns false for Source warranty documents', () => {
      expect(isWarrantyOwnedConcern('Source warranty documents (certificates, turnover package)')).toBe(false);
    });
    it('returns false for Back-charge cost records', () => {
      expect(isWarrantyOwnedConcern('Back-charge cost records, financial commitments')).toBe(false);
    });
    it('returns false for unknown concern', () => {
      expect(isWarrantyOwnedConcern('Unknown concern')).toBe(false);
    });
  });

  describe('adjacent module boundary guards', () => {
    it('canWarrantyWriteToCloseout always false', () => { expect(canWarrantyWriteToCloseout()).toBe(false); });
    it('canWarrantyWriteToStartup always false', () => { expect(canWarrantyWriteToStartup()).toBe(false); });
    it('canWarrantyWriteToFinancial always false', () => { expect(canWarrantyWriteToFinancial()).toBe(false); });
    it('canWarrantyCreateFinancialCommitment always false', () => { expect(canWarrantyCreateFinancialCommitment()).toBe(false); });
  });

  describe('isOutOfScopeForPhase3', () => {
    it('returns true for OWNER_PORTAL', () => { expect(isOutOfScopeForPhase3('OWNER_PORTAL')).toBe(true); });
    it('returns true for SUBCONTRACTOR_ACCESS', () => { expect(isOutOfScopeForPhase3('SUBCONTRACTOR_ACCESS')).toBe(true); });
    it('returns true for OUTBOUND_NOTIFICATIONS', () => { expect(isOutOfScopeForPhase3('OUTBOUND_NOTIFICATIONS')).toBe(true); });
    it('returns true for DEFECT_LITIGATION', () => { expect(isOutOfScopeForPhase3('DEFECT_LITIGATION')).toBe(true); });
    it('returns true for all 10 items', () => {
      const items: readonly string[] = [
        'OWNER_PORTAL', 'SUBCONTRACTOR_ACCESS', 'OUTBOUND_NOTIFICATIONS',
        'OWNER_AUTH_ROLE', 'EXTERNAL_SLA_DASHBOARD', 'SHARED_RESOLUTION_WORKSPACE',
        'PROPERTY_MGMT_INTEGRATION', 'PROACTIVE_MAINTENANCE', 'DEFECT_LITIGATION', 'LIEN_RELEASE',
      ];
      for (const item of items) {
        expect(isOutOfScopeForPhase3(item as never)).toBe(true);
      }
    });
  });

  describe('Layer 2 deferral', () => {
    it('isLayer2Deferred always true', () => { expect(isLayer2Deferred()).toBe(true); });
    it('isLayer2SeamFieldOptional always true', () => { expect(isLayer2SeamFieldOptional()).toBe(true); });
    it('mustLayer2UsePhase3RecordModel always true', () => { expect(mustLayer2UsePhase3RecordModel()).toBe(true); });
  });
});
