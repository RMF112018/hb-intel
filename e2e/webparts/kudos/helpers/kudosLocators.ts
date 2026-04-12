/**
 * Stable locator + test-id registry for the HB Kudos stress suite.
 *
 * Rule: any selector used by more than one spec MUST be declared here.
 * Prefer `data-hbc-testid` over role/text when possible; fall back to
 * ARIA role + accessible name when a test id would duplicate semantics
 * already exposed to assistive tech.
 *
 * When a needed test id is missing from the component, add it in the
 * same commit that references it — never rely on brittle visual text
 * alone for critical path assertions.
 */
export const KUDOS_TESTIDS = {
  // Public webpart
  publicRoot: 'hb-kudos-public-root',
  publicFeed: 'hb-kudos-public-feed',
  publicFeedItem: 'hb-kudos-public-feed-item',
  publicDetailPanel: 'hb-kudos-public-detail',
  publicAuditTimeline: 'hb-kudos-audit-timeline', // MUST NOT appear on public
  giveKudosFlyoutTrigger: 'hb-kudos-give-trigger',
  composerForm: 'hb-kudos-composer-form',
  composerPreview: 'hb-kudos-composer-preview',
  composerSubmit: 'hb-kudos-composer-submit',
  composerDiscardDialog: 'hb-kudos-composer-discard-dialog',
  composerSendAnother: 'hb-kudos-composer-send-another',
  peoplePickerInput: 'hb-kudos-people-picker-input',
  peoplePickerResults: 'hb-kudos-people-picker-results',
  peoplePickerEmpty: 'hb-kudos-people-picker-empty',
  peoplePickerError: 'hb-kudos-people-picker-error',
  celebrateButton: 'hb-kudos-celebrate',
  celebrateCount: 'hb-kudos-celebrate-count',
  viewAllTrigger: 'hb-kudos-view-all',
  viewAllFeedPanel: 'hb-kudos-view-all-panel',
  archiveSearchInput: 'hb-kudos-archive-search',

  // Companion webpart
  companionRoot: 'hb-kudos-companion-root',
  queueTab: (bucket: QueueBucket) => `hb-kudos-queue-tab-${bucket}`,
  queueRow: 'hb-kudos-queue-row',
  queueFilterSearch: 'hb-kudos-queue-filter-search',
  queueFilterOwnership: 'hb-kudos-queue-filter-ownership',
  queueFilterAdminReviewOnly: 'hb-kudos-queue-filter-admin-review',
  queueFilterScheduledOnly: 'hb-kudos-queue-filter-scheduled',
  queueFilterAging: 'hb-kudos-queue-filter-aging',
  companionDetailPanel: 'hb-kudos-companion-detail',
  companionAuditTimeline: 'hb-kudos-audit-timeline', // MUST appear on admin
  bulkApproveButton: 'hb-kudos-bulk-approve',
  governanceAction: (action: GovernanceAction) => `hb-kudos-action-${action}`,
} as const;

export type QueueBucket =
  | 'pending'
  | 'revisionRequested'
  | 'flagged'
  | 'approved'
  | 'rejected'
  | 'removed';

export type GovernanceAction =
  | 'approve'
  | 'reject'
  | 'request-revision'
  | 'withdraw'
  | 'remove'
  | 'reopen'
  | 'claim'
  | 'assign'
  | 'flag'
  | 'clear-flag'
  | 'pin'
  | 'unpin'
  | 'feature'
  | 'unfeature';

/** Matrix-coordinate tag helper. Produces the `[A3][C1][H1]` tag used in
 *  test titles for coverage reconstruction. */
export function matrixTag(...parts: string[]): string {
  return parts.map((p) => `[${p}]`).join('');
}
