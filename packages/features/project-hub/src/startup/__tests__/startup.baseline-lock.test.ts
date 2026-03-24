import { describe, expect, it } from 'vitest';

import {
  canCreateBaselineSnapshot,
  getBaselineAPIResponse,
  isBaselineMutationAllowed,
  isBaselineReadAuthorized,
  isBaselineSnapshotComplete,
} from '../../index.js';

import { createMockStartupBaseline } from '../../../testing/createMockStartupBaseline.js';

describe('P3-E11-T10 Stage 8 Startup baseline lock business rules', () => {
  // -- Snapshot Completeness (T10 §2 Stage 8 Gate) ----------------------------

  describe('isBaselineSnapshotComplete', () => {
    it('returns true when all 22 fields populated', () => {
      const snapshot = createMockStartupBaseline();
      expect(isBaselineSnapshotComplete(snapshot as unknown as Record<string, unknown>)).toBe(true);
    });

    it('returns false when snapshotId is null', () => {
      const snapshot = { ...createMockStartupBaseline(), snapshotId: null };
      expect(isBaselineSnapshotComplete(snapshot as unknown as Record<string, unknown>)).toBe(false);
    });

    it('returns false when lockedAt is null', () => {
      const snapshot = { ...createMockStartupBaseline(), lockedAt: null };
      expect(isBaselineSnapshotComplete(snapshot as unknown as Record<string, unknown>)).toBe(false);
    });

    it('returns false when taskLibrarySnapshotAtLock is null', () => {
      const snapshot = { ...createMockStartupBaseline(), taskLibrarySnapshotAtLock: null };
      expect(isBaselineSnapshotComplete(snapshot as unknown as Record<string, unknown>)).toBe(false);
    });

    it('returns false when executionBaselineFieldsAtLock is null', () => {
      const snapshot = { ...createMockStartupBaseline(), executionBaselineFieldsAtLock: null };
      expect(isBaselineSnapshotComplete(snapshot as unknown as Record<string, unknown>)).toBe(false);
    });

    it('returns false when certificationSummaryAtLock is null', () => {
      const snapshot = { ...createMockStartupBaseline(), certificationSummaryAtLock: null };
      expect(isBaselineSnapshotComplete(snapshot as unknown as Record<string, unknown>)).toBe(false);
    });

    it('returns false when authorizingPEUserId is null', () => {
      const snapshot = { ...createMockStartupBaseline(), authorizingPEUserId: null };
      expect(isBaselineSnapshotComplete(snapshot as unknown as Record<string, unknown>)).toBe(false);
    });

    it('returns false when authorizationTimestamp is null', () => {
      const snapshot = { ...createMockStartupBaseline(), authorizationTimestamp: null };
      expect(isBaselineSnapshotComplete(snapshot as unknown as Record<string, unknown>)).toBe(false);
    });

    it('returns false when a required field is missing entirely', () => {
      const snapshot = createMockStartupBaseline() as unknown as Record<string, unknown>;
      const { snapshotId: _, ...incomplete } = snapshot;
      expect(isBaselineSnapshotComplete(incomplete)).toBe(false);
    });

    it('returns false for empty object', () => {
      expect(isBaselineSnapshotComplete({})).toBe(false);
    });
  });

  // -- Immutability (T02 §7.1, T10 Criterion 23) -----------------------------

  describe('isBaselineMutationAllowed', () => {
    it('always returns false', () => {
      expect(isBaselineMutationAllowed()).toBe(false);
    });
  });

  // -- Authorization (T02 §7.3) -----------------------------------------------

  describe('isBaselineReadAuthorized', () => {
    it('returns true for PX', () => {
      expect(isBaselineReadAuthorized('PX')).toBe(true);
    });

    it('returns true for CloseoutService', () => {
      expect(isBaselineReadAuthorized('CloseoutService')).toBe(true);
    });

    it('returns false for PM', () => {
      expect(isBaselineReadAuthorized('PM')).toBe(false);
    });

    it('returns false for PA', () => {
      expect(isBaselineReadAuthorized('PA')).toBe(false);
    });

    it('returns false for Superintendent', () => {
      expect(isBaselineReadAuthorized('Superintendent')).toBe(false);
    });

    it('returns false for unknown role', () => {
      expect(isBaselineReadAuthorized('Unknown')).toBe(false);
    });
  });

  // -- Snapshot Creation Gate (T01 §7.5) --------------------------------------

  describe('canCreateBaselineSnapshot', () => {
    it('returns true for BASELINE_LOCKED target state', () => {
      expect(canCreateBaselineSnapshot('BASELINE_LOCKED')).toBe(true);
    });

    it('returns false for STABILIZING', () => {
      expect(canCreateBaselineSnapshot('STABILIZING')).toBe(false);
    });

    it('returns false for MOBILIZED', () => {
      expect(canCreateBaselineSnapshot('MOBILIZED')).toBe(false);
    });

    it('returns false for DRAFT', () => {
      expect(canCreateBaselineSnapshot('DRAFT')).toBe(false);
    });

    it('returns false for ARCHIVED', () => {
      expect(canCreateBaselineSnapshot('ARCHIVED')).toBe(false);
    });

    it('returns false for ACTIVE_PLANNING', () => {
      expect(canCreateBaselineSnapshot('ACTIVE_PLANNING')).toBe(false);
    });
  });

  // -- API Response (T02 §7.3) ------------------------------------------------

  describe('getBaselineAPIResponse', () => {
    it('returns 200 for GET', () => {
      expect(getBaselineAPIResponse('GET')).toBe(200);
    });

    it('returns 405 for PATCH', () => {
      expect(getBaselineAPIResponse('PATCH')).toBe(405);
    });

    it('returns 405 for PUT', () => {
      expect(getBaselineAPIResponse('PUT')).toBe(405);
    });

    it('returns 405 for DELETE', () => {
      expect(getBaselineAPIResponse('DELETE')).toBe(405);
    });
  });

  // -- Mock factory -----------------------------------------------------------

  describe('createMockStartupBaseline', () => {
    it('creates a valid default baseline snapshot', () => {
      const snapshot = createMockStartupBaseline();
      expect(snapshot.snapshotId).toBe('snap-001');
      expect(snapshot.programStateAtLock).toBe('BASELINE_LOCKED');
      expect(snapshot.stabilizationWindowDays).toBe(14);
      expect(snapshot.certificationSummaryAtLock).toHaveLength(6);
      expect(snapshot.permitPostingSnapshotAtLock).toHaveLength(12);
    });

    it('accepts overrides', () => {
      const snapshot = createMockStartupBaseline({ lockedBy: 'SYSTEM', stabilizationActualDuration: 14 });
      expect(snapshot.lockedBy).toBe('SYSTEM');
      expect(snapshot.stabilizationActualDuration).toBe(14);
    });
  });
});
