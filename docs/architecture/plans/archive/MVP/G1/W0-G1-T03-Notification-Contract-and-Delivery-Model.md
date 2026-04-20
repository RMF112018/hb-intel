# W0-G1-T03 — Notification Contract and Delivery Model

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 1 task plan for notification contracts. Governs what notifications are sent at each provisioning lifecycle event, who receives them, and how delivery routes through the existing backend pipeline. Must be locked before G3 notification wiring proceeds.

**Phase Reference:** Wave 0 Group 1 — Contracts and Configuration Plan
**Locked Decisions Applied:** Decision 3 — email first, Teams later; mandatory `@hbc/notification-intelligence` integration
**Estimated Decision Effort:** 1 working session with product owner (message clarity review)
**Depends On:** T02 (in flight — needs group/recipient model); T04 (needs channel configuration classification)
**Unlocks:** G3.2 (shared platform wiring — notification-intelligence to provisioning state transitions), T07 of MVP Project Setup plan set
**ADR Output:** Contributes to ADR-0114 (notification delivery channel section)

---

## Objective

Lock the Wave 0 notification contract: the complete specification of which notifications are sent at each provisioning lifecycle event, who receives each notification, what tier each event maps to in `@hbc/notification-intelligence`'s three-tier model, how delivery routes through the existing backend pipeline, and what Teams deferral means in practice.

The output of this task is a reference document (`docs/reference/provisioning/notification-event-matrix.md`) that G3 and T07 implementors use to wire `@hbc/notification-intelligence` registrations and backend notification pipeline calls without inventing event names, recipient rules, or tier assignments.

---

## Why This Task Exists

The HB Intel notification system has two layers that must be aligned:

**Layer 1 — `@hbc/notification-intelligence` (frontend platform primitive):**
The package at `packages/notification-intelligence/src/` defines a three-tier notification model (`immediate` / `watch` / `digest`) with a registry pattern (`INotificationRegistration`). Packages register their event types at initialization time. The notification center (`INotificationEvent`) surfaces registered events to users in the app UI. This layer governs in-app visibility and user preference management.

**Layer 2 — Backend notification pipeline (`backend/functions/src/functions/notifications/`):**
The backend pipeline in `SendNotification.ts`, `ProcessNotification.ts`, `channelRouter.ts`, `tierResolver.ts`, `emailDelivery.ts`, `pushDelivery.ts`, `notificationStore.ts`, and `preferencesStore.ts` handles the actual delivery mechanics — routing by tier and channel, email sending (SendGrid), push delivery, and notification persistence.

**Current gap:** The provisioning lifecycle has five notification templates in `packages/provisioning/src/notification-templates.ts` (`NeedsClarification`, `ReadyToProvision`, `ProvisioningStarted`, `ProvisioningCompleted`, `ProvisioningFailed`). However:
- These templates have no formal `INotificationRegistration` mappings
- Three additional events required by the MVP Project Setup T07 plan (`clarification-requested`, `second-failure-escalated`, `recovery-resolved`) have no templates
- No integration exists between the provisioning state machine transitions and the backend `SendNotification` endpoint
- The tier classification for each event is undefined
- Recipient resolution (converting `STATE_NOTIFICATION_TARGETS` groups to actual UPNs) is not specified

T03 fills all of these gaps at the specification level. It does not implement code.

---

## Scope

T03 covers:

1. The complete event-to-notification matrix for all provisioning lifecycle events
2. Tier classification for each event (`immediate` / `watch` / `digest`)
3. Delivery channel assignments per tier
4. Recipient specification rules: how `STATE_NOTIFICATION_TARGETS` groups map to concrete recipients
5. `INotificationRegistration` specifications for each event type (ready for G3 to implement)
6. Integration path: how provisioning state transitions invoke `SendNotification`
7. Message clarity requirements for all notification templates
8. Teams deferral: what "email first, Teams later" means and what is explicitly out of scope

