# P2-C2: Notification-to-Work Mapping Policy

| Field | Value |
|---|---|
| **Doc ID** | P2-C2 |
| **Phase** | Phase 2 |
| **Workstream** | C — Shared Work Sources, Signals, and Handoff Rules |
| **Document Type** | Governance Policy |
| **Owner** | Platform / Core Services |
| **Update Authority** | Platform lead; changes require review by Experience lead and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §9.1, §9.2, §10.3, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md); [P2-C3](P2-C3-Work-Item-Navigation-Matrix.md); [P2-C4](P2-C4-Handoff-Criteria-Matrix.md); [P2-C5](P2-C5-Pilot-Publication-and-Rollout-Readiness-Register.md); [@hbc/notification-intelligence README](../../../../packages/notification-intelligence/README.md); [@hbc/bic-next-move README](../../../../packages/bic-next-move/README.md); [@hbc/workflow-handoff README](../../../../packages/workflow-handoff/README.md); [@hbc/acknowledgment README](../../../../packages/acknowledgment/README.md); [@hbc/step-wizard README](../../../../packages/step-wizard/README.md); [@hbc/field-annotations README](../../../../packages/field-annotations/README.md) |

---

## Policy Statement

Notifications are signals into the Personal Work Hub, not a competing work system. `@hbc/notification-intelligence` is the governing signal layer — all notification-fed work items must flow through its event registry, tier model, action-URL rules, and channel-routing semantics before they are normalized by the hub’s notification adapter.

This tightened policy deliberately separates **signal doctrine** from **notification maturity**. A source may be structurally part of the first-release notification scope while still being blocked on registration, publication, or launch validation. No source may claim first-release notification readiness merely because a helper, template, or design concept exists.

---

## Policy Scope

### This policy governs

- Signal doctrine (notifications as hub signals, not a separate work system)
- Signal classification rules (`action-required` vs `awareness`)
- Tier-to-priority and tier-to-lane mapping
- Deduplication when notifications overlap with BIC, handoff, or approval-derived work items
- Notification registration and action-URL contract for first-release sources
- Channel routing by tier
- SPFx notification constraints for first release
- User preference and tier-override rules
- Badge and banner behavior
- Notification readiness maturity by first-release source
- Cross-lane notification consistency

### This policy does NOT govern

- Source classification and overall tranche readiness — see [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md)
- Full ranking coefficients and scoring — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Item-type navigation behavior — see P2-C3
- Project-significance handoff criteria — see [P2-C4](P2-C4-Handoff-Criteria-Matrix.md)
- Freshness and staleness trust semantics outside signal mapping — see P2-B3

---

## Definitions

| Term | Meaning |
|---|---|
| **Notification signal** | A lifecycle event published through `@hbc/notification-intelligence` that may produce a work item in the hub via the notification adapter |
| **Tier** | Notification priority classification: `immediate`, `watch`, or `digest` |
| **Channel** | Delivery mechanism: `push`, `email`, `in-app`, or `digest-email` |
| **Action URL** | Relative-path deep link carried by a notification event and resolved against the current surface origin |
| **Action-required event** | A notification event representing responsibility that should be surfaced within 24 hours and may not be downgraded when declared non-overridable |
| **Awareness event** | A lifecycle signal that informs the user something changed but does not itself create a must-act-now posture |
| **Contract / pattern defined** | The source has a stable notification event pattern, naming posture, tier doctrine, and action-URL shape defined clearly enough that registration work can proceed |
| **Registered / wired** | Source-specific `NotificationRegistry.register()` usage, event definitions, templates, and bootstrap wiring exist in the repo |
| **Publishing** | The source emits real notification-driven work items or real notification events into the hub workflow on at least one actual route |
| **Tested / pilot-ready** | Source-specific tests and pilot-readiness evidence exist at a level that supports launch review |

---

## 1. Locked First-Release Decisions

This tightened policy incorporates the following locked decisions:

| Decision | Locked Resolution | Consequence in P2-C2 |
|---|---|---|
| Badge posture | **Immediate-only badge in first release** | `HbcNotificationBadge` policy aligns to current repo truth |
| Grey watch-only badge | **Deferred** | Watch-only grey badge is not first-release behavior; it must remain an explicit deferred item |
| First-release source scope | **Expand to full tightened Wave 1 source set** | Notification coverage explicitly addresses Provisioning / admin exceptions, Estimating Bid Readiness, BD Score Benchmark, BD Strategic Intelligence, Project Hub Handoff Signals, Project Hub Health Pulse, and Approvals |
| Notification readiness model | **Use staged maturity bands** | This policy no longer uses a flat `ready / not defined / event count` table as the primary truth signal |
| Notification relationship | **Notifications feed the hub; hub remains the work surface** | No competing inbox / work-management posture is permitted |

---

## 2. Signal Doctrine

### 2.1 Governing Principle

Per the locked Phase 2 posture:

> Notifications feed the hub via `@hbc/notification-intelligence`; the hub remains the main work surface.

### 2.2 Practical Meaning

| Principle | Rule |
|---|---|
| **Hub is the work surface** | Users review, prioritize, and act on work in the Personal Work Hub, not in a notification center or inbox |
| **Notifications are signals** | Notifications inform the hub about lifecycle events; they do not create a parallel work-management system |
| **No competing inbox** | `NotificationApi.getCenter()` exists for history and reference, not as an alternative work surface |
| **Signal-to-item conversion** | Notification events become work items only through the governed notification adapter and then participate in the same feed normalization contract as other items |

### 2.3 Doctrine Invariants

- Notification events MUST NOT bypass `@hbc/notification-intelligence` to create hub items directly.
- Notification-driven items in the feed MUST participate in the same canonical ranking and lane contract as other items.
- A notification signal MUST NOT silently outrank a stronger direct-work source for the same underlying responsibility.

---

## 3. Tier-to-Work Mapping

Notification tiers map to feed priorities and responsibility lanes as follows:

| Notification Tier | Feed Priority | Assigned Lane | Source Weight Class |
|---|---|---|---|
| `immediate` | `now` | `do-now` | Notification signal |
| `watch` | `soon` | `watch` | Notification signal |
| `digest` | `watch` | `watch` | Notification signal |

### 3.1 Mapping Rules

- Tier-to-priority mapping is fixed and MUST NOT vary by source.
- A notification item uses the notification source-weight/trust posture from P2-A2; it does not become a direct-work item simply because it is urgent.
- Tier mapping does not override stronger scoring factors from overdue, blocked, or direct-work responsibility.
- `digest` remains visible as a lower-attention signal class; it is not hidden from the in-app archive model.

### 3.2 Mapping Invariants

- `immediate` always maps to `do-now`.
- `watch` and `digest` do not create urgent-lane dominance by themselves.
- Source-specific urgency vocabularies must normalize into the same three-tier model before reaching the hub.

---

## 4. Signal Classification Rules

Every first-release notification event type MUST be classified as either **action-required** or **awareness**.

### 4.1 Classification Matrix

| Classification | Default Tier | Tier Overridable | Default Channels | User Can Downgrade? |
|---|---|---|---|---|
| **Action-required** | `immediate` | `false` | `push`, `email`, `in-app` | No |
| **Awareness** | `watch` or `digest` | `true` | `in-app` + optional additional channels | Yes |

### 4.2 Classification Rules

| Rule | Meaning |
|---|---|
| **Action-required** | Represents responsibility the user should address within 24 hours or a material exception requiring intervention |
| **Awareness** | Represents a meaningful lifecycle change that does not itself create a must-act-now posture |
| **Non-downgradable urgent work** | Action-required events may be declared `tierOverridable: false` when users must not suppress them |
| **User-adjustable awareness** | Awareness events may be promoted or demoted by user preference when the source permits overrides |

### 4.3 First-Release Reference Pattern

Provisioning remains the reference source for classification posture:
- action-required events such as `request-submitted`, `clarification-requested`, `first-failure`, and `handoff-received`
- awareness events such as `completed`, `request-approved`, and `step-completed`

---

## 5. Deduplication with BIC, Handoff, and Approval-Derived Work

When the same underlying responsibility produces a notification item and a stronger direct-work item, the notification signal is merged rather than displayed as a competing primary item.

### 5.1 Deduplication Hierarchy

