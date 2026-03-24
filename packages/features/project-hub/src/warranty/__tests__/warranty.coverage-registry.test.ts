import { describe, expect, it } from 'vitest';

import {
  canCreateCaseAgainstCoverage,
  canPromoteToCoverageActive,
  getAnchorRequirementForLayer,
  isAnchorRequiredForLayer,
  isCommissioningDeferred,
  isCoverageApproachingExpiration,
  isCoverageExpired,
  isCoverageMetadataComplete,
  isCoverageScopeGoverned,
} from '../../index.js';

describe('P3-E14-T10 Stage 3 coverage-registry business rules', () => {
  describe('isCoverageScopeGoverned', () => {
    it('returns true for Labor.Concrete', () => { expect(isCoverageScopeGoverned('Labor.Concrete')).toBe(true); });
    it('returns true for Equipment.HVAC-AHU-3', () => { expect(isCoverageScopeGoverned('Equipment.HVAC-AHU-3')).toBe(true); });
    it('returns true for System.Fire-Protection', () => { expect(isCoverageScopeGoverned('System.Fire-Protection')).toBe(true); });
    it('returns false for ungoverned scope', () => { expect(isCoverageScopeGoverned('Random.Ungoverned')).toBe(false); });
  });

  describe('isCoverageMetadataComplete', () => {
    const complete = { coverageLayer: 'Product', coverageScope: 'Equipment.HVAC-AHU', responsiblePartyId: 'sub-001', responsiblePartyName: 'ACME', warrantyStartDate: '2026-01-01', warrantyEndDate: '2027-01-01' };
    it('returns true when all fields populated', () => { expect(isCoverageMetadataComplete(complete)).toBe(true); });
    it('returns false when coverageLayer is null', () => { expect(isCoverageMetadataComplete({ ...complete, coverageLayer: null })).toBe(false); });
    it('returns false when warrantyEndDate is null', () => { expect(isCoverageMetadataComplete({ ...complete, warrantyEndDate: null })).toBe(false); });
  });

  describe('canPromoteToCoverageActive', () => {
    it('returns true for Draft + complete', () => { expect(canPromoteToCoverageActive('Draft', true)).toBe(true); });
    it('returns false for Draft + incomplete', () => { expect(canPromoteToCoverageActive('Draft', false)).toBe(false); });
    it('returns false for Active + complete', () => { expect(canPromoteToCoverageActive('Active', true)).toBe(false); });
  });

  describe('canCreateCaseAgainstCoverage', () => {
    it('returns true for Active', () => { expect(canCreateCaseAgainstCoverage('Active')).toBe(true); });
    it('returns false for Draft', () => { expect(canCreateCaseAgainstCoverage('Draft')).toBe(false); });
    it('returns false for Expired', () => { expect(canCreateCaseAgainstCoverage('Expired')).toBe(false); });
    it('returns false for Voided', () => { expect(canCreateCaseAgainstCoverage('Voided')).toBe(false); });
  });

  describe('isCoverageExpired', () => {
    it('returns true for past date', () => { expect(isCoverageExpired('2020-01-01')).toBe(true); });
    it('returns false for future date', () => { expect(isCoverageExpired('2099-01-01')).toBe(false); });
  });

  describe('isCoverageApproachingExpiration', () => {
    it('returns true when within threshold', () => {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 15);
      expect(isCoverageApproachingExpiration(endDate.toISOString(), 30, now)).toBe(true);
    });
    it('returns false when far from expiration', () => {
      expect(isCoverageApproachingExpiration('2099-01-01', 30)).toBe(false);
    });
  });

  describe('isCommissioningDeferred', () => {
    it('returns true for Deferred', () => { expect(isCommissioningDeferred('Deferred')).toBe(true); });
    it('returns false for Accepted', () => { expect(isCommissioningDeferred('Accepted')).toBe(false); });
    it('returns false for AcceptedWithConditions', () => { expect(isCommissioningDeferred('AcceptedWithConditions')).toBe(false); });
  });

  describe('anchor requirements', () => {
    it('Product requires SYSTEM_REF', () => { expect(isAnchorRequiredForLayer('Product', 'SYSTEM_REF')).toBe(true); });
    it('Product requires ASSET_REF', () => { expect(isAnchorRequiredForLayer('Product', 'ASSET_REF')).toBe(true); });
    it('Labor requires LOCATION_REF', () => { expect(isAnchorRequiredForLayer('Labor', 'LOCATION_REF')).toBe(true); });
    it('System requires SYSTEM_REF', () => { expect(isAnchorRequiredForLayer('System', 'SYSTEM_REF')).toBe(true); });
    it('System ASSET_REF is not applicable', () => { expect(getAnchorRequirementForLayer('System', 'ASSET_REF')).toBe('NOT_APPLICABLE'); });
  });
});