T03 does not cover:

- Implementing `INotificationRegistration` entries (G3 task)
- Integrating `SendNotification` calls into the saga or state machine (G3 task)
- SendGrid account setup or email domain configuration (T04 / environment concern)
- Building a notification center UI (that is `@hbc/notification-intelligence` consuming apps)
- Push notification service worker setup (Wave 1+; push is PWA-only and not in Wave 0 scope)
- Teams adaptive card implementation (explicitly deferred; see §Teams Deferral)

---

## Governing Constraints

- **Locked Decision 3 (email first):** Wave 0 primary delivery channel is email. The `email` channel in `@hbc/notification-intelligence` (mapped to `emailDelivery.ts` via `channelRouter.ts`) is the required delivery mechanism for all `immediate`-tier provisioning events. In-app notification center is always populated regardless of tier.
- **Mandatory `@hbc/notification-intelligence` integration:** Provisioning notifications must NOT bypass `@hbc/notification-intelligence`. All event types must be registered via `INotificationRegistration`. The backend pipeline must be invoked via the `SendNotification` Azure Function endpoint — not by calling email delivery directly.
- **Non-blocking delivery (D-PH6-06 pattern):** Notification dispatch from the provisioning saga must be non-blocking. A notification failure must not fail the provisioning step. The provisioning pipeline logs notification failures as non-critical warnings.
- **CLAUDE.md §1.2 Zero-Deviation Rule:** The event type names in the notification registry become a shared contract between the provisioning package, the backend pipeline, and the notification center. Once locked, they cannot change without versioning.
- **Existing backend pipeline — no duplication:** T07 from the MVP Project Setup plan set explicitly requires all notifications to route through the existing `SendNotification` → `ProcessNotification` → `channelRouter` pipeline. T03 confirms this integration path.

---

## Existing Infrastructure Baseline

Before specifying the contract, this is what currently exists — verified from live code.

### `packages/provisioning/src/notification-templates.ts` (5 templates)
| Template Key | Subject/Body Summary | State Trigger |
|-------------|---------------------|--------------|
| `NeedsClarification` | "Action Required: Clarification needed for..." | `NeedsClarification` state |
| `ReadyToProvision` | "Project Setup Ready: ... is ready for provisioning" | `ReadyToProvision` state |
| `ProvisioningStarted` | "SharePoint Project Site... is being created!" | `Provisioning` state |
| `ProvisioningCompleted` | "...SharePoint Site is up and running!" | `Completed` state |
| `ProvisioningFailed` | "Provisioning Failed: ..." | `Failed` state |

### `packages/provisioning/src/state-machine.ts` (notification targets)
```typescript
export const STATE_NOTIFICATION_TARGETS: Partial<
  Record<ProjectSetupRequestState, ('submitter' | 'controller' | 'group')[]>
> = {
  NeedsClarification: ['submitter'],
  ReadyToProvision: ['controller'],
  Provisioning: ['group'],
  Completed: ['group'],
  Failed: ['controller', 'submitter'],
};
```

> **State machine alignment note:** T03 adds three new notification events (`provisioning.request-submitted`, `provisioning.second-failure-escalated`, `provisioning.recovery-resolved`) that have no current entry in `STATE_NOTIFICATION_TARGETS`. T03 also distinguishes `provisioning.first-failure` vs. `provisioning.second-failure-escalated` from the existing single `Failed` entry. These additions extend — but do not contradict — the existing targets map. G3 must add these dispatch calls to the appropriate lifecycle handlers. The existing 5 targets in `STATE_NOTIFICATION_TARGETS` map directly and correctly to T03's event matrix: `NeedsClarification → provisioning.clarification-requested`, `ReadyToProvision → provisioning.ready-to-provision`, `Provisioning → provisioning.started`, `Completed → provisioning.completed`, `Failed → provisioning.first-failure` or `provisioning.second-failure-escalated` based on `retryCount`.

