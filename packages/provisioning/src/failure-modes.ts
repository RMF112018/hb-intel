/**
 * W0-G3-T07: Failure mode registry for project setup shared primitives.
 *
 * 10 failure modes covering degraded behavior at every integration seam
 * between the six shared packages. Each entry specifies the scenario,
 * expected degradation, and affected packages.
 *
 * These are behavioral expectations for consuming surfaces — not runtime enforcement.
 * T08 integration tests reference these FM IDs as stable identifiers.
 *
 * Traceability: docs/architecture/plans/MVP/G3/W0-G3-T07-Shared-Primitive-Integration-Rules-Failure-Modes-and-Validation.md Part 2
 */

export interface IFailureMode {
  readonly fmId: string;
  readonly title: string;
  readonly scenario: string;
  readonly expectedDegradation: string;
  readonly affectedPackages: readonly string[];
}

export const PROJECT_SETUP_FAILURE_MODES: readonly IFailureMode[] = [
  {
    fmId: 'FM-01',
    title: 'IndexedDB Unavailable',
    scenario: 'IndexedDB unavailable (private browsing, storage quota exceeded, browser restriction)',
    expectedDegradation: 'Form functions normally; auto-save silently disabled; draft-saved indicator hidden; no error thrown; data lost on navigation (expected)',
    affectedPackages: ['@hbc/session-state'],
  },
  {
    fmId: 'FM-02',
    title: 'BIC resolveCurrentOwner Returns Null',
    scenario: 'Request is in ReadyToProvision or Provisioning state (system-owned)',
    expectedDegradation: 'BIC badge shows "In Progress" or system indicator instead of a named owner; HbcBicBadge handles null owner gracefully without rendering unassigned warning',
    affectedPackages: ['@hbc/bic-next-move'],
  },
  {
    fmId: 'FM-03',
    title: 'Notification Registration Missing',
    scenario: 'Backend fires NotificationApi.send() with an event type not yet registered via NotificationRegistry.register() on the frontend',
    expectedDegradation: 'Backend delivers notification regardless; frontend notification center falls back to raw event type string instead of human-readable description',
    affectedPackages: ['@hbc/notification-intelligence'],
  },
  {
    fmId: 'FM-04',
    title: 'Handoff validateReadiness Fails',
    scenario: 'User attempts Estimating → Project Hub handoff but validateReadiness(request) returns non-null error (e.g., site URL not yet synced)',
    expectedDegradation: 'HbcHandoffComposer displays blocking error; "Send Handoff" CTA disabled; user cannot send until blocking condition resolved; no error thrown',
    affectedPackages: ['@hbc/workflow-handoff'],
  },
  {
    fmId: 'FM-05',
    title: 'API Submission Fails After onAllComplete',
    scenario: 'Wizard reports all steps complete, onAllComplete fires, surface calls ProjectSetupApi.submit(), API returns error',
    expectedDegradation: 'Draft NOT cleared; form remains on Review step; error message displayed; user can retry; all entered values intact',
    affectedPackages: ['@hbc/step-wizard', '@hbc/session-state'],
  },
  {
    fmId: 'FM-06',
    title: 'Clarification Draft TTL Expires',
    scenario: 'Requester opens clarification return form, starts entering responses, does not return for 8+ days; 7-day draft TTL expires',
    expectedDegradation: 'useDraft returns null; surface falls back to server record; in-progress clarification responses lost; step statuses re-derived from open clarification annotations',
    affectedPackages: ['@hbc/session-state', '@hbc/step-wizard'],
  },
  {
    fmId: 'FM-07',
    title: 'BIC Module queryFn Fails',
    scenario: 'My Work calls provisioning module queryFn and the provisioning API returns 500 error',
    expectedDegradation: 'Failed module reported in IBicMyItemsResult.failedModules[]; other modules continue to display; queryFn returns empty items array (does not throw); error logged',
    affectedPackages: ['@hbc/bic-next-move'],
  },
  {
    fmId: 'FM-08',
    title: 'Complexity Tier Cannot Be Derived from Role',
    scenario: 'User Azure AD groups do not match any entry in roleComplexityMap; complexity package cannot derive tier from role',
    expectedDegradation: 'Tier falls back to "essential" (configured fallbackTier); user sees minimum information set; can manually adjust via HbcComplexityDial',
    affectedPackages: ['@hbc/complexity'],
  },
  {
    fmId: 'FM-09',
    title: 'SignalR Disconnected During Provisioning',
    scenario: 'Requester watching provisioning status page; SignalR disconnects (network hiccup, token expiry, firewall)',
    expectedDegradation: 'Status page falls back to polling (GET /api/provisioning-status/{projectId} every 30s); isPollingFallbackRequired set to true; "Live updates paused" message displayed',
    affectedPackages: ['@hbc/session-state'],
  },
  {
    fmId: 'FM-10',
    title: 'Handoff Recipient Cannot Be Resolved',
    scenario: 'resolveRecipient(request) cannot resolve valid BIC owner because projectLeadId is null or user no longer exists in directory',
    expectedDegradation: 'usePrepareHandoff returns preflight.blockingReason with guidance; handoff blocked; no recipient ambiguity',
    affectedPackages: ['@hbc/workflow-handoff', '@hbc/bic-next-move'],
  },
] as const;

/** Look up a failure mode by ID. */
export function getFailureMode(fmId: string): IFailureMode | undefined {
  return PROJECT_SETUP_FAILURE_MODES.find((fm) => fm.fmId === fmId);
}