| Stronger Source | Notification Consequence |
|---|---|
| **BIC item** | BIC survives; notification metadata merges into `sourceMeta` |
| **Workflow handoff item** | Handoff survives; notification metadata merges into `sourceMeta` |
| **Acknowledgment / approval-derived direct work** | Direct work survives; notification metadata merges into `sourceMeta` |
| **Notification-only item** | Notification item may remain when no stronger direct-work source exists for the same responsibility |

### 5.2 Deduplication Rules

- Higher-trust direct-work sources win over notification-only signals for the same record.
- The canonical deduplication identity remains source-independent, using the same governed record identity patterns tracked in P2-C1.
- Notification metadata may still provide useful context (for example unread, last-signaled, or channel provenance) after merge.
- Notification-only items may remain visible when the user is not the direct BIC owner and no stronger responsibility-bearing item is published for that record.

### 5.3 Consequence for Approvals

Approval routes that publish both a direct-work item and a notification must preserve the direct-work item as the survivor. The notification event remains a signal, not the authoritative approval work item.

---

## 6. Notification Registration Contract

Every first-release source that publishes notifications MUST register its event types with `@hbc/notification-intelligence` using the canonical registration pattern.

### 6.1 Required Registration Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `eventType` | `string` | Yes | Namespaced event identifier |
| `defaultTier` | `NotificationTier` | Yes | `immediate`, `watch`, or `digest` |
| `description` | `string` | Yes | Human-readable description for preferences UI |
| `tierOverridable` | `boolean` | Yes | `false` for non-downgradable urgent events; `true` where user adjustment is permitted |
| `channels` | `NotificationChannel[]` | Yes | Default delivery channels |

### 6.2 Event-Type Naming Convention

Event types MUST follow the pattern:

```text
{source-prefix}.{event-name}
```

| Source | Prefix | Example Pattern |
|---|---|---|
| Provisioning / admin exceptions | `provisioning.` | `provisioning.request-submitted` |
| Estimating Bid Readiness | `estimating.` | `estimating.bid-readiness-changed` |
| BD Score Benchmark | `bd-score.` | `bd-score.criterion-updated` |
| BD Strategic Intelligence | `bd-strategic.` | `bd-strategic.entry-flagged` |
| Project Hub Handoff Signals | `project-hub-handoff.` **or** governed route-specific handoff prefix | `project-hub-handoff.package-received` |
| Project Hub Health Pulse | `project-health.` | `project-health.pulse-alert` |
| Approvals | `approvals.` **or** governed route-specific approval prefix | `approvals.requested`, `approvals.completed` |

### 6.3 Registration Pattern

All source registrations MUST follow the singleton `NotificationRegistry.register()` posture:
- called once per package / bootstrap seam
- additive only
- duplicate `eventType` values are prohibited
- invalid tier declarations are prohibited

### 6.4 Registration Invariant

A source is not **registered / wired** merely because a reference adapter or concept exists. This band closes only when the real event definitions, templates, and bootstrap registration are present in repo truth.

---

## 7. Action URL Rules

All notification action URLs MUST be **relative paths** for cross-surface compatibility.

### 7.1 URL Requirements

| Requirement | Rule |
|---|---|
| **Format** | Relative path beginning with `/` |
| **Cross-surface** | Same URL resolves correctly on PWA and SPFx because each host supplies its own origin |
| **Query parameters** | Use `buildActionUrl(path, params)` from `@hbc/notification-intelligence` |
| **Absolute URLs** | Prohibited unless the destination is an external resource such as a SharePoint site URL |
| **Undefined values** | Omitted by `buildActionUrl()` |

### 7.2 Action Label Rule

Sources SHOULD provide meaningful action labels when the default `'View'` label is too generic for the work posture.

### 7.3 Action URL Invariants

- Action URLs must remain relative for cross-surface compatibility.
- Notification links must not encode surface-specific origins.
- Item navigation behavior after click is governed by P2-C3 and P2-C4, not redefined here.

---

## 8. Channel Routing by Tier

| Tier | Push | Email | In-App | Digest Email |
|---|---|---|---|---|
| `immediate` | ✅ | ✅ | ✅ | — |
| `watch` | — | Optional by preference | ✅ | Optional / deferred by source posture |
| `digest` | — | — | ✅ archive posture | ✅ periodic roll-up |