### `@hbc/notification-intelligence` types
The tier model (`immediate` / `watch` / `digest`) and `INotificationRegistration` interface are defined in `packages/notification-intelligence/src/types/INotification.ts`. Channels include `push`, `email`, `in-app`, `digest-email`.

### Backend notification pipeline
`backend/functions/src/functions/notifications/` contains the complete pipeline (`SendNotification`, `ProcessNotification`, `channelRouter`, `tierResolver`, `emailDelivery`, `pushDelivery`, `notificationStore`, `preferencesStore`). This pipeline is mature and must be the integration target.

---

## Recipient Resolution Model

`STATE_NOTIFICATION_TARGETS` uses abstract recipient groups (`submitter`, `controller`, `group`). These must resolve to actual UPNs at dispatch time.

### Resolution Table

| Recipient Group | Resolves To | Source |
|----------------|-------------|--------|
| `submitter` | The UPN of the person who submitted the project setup request | `IProjectSetupRequest.submittedBy` |
| `controller` | The UPN(s) of Controller-role users | Environment configuration — `CONTROLLER_UPNS` (comma-separated list of users with controller responsibility) |
| `group` | All members of the Project Team and Leaders groups | `IProvisioningStatus.groupMembers` + `IProvisionSiteRequest.groupLeaders` (after T02 field additions) |
| `admin` | HBIntelAdmin-role users | Environment configuration — `ADMIN_UPNS` |

### Resolution Governance Rules

- `controller` and `admin` UPN lists are environment configuration, not hardcoded. The controller can change between tenants and over time. See T04 for config classification.
- `group` recipients are derived from the provisioning request data at dispatch time — not from a live Entra ID group membership lookup (that would add latency and a Graph API dependency to every notification dispatch).
- If `submitter` is also a `controller`, they receive one notification, not two.

---

## Complete Notification Event Matrix

The following matrix defines every notification event in the Wave 0 provisioning lifecycle. This is the authoritative specification for G3 and T07 implementation.

### Event: `provisioning.request-submitted`
| Property | Value |
|----------|-------|
| **Trigger** | `IProjectSetupRequest` is created and state transitions to `Submitted` |
| **Tier** | `immediate` |
| **Channels** | `email`, `in-app` |
| **Tier overridable** | `false` — controller must see every new request |
| **Recipients** | `controller` |
| **Subject** | `New Project Setup Request: "{projectName}" needs your review` |
| **Body** | `{submittedBy} has submitted a project setup request for "{projectName}" ({projectNumber}). Please review in the Controller dashboard.` |
| **Action URL** | `/accounting` (controller gate page in Accounting SPFx app) |
| **Action Label** | `Review Request` |
| **Template key** | `provisioning.request-submitted` |

### Event: `provisioning.clarification-requested`
| Property | Value |
|----------|-------|
| **Trigger** | State machine transitions to `NeedsClarification` (a real lifecycle state in `STATE_TRANSITIONS`; `NeedsClarification` is already in `STATE_NOTIFICATION_TARGETS: { NeedsClarification: ['submitter'] }`) |
| **Tier** | `immediate` |
| **Channels** | `email`, `in-app` |
| **Tier overridable** | `false` — requester must know action is needed |
| **Recipients** | `submitter` |
| **Subject** | `Action Required: Clarification needed for "{projectName}" Project Setup Request` |
| **Body** | `The Controller has reviewed your Project Setup Request for "{projectName}" and requires additional information before proceeding.\n\nNote: {clarificationNote}\n\nPlease update your request in the Estimating app.` |
| **Action URL** | `/project-setup/{requestId}` (in Estimating SPFx app) |
| **Action Label** | `Update Request` |
| **Template key** | `provisioning.clarification-requested` |
| **State machine alignment** | `NeedsClarification` is a validated real state in `packages/provisioning/src/state-machine.ts`. The notification is dispatched **on the state transition** (when a Controller action triggers `UnderReview → NeedsClarification`), not as a side-effect of an admin action outside the lifecycle. Maps to existing `NeedsClarification` notification template in `notification-templates.ts` — may reuse with minor field alignment (add `requestId` for deep-link URL). |

