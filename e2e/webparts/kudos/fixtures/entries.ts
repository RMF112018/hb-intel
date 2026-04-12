/**
 * Named entry fixtures — one composable factory per scenario. Factories
 * are intentionally small and overlay-explicit so the scenario catalog
 * (11-Fixture-Catalog.md) can describe each without code drift.
 */
import { at, KUDOS_AGED_OFF_ISO, KUDOS_ARCHIVE_ELIGIBLE_ISO } from '../helpers/kudosClock';
import { seedKudos, type SeededKudosItem } from '../helpers/kudosSeed';
import { RECIPIENTS, multipleIndividualsMixedPhoto, mixedBucket } from './recipients';
import { USERS } from './users';

/** A1–A7 workflow core. */
export const ENTRIES = {
  pending: () =>
    seedKudos('pending', {
      id: 'k-pending',
      submitterId: USERS.submitter.id,
      title: 'Pending entry',
    }),
  revisionRequested: () =>
    seedKudos('revisionRequested', {
      id: 'k-revision',
      submitterId: USERS.submitter.id,
      title: 'Revision requested',
    }),
  approvedLive: () =>
    seedKudos('approved', {
      id: 'k-approved',
      submitterId: USERS.submitter.id,
      title: 'Approved and live',
      overlays: { celebrateCount: 3 },
    }),
  approvedScheduled: () =>
    seedKudos('approvedScheduled', {
      id: 'k-scheduled',
      submitterId: USERS.submitter.id,
      title: 'Approved and scheduled',
    }),
  rejected: () =>
    seedKudos('rejected', {
      id: 'k-rejected',
      submitterId: USERS.submitter.id,
      title: 'Rejected',
    }),
  withdrawn: () =>
    seedKudos('withdrawn', {
      id: 'k-withdrawn',
      submitterId: USERS.submitter.id,
      title: 'Withdrawn by submitter',
    }),
  removedUnpublished: () =>
    seedKudos('removedUnpublished', {
      id: 'k-removed',
      submitterId: USERS.submitter.id,
      title: 'Removed / unpublished',
    }),

  // Overlay-specific variants
  approvedArchiveEligible: () =>
    seedKudos('approved', {
      id: 'k-archive',
      createdIso: KUDOS_ARCHIVE_ELIGIBLE_ISO,
      updatedIso: KUDOS_ARCHIVE_ELIGIBLE_ISO,
      title: 'Archive-eligible',
    }),
  approvedAgedOff: () =>
    seedKudos('approved', {
      id: 'k-agedoff',
      createdIso: KUDOS_AGED_OFF_ISO,
      updatedIso: KUDOS_AGED_OFF_ISO,
      title: 'Aged off homepage',
    }),
  approvedPinned: () =>
    seedKudos('approved', {
      id: 'k-pinned',
      overlays: { prominence: 'pinned' },
      title: 'Pinned',
    }),
  approvedFeatured: () =>
    seedKudos('approved', {
      id: 'k-featured',
      overlays: { prominence: 'featured' },
      title: 'Featured',
    }),
  pendingFlagged: () =>
    seedKudos('pending', {
      id: 'k-flagged',
      overlays: { flaggedForAdminReview: true },
      title: 'Flagged for admin review',
    }),
  pendingClaimed: () =>
    seedKudos('pending', {
      id: 'k-claimed',
      overlays: { claimOwnerId: USERS.admin.id },
      title: 'Claimed by admin',
    }),
  pendingAssigned: () =>
    seedKudos('pending', {
      id: 'k-assigned',
      overlays: { assignedOwnerId: USERS.otherAdmin.id },
      title: 'Assigned to other admin',
    }),
  approvedReviewed: () =>
    seedKudos('approved', {
      id: 'k-reviewed',
      overlays: { reviewedByCurrentUser: true },
      title: 'Reviewed by current user',
    }),
  approvedZeroCelebrates: () =>
    seedKudos('approved', {
      id: 'k-celebrate-zero',
      overlays: { celebrateCount: 0 },
      title: 'Zero celebrates',
    }),
  approvedManyCelebrates: () =>
    seedKudos('approved', {
      id: 'k-celebrate-many',
      overlays: { celebrateCount: 42 },
      title: 'Many celebrates',
    }),

  // Recipient-shape variants
  approvedIndividualNoPhoto: () =>
    seedKudos('approved', {
      id: 'k-nophoto',
      recipients: [RECIPIENTS.individualNoPhoto],
      title: 'Individual without photo',
    }),
  approvedMixedIndividuals: () =>
    seedKudos('approved', {
      id: 'k-mixed-individuals',
      recipients: multipleIndividualsMixedPhoto,
      title: 'Multiple individuals, mixed photo',
    }),
  approvedMixedBucket: () =>
    seedKudos('approved', {
      id: 'k-mixed-bucket',
      recipients: mixedBucket,
      title: 'Mixed bucket (RT*)',
    }),
} as const;

export type EntryKey = keyof typeof ENTRIES;

/** Full 7-state workflow baseline using the named ENTRIES factories. */
export function allWorkflowStates(): SeededKudosItem[] {
  return [
    ENTRIES.pending(),
    ENTRIES.revisionRequested(),
    ENTRIES.approvedLive(),
    ENTRIES.approvedScheduled(),
    ENTRIES.rejected(),
    ENTRIES.withdrawn(),
    ENTRIES.removedUnpublished(),
  ];
}

/** History shape: a previously removed item that was restored to approved. */
export function removedThenRestored(): SeededKudosItem {
  return seedKudos('approved', {
    id: 'k-restored',
    title: 'Removed → restored',
    createdIso: at(-60 * 24 * 7),
    updatedIso: at(-60),
    overlays: { celebrateCount: 1 },
  });
}