### 8.1 Channel Rules

- `immediate` routes to all active urgent channels.
- `watch` defaults to in-app and may be promoted to email where supported.
- `digest` accumulates for lower-attention summary delivery while remaining visible in the in-app archive / history posture.
- Channel availability may vary by host surface; see SPFx constraints below.

---

## 9. SPFx Notification Constraints

First release retains the current host constraint posture.

| Constraint | Rule |
|---|---|
| **Push notifications** | Unavailable in SPFx for first release |
| **Available channels** | `email` + `in-app` only |
| **Push toggle** | Hidden when SharePoint context is detected |
| **Action URLs** | Same relative paths as PWA |
| **Badge behavior** | Same **immediate-only** badge count semantics as first-release PWA |

### 9.1 SPFx Invariants

- SPFx users receive the same notification events; only channel availability differs.
- In-app notification semantics remain consistent across hosts.
- First release does not require SPFx-specific push parity.

---

## 10. User Preference Rules

### 10.1 Tier-Override Semantics

| User Action | Permitted? | Rule |
|---|---|---|
| Promote `watch` → `immediate` | ✅ Yes | User wants higher urgency for awareness events |
| Promote `digest` → `watch` | ✅ Yes | User wants faster delivery of digest items |
| Demote `watch` → `digest` | ✅ Yes | User wants less frequent delivery |
| Demote `immediate` urgent work | ❌ Only when source allows override | Action-required events declared non-overridable may not be downgraded |

### 10.2 Preference Storage

User preferences continue to live in the notification-intelligence preference model, including:
- per-event tier overrides
- push enablement where host-supported
- digest scheduling controls

### 10.3 Preference Invariants

- Preference overrides must not break non-downgradable urgent work.
- User preferences change delivery and surfacing urgency, not canonical record identity.
- First-release badge posture is not widened by preference changes; the badge remains immediate-only.

---

## 11. Badge and Banner Behavior

### 11.1 Badge — First-Release Locked Behavior

| Behavior | First-Release Specification |
|---|---|
| **Component** | `HbcNotificationBadge` |
| **Count source** | Immediate-tier unread count only |
| **Visible badge** | Only when immediate unread > 0 |
| **No visible badge** | Watch-only unread, digest-only unread, or no unread |
| **Polling interval** | 60 seconds |

### 11.2 Deferred Badge Behavior

The **grey watch-only badge** remains an explicit deferred enhancement. It is not part of first-release required behavior and must not be described as current repo truth.

### 11.3 Banner

| Behavior | Specification |
|---|---|
| **Component** | `HbcNotificationBanner` |
| **Tier** | Immediate-tier only |
| **Auto-dismiss** | 30 seconds if not interacted |
| **Maximum visible** | 1 at a time; overflow is queued |
| **Action** | Click navigates to `actionUrl` |

### 11.4 Badge / Banner Invariants

- The badge is intentionally not a total-noise counter.
- Watch-only and digest-only signals remain visible through the notification center / hub flow even when no badge is shown.
- Banner behavior must remain urgent-only in first release.

---

## 12. First-Release Notification Source Coverage and Maturity

This tightened policy explicitly covers the full first-release notification source scope.

### 12.1 Source Coverage Matrix

| Source | Notification Scope in P2-C2 | Contract / Pattern Defined | Registered / Wired | Publishing | Tested / Pilot-Ready | Notes |
|---|---|---|---|---|---|---|
| **Provisioning / admin exceptions** | In scope | **Ready** | **Ready** | **Ready** | **Partial** | Reference implementation with 15 real registrations |
| **Estimating Bid Readiness** | In scope | **Ready** | **Blocked** | **Blocked** | **Blocked** | Reference notification adapter exists, but registry wiring is not closed |
| **BD Score Benchmark** | In scope | **Blocked** | **Blocked** | **Blocked** | **Blocked** | No closed notification registration posture yet |
| **BD Strategic Intelligence** | In scope | **Blocked** | **Blocked** | **Blocked** | **Blocked** | No closed notification registration posture yet |
| **Project Hub Handoff Signals** | In scope | **Ready** | **Partial** | **Partial** | **Blocked** | Handoff-related notification semantics exist through provisioning / workflow-handoff posture, but standalone row maturity is not fully closed |
| **Project Hub Health Pulse** | In scope | **Partial** | **Blocked** | **Blocked** | **Blocked** | Health Pulse naming posture must stay aligned to `project-health` / `project-health-pulse` |
| **Approvals** | In scope | **Ready** | **Blocked** | **Blocked** | **Blocked** | Notifications must remain subordinate to the direct approval work item; Wave 1 proof path remains limited to admin provisioning approval posture |

