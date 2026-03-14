# W0-G3-T04 — Notification Intelligence and My Work Alignment

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 3 task plan defining how `@hbc/notification-intelligence` is wired to every project setup lifecycle event, the complete `INotificationRegistration` specification for all events, the explicit categorization of action-required vs. awareness notifications, and the My Work alignment contract that defines future hook points without building My Work UI.

**Phase Reference:** Wave 0 Group 3 — Shared-Platform Wiring and Workflow Experience Plan
**Depends On:** T02 (canonical action strings — used in notification bodies), T03 (clarification notification trigger), G1-T03 (notification delivery model and event matrix baseline)
**Unlocks:** T07 (notification failure modes), T08 (notification tests), G4/G5 notification wiring
**Repo Paths Governed:** `packages/notification-intelligence/src/`, `packages/provisioning/src/notification-templates.ts`, `packages/provisioning/src/state-machine.ts`, `backend/functions/src/functions/notifications/`

---

## Objective

This task produces two deliverables:

1. The complete `INotificationRegistration` specification for every project setup lifecycle notification — one row per event type, with tier, channels, `tierOverridable`, body template, and action URL.

2. The My Work alignment contract — a stable interface-level definition of what `@hbc/my-work-feed` will consume from the project setup lifecycle when that feature ships. This contract includes the minimum interim hook points that must be wired now (specifically, `registerBicModule()` from T02) and the full item model shape that My Work will aggregate.

---

## Why This Task Exists

G1-T03 defined the notification delivery model and the event-to-notification matrix baseline for 8 provisioning lifecycle events. G3-T04 extends that foundation with the full G3 integration contracts:

- G1-T03 specified **what** notifications are sent (event types, tiers, channels)
- G3-T04 specifies **how** those notifications are registered via `NotificationRegistry.register()`, what the exact payload shapes are, and critically — how action-required and awareness notifications are explicitly separated

The G3-D8 locked decision requires explicit separation of awareness/informational notifications from action-required notifications. This is not just a tier assignment — it governs whether `tierOverridable` is `true` (awareness events can be downgraded by users) or `false` (action-required events cannot).

The My Work alignment contract must exist now because:
1. The `registerBicModule()` call (T02) is the minimum interim hook point — it must be wired at G4/G5 implementation time
2. The item model shape that My Work will consume must be stable before G4/G5 ships — if the shape is not defined now, My Work integration will require G4/G5 rework
3. Without the alignment contract, G4/G5 teams might build bespoke "my items" surfaces that conflict with My Work's future aggregation model

---

## Scope

T04 specifies:
- The full `INotificationRegistration` table for all project setup lifecycle events
- Exact notification body templates (title and body string patterns)
- Action URLs (deep links to the relevant surface)
- Tier assignment (immediate / watch / digest) with rationale for each
- `tierOverridable` flag for each event (action-required = false; awareness = true)
- Channel assignments (push / email / in-app / digest-email)
- The My Work alignment contract (interface-level item model, source enumeration, hook points)
- Minimum interim hook points that must be implemented in G4/G5

T04 does not specify:
- Email delivery implementation (backend Azure Function pipeline — G1-T03 governs this)
- My Work UI or aggregation surface (SF-29 future scope)
- Notification preference UI (G4/G5 surface scope)
- Teams notification integration (G1-D3 deferred to post-Wave-0)

---

## Governing Constraints

- Per G1-D3, `@hbc/notification-intelligence` is the **mandatory** notification platform seam. All project setup lifecycle notifications must flow through `NotificationRegistry.register()` and `NotificationApi.send()`. No bespoke email dispatch or out-of-band notification logic is permitted.
- Per G3-D8, action-required and awareness notifications must be explicitly separated with `tierOverridable: false` on action-required events.
- Per G3-D7, no My Work UI may be built in G3 or G4/G5 as a stopgap. The `registerBicModule()` call is the entire interim hook.
- The `provisioning.clarification-requested` event is a confirmed state machine transition (`NeedsClarification`) with an existing entry in `STATE_NOTIFICATION_TARGETS` in `packages/provisioning/src/state-machine.ts`. G4/G5 must confirm this entry is present before wiring the notification.

---

## Part 1 — Notification Registration Specifications

### Event Classification

All project setup lifecycle notification events fall into one of two G3-D8 categories:

**Action-Required** (immediate tier, `tierOverridable: false`): The recipient must take a specific action to advance the workflow. Failure to act will stall the process. These must not be downgradable by the user.

**Awareness/Informational** (watch or digest tier, `tierOverridable: true`): The recipient should be informed but no specific action is required immediately. These can be downgraded to digest by users who prefer consolidated summaries.

