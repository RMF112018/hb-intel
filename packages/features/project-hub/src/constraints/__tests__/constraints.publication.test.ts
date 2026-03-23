import { describe, expect, it } from 'vitest';

import {
  canPublishSnapshot,
  canPublishReviewPackage,
  canAnnotatePublished,
  canConfigureGovernance,
  isRoleAuthorizedForAction,
  generateReviewPackageNumber,
  getStateConsumptionMode,
} from '../../index.js';

describe('P3-E6-T06 Publication business rules', () => {
  // ── canPublishSnapshot ──────────────────────────────────────────────

  describe('canPublishSnapshot', () => {
    it('allows PM', () => {
      expect(canPublishSnapshot('PM')).toBe(true);
    });

    it('rejects PER', () => {
      expect(canPublishSnapshot('PER')).toBe(false);
    });

    it('rejects ProjectControls', () => {
      expect(canPublishSnapshot('ProjectControls')).toBe(false);
    });
  });

  // ── canPublishReviewPackage ─────────────────────────────────────────

  describe('canPublishReviewPackage', () => {
    it('allows PM', () => {
      expect(canPublishReviewPackage('PM')).toBe(true);
    });

    it('allows DesignatedApprover', () => {
      expect(canPublishReviewPackage('DesignatedApprover')).toBe(true);
    });

    it('rejects PER', () => {
      expect(canPublishReviewPackage('PER')).toBe(false);
    });
  });

  // ── canAnnotatePublished ────────────────────────────────────────────

  describe('canAnnotatePublished', () => {
    it('allows PER', () => {
      expect(canAnnotatePublished('PER')).toBe(true);
    });

    it('rejects PM', () => {
      expect(canAnnotatePublished('PM')).toBe(false);
    });
  });

  // ── canConfigureGovernance ──────────────────────────────────────────

  describe('canConfigureGovernance', () => {
    it('allows ManagerOfOpEx', () => {
      expect(canConfigureGovernance('ManagerOfOpEx')).toBe(true);
    });

    it('allows Admin', () => {
      expect(canConfigureGovernance('Admin')).toBe(true);
    });

    it('rejects PM', () => {
      expect(canConfigureGovernance('PM')).toBe(false);
    });
  });

  // ── isRoleAuthorizedForAction ───────────────────────────────────────

  describe('isRoleAuthorizedForAction', () => {
    it('PM can create/edit live records', () => {
      expect(isRoleAuthorizedForAction('PM', 'CreateEditLive')).toBe(true);
    });

    it('PER cannot create/edit live records', () => {
      expect(isRoleAuthorizedForAction('PER', 'CreateEditLive')).toBe(false);
    });

    it('ProjectControls can access live state', () => {
      expect(isRoleAuthorizedForAction('ProjectControls', 'AccessLive')).toBe(true);
    });
  });

  // ── generateReviewPackageNumber ─────────────────────────────────────

  describe('generateReviewPackageNumber', () => {
    it('pads single digit to 3', () => {
      expect(generateReviewPackageNumber(1)).toBe('RP-001');
    });

    it('preserves triple digit', () => {
      expect(generateReviewPackageNumber(42)).toBe('RP-042');
    });
  });

  // ── getStateConsumptionMode ─────────────────────────────────────────

  describe('getStateConsumptionMode', () => {
    it('returns Live for PM daily operations', () => {
      expect(getStateConsumptionMode('PM daily operations')).toBe('Live');
    });

    it('returns Published for Executive review (PER)', () => {
      expect(getStateConsumptionMode('Executive review (PER)')).toBe('Published');
    });

    it('returns Configurable for Operational reports', () => {
      expect(getStateConsumptionMode('Operational reports')).toBe('Configurable');
    });

    it('returns Live for unknown consumer (safe default)', () => {
      expect(getStateConsumptionMode('Unknown Consumer')).toBe('Live');
    });
  });
});