### Event: `provisioning.ready-to-provision`
| Property | Value |
|----------|-------|
| **Trigger** | State transitions to `ReadyToProvision` |
| **Tier** | `immediate` |
| **Channels** | `email`, `in-app` |
| **Tier overridable** | `false` — controller must take action |
| **Recipients** | `controller` |
| **Subject** | `Ready to Provision: "{projectName}" awaits external setup confirmation` |
| **Body** | `The Project Setup Request for "{projectName}" is ready. Please complete any required external setup (IT, licenses, etc.) and trigger provisioning in the Accounting app.` |
| **Action URL** | `/accounting` |
| **Action Label** | `Complete Setup` |
| **Template key** | `provisioning.ready-to-provision` |
| **Note** | Maps to existing `ReadyToProvision` template |

### Event: `provisioning.started`
| Property | Value |
|----------|-------|
| **Trigger** | Provisioning saga begins (overall status transitions to `InProgress`) |
| **Tier** | `watch` |
| **Channels** | `in-app` (email optional; configurable by user preference) |
| **Tier overridable** | `true` — users may promote to immediate if they want email at start |
| **Recipients** | `group` (all project team members) |
| **Subject** | `Provisioning Started: "{projectNumber} — {projectName}" is being set up` |
| **Body** | `The SharePoint project site for {projectNumber} — {projectName} is being created. You'll receive another notification when it's ready.` |
| **Action URL** | `/project-setup/{requestId}` |
| **Action Label** | `View Progress` |
| **Template key** | `provisioning.started` |

### Event: `provisioning.first-failure`
| Property | Value |
|----------|-------|
| **Trigger** | Provisioning saga reaches `Failed` state for the first time (`retryCount = 0`) |
| **Tier** | `immediate` |
| **Channels** | `email`, `in-app` |
| **Tier overridable** | `false` — failure requires immediate attention |
| **Recipients** | `submitter`, `controller` |
| **Subject** | `Provisioning Failed: "{projectNumber} — {projectName}" — retry available` |
| **Body** | `Provisioning of the SharePoint site for {projectNumber} — {projectName} has failed. A retry attempt is available. Please check the admin dashboard or contact your Controller.` |
| **Action URL** | `/provisioning-failures` (Admin SPFx app) |
| **Action Label** | `View Failure Details` |
| **Template key** | `provisioning.first-failure` |

### Event: `provisioning.second-failure-escalated`
| Property | Value |
|----------|-------|
| **Trigger** | Provisioning saga reaches `Failed` state after at least one retry (`retryCount >= 1`) |
| **Tier** | `immediate` |
| **Channels** | `email`, `in-app` |
| **Tier overridable** | `false` — escalation requires admin action |
| **Recipients** | `admin`, `controller`, `submitter` |
| **Subject** | `Escalated: "{projectNumber} — {projectName}" provisioning requires admin intervention` |
| **Body** | `Provisioning of {projectNumber} — {projectName} has failed a second time and has been escalated. An HB Intel administrator will investigate. You will be notified once the issue is resolved.` |
| **Action URL** | `/provisioning-failures` |
| **Action Label** | `View Escalated Issue` |
| **Template key** | `provisioning.second-failure-escalated` |

