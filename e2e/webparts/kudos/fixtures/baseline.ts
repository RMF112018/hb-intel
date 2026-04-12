/**
 * Scenario-oriented SeedPayload baselines for the HB Kudos stress suite.
 *
 * Each baseline composes named entry factories + optional audit
 * sequences and returns a SeedPayload consumable by
 * `gotoKudosPublic` / `gotoKudosCompanion`.
 *
 * See `11-Fixture-Catalog.md` for the scenario ↔ matrix-coordinate map.
 */
import type { SeedPayload } from '../helpers/kudosHarnessPage';
import { resetKudosSeedSequence, type SeededAuditEvent } from '../helpers/kudosSeed';
import { AUDIT_SEQUENCES, type AuditSequenceKey } from './audits';
import { ENTRIES, allWorkflowStates } from './entries';
import { USERS, type KudosUserKey } from './users';

function withCurrentUser(
  payload: Omit<SeedPayload, 'currentUserId' | 'currentUserRole'>,
  asUser: KudosUserKey,
): SeedPayload {
  const u = USERS[asUser];
  return { ...payload, currentUserId: u.id, currentUserRole: u.role };
}

/** 7-state workflow baseline, current user = unrelated public viewer. */
export function workflowBaseline(): SeedPayload {
  resetKudosSeedSequence();
  return withCurrentUser({ items: allWorkflowStates(), audits: [] }, 'unrelated');
}

/** Visibility/archive/age-off baseline, current user = unrelated. */
export function visibilityBaseline(): SeedPayload {
  resetKudosSeedSequence();
  return withCurrentUser(
    {
      items: [
        ENTRIES.approvedLive(),
        ENTRIES.approvedArchiveEligible(),
        ENTRIES.approvedAgedOff(),
      ],
      audits: [],
    },
    'unrelated',
  );
}

/** Governance baseline, current user = admin. */
export function governanceBaseline(): SeedPayload {
  resetKudosSeedSequence();
  return withCurrentUser(
    {
      items: [
        ENTRIES.pendingFlagged(),
        ENTRIES.pendingClaimed(),
        ENTRIES.pendingAssigned(),
        ENTRIES.approvedLive(),
        ENTRIES.approvedReviewed(),
      ],
      audits: [],
    },
    'admin',
  );
}

/** Prominence baseline with pin+feature slots already occupied. */
export function prominenceBaseline(): SeedPayload {
  resetKudosSeedSequence();
  return withCurrentUser(
    {
      items: [ENTRIES.approvedPinned(), ENTRIES.approvedFeatured(), ENTRIES.approvedLive()],
      audits: [],
    },
    'admin',
  );
}

/** Identity/media baseline. */
export function identityMediaBaseline(): SeedPayload {
  resetKudosSeedSequence();
  return withCurrentUser(
    {
      items: [
        ENTRIES.approvedLive(),
        ENTRIES.approvedIndividualNoPhoto(),
        ENTRIES.approvedMixedIndividuals(),
        ENTRIES.approvedMixedBucket(),
      ],
      audits: [],
    },
    'unrelated',
  );
}

/** Interaction baseline (celebrate count variants). */
export function interactionBaseline(): SeedPayload {
  resetKudosSeedSequence();
  return withCurrentUser(
    {
      items: [ENTRIES.approvedZeroCelebrates(), ENTRIES.approvedManyCelebrates()],
      audits: [],
    },
    'recipient',
  );
}

/** Submitter-perspective baseline (own pending + revision + rejected). */
export function submitterPerspectiveBaseline(): SeedPayload {
  resetKudosSeedSequence();
  return withCurrentUser(
    {
      items: [ENTRIES.pending(), ENTRIES.revisionRequested(), ENTRIES.rejected()],
      audits: [],
    },
    'submitter',
  );
}

/** Recipient-perspective baseline. */
export function recipientPerspectiveBaseline(): SeedPayload {
  resetKudosSeedSequence();
  return withCurrentUser({ items: [ENTRIES.approvedLive()], audits: [] }, 'recipient');
}

/** Reviewer-perspective baseline for admin-review overlays. */
export function reviewerPerspectiveBaseline(): SeedPayload {
  resetKudosSeedSequence();
  return withCurrentUser(
    { items: [ENTRIES.pendingFlagged(), ENTRIES.approvedLive()], audits: [] },
    'reviewer',
  );
}

/** Audit-timeline baseline: one entry per canonical sequence. */
export function auditTimelineBaseline(): SeedPayload {
  resetKudosSeedSequence();
  const pairs: Array<[ReturnType<typeof ENTRIES.approvedLive>, AuditSequenceKey]> = [
    [ENTRIES.approvedLive(), 'submitApprove'],
    [ENTRIES.approvedLive(), 'submitRevisionResubmitApprove'],
    [ENTRIES.rejected(), 'submitReject'],
    [ENTRIES.withdrawn(), 'submitWithdraw'],
    [ENTRIES.approvedScheduled(), 'approveScheduleUnschedule'],
    [ENTRIES.approvedPinned(), 'approvePinUnpin'],
    [ENTRIES.approvedFeatured(), 'approveFeatureUnfeature'],
    [ENTRIES.removedUnpublished(), 'approveRemoveRestore'],
    [ENTRIES.pendingClaimed(), 'claimReassign'],
    [ENTRIES.pendingFlagged(), 'flagClear'],
    [ENTRIES.approvedManyCelebrates(), 'celebrateIncrements'],
    [ENTRIES.rejected(), 'reopen'],
    [ENTRIES.approvedLive(), 'updateContent'],
  ];
  const items = pairs.map(([item], i) => ({ ...item, id: `${item.id}-seq-${i}` }));
  const audits: SeededAuditEvent[] = pairs.flatMap(([, key], i) =>
    AUDIT_SEQUENCES[key](items[i].id),
  );
  return withCurrentUser({ items, audits }, 'admin');
}
