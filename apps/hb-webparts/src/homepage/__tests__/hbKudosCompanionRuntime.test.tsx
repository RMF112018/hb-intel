/**
 * HB Kudos Approval Companion runtime tests — Phase-14 kudos/ Prompt-03.
 *
 * Covers capability derivation, the governance patch plan builder,
 * the governance write dispatcher at the discriminator layer, and
 * a lightweight runtime smoke for the new webpart.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Site context mock — forces the hooks to fall through to the local
// config path so the runtime smoke can render in jsdom.
// ---------------------------------------------------------------------------
vi.mock('../data/spContext.js', () => ({
  getSiteUrl: () => undefined,
  storeSiteUrl: vi.fn(),
}));

import { HbKudosCompanion } from '../../webparts/hbKudosCompanion/HbKudosCompanion.js';
import {
  deriveKudosCapabilities,
  KUDOS_ROLES,
  parseKudosRole,
} from '../helpers/kudosCapabilities.js';
import {
  buildKudosPatchPlan,
} from '../data/kudosGovernanceWriter.js';
import { KUDOS_FIELDS } from '../data/peopleCultureListSource.js';

describe('kudosCapabilities — deriveKudosCapabilities', () => {
  it('admin has every capability', () => {
    const caps = deriveKudosCapabilities('admin');
    expect(caps.canApprove).toBe(true);
    expect(caps.canReject).toBe(true);
    expect(caps.canRequestRevision).toBe(true);
    expect(caps.canFlagAdminReview).toBe(true);
    expect(caps.canClearAdminReview).toBe(true);
    expect(caps.canSchedule).toBe(true);
    expect(caps.canPin).toBe(true);
    expect(caps.canFeature).toBe(true);
    expect(caps.canRemove).toBe(true);
    expect(caps.canRestore).toBe(true);
    expect(caps.canBulkApprove).toBe(true);
    expect(caps.canViewGovernance).toBe(true);
    expect(caps.canEditPublished).toBe(true);
  });

  it('reviewer has review-flow actions but no admin-only actions', () => {
    const caps = deriveKudosCapabilities('reviewer');
    expect(caps.canApprove).toBe(true);
    expect(caps.canReject).toBe(true);
    expect(caps.canRequestRevision).toBe(true);
    expect(caps.canFlagAdminReview).toBe(true);
    expect(caps.canClearAdminReview).toBe(true);
    expect(caps.canBulkApprove).toBe(true);
    expect(caps.canViewGovernance).toBe(true);
    // Admin-only flags are off for reviewers.
    expect(caps.canSchedule).toBe(false);
    expect(caps.canPin).toBe(false);
    expect(caps.canFeature).toBe(false);
    expect(caps.canRemove).toBe(false);
    expect(caps.canRestore).toBe(false);
    expect(caps.canEditPublished).toBe(false);
  });

  it('viewer has no governance capabilities', () => {
    const caps = deriveKudosCapabilities('viewer');
    for (const key of Object.keys(caps) as (keyof typeof caps)[]) {
      expect(caps[key]).toBe(false);
    }
  });

  it('parseKudosRole accepts each valid role and defaults to viewer', () => {
    for (const role of KUDOS_ROLES) {
      expect(parseKudosRole(role)).toBe(role);
    }
    expect(parseKudosRole(undefined)).toBe('viewer');
    expect(parseKudosRole('manager')).toBe('viewer');
    expect(parseKudosRole(42)).toBe('viewer');
  });
});

describe('kudosGovernanceWriter — buildKudosPatchPlan', () => {
  const NOW = '2026-04-09T12:00:00.000Z';

  it('approve plan sets WorkflowStatus=approved and HomepageEnabled=true', () => {
    const plan = buildKudosPatchPlan({
      kind: 'approve',
      kudosId: 'kudos-1',
      actorUserId: 42,
      actedAtIso: NOW,
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.WorkflowStatus]).toBe('approved');
    expect(plan.fields[KUDOS_FIELDS.HomepageEnabled]).toBe(true);
    expect(plan.fields[KUDOS_FIELDS.WasEverPublished]).toBe(true);
    expect(plan.fields[`${KUDOS_FIELDS.ApprovedBy}Id`]).toBe(42);
    expect(plan.fields[KUDOS_FIELDS.ApprovedDate]).toBe(NOW);
    expect(plan.fields[`${KUDOS_FIELDS.ReviewedBy}Id`]).toBe(42);
    expect(plan.auditEvent.eventType).toBe('approve');
    expect(plan.auditEvent.kudosId).toBe('kudos-1');
    expect(plan.auditEvent.actorUserId).toBe(42);
  });

  it('approve plan can also flag for admin review', () => {
    const plan = buildKudosPatchPlan({
      kind: 'approve',
      kudosId: 'kudos-2',
      actorUserId: 7,
      actedAtIso: NOW,
      flagForAdminReview: true,
      adminReviewReason: 'needs HR partner review',
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.IsFlaggedForAdminReview]).toBe(true);
    expect(plan.fields[KUDOS_FIELDS.AdminReviewReason]).toBe('needs HR partner review');
    expect(plan.fields[`${KUDOS_FIELDS.AdminReviewFlaggedBy}Id`]).toBe(7);
    expect(plan.fields[KUDOS_FIELDS.AdminReviewFlaggedAt]).toBe(NOW);
  });

  it('reject plan requires a rejection reason and emits a reject audit event', () => {
    const missing = buildKudosPatchPlan({
      kind: 'reject',
      kudosId: 'kudos-3',
      rejectionReason: '   ',
    });
    expect(missing.ok).toBe(false);

    const plan = buildKudosPatchPlan({
      kind: 'reject',
      kudosId: 'kudos-3',
      actorUserId: 9,
      actedAtIso: NOW,
      rejectionReason: 'off-topic',
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.WorkflowStatus]).toBe('rejected');
    expect(plan.fields[KUDOS_FIELDS.RejectionReason]).toBe('off-topic');
    expect(plan.fields[`${KUDOS_FIELDS.ReviewedBy}Id`]).toBe(9);
    expect(plan.fields[KUDOS_FIELDS.ReviewedAt]).toBe(NOW);
    expect(plan.auditEvent.eventType).toBe('reject');
  });

  it('requestRevision plan requires guidance and writes the revision metadata', () => {
    const missing = buildKudosPatchPlan({
      kind: 'requestRevision',
      kudosId: 'kudos-4',
      revisionGuidance: '',
    });
    expect(missing.ok).toBe(false);

    const plan = buildKudosPatchPlan({
      kind: 'requestRevision',
      kudosId: 'kudos-4',
      actorUserId: 11,
      actedAtIso: NOW,
      revisionGuidance: 'tighten the headline',
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.WorkflowStatus]).toBe('revisionRequested');
    expect(plan.fields[KUDOS_FIELDS.RevisionGuidance]).toBe('tighten the headline');
    expect(plan.fields[KUDOS_FIELDS.RevisionRequestedAt]).toBe(NOW);
    expect(plan.fields[`${KUDOS_FIELDS.RevisionRequestedBy}Id`]).toBe(11);
    expect(plan.auditEvent.eventType).toBe('revisionRequested');
  });

  it('flagAdminReview plan requires a reason and writes the admin-review metadata', () => {
    const missing = buildKudosPatchPlan({
      kind: 'flagAdminReview',
      kudosId: 'kudos-5',
      adminReviewReason: '',
    });
    expect(missing.ok).toBe(false);

    const plan = buildKudosPatchPlan({
      kind: 'flagAdminReview',
      kudosId: 'kudos-5',
      actorUserId: 3,
      actedAtIso: NOW,
      adminReviewReason: 'contains legal language',
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.IsFlaggedForAdminReview]).toBe(true);
    expect(plan.fields[KUDOS_FIELDS.AdminReviewReason]).toBe('contains legal language');
    expect(plan.auditEvent.eventType).toBe('flagAdminReview');
  });

  it('clearAdminReview plan writes the resolution timestamp and actor', () => {
    const plan = buildKudosPatchPlan({
      kind: 'clearAdminReview',
      kudosId: 'kudos-6',
      actorUserId: 5,
      actedAtIso: NOW,
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.IsFlaggedForAdminReview]).toBe(false);
    expect(plan.fields[`${KUDOS_FIELDS.AdminReviewedBy}Id`]).toBe(5);
    expect(plan.fields[KUDOS_FIELDS.AdminReviewedAt]).toBe(NOW);
    expect(plan.auditEvent.eventType).toBe('clearAdminReview');
  });

  it('Prompt-04 scheduling/prominence/remove/restore writers return ok plans', () => {
    const implemented: Array<Parameters<typeof buildKudosPatchPlan>[0]> = [
      { kind: 'schedule', kudosId: 'k', scheduledPublishAtIso: NOW },
      { kind: 'unschedule', kudosId: 'k' },
      { kind: 'pin', kudosId: 'k' },
      { kind: 'unpin', kudosId: 'k' },
      { kind: 'feature', kudosId: 'k' },
      { kind: 'unfeature', kudosId: 'k' },
      { kind: 'remove', kudosId: 'k', removedReason: 'test' },
      { kind: 'restore', kudosId: 'k' },
    ];
    for (const patch of implemented) {
      const plan = buildKudosPatchPlan(patch);
      expect(plan.ok).toBe(true);
    }
  });

  it('schedule plan sets WorkflowStatus=approvedScheduled and IsScheduled=true', () => {
    const plan = buildKudosPatchPlan({
      kind: 'schedule',
      kudosId: 'k',
      actorUserId: 7,
      actedAtIso: NOW,
      scheduledPublishAtIso: '2026-05-01T09:00:00Z',
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.WorkflowStatus]).toBe('approvedScheduled');
    expect(plan.fields[KUDOS_FIELDS.IsScheduled]).toBe(true);
    expect(plan.fields[KUDOS_FIELDS.ScheduledPublishAt]).toBe('2026-05-01T09:00:00Z');
    expect(plan.auditEvent.eventType).toBe('schedule');
  });

  it('pin plan sets ProminenceIntent=pinned and clears IsFeatured', () => {
    const plan = buildKudosPatchPlan({
      kind: 'pin',
      kudosId: 'k',
      pinOrder: 2,
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.IsPinned]).toBe(true);
    expect(plan.fields[KUDOS_FIELDS.IsFeatured]).toBe(false);
    expect(plan.fields[KUDOS_FIELDS.ProminenceIntent]).toBe('pinned');
    expect(plan.fields[KUDOS_FIELDS.PinOrder]).toBe(2);
  });

  it('feature plan sets ProminenceIntent=featured and clears IsPinned', () => {
    const plan = buildKudosPatchPlan({
      kind: 'feature',
      kudosId: 'k',
      featuredExpiresAtIso: '2026-06-01T00:00:00Z',
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.IsFeatured]).toBe(true);
    expect(plan.fields[KUDOS_FIELDS.IsPinned]).toBe(false);
    expect(plan.fields[KUDOS_FIELDS.ProminenceIntent]).toBe('featured');
  });

  it('remove plan requires a reason and disables homepage visibility', () => {
    const missing = buildKudosPatchPlan({ kind: 'remove', kudosId: 'k', removedReason: '' });
    expect(missing.ok).toBe(false);

    const plan = buildKudosPatchPlan({ kind: 'remove', kudosId: 'k', removedReason: 'inappropriate', actorUserId: 3, actedAtIso: NOW });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.WorkflowStatus]).toBe('removedUnpublished');
    expect(plan.fields[KUDOS_FIELDS.IsRemovedFromPublicView]).toBe(true);
    expect(plan.fields[KUDOS_FIELDS.HomepageEnabled]).toBe(false);
  });

  it('restore plan re-enables homepage and clears the removed flag', () => {
    const plan = buildKudosPatchPlan({ kind: 'restore', kudosId: 'k', actorUserId: 5, actedAtIso: NOW });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.WorkflowStatus]).toBe('approved');
    expect(plan.fields[KUDOS_FIELDS.IsRemovedFromPublicView]).toBe(false);
    expect(plan.fields[KUDOS_FIELDS.HomepageEnabled]).toBe(true);
  });

  it('deferred patch kinds return a NotImplemented error', () => {
    const deferred: Array<Parameters<typeof buildKudosPatchPlan>[0]> = [
      { kind: 'claim', kudosId: 'k' },
      { kind: 'reassign', kudosId: 'k', assignedUserId: 1 },
      { kind: 'celebrate', kudosId: 'k', nextCount: 5 },
      { kind: 'updateContent', kudosId: 'k', headline: 'h' },
      { kind: 'resubmit', kudosId: 'k' },
      { kind: 'withdraw', kudosId: 'k' },
    ];
    for (const patch of deferred) {
      const plan = buildKudosPatchPlan(patch);
      expect(plan.ok).toBe(false);
      if (plan.ok) continue;
      expect(plan.error).toContain('NotImplemented');
    }
  });
});

describe('HbKudosCompanion webpart — runtime smoke', () => {
  it('viewer role sees the access-restricted empty state', () => {
    render(<HbKudosCompanion config={{ simulatedRole: 'viewer' }} />);
    const section = document.querySelector('[data-hbc-webpart="hb-kudos-companion"]');
    expect(section).not.toBeNull();
    expect(section?.getAttribute('data-hbc-role')).toBe('viewer');
    expect(screen.getByText('Access restricted')).toBeTruthy();
  });

  it('reviewer role renders the workspace with the Phase-14 Prompt-03 marker', () => {
    render(<HbKudosCompanion config={{ simulatedRole: 'reviewer' }} />);
    const section = document.querySelector('[data-hbc-webpart="hb-kudos-companion"]');
    expect(section?.getAttribute('data-hbc-webpart-phase')).toBe('phase-14-kudos-prompt-03');
    expect(section?.getAttribute('data-hbc-role')).toBe('reviewer');
    // Tab bar should render the Pending tab by default.
    expect(screen.getByRole('tab', { name: 'Pending review' })).toBeTruthy();
    // Toolbar search is visible.
    expect(screen.getByPlaceholderText('Search recognition…')).toBeTruthy();
  });

  it('admin role shows the admin role label chip', () => {
    render(<HbKudosCompanion config={{ simulatedRole: 'admin' }} />);
    expect(screen.getByText('Kudos Admin')).toBeTruthy();
  });

  it('tab switching updates the active tab', () => {
    render(<HbKudosCompanion config={{ simulatedRole: 'reviewer' }} />);
    const flaggedTab = screen.getByRole('tab', { name: 'Flagged for admin' });
    fireEvent.click(flaggedTab);
    expect(flaggedTab.getAttribute('aria-selected')).toBe('true');
  });
});