---

### Complete Notification Registration Table

All event types below must be registered via `NotificationRegistry.register([...])` at application/webpart initialization. The provisioning package or a G3 init module should perform this registration.

```typescript
import { NotificationRegistry } from '@hbc/notification-intelligence';

NotificationRegistry.register([

  // ─── ACTION-REQUIRED EVENTS (immediate tier, tierOverridable: false) ───

  {
    eventType: 'provisioning.clarification-requested',
    defaultTier: 'immediate',
    description: 'A controller has requested clarification on your project setup request',
    tierOverridable: false, // Requester must respond to advance the workflow
    channels: ['push', 'email', 'in-app'],
  },

  {
    eventType: 'provisioning.failed',
    defaultTier: 'immediate',
    description: 'Project site provisioning has failed and requires attention',
    tierOverridable: false, // Admin or requester must act
    channels: ['push', 'email', 'in-app'],
  },

  {
    eventType: 'provisioning.failed-escalated',
    defaultTier: 'immediate',
    description: 'Project site provisioning has failed a second time and is escalated to admin',
    tierOverridable: false, // Admin must investigate
    channels: ['push', 'email', 'in-app'],
  },

  {
    eventType: 'provisioning.request-submitted',
    defaultTier: 'immediate',
    description: 'A new project setup request has been submitted for your review',
    tierOverridable: false, // Controller must review to advance the workflow
    channels: ['push', 'email', 'in-app'],
  },

  {
    eventType: 'provisioning.clarification-responded',
    defaultTier: 'immediate',
    description: 'A requester has responded to your clarification request',
    tierOverridable: false, // Controller must review the response
    channels: ['push', 'email', 'in-app'],
  },

  {
    eventType: 'provisioning.handoff-received',
    defaultTier: 'immediate',
    description: 'A project setup handoff package is awaiting your acknowledgment',
    tierOverridable: false, // Recipient must acknowledge to create Project Hub record
    channels: ['push', 'email', 'in-app'],
  },

  // ─── AWARENESS / INFORMATIONAL EVENTS (watch or digest tier, tierOverridable: true) ───

  {
    eventType: 'provisioning.completed',
    defaultTier: 'watch',
    description: 'A project site has been successfully provisioned',
    tierOverridable: true, // Requester/controller informed; no time-critical action required
    channels: ['in-app', 'email'],
  },

  {
    eventType: 'provisioning.step-completed',
    defaultTier: 'watch',
    description: 'A provisioning step has completed',
    tierOverridable: true,
    channels: ['in-app'],
  },

  {
    eventType: 'provisioning.request-approved',
    defaultTier: 'watch',
    description: 'Your project setup request has been approved and provisioning is starting',
    tierOverridable: true,
    channels: ['in-app', 'email'],
  },

  {
    eventType: 'provisioning.handoff-acknowledged',
    defaultTier: 'watch',
    description: 'Your project setup handoff has been acknowledged',
    tierOverridable: true,
    channels: ['in-app', 'email'],
  },

  {
    eventType: 'provisioning.handoff-rejected',
    defaultTier: 'immediate', // Rejection requires sender action — reclassified as action-required
    description: 'Your project setup handoff was rejected and requires revision',
    tierOverridable: false,
    channels: ['push', 'email', 'in-app'],
  },

  {
    eventType: 'provisioning.site-access-ready',
    defaultTier: 'watch',
    description: 'Your project SharePoint site is ready to access',
    tierOverridable: true,
    channels: ['in-app', 'email'],
  },

]);
```

---

### Notification Payload Templates

For each action-required event, the consuming surface fires notifications using `NotificationApi.send()` with the following payload templates. These templates use the canonical action strings from T02 as the basis for notification body text.