### Event: `provisioning.completed`
| Property | Value |
|----------|-------|
| **Trigger** | Provisioning saga reaches `Completed` state |
| **Tier** | `immediate` |
| **Channels** | `email`, `in-app` |
| **Tier overridable** | `true` — users may downgrade to watch if they prefer in-app only |
| **Recipients** | `group` (all project team members), `submitter` |
| **Subject** | `"{projectNumber} — {projectName}" SharePoint site is ready!` |
| **Body** | `The SharePoint project site for {projectNumber} — {projectName} has been successfully set up and is ready to use. Click below to go to your project site.` |
| **Action URL** | `{siteUrl}` (direct link to the provisioned SharePoint site) |
| **Action Label** | `Open Project Site` |
| **Template key** | `provisioning.completed` |
| **Note** | Maps to existing `ProvisioningCompleted` template — extend with `siteUrl` deep link |

### Event: `provisioning.recovery-resolved`
| Property | Value |
|----------|-------|
| **Trigger** | Admin marks a failed/escalated provisioning run as resolved in the failures inbox |
| **Tier** | `immediate` |
| **Channels** | `email`, `in-app` |
| **Tier overridable** | `false` — requester and controller must know the issue is resolved |
| **Recipients** | `submitter`, `controller` |
| **Subject** | `Resolved: "{projectNumber} — {projectName}" provisioning issue has been addressed` |
| **Body** | `An administrator has resolved the provisioning issue for {projectNumber} — {projectName}. {recoverySummary}` |
| **Action URL** | `/project-setup/{requestId}` |
| **Action Label** | `View Project Status` |
| **Template key** | `provisioning.recovery-resolved` |

---

## `INotificationRegistration` Specifications

The following registration objects must be added to the notification registry for the provisioning module. G3 implements these registrations via `NotificationRegistry.register([])` in `@hbc/notification-intelligence`.

```typescript
// packages/provisioning/src/notification-registrations.ts  (new file — G3 creates)
import type { INotificationRegistration } from '@hbc/notification-intelligence';

export const PROVISIONING_NOTIFICATION_REGISTRATIONS: INotificationRegistration[] = [
  {
    eventType: 'provisioning.request-submitted',
    defaultTier: 'immediate',
    description: 'A new project setup request has been submitted and needs controller review.',
    tierOverridable: false,
    channels: ['email', 'in-app'],
  },
  {
    eventType: 'provisioning.clarification-requested',
    defaultTier: 'immediate',
    description: 'The controller has requested clarification on your project setup request.',
    tierOverridable: false,
    channels: ['email', 'in-app'],
  },
  {
    eventType: 'provisioning.ready-to-provision',
    defaultTier: 'immediate',
    description: 'A project setup request is ready for provisioning and awaits your action.',
    tierOverridable: false,
    channels: ['email', 'in-app'],
  },
  {
    eventType: 'provisioning.started',
    defaultTier: 'watch',
    description: 'Provisioning of your project SharePoint site has started.',
    tierOverridable: true,
    channels: ['in-app'],
  },
  {
    eventType: 'provisioning.first-failure',
    defaultTier: 'immediate',
    description: 'Provisioning of your project site failed. A retry is available.',
    tierOverridable: false,
    channels: ['email', 'in-app'],
  },
  {
    eventType: 'provisioning.second-failure-escalated',
    defaultTier: 'immediate',
    description: 'Provisioning failed a second time and has been escalated to an administrator.',
    tierOverridable: false,
    channels: ['email', 'in-app'],
  },
  {
    eventType: 'provisioning.completed',
    defaultTier: 'immediate',
    description: 'Your project SharePoint site has been successfully created.',
    tierOverridable: true,
    channels: ['email', 'in-app'],
  },
  {
    eventType: 'provisioning.recovery-resolved',
    defaultTier: 'immediate',
    description: 'A provisioning issue for your project has been resolved by an administrator.',
    tierOverridable: false,
    channels: ['email', 'in-app'],
  },
];
```

---

## Backend Pipeline Integration Path

All notification dispatch must route through the existing backend pipeline. The integration pattern is:

```typescript
// In provisioning saga or state lifecycle handler — non-blocking pattern
await services.notifications.sendNotification({
  eventType: 'provisioning.completed',
  sourceModule: 'provisioning',
  sourceRecordType: 'provisioning-run',
  sourceRecordId: status.correlationId,
  recipientUserId: recipientUpn,  // one call per recipient
  title: `"${projectNumber} — ${projectName}" SharePoint site is ready!`,
  body: `The SharePoint project site... is ready to use.`,
  actionUrl: siteUrl,
  actionLabel: 'Open Project Site',
}).catch((err) => {
  // D-PH6-06: notification failures are non-blocking
  logger.warn('Non-critical: notification dispatch failed', { eventType, error: err.message });
});
```

**Integration rules:**
- One `sendNotification` call per recipient per event — do not batch multiple recipients into one call
- Dispatch happens after the relevant state transition succeeds — not before, not during
- For saga step completion events (`provisioning.started`, `provisioning.completed`, `provisioning.first-failure`), dispatch occurs from within the saga orchestrator after the relevant step or overall status update
- For request lifecycle events (`request-submitted`, `clarification-requested`, `ready-to-provision`), dispatch occurs from within the project requests service after the state transition is persisted
- The `tierResolver.ts` in the backend pipeline classifies events by their registered tier — callers do not set the tier

---

## Template Alignment

The five existing templates in `packages/provisioning/src/notification-templates.ts` must be aligned to the event matrix above. The following mapping governs this alignment:

| Existing Template | Corresponding Event | Gap/Action |
|------------------|--------------------|-----------|
| `NeedsClarification` | `provisioning.clarification-requested` | Minor: add `requestId` for deep-link URL |
| `ReadyToProvision` | `provisioning.ready-to-provision` | Minor: update body to match matrix spec |
| `ProvisioningStarted` | `provisioning.started` | Minor: add `requestId` for progress URL |
| `ProvisioningCompleted` | `provisioning.completed` | Add: `siteUrl` for direct site link in action URL |
| `ProvisioningFailed` | `provisioning.first-failure` | Differentiate: first-failure vs. second-failure-escalated |
| *(absent)* | `provisioning.request-submitted` | New template required |
| *(absent)* | `provisioning.second-failure-escalated` | New template required |
| *(absent)* | `provisioning.recovery-resolved` | New template required |

All template changes are implemented in G3 / T07 — T03 specifies what they should contain.

---

## Message Clarity Requirements

All provisioning notifications must follow these rules, consistent with MVP Project Setup plan R-08:

1. **No raw enum values or state names.** Notifications must not contain text like `"state: ReadyToProvision"` or `"step: 4"`. Business-readable language only.
2. **Every notification must name the project.** Use `{projectNumber} — {projectName}` format (e.g., `"25-001-01 — Riverside Commons"`).
3. **Action URLs must be deep links.** Where the notification requires action, the URL must take the user directly to the relevant surface, not to a generic app home page.
4. **Immediate-tier notifications must include a clear next step.** The body or action label must make it unambiguous what the recipient is expected to do.
5. **Failure notifications must not include raw error messages.** Technical error details belong in the admin failures inbox, not in email/notification-center notifications sent to end users.

---

## Teams Deferral

Locked Decision 3 specifies "email first, Teams later." This section defines precisely what that means.

### What is deferred

- Teams Adaptive Card delivery for any provisioning event
- Teams channel/bot notifications
- Teams incoming webhook integration
- Any `teams` channel value in `INotificationRegistration.channels`

### What deferral means

"Teams later" means:
- Teams integration is a named future milestone, not a vague promise
- The notification registration structure (`INotificationRegistration`) supports additional channels — adding `teams` as a channel in a future release does not require rearchitecting the notification system
- The `channelRouter.ts` in the backend pipeline is the correct place to add Teams delivery logic when the time comes
- No Wave 0 work should anticipate Teams integration by creating stub code, `if (teams) {}` branches, or Teams-specific templates

### What deferral does not mean

