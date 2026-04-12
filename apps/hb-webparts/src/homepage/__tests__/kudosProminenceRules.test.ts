/**
 * Phase-16a/05 — direct tests for kudosProminenceRules.
 */
import { describe, expect, it } from 'vitest';
import {
  FEATURED_MAX,
  PINNED_MAX,
  handleScheduledProminenceCollision,
  validateFeatureAction,
  validatePinAction,
  validateReassignmentAuthority,
} from '../helpers/kudosProminenceRules.js';

describe('validateFeatureAction', () => {
  it('rejects missing featuredExpiresAt', () => {
    const r = validateFeatureAction({ featuredCount: 0, pinnedCount: 0 }, undefined);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/expiration/i);
  });

  it('rejects whitespace-only featuredExpiresAt', () => {
    const r = validateFeatureAction({ featuredCount: 0, pinnedCount: 0 }, '   ');
    expect(r.ok).toBe(false);
  });

  it(`rejects when slot is full (max ${FEATURED_MAX})`, () => {
    const r = validateFeatureAction(
      { featuredCount: FEATURED_MAX, pinnedCount: 0 },
      '2026-06-01T00:00:00Z',
    );
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/featured slot is full/i);
  });

  it('accepts when slot open + expiration present', () => {
    const r = validateFeatureAction(
      { featuredCount: 0, pinnedCount: 1 },
      '2026-06-01T00:00:00Z',
    );
    expect(r.ok).toBe(true);
  });
});

describe('validatePinAction', () => {
  it(`rejects when pin slots are full (max ${PINNED_MAX})`, () => {
    const r = validatePinAction({ featuredCount: 0, pinnedCount: PINNED_MAX });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/pin slots are full/i);
  });

  it('accepts below the pin cap', () => {
    const r = validatePinAction({ featuredCount: 0, pinnedCount: PINNED_MAX - 1 });
    expect(r.ok).toBe(true);
  });
});

describe('handleScheduledProminenceCollision', () => {
  it('featured collision demotes to standard + flags admin review', () => {
    const r = handleScheduledProminenceCollision(
      { featuredCount: FEATURED_MAX, pinnedCount: 0 },
      'featured',
    );
    expect(r.ok).toBe(true);
    expect(r.demoteToStandard).toBe(true);
    expect(r.flagForAdminReview).toBe(true);
    expect(r.adminNotificationReason).toMatch(/featured/i);
  });

  it('pinned collision demotes + flags', () => {
    const r = handleScheduledProminenceCollision(
      { featuredCount: 0, pinnedCount: PINNED_MAX },
      'pinned',
    );
    expect(r.demoteToStandard).toBe(true);
    expect(r.flagForAdminReview).toBe(true);
  });

  it('no collision when slot is open', () => {
    const r = handleScheduledProminenceCollision(
      { featuredCount: 0, pinnedCount: 0 },
      'featured',
    );
    expect(r.ok).toBe(true);
    expect(r.demoteToStandard).toBeFalsy();
    expect(r.flagForAdminReview).toBeFalsy();
  });
});

describe('validateReassignmentAuthority', () => {
  it('viewers are always blocked', () => {
    expect(validateReassignmentAuthority('viewer', false)).toMatch(/viewers/i);
    expect(validateReassignmentAuthority('viewer', true)).toMatch(/viewers/i);
  });

  it('reviewers blocked on flagged items', () => {
    expect(validateReassignmentAuthority('reviewer', true)).toMatch(/admins/i);
  });

  it('reviewers allowed on non-flagged items', () => {
    expect(validateReassignmentAuthority('reviewer', false)).toBeUndefined();
  });

  it('admins allowed always', () => {
    expect(validateReassignmentAuthority('admin', true)).toBeUndefined();
    expect(validateReassignmentAuthority('admin', false)).toBeUndefined();
  });
});