### 12.2 Minimum Viable Notification Set per Source

For a source row to be considered meaningfully notification-capable for pilot review, it should define at minimum:
- one **action-required** event when the source can create real user responsibility
- one **awareness** event for meaningful lifecycle change

### 12.3 Maturity-Band Meanings

| Band | Meaning |
|---|---|
| **Contract / Pattern Defined** | Stable naming, tier doctrine, event posture, and action-URL pattern exist |
| **Registered / Wired** | Real registry definitions, templates, and bootstrap integration exist |
| **Publishing** | Real events or notification-driven work items are produced on an actual route |
| **Tested / Pilot-Ready** | Source-specific testing and pilot evidence exist at a launch-review level |

---

## 13. Cross-Lane Consistency

Per the locked Phase 2 lane-consistency doctrine, notification semantics must remain consistent across hosts.

| Aspect | PWA | SPFx | Rule |
|---|---|---|---|
| Event types | Same registered events | Same registered events | Identical |
| Tier semantics | Same meanings | Same meanings | Identical |
| Badge semantics | Immediate-only | Immediate-only | Identical for first release |
| Action URLs | Resolve against PWA origin | Resolve against SPFx origin | Same relative-path contract |
| Channel availability | push + email + in-app | email + in-app | Host-limited only |
| Feed priority mapping | immediate → now; watch → soon; digest → watch | Same mapping | Identical |

---

## 14. Signal Gate Posture

P2-C2 is the signal-mapping evidence artifact for the Phase 2 signal gate.

| Field | Value |
|---|---|
| **Gate** | Signal gate |
| **Pass condition** | Notifications act as signals into the hub rather than a competing work system |
| **Evidence required** | Mapping policy (this document), interaction review, launch checks, source-specific notification maturity evidence |
| **Primary owner** | Platform / Core Services |

### Current Gate Reading

- **Signal doctrine:** Ready
- **Action URL contract:** Ready
- **First-release source coverage model:** Ready after this tightening pass
- **Current source registration maturity:** Blocked beyond Provisioning / admin exceptions
- **Why blocked:** most first-release sources remain partially defined or unpublished at the notification layer

---

## 15. Policy Precedence

| Deliverable | Relationship to P2-C2 |
|---|---|
| **P2-C1** — Source Tranche Register | P2-C1 defines which source rows matter in Wave 1; P2-C2 defines how their notifications map into work |
| **P2-A2** — Ranking Policy | Notification items follow the same canonical ranking and source-trust rules |
| **P2-B0** — Lane Ownership | Cross-lane consistency and anti-drift rules constrain notification behavior across hosts |
| **P2-C3** — Navigation Matrix | P2-C3 governs what happens when the user acts on a notification-driven item |
| **P2-C4** — Handoff Criteria Matrix | P2-C4 governs when signal-driven items should hand off to Project Hub |
| **P2-C5** — Pilot Readiness Register | P2-C5 uses this policy when assessing signal-gate closure and launch readiness |

If a downstream artifact reintroduces the grey watch-only badge as first-release required behavior, narrows the source scope back to the older five-source table, or collapses notification maturity back to a flat `ready / not defined` table, this tightened policy takes precedence unless Platform lead explicitly revises it.

---

## 16. Update Guardrails

When this policy is updated:

1. Do **not** describe the watch-only grey badge as current first-release behavior.
2. Do **not** narrow notification source coverage back to the older five-source table.
3. Do **not** mark a source as notification-ready solely because a helper or pattern exists.
4. Do **not** treat notification-only items as stronger than direct-work items for the same underlying responsibility.
5. Do **not** break the relative-path action-URL contract.
6. Do **not** let notification semantics drift between PWA and SPFx beyond host channel constraints.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §9.1, §9.2, §10.3, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