```typescript
// provisioning.clarification-requested
{
  eventType: 'provisioning.clarification-requested',
  sourceModule: 'estimating',
  sourceRecordType: 'project-setup-request',
  sourceRecordId: request.id,
  recipientUserId: request.requesterId,
  title: `Action Required: Clarification needed on "${request.projectName}"`,
  body: `${controllerDisplayName} has requested clarification on your project setup request. Respond to clarification requests to continue setup.`,
  actionUrl: `/project-setup/${request.id}/respond`,
  actionLabel: 'Respond to Clarification',
}

// provisioning.request-submitted
{
  eventType: 'provisioning.request-submitted',
  sourceModule: 'estimating',
  sourceRecordType: 'project-setup-request',
  sourceRecordId: request.id,
  recipientUserId: controllerId,
  title: `New Project Setup Request: "${request.projectName}"`,
  body: `${requesterDisplayName} has submitted a new project setup request for your review.`,
  actionUrl: `/accounting/project-setup/${request.id}/review`,
  actionLabel: 'Review Request',
}

// provisioning.failed
{
  eventType: 'provisioning.failed',
  sourceModule: 'estimating',
  sourceRecordType: 'project-setup-request',
  sourceRecordId: request.id,
  recipientUserId: /* admin or requester depending on retry policy */,
  title: `Site Provisioning Failed: "${request.projectName}"`,
  body: /* see failed-state canonical action string from T02 */,
  actionUrl: `/admin/provisioning-failures/${request.id}`,
  actionLabel: 'View Failure Details',
}

// provisioning.completed
{
  eventType: 'provisioning.completed',
  sourceModule: 'estimating',
  sourceRecordType: 'project-setup-request',
  sourceRecordId: request.id,
  recipientUserId: request.requesterId,
  title: `Project Site Ready: "${request.projectName}"`,
  body: `Your project site has been provisioned. Review your provisioned project site and complete the getting-started steps.`,
  actionUrl: request.siteLaunch.siteUrl,
  actionLabel: 'Open Project Site',
}
```

**Canonical action string reuse:** The `body` field in each notification payload must use the canonical action string from T02's `resolveExpectedAction()` output for the relevant lifecycle state. This is the mechanism that ensures G3-D3 (one consistent action model across surfaces) is satisfied. Surfaces must not write independent notification body text.

---

### Who Fires Each Notification

Notifications are fired from the backend Azure Function pipeline (not from the frontend). The frontend surfaces must not call `NotificationApi.send()` directly for lifecycle event notifications. The backend fires them as a side effect of state transitions.

Exception: The handoff notification (`provisioning.handoff-received`) is fired by the `@hbc/workflow-handoff` package's `HandoffApi.send()` call — this is appropriate because the handoff package owns the handoff lifecycle.

| Event | Fired by |
|-------|----------|
| `provisioning.request-submitted` | Backend: `advanceState()` transition handler |
| `provisioning.clarification-requested` | Backend: `advanceState('NeedsClarification')` handler |
| `provisioning.clarification-responded` | Backend: `submitClarificationResponse()` handler |
| `provisioning.request-approved` | Backend: `advanceState('ReadyToProvision')` handler |
| `provisioning.step-completed` | Backend: saga step completion handler (per step) |
| `provisioning.completed` | Backend: saga `Completed` transition |
| `provisioning.failed` | Backend: saga failure handler |
| `provisioning.failed-escalated` | Backend: second-failure escalation handler |
| `provisioning.site-access-ready` | Backend: saga step 6 (permissions) completion |
| `provisioning.handoff-received` | `@hbc/workflow-handoff` `HandoffApi.send()` |
| `provisioning.handoff-acknowledged` | `@hbc/workflow-handoff` `HandoffApi.acknowledge()` |
| `provisioning.handoff-rejected` | `@hbc/workflow-handoff` `HandoffApi.reject()` |

---

## Part 2 — My Work Alignment Contract

### Why This Contract Exists

`@hbc/my-work-feed` (SF-29) is a future feature that will aggregate all items where the user is the current BIC owner across all modules. When it ships, it will call each registered module's `queryFn` to populate the feed.

The G3-D7 locked decision specifies: define the full future-ready contract now, wire only the minimum justified interim hook points now. The minimum justified interim hook point is `registerBicModule()` (specified in T02). This alignment contract defines what My Work will consume so the contract is stable when My Work ships.

### My Work Item Model for Project Setup

Each project setup request that the My Work feed will surface must map to the `IMyWorkItem` shape (from SF-29 spec). The G3 contract defines this mapping:

```typescript
import {
  MyWorkItemClass,
  MyWorkPriority,
  MyWorkState,
  MyWorkSource,
  IMyWorkContext,
} from '@hbc/my-work-feed'; // future package — contract defined here, not yet imported

// Mapping from IProjectSetupRequest to IMyWorkItem (future shape)
function mapSetupRequestToMyWorkItem(
  request: IProjectSetupRequest,
  bicState: IBicNextMoveState,
): IMyWorkItem {
  return {
    itemId: `provisioning:${request.id}`,
    itemClass: resolveItemClass(request, bicState),
    priority: resolvePriority(bicState),
    state: resolveWorkState(request, bicState),
    source: 'bic-next-move' as MyWorkSource,
    title: request.projectName,
    subtitle: `Project Setup · ${request.department ?? 'Unknown Department'}`,
    context: {
      moduleKey: 'estimating',
      projectCode: request.projectNumber ?? undefined,
      projectName: request.projectName,
      recordId: request.id,
      recordType: 'project-setup-request',
      href: `/project-setup/${request.id}`,
    } as IMyWorkContext,
    currentOwnerUserId: bicState.currentOwner?.userId ?? null,
    expectedAction: bicState.expectedAction, // canonical action string from T02
    dueDate: bicState.dueDate,
    isOverdue: bicState.isOverdue,
    isBlocked: bicState.isBlocked,
    blockedReason: bicState.blockedReason,
    urgencyTier: bicState.urgencyTier,
    // Explainability fields (why is this here?)
    sourceReason: `You ${resolveOwnershipReason(request)} this project setup request`,
    rankingRationale: resolveRankingRationale(bicState),
  };
}

function resolveItemClass(
  request: IProjectSetupRequest,
  bicState: IBicNextMoveState,
): MyWorkItemClass {
  if (request.workflowStage === 'NeedsClarification') return 'owned-action';
  if (request.workflowStage === 'Submitted' || request.workflowStage === 'UnderReview') return 'owned-action';
  if (request.workflowStage === 'Failed') return 'owned-action';
  if (request.workflowStage === 'Completed') return 'queued-follow-up'; // getting-started tasks
  return 'owned-action';
}

function resolvePriority(bicState: IBicNextMoveState): MyWorkPriority {
  if (bicState.urgencyTier === 'immediate') return 'now';
  if (bicState.urgencyTier === 'watch') return 'soon';
  return 'watch';
}
```

**Note for G4/G5 implementation:** This mapping function should be defined in the provisioning package or a G3 init module and kept stable. When My Work ships, it will call the module's `queryFn` which uses this mapping. The mapping must not be defined independently in each surface.

### Minimum Interim Hook Points (Wave 0 Required)

The following hook points **must** be wired in G4/G5 implementation to enable My Work integration without rework:

**Hook 1 — BIC Module Registration (required):**
`registerBicModule()` from T02 must be called at app/webpart initialization. This is the only required interim hook. When My Work ships, it will call this module's `queryFn` automatically.

**Hook 2 — Notification Event Types Registered (required):**
All event types in the registration table above must be registered via `NotificationRegistry.register()`. My Work will surface `immediate`-tier notification events as high-priority action items. If event types are not registered, My Work cannot surface them correctly.

**Hook 3 — Canonical Action Strings Stable (required):**
The `resolveExpectedAction()` function in the BIC config (T02) must produce the canonical action strings. These strings are the `expectedAction` in the My Work item model. If they change after G4/G5 ships, My Work will surface inconsistent action text.

### What Must NOT Be Built as My Work Stopgaps

The following are prohibited:

- A "My Requests" tab or page in the Estimating app that shows all requests the user submitted
- A "My Reviews" inbox in the Accounting app that shows all requests awaiting controller review
- A "My Active Items" list in the Admin app that aggregates active provisioning failures

These are all My Work's job. Building them now creates surfaces that will conflict with My Work when it ships and must then be removed (technical debt + UX confusion). The correct interim behavior is:
- The workflow screen shows the current request state and BIC ownership (T02)
- The notification center shows action-required items (T04 notification registrations)
- That is sufficient for Wave 0

---

## Required Outputs

| Artifact | Location | Description |
|----------|----------|-------------|
| Notification registration table | `docs/reference/workflow-experience/setup-notification-registrations.md` | Full registration spec table with tier, tierOverridable, channels, payload templates, who-fires-each |
| My Work alignment contract | `docs/reference/workflow-experience/my-work-alignment-contract.md` | Item model mapping, source enumeration, minimum interim hook points |

Both reference documents must be added to `current-state-map.md §2`.

---

## Acceptance Criteria

- [ ] `INotificationRegistration` spec is complete for all 12 project setup lifecycle event types
- [ ] Each event has explicit tier assignment with written rationale
- [ ] `tierOverridable: false` is applied to all action-required events; `true` to all awareness events
- [ ] Notification body templates use canonical action strings from T02 (G3-D3 verified)
- [ ] Who-fires-each table is complete (backend vs. workflow-handoff package)
- [ ] My Work item model mapping is defined (`mapSetupRequestToMyWorkItem` shape)
- [ ] Three minimum interim hook points are explicitly enumerated
- [ ] Four prohibited My Work stopgap patterns are explicitly stated
- [ ] Reference documents exist and are added to `current-state-map.md §2`

---

*End of W0-G3-T04 — Notification Intelligence and My Work Alignment v1.0*
