import { describe, expect, it } from 'vitest';

import {
  isThreadRoot,
  isStandalone,
  isThreadChild,
  canRolePerformAction,
  deriveHealthTier,
  deriveThreadHealthTier,
} from '../../index.js';

import { createMockPermitThreadNode } from '../../../testing/createMockPermitThreadNode.js';

describe('P3-E7-T01 Permits foundation business rules', () => {
  // ── Thread Model (§4) ───────────────────────────────────────────────

  describe('isThreadRoot', () => {
    it('returns true for THREAD_ROOT', () => {
      expect(isThreadRoot(createMockPermitThreadNode())).toBe(true);
    });

    it('returns false for SUBPERMIT', () => {
      expect(isThreadRoot(createMockPermitThreadNode({ threadRelationshipType: 'SUBPERMIT' }))).toBe(false);
    });

    it('returns false for STANDALONE', () => {
      expect(isThreadRoot(createMockPermitThreadNode({ threadRelationshipType: 'STANDALONE' }))).toBe(false);
    });
  });

  describe('isStandalone', () => {
    it('returns true for STANDALONE', () => {
      expect(isStandalone(createMockPermitThreadNode({ threadRelationshipType: 'STANDALONE' }))).toBe(true);
    });

    it('returns false for THREAD_ROOT', () => {
      expect(isStandalone(createMockPermitThreadNode())).toBe(false);
    });
  });

  describe('isThreadChild', () => {
    it('returns true for SUBPERMIT', () => {
      expect(isThreadChild(createMockPermitThreadNode({ threadRelationshipType: 'SUBPERMIT' }))).toBe(true);
    });

    it('returns true for PHASED_RELEASE', () => {
      expect(isThreadChild(createMockPermitThreadNode({ threadRelationshipType: 'PHASED_RELEASE' }))).toBe(true);
    });

    it('returns false for THREAD_ROOT', () => {
      expect(isThreadChild(createMockPermitThreadNode())).toBe(false);
    });

    it('returns false for STANDALONE', () => {
      expect(isThreadChild(createMockPermitThreadNode({ threadRelationshipType: 'STANDALONE' }))).toBe(false);
    });
  });

  // ── Authority Model (§7.1) ──────────────────────────────────────────

  describe('canRolePerformAction', () => {
    it('PM can create PermitApplication', () => {
      expect(canRolePerformAction('ProjectManager', 'PermitApplication', 'Create')).toBe(true);
    });

    it('PM cannot annotate IssuedPermit', () => {
      expect(canRolePerformAction('ProjectManager', 'IssuedPermit', 'Annotate')).toBe(false);
    });

    it('Executive can annotate IssuedPermit', () => {
      expect(canRolePerformAction('Executive', 'IssuedPermit', 'Annotate')).toBe(true);
    });

    it('Executive cannot create PermitApplication', () => {
      expect(canRolePerformAction('Executive', 'PermitApplication', 'Create')).toBe(false);
    });

    it('SiteSupervisor can create InspectionVisit', () => {
      expect(canRolePerformAction('SiteSupervisor', 'InspectionVisit', 'Create')).toBe(true);
    });

    it('SiteSupervisor cannot update IssuedPermit', () => {
      expect(canRolePerformAction('SiteSupervisor', 'IssuedPermit', 'Update')).toBe(false);
    });

    it('returns false for role with no rule for record type', () => {
      expect(canRolePerformAction('System', 'PermitApplication', 'Create')).toBe(false);
    });
  });

  // ── Compliance Health Derivation (§8) ────────────────────────────────

  describe('deriveHealthTier', () => {
    it('returns NORMAL when no active signals', () => {
      const result = deriveHealthTier([]);
      expect(result.tier).toBe('NORMAL');
      expect(result.activeSignals).toHaveLength(0);
    });

    it('returns CLOSED when permit is closed', () => {
      const result = deriveHealthTier([], true);
      expect(result.tier).toBe('CLOSED');
    });

    it('returns CRITICAL when ExpirationProximity signal is active', () => {
      const result = deriveHealthTier(['ExpirationProximity']);
      expect(result.tier).toBe('CRITICAL');
      expect(result.activeSignals).toContain('ExpirationProximity');
    });

    it('returns CRITICAL when ActiveStopWorkOrViolation signal is active', () => {
      const result = deriveHealthTier(['ActiveStopWorkOrViolation']);
      expect(result.tier).toBe('CRITICAL');
    });

    it('returns AT_RISK when only FailedInspectionWithoutPass is active', () => {
      const result = deriveHealthTier(['FailedInspectionWithoutPass']);
      expect(result.tier).toBe('AT_RISK');
    });

    it('returns CRITICAL when both CRITICAL and AT_RISK signals present', () => {
      const result = deriveHealthTier(['FailedInspectionWithoutPass', 'OpenHighSeverityDeficiency']);
      expect(result.tier).toBe('CRITICAL');
    });

    it('returns CLOSED over CRITICAL when isClosed is true', () => {
      const result = deriveHealthTier(['ExpirationProximity'], true);
      expect(result.tier).toBe('CLOSED');
    });
  });

  // ── Thread Health (§4.3) ────────────────────────────────────────────

  describe('deriveThreadHealthTier', () => {
    it('returns NORMAL for empty thread', () => {
      expect(deriveThreadHealthTier([])).toBe('NORMAL');
    });

    it('returns worst tier — CRITICAL wins over NORMAL', () => {
      expect(deriveThreadHealthTier(['NORMAL', 'CRITICAL', 'NORMAL'])).toBe('CRITICAL');
    });

    it('returns AT_RISK when worst is AT_RISK', () => {
      expect(deriveThreadHealthTier(['NORMAL', 'AT_RISK'])).toBe('AT_RISK');
    });

    it('returns NORMAL when all are NORMAL', () => {
      expect(deriveThreadHealthTier(['NORMAL', 'NORMAL'])).toBe('NORMAL');
    });

    it('returns CLOSED when all are CLOSED', () => {
      expect(deriveThreadHealthTier(['CLOSED', 'CLOSED'])).toBe('CLOSED');
    });

    it('CRITICAL propagates from child to thread', () => {
      expect(deriveThreadHealthTier(['NORMAL', 'NORMAL', 'CRITICAL'])).toBe('CRITICAL');
    });
  });
});
