/**
 * W0-G3-T07: Integration rule registry for project setup shared primitives.
 *
 * 7 rules governing interactions between the six shared packages
 * (@hbc/step-wizard, @hbc/session-state, @hbc/bic-next-move,
 * @hbc/notification-intelligence, @hbc/workflow-handoff, @hbc/complexity).
 *
 * These are behavioral constraints on consuming surfaces — not runtime enforcement.
 * T08 integration tests reference these rule IDs as stable identifiers.
 *
 * Traceability: docs/architecture/plans/MVP/G3/W0-G3-T07-Shared-Primitive-Integration-Rules-Failure-Modes-and-Validation.md Part 1
 */

export interface IIntegrationRule {
  readonly ruleId: string;
  readonly title: string;
  readonly packageA: string;
  readonly packageB: string;
  readonly rule: string;
  readonly antiPattern: string;
  readonly correctPattern: string;
}

export const PROJECT_SETUP_INTEGRATION_RULES: readonly IIntegrationRule[] = [
  {
    ruleId: 'IR-01',
    title: 'Draft Cleared Only on API Success',
    packageA: '@hbc/step-wizard',
    packageB: '@hbc/session-state',
    rule: 'The wizard must NOT clear the draft inside onAllComplete. The consuming surface must call clearDraft(draftKey) after API submission succeeds.',
    antiPattern: 'Calling clearDraft() inside onAllComplete callback',
    correctPattern: 'Call clearDraft() in the API success handler after submission completes',
  },
  {
    ruleId: 'IR-02',
    title: 'BIC Transfer and Notification Are Separate Concerns',
    packageA: '@hbc/bic-next-move',
    packageB: '@hbc/notification-intelligence',
    rule: 'useBicNextMove resolves the current owner from request state — it does not fire notifications. Notifications are fired by the backend state transition handlers (T04). The frontend BIC badge always reflects the current server state.',
    antiPattern: 'Wiring frontend BIC transfer events to directly call NotificationApi.send()',
    correctPattern: 'Let backend fire all ownership-change notifications; frontend only reads current owner via useBicNextMove',
  },
  {
    ruleId: 'IR-03',
    title: 'No Per-Step BIC Transfer in Setup Wizard',
    packageA: '@hbc/step-wizard',
    packageB: '@hbc/bic-next-move',
    rule: 'The setup intake form (Steps 1–5) is owned entirely by the requester. BIC transfer at the workflow level (requester → controller) happens at form submission — not at step completion. The resolveAssignee prop should be omitted.',
    antiPattern: 'Wiring step completion to BIC transfers in the setup wizard',
    correctPattern: 'Omit resolveAssignee in project setup wizard config; use deriveCurrentOwner() at the lifecycle level',
  },
  {
    ruleId: 'IR-04',
    title: 'Handoff Governs BIC at Completion Stage',
    packageA: '@hbc/workflow-handoff',
    packageB: '@hbc/bic-next-move',
    rule: 'The BIC config must handle workflowStage === "Completed" with an active outbound handoff. resolveCurrentOwner() must return the handoff recipient. On rejection, onRejected returns to coordinator review and BIC shows the controller. workflowStage governs when it disagrees with handoff status.',
    antiPattern: 'Resolving BIC ownership from handoff status field alone without checking workflowStage first',
    correctPattern: 'Check workflowStage first (primary signal), active handoff as secondary signal; workflowStage governs on disagreement',
  },
  {
    ruleId: 'IR-05',
    title: 'Handoff Package Owns Its Own Notifications',
    packageA: '@hbc/notification-intelligence',
    packageB: '@hbc/workflow-handoff',
    rule: 'The handoff package must register provisioning.handoff-received and provisioning.handoff-acknowledged event types via NotificationRegistry.register() at initialization. These registrations must be present before any handoff is sent.',
    antiPattern: 'Sending handoff notifications from the consuming surface independently of the workflow-handoff package',
    correctPattern: 'Let workflow-handoff package send its own notifications; surface only calls handoff API methods',
  },
  {
    ruleId: 'IR-06',
    title: 'ComplexityProvider Mounted at App Root',
    packageA: '@hbc/complexity',
    packageB: 'all-packages',
    rule: 'ComplexityProvider must be mounted at app root (or webpart root for SPFx), not inside individual components or routes. At Essential tier, HbcNotificationCenter shows only immediate-tier notifications. Complexity gates individual fields/sections, not entire views.',
    antiPattern: 'Gating complexity at the page or route level (e.g., if tier === "expert" return <AdminView />)',
    correctPattern: 'Use HbcComplexityGate at the individual field or section level; switching tiers progressively reveals more within the same view',
  },
  {
    ruleId: 'IR-07',
    title: 'Offline Notification Actions Queued via Session-State',
    packageA: '@hbc/session-state',
    packageB: '@hbc/notification-intelligence',
    rule: 'When the user dismisses or reads notifications while offline, those actions must be queued in the session-state operation queue and replayed on reconnect. The notification package calls queueOperation() when useConnectivity() returns offline or degraded.',
    antiPattern: 'Silently discarding notification read/dismiss events when offline',
    correctPattern: 'Call queueOperation({ type: "notification-action", ... }) when connectivity is offline or degraded',
  },
] as const;

/** Look up an integration rule by ID. */
export function getIntegrationRule(ruleId: string): IIntegrationRule | undefined {
  return PROJECT_SETUP_INTEGRATION_RULES.find((r) => r.ruleId === ruleId);
}
