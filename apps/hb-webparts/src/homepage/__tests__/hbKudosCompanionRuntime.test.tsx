/**
 * HB Kudos Approval Companion runtime tests — Phase-14 kudos/ Prompt-03.
 *
 * Covers capability derivation, the governance patch plan builder,
 * the governance write dispatcher at the discriminator layer, and
 * a lightweight runtime smoke for the new webpart.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  getKudosListHostUrl: () => undefined,
  storeSiteUrl: vi.fn(),
  storeKudosListHostUrl: vi.fn(),
  resolveCurrentUserId: () => Promise.resolve(undefined),
}));

// ---------------------------------------------------------------------------
// Role resolver mock — resolves immediately using the simulatedRole
// fallback path (siteUrl is undefined in test context).
// ---------------------------------------------------------------------------
vi.mock('../helpers/kudosRoleResolver.js', () => ({
  resolveKudosRole: vi.fn(async (config: { simulatedRole?: unknown }) => {
    const { parseKudosRole } = await import('../helpers/kudosCapabilities.js');
    return parseKudosRole(config.simulatedRole);
  }),
  resolveKudosRoleStatus: vi.fn(async (config: { simulatedRole?: unknown; siteUrl?: string }) => {
    const { parseKudosRole } = await import('../helpers/kudosCapabilities.js');
    return {
      role: parseKudosRole(config.simulatedRole),
      status: config.siteUrl ? 'resolved' : 'simulated',
    };
  }),
  clearKudosRoleCache: vi.fn(),
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

  it('Prompt-05 work-management + lifecycle writers return ok plans', () => {
    const implemented: Array<Parameters<typeof buildKudosPatchPlan>[0]> = [
      { kind: 'claim', kudosId: 'k' },
      { kind: 'reassign', kudosId: 'k', assignedUserId: 1 },
      { kind: 'celebrate', kudosId: 'k', nextCount: 5 },
      { kind: 'updateContent', kudosId: 'k', headline: 'h' },
      { kind: 'resubmit', kudosId: 'k' },
      { kind: 'withdraw', kudosId: 'k' },
    ];
    for (const patch of implemented) {
      const plan = buildKudosPatchPlan(patch);
      expect(plan.ok).toBe(true);
    }
  });

  it('claim plan sets ClaimOwnerId and ClaimedAt', () => {
    const plan = buildKudosPatchPlan({ kind: 'claim', kudosId: 'k', actorUserId: 42, actedAtIso: NOW });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[`${KUDOS_FIELDS.ClaimOwner}Id`]).toBe(42);
    expect(plan.fields[KUDOS_FIELDS.ClaimedAt]).toBe(NOW);
    expect(plan.auditEvent.eventType).toBe('claim');
  });

  it('reassign plan sets AssignedOwnerId and ReassignedAt', () => {
    const plan = buildKudosPatchPlan({ kind: 'reassign', kudosId: 'k', actorUserId: 1, assignedUserId: 99, actedAtIso: NOW });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[`${KUDOS_FIELDS.AssignedOwner}Id`]).toBe(99);
    expect(plan.fields[KUDOS_FIELDS.ReassignedAt]).toBe(NOW);
    expect(plan.auditEvent.eventType).toBe('reassign');
  });

  it('celebrate plan sets CelebrateCount', () => {
    const plan = buildKudosPatchPlan({ kind: 'celebrate', kudosId: 'k', nextCount: 25 });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.CelebrateCount]).toBe(25);
    expect(plan.auditEvent.eventType).toBe('celebrate');
  });

  it('withdraw plan sets WorkflowStatus=withdrawn', () => {
    const plan = buildKudosPatchPlan({ kind: 'withdraw', kudosId: 'k', actorUserId: 3, actedAtIso: NOW });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.WorkflowStatus]).toBe('withdrawn');
    expect(plan.fields[KUDOS_FIELDS.WithdrawnAt]).toBe(NOW);
  });

  it('resubmit plan sets WorkflowStatus=pending', () => {
    const plan = buildKudosPatchPlan({ kind: 'resubmit', kudosId: 'k', updatedHeadline: 'Updated' });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.WorkflowStatus]).toBe('pending');
    expect(plan.fields[KUDOS_FIELDS.Headline]).toBe('Updated');
  });

  it('updateContent plan requires at least one field', () => {
    const empty = buildKudosPatchPlan({ kind: 'updateContent', kudosId: 'k' });
    expect(empty.ok).toBe(false);

    const withContent = buildKudosPatchPlan({ kind: 'updateContent', kudosId: 'k', headline: 'New' });
    expect(withContent.ok).toBe(true);
  });

  it('all 19 patch kinds now have real implementations (no NotImplemented)', () => {
    // Exhaustive check: every kind from the KudosPatch union should
    // return ok=true when given valid inputs.
    const allKinds: Array<Parameters<typeof buildKudosPatchPlan>[0]> = [
      { kind: 'approve', kudosId: 'k' },
      { kind: 'reject', kudosId: 'k', rejectionReason: 'r' },
      { kind: 'requestRevision', kudosId: 'k', revisionGuidance: 'g' },
      { kind: 'flagAdminReview', kudosId: 'k', adminReviewReason: 'a' },
      { kind: 'clearAdminReview', kudosId: 'k' },
      { kind: 'schedule', kudosId: 'k', scheduledPublishAtIso: NOW },
      { kind: 'unschedule', kudosId: 'k' },
      { kind: 'pin', kudosId: 'k' },
      { kind: 'unpin', kudosId: 'k' },
      { kind: 'feature', kudosId: 'k' },
      { kind: 'unfeature', kudosId: 'k' },
      { kind: 'remove', kudosId: 'k', removedReason: 'x' },
      { kind: 'restore', kudosId: 'k' },
      { kind: 'claim', kudosId: 'k' },
      { kind: 'reassign', kudosId: 'k', assignedUserId: 1 },
      { kind: 'celebrate', kudosId: 'k', nextCount: 1 },
      { kind: 'resubmit', kudosId: 'k' },
      { kind: 'withdraw', kudosId: 'k' },
      { kind: 'updateContent', kudosId: 'k', headline: 'h' },
    ];
    for (const patch of allKinds) {
      const plan = buildKudosPatchPlan(patch);
      expect(plan.ok).toBe(true);
    }
  });
});

describe('kudosNotificationBuilder', () => {
  it('approve triggers submitter notification', async () => {
    const { buildKudosNotificationIntents } = await import('../helpers/kudosNotificationBuilder.js');
    const intents = buildKudosNotificationIntents({
      eventType: 'approve',
      kudosId: 'k1',
      headline: 'Great work',
      isLive: true,
      isFirstPublish: false,
    });
    expect(intents.length).toBe(1);
    expect(intents[0]!.targetKinds).toEqual(['submitter']);
  });

  it('approve + first publish also triggers recipient notification', async () => {
    const { buildKudosNotificationIntents } = await import('../helpers/kudosNotificationBuilder.js');
    const intents = buildKudosNotificationIntents({
      eventType: 'approve',
      kudosId: 'k2',
      headline: 'Great work',
      isLive: true,
      isFirstPublish: true,
    });
    expect(intents.length).toBe(2);
    expect(intents[1]!.targetKinds).toEqual(['recipients']);
  });

  it('reject triggers submitter with reason', async () => {
    const { buildKudosNotificationIntents } = await import('../helpers/kudosNotificationBuilder.js');
    const intents = buildKudosNotificationIntents({
      eventType: 'reject',
      kudosId: 'k3',
      headline: 'Off-topic',
      isLive: false,
      isFirstPublish: false,
      reason: 'does not meet criteria',
    });
    expect(intents.length).toBe(1);
    expect(intents[0]!.body).toContain('does not meet criteria');
  });

  it('non-notification events return empty', async () => {
    const { buildKudosNotificationIntents } = await import('../helpers/kudosNotificationBuilder.js');
    expect(buildKudosNotificationIntents({ eventType: 'pin', kudosId: 'k', headline: 'h', isLive: true, isFirstPublish: false })).toEqual([]);
    expect(buildKudosNotificationIntents({ eventType: 'celebrate', kudosId: 'k', headline: 'h', isLive: true, isFirstPublish: false })).toEqual([]);
  });
});

describe('kudosNotificationBuilder — overdue helpers', () => {
  it('deriveKudosOverdueStatus returns overdue after threshold', async () => {
    const { deriveKudosOverdueStatus } = await import('../helpers/kudosNotificationBuilder.js');
    expect(deriveKudosOverdueStatus('2026-04-05T00:00:00Z', '2026-04-09T00:00:00Z', 3)).toBe('overdue');
    expect(deriveKudosOverdueStatus('2026-04-07T00:00:00Z', '2026-04-09T00:00:00Z', 3)).toBe('approaching');
    expect(deriveKudosOverdueStatus('2026-04-08T12:00:00Z', '2026-04-09T00:00:00Z', 3)).toBe('ok');
  });

  it('findKudosReminderTargets returns pending entries past threshold', async () => {
    const { findKudosReminderTargets } = await import('../helpers/kudosNotificationBuilder.js');
    const targets = findKudosReminderTargets(
      [
        { id: 'k1', headline: 'h1', submittedDate: '2026-04-01T00:00:00Z', workflowStatus: 'pending' },
        { id: 'k2', headline: 'h2', submittedDate: '2026-04-08T00:00:00Z', workflowStatus: 'pending' },
        { id: 'k3', headline: 'h3', submittedDate: '2026-04-01T00:00:00Z', workflowStatus: 'approved' },
        { id: 'k4', headline: 'h4', submittedDate: '2026-04-06T00:00:00Z', workflowStatus: 'pending', isFlaggedForAdminReview: true },
      ],
      '2026-04-10T00:00:00Z',
    );
    // k1: pending, 9 days old → overdue (3-day threshold) → reviewers
    // k2: pending, 2 days old → approaching (50% of 3 = 1.5) → reviewers
    // k3: approved → skip
    // k4: pending 4 days old → overdue → reviewers; also flagged → admin overdue (2-day) → admins
    expect(targets.length).toBe(4);
    expect(targets.find((t) => t.kudosId === 'k1' && t.targetKind === 'reviewers')).toBeTruthy();
    expect(targets.find((t) => t.kudosId === 'k2' && t.targetKind === 'reviewers')).toBeTruthy();
    expect(targets.find((t) => t.kudosId === 'k4' && t.targetKind === 'reviewers')).toBeTruthy();
    expect(targets.find((t) => t.kudosId === 'k4' && t.targetKind === 'admins')).toBeTruthy();
  });
});

describe('HbKudosCompanion webpart — runtime smoke', () => {
  it('viewer role sees the access-restricted empty state', async () => {
    await act(async () => {
      render(<HbKudosCompanion config={{ simulatedRole: 'viewer' }} />);
    });
    const section = document.querySelector('[data-hbc-webpart="hb-kudos-companion"]');
    expect(section).not.toBeNull();
    await waitFor(() => {
      expect(section?.getAttribute('data-hbc-role')).toBe('viewer');
      expect(screen.getByText('Access restricted')).toBeTruthy();
    });
  });

  it('reviewer role renders the workspace with the Phase-14 Prompt-03 marker', async () => {
    await act(async () => {
      render(<HbKudosCompanion config={{ simulatedRole: 'reviewer' }} />);
    });
    await waitFor(() => {
      const section = document.querySelector('[data-hbc-webpart="hb-kudos-companion"]');
      expect(section?.getAttribute('data-hbc-webpart-phase')).toBe('phase-14-kudos-phase-04');
      expect(section?.getAttribute('data-hbc-role')).toBe('reviewer');
    });
    // Filter bar should render the Pending tab active by default.
    // Phase-27 Prompt-06 appends a scope count: "Pending (N)".
    expect(screen.getByRole('button', { name: /^Pending\s*\(\d+\)$/ })).toBeTruthy();
    // Toolbar search is visible.
    expect(screen.getByPlaceholderText('Search recognition…')).toBeTruthy();
  });

  it('admin role shows the admin role label chip', async () => {
    await act(async () => {
      render(<HbKudosCompanion config={{ simulatedRole: 'admin' }} />);
    });
    await waitFor(() => {
      expect(screen.getByText('Kudos Admin')).toBeTruthy();
    });
  });

  it('filter switching updates the active filter button', async () => {
    await act(async () => {
      render(<HbKudosCompanion config={{ simulatedRole: 'reviewer' }} />);
    });
    // Phase-27 Prompt-06 appends a scope count to every tab label.
    const rejectedRe = /^Rejected\s*\(\d+\)$/;
    await waitFor(() => {
      expect(screen.getByRole('button', { name: rejectedRe })).toBeTruthy();
    });
    const rejectedBtn = screen.getByRole('button', { name: rejectedRe });
    fireEvent.click(rejectedBtn);
    expect(rejectedBtn.getAttribute('aria-pressed')).toBe('true');
  });
});
