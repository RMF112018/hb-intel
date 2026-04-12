/**
 * Shared fixture baselines for the HB Kudos stress suite.
 *
 * Each baseline returns a SeedPayload shape consumable by
 * `gotoKudosPublic` / `gotoKudosCompanion`.
 */
import { resetKudosSeedSequence, seedKudos, seedWorkflowBaseline } from '../helpers/kudosSeed';
import type { SeedPayload } from '../helpers/kudosHarnessPage';
import { KUDOS_AGED_OFF_ISO, KUDOS_ARCHIVE_ELIGIBLE_ISO } from '../helpers/kudosClock';

export function workflowBaseline(): SeedPayload {
  resetKudosSeedSequence();
  return {
    items: seedWorkflowBaseline(),
    audits: [],
    currentUserId: 'user-current',
    currentUserRole: 'public',
  };
}

export function visibilityBaseline(): SeedPayload {
  resetKudosSeedSequence();
  const items = [
    seedKudos('approved', { createdIso: KUDOS_ARCHIVE_ELIGIBLE_ISO, title: 'Archive-eligible' }),
    seedKudos('approved', { createdIso: KUDOS_AGED_OFF_ISO, title: 'Aged-off' }),
    seedKudos('approved', { title: 'Currently-public' }),
  ];
  return { items, currentUserId: 'user-current', currentUserRole: 'public' };
}

export function governanceBaseline(): SeedPayload {
  resetKudosSeedSequence();
  const items = [
    seedKudos('pending', { overlays: { flaggedForAdminReview: true } }),
    seedKudos('pending', { overlays: { claimOwnerId: 'user-admin' } }),
    seedKudos('pending', { overlays: { assignedOwnerId: 'user-other-admin' } }),
    seedKudos('approved'),
  ];
  return { items, currentUserId: 'user-admin', currentUserRole: 'admin' };
}

export function prominenceBaseline(): SeedPayload {
  resetKudosSeedSequence();
  const items = [
    seedKudos('approved', { overlays: { prominence: 'pinned' } }),
    seedKudos('approved', { overlays: { prominence: 'featured' } }),
    seedKudos('approved'),
  ];
  return { items, currentUserId: 'user-admin', currentUserRole: 'admin' };
}