- Teams deferral does not mean push notifications are deferred. Push (`push` channel, PWA service worker) is a separate capability. Per `INotificationRegistration`, push is PWA-only (D-07 in `@hbc/notification-intelligence`) and is correctly omitted from Wave 0 provisioning notification channels. It is not Teams-deferred.
- Teams deferral does not mean the event matrix is incomplete. All 8 events are fully specified for email + in-app delivery. Teams is a future channel addition to existing events.

---

## Reference Document Requirements

T03 must produce `docs/reference/provisioning/notification-event-matrix.md`. That document must include:

1. The complete 8-event matrix with all fields from this plan
2. The recipient resolution table
3. The `INotificationRegistration` specifications (copy from this plan)
4. Backend pipeline integration call pattern (copy from this plan)
5. Message clarity rules
6. Teams deferral statement

---

## Acceptance Criteria

- [ ] All 8 provisioning lifecycle events are defined in the event matrix (with tier, channels, recipients, subject, body, action URL)
- [ ] Recipient resolution rules are documented (submitter, controller, group, admin → concrete UPN sources)
- [ ] `INotificationRegistration` specification is written for all 8 event types
- [ ] Backend pipeline integration call pattern is documented
- [ ] Template alignment table maps existing 5 templates to new event type names; 3 missing templates are specified
- [ ] Message clarity rules are documented
- [ ] Teams deferral scope is explicitly documented
- [ ] Reference document (`docs/reference/provisioning/notification-event-matrix.md`) exists and is complete
- [ ] Reference document is added to `current-state-map.md §2` as "Reference"
- [ ] G3 can implement notification registrations and `SendNotification` integration from this specification without inventing event names, tiers, or recipient rules

---

## Known Risks and Pitfalls

**Risk T03-R1: Email delivery configuration is not confirmed.** SendGrid or equivalent email delivery requires environment configuration (API key, sender domain, bounce handling). T04 must classify these as protected infrastructure configuration. Without email delivery working, `immediate`-tier events are in-app only. This is acceptable for dev/staging but not for pilot.

**Risk T03-R2: `controller` and `admin` UPN lists are hardcoded if T04 is not locked.** If T04's config classification is not confirmed before G3 implements notification dispatch, developers may hardcode UPN lists. Prevent this by ensuring T04 locks before G3 proceeds.

**Risk T03-R3: Duplicate notifications.** If the submitter is also a group member, they will receive notifications as both `submitter` and `group` recipient for some events. The `notificationStore.ts` must deduplicate by `(recipientUserId, eventType, sourceRecordId)` to prevent double notifications. G3 must confirm this deduplication exists in the backend pipeline.

**Risk T03-R4: Non-blocking dispatch creates invisible failures.** If notification dispatch fails silently during staging testing, the team may not notice until pilot. G3 must ensure notification failures are logged to AppInsights as warnings, and an AppInsights alert rule should exist for repeated notification failures.

---

## Follow-On Consumers

- **G3.2 (shared platform wiring):** Implements the `INotificationRegistration` entries, extends `notification-templates.ts`, and wires `SendNotification` calls into provisioning state transitions.
- **T07 (MVP Project Setup plan set):** Admin Recovery, Notifications, and Audit task uses T03's event matrix as the authoritative source for which events need notification delivery.
- **G6.1 (AppInsights KQL templates):** The notification failure rate is an operational health metric. G6 KQL queries should include a notification delivery success/failure rate query.
- **Wave 1 notification center surface:** Any app surface that renders the `HbcNotifications` in-app center must not define new event types that conflict with T03's provisioning namespace (`provisioning.*`).

---

*End of W0-G1-T03 — Notification Contract and Delivery Model v1.1 (Corrected 2026-03-14: `clarification-requested` event explicitly confirmed as real state machine lifecycle event — dispatched on `NeedsClarification` state transition, not an admin side-action; explicit state machine alignment note added to the existing targets section; T03-to-state-machine mapping table added)*
