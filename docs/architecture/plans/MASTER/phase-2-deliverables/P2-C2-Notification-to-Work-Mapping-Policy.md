# P2-C2: Notification-to-Work Mapping Policy

| Field | Value |
|---|---|
| **Doc ID** | P2-C2 |
| **Phase** | Phase 2 |
| **Workstream** | C — Shared Work Sources, Signals, and Handoff Rules |
| **Document Type** | Governance Policy |
| **Owner** | Platform / Core Services |
| **Update Authority** | Platform lead; changes require review by Experience lead and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | [Phase 2 Plan §9.1, §10.3, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md); [publication-model §4, §6](../../../reference/work-hub/publication-model.md); `@hbc/notification-intelligence`; ADR-0099 |

---

## Policy Statement

Notifications are signals into the Personal Work Hub, not a competing work system. `@hbc/notification-intelligence` is the governing signal layer — all notification-fed work items flow through its registry, tier model, and channel routing into the hub's notification adapter. Users manage their work in the hub, not in a notification inbox. This policy locks the signal classification rules, tier-to-work mapping, deduplication behavior, registration contract, and cross-surface constraints.

---

## Policy Scope

### This policy governs

- Signal doctrine (notifications as hub signals, not a separate work system)
- Signal classification rules (action-required vs awareness)
- Notification tier to feed priority and lane mapping
- Deduplication behavior when notifications overlap with BIC items
- Notification registration contract for first-release sources
- Action URL rules for cross-surface compatibility
- Channel routing by tier
- SPFx notification constraints
- User preference and tier override rules
- Badge and banner behavior
- Cross-lane notification consistency

### This policy does NOT govern

- Source tranche classification and readiness — see [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md)
- Work-item navigation behavior per item type — see P2-C3
- Handoff criteria to Project Hub — see P2-C4
- Ranking coefficients and scoring — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Freshness and staleness trust — see [P2-B3](P2-B3-Freshness-Refresh-and-Staleness-Trust-Policy.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Notification signal** | A lifecycle event (state change, completion, failure, escalation) published through `@hbc/notification-intelligence` that may produce a work item in the hub via the notification adapter |
| **Tier** | The priority classification of a notification: `immediate`, `watch`, or `digest`. Determines feed priority, lane assignment, and channel routing |
| **Channel** | A delivery mechanism for notifications: `push`, `email`, `in-app`, or `digest-email` |
| **Action URL** | A relative path deep link carried by a notification event, resolved against the current surface's origin for cross-surface compatibility |
| **Signal classification** | The categorization of a notification event as `action-required` (non-downgradable, immediate tier) or `awareness` (downgradable, watch/digest tier) |
| **Deduplication** | The process where a notification item for the same record is merged with a higher-weight BIC item, preserving the BIC item and merging notification metadata |

---

## 1. Signal Doctrine

### 1.1 Governing Principle

Per Phase 2 Plan §9.1 and §16 (locked decision):

> "Notifications feed the hub via `@hbc/notification-intelligence`; hub remains the main work surface."

### 1.2 What This Means

| Principle | Rule |
|---|---|
| **Hub is the work surface** | Users review, prioritize, and act on work in the Personal Work Hub — not in a notification center, inbox, or alert panel |
| **Notifications are signals** | Notifications inform the hub about lifecycle events; they do not create a parallel work management experience |
| **No competing inbox** | The notification center (`NotificationApi.getCenter()`) exists for reference and history, not as an alternative work surface |
| **Signal-to-item conversion** | Notifications produce feed items through the notification adapter (weight 0.5) — they are ranked alongside BIC and handoff items using the same algorithm (P2-A2) |

### 1.3 Signal Doctrine Invariants

- The hub MUST remain the primary surface where users manage work, regardless of how many notification channels deliver signals.
- Notification events MUST NOT bypass `@hbc/notification-intelligence` to create hub items directly (P2-B0 Anti-Drift Rule 5).
- Notification-driven items in the feed are ranked by the same scoring model as all other items (P2-A2 §9).

---

## 2. Tier-to-Work Mapping

Notification tiers map to feed priorities and responsibility lanes:

| Notification Tier | Feed Priority | Assigned Lane | Scoring Impact |
|---|---|---|---|
| `immediate` | `now` | `do-now` | Enters scoring with source weight 0.5 × 50 = +25 from source weight factor |
| `watch` | `soon` | `watch` | Same source weight contribution |
| `digest` | `watch` | `watch` | Same source weight contribution |

See [publication-model §6](../../../reference/work-hub/publication-model.md) for the complete priority mapping reference and [P2-A2 §3](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md) for lane assignment logic.

### 2.1 Mapping Invariants

- Tier-to-priority mapping is fixed and MUST NOT vary by domain source. An `immediate` notification from Provisioning and an `immediate` notification from Estimating both map to `now` priority.
- The notification adapter weight (0.5) is lower than BIC (1.0) and handoff (0.8) — notification-only items rank lower than ownership items of equal urgency.
- Tier mapping does not affect the scoring from other factors (overdue, blocked, unread freshness, etc.) — only the source weight contribution.

---

## 3. Signal Classification Rules

Every notification event type MUST be classified as either **action-required** or **awareness**. This classification determines tier downgradability and default channels.

### 3.1 Classification Matrix

| Classification | Default Tier | Tier Overridable | Default Channels | User Can Downgrade? |
|---|---|---|---|---|
| **Action-required** | `immediate` | `false` | `push`, `email`, `in-app` | No — forced to `immediate` |
| **Awareness** | `watch` or `digest` | `true` | `in-app` + optional additional | Yes — can promote or demote |

### 3.2 Classification Rules

| Rule | Meaning |
|---|---|
| **Action-required** events represent situations where the user **must act** within 24 hours | Examples: request submitted to user, clarification requested, failure requiring intervention |
| **Awareness** events represent informational lifecycle signals that do **not require user action** | Examples: step completed, request approved, handoff acknowledged |
| Action-required events are **non-downgradable** (`tierOverridable: false`) | Users cannot suppress urgent notifications for items they must act on |
| Awareness events are **user-adjustable** (`tierOverridable: true`) | Users can promote awareness events to `immediate` or demote to `digest` |

### 3.3 Reference Implementation

The Provisioning module classifies its 15 events per this pattern:
- 8 action-required events (non-downgradable, `immediate`)
- 7 awareness events (downgradable, `watch`)

See `packages/provisioning/src/notification-registrations.ts` for the reference implementation.

All first-release sources MUST follow this classification pattern when defining their notification registrations.

---

## 4. Deduplication with BIC Items

When the same record produces both a BIC item (weight 0.9) and a notification item (weight 0.5), deduplication resolves the overlap.

### 4.1 Deduplication Rules

| Rule | Behavior |
|---|---|
| **Higher weight wins** | BIC item (0.9) survives; notification item (0.5) is merged |
| **Metadata merge** | Notification's `sourceMeta` is merged into the BIC item's `sourceMeta` array |
| **Permission preservation** | `canAct: true` from BIC wins over `canAct: false` from notification |
| **Dedup key** | Same canonical format: `{moduleKey}::{recordType}::{recordId}` |

### 4.2 Deduplication Consequence

- When a user receives both a BIC ownership item and a notification for the same record, they see **one item** in the feed — the BIC-weighted item with notification metadata merged in.
- The notification adapter's lower weight means that if the user is NOT the BIC owner but receives a notification, the notification-only item appears with lower source-weight scoring than an owned BIC item.
- Deduplication details are available in the reasoning drawer via `dedupe: IMyWorkDedupeMetadata` (P2-A3 §1.3).

---

## 5. Notification Registration Contract

Every first-release source that publishes notifications MUST register its event types with `@hbc/notification-intelligence` using `INotificationRegistration`.

### 5.1 Required Registration Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `eventType` | `string` | Yes | Namespaced event identifier (e.g., `provisioning.request-submitted`) |
| `defaultTier` | `NotificationTier` | Yes | `immediate`, `watch`, or `digest` |
| `description` | `string` | Yes | Human-readable description for user preferences UI |
| `tierOverridable` | `boolean` | Yes | `false` for action-required; `true` for awareness |
| `channels` | `NotificationChannel[]` | Yes | Default delivery channels |

### 5.2 Event Type Naming Convention

Event types MUST follow the pattern: `{sourceModule}.{event-name}`

| Source | Prefix | Examples |
|---|---|---|
| Provisioning | `provisioning.` | `provisioning.request-submitted`, `provisioning.completed` |
| Estimating | `estimating.` | `estimating.bid-readiness-changed` |
| BD Score Benchmark | `bd-score.` | `bd-score.criterion-updated` |
| BD Strategic Intelligence | `bd-strategic.` | `bd-strategic.entry-flagged` |
| Project Hub Health | `project-health.` | `project-health.pulse-alert` |

### 5.3 Registration Pattern

All registrations MUST use the singleton `NotificationRegistry.register()` pattern:
- Called once per package at initialization
- Additive only — no deregistration
- Throws on duplicate `eventType` or invalid tier

See `packages/provisioning/src/notification-registrations.ts` for the reference implementation.

---

## 6. Action URL Rules

All notification action URLs MUST be **relative paths** for cross-surface compatibility.

### 6.1 URL Requirements

| Requirement | Rule |
|---|---|
| **Format** | Relative path starting with `/` (e.g., `/accounting/requests/req-42`) |
| **Cross-surface** | Same URL resolves correctly on both PWA and SPFx because each surface adds its own origin |
| **Query parameters** | Use `buildActionUrl(path, params)` from `@hbc/notification-intelligence` for consistent formatting |
| **No absolute URLs** | Absolute URLs (`https://...`) are prohibited unless linking to external resources (e.g., SharePoint sites) |
| **Undefined values** | `buildActionUrl()` omits query params with `undefined` values |

### 6.2 Action Label

- Default action label is `'View'` when `actionLabel` is not specified in `NotificationSendPayload`.
- Sources SHOULD provide meaningful action labels (e.g., `'Review Request'`, `'Acknowledge Handoff'`).

---

## 7. Channel Routing by Tier

| Tier | Push | Email | In-App | Digest Email |
|---|---|---|---|---|
| `immediate` | ✅ | ✅ | ✅ | — |
| `watch` | — | Optional (user pref) | ✅ | Optional (weekly digest) |
| `digest` | — | — | ✅ (archive) | ✅ (weekly roll-up) |

### 7.1 Channel Rules

- `immediate` events route to all active channels simultaneously.
- `watch` events default to in-app only; users may enable email via preferences.
- `digest` events accumulate for weekly digest email; in-app items are available in archive.
- Channel availability may vary by surface (see §8 SPFx constraints).

---

## 8. SPFx Notification Constraints

Per `@hbc/notification-intelligence` design decision D-07:

| Constraint | Rule |
|---|---|
| **Push notifications** | Unavailable in SPFx — requires PWA service worker |
| **Available channels** | `email` + `in-app` only |
| **Push toggle** | Hidden when SharePoint context is detected |
| **Notification badge** | Same badge behavior as PWA (immediate-only unread count) |
| **Action URLs** | Same relative paths — resolved against SPFx origin |

### 8.1 SPFx Constraint Invariants

- SPFx users receive the same notification events as PWA users — only the delivery channels differ.
- The same `INotificationEvent` data structure is used on both surfaces.
- In-app notification behavior (badge count, read/dismiss) is identical across surfaces.

---

## 9. User Preference Rules

### 9.1 Tier Override Semantics

| User Action | Permitted? | Rule |
|---|---|---|
| Promote `watch` → `immediate` | ✅ Yes | User wants higher urgency for awareness events |
| Promote `digest` → `watch` | ✅ Yes | User wants faster delivery of digest items |
| Demote `watch` → `digest` | ✅ Yes | User wants less frequent delivery |
| Demote `immediate` → `watch` or `digest` | ❌ Only if `tierOverridable: true` | Action-required events (`tierOverridable: false`) cannot be downgraded |

### 9.2 Preference Storage

User preferences are stored in the `HbcNotificationPreferences` SharePoint list via `INotificationPreferences`:
- `tierOverrides: Record<string, NotificationTier>` — per-eventType overrides
- `pushEnabled: boolean` — PWA-only push notification toggle
- `digestDay: number` — weekly digest delivery day (0–6)
- `digestHour: number` — weekly digest delivery hour (0–23 local time)

---

## 10. Badge and Banner Behavior

### 10.1 Badge

| Behavior | Specification |
|---|---|
| **Component** | `HbcNotificationBadge` |
| **Count source** | Immediate-tier unread count only (`immediateUnreadCount` from `INotificationCenterResult`) |
| **Red badge** | Immediate unread > 0 |
| **Grey badge** | Watch-only items unread (no immediate) |
| **No badge** | Digest-only or no unread items |
| **Polling interval** | 60 seconds |

### 10.2 Banner

| Behavior | Specification |
|---|---|
| **Component** | `HbcNotificationBanner` |
| **Tier** | Immediate-tier only |
| **Auto-dismiss** | 30 seconds if not interacted |
| **Maximum visible** | 1 banner at a time; overflow managed by queue |
| **Action** | Click navigates to `actionUrl` |

---

## 11. Cross-Lane Consistency

Per [P2-B0 Cross-Lane Consistency Rule 3](P2-B0-Lane-Ownership-and-Coexistence-Rules.md):

> "Notification-to-work signal semantics MUST remain consistent across both lanes."

| Aspect | PWA | SPFx | Rule |
|---|---|---|---|
| Event types | All registered events | Same events | Identical |
| Tier semantics | immediate/watch/digest | Same meanings | Identical |
| Badge behavior | Immediate unread count | Same count | Identical |
| Action URLs | Resolve against PWA origin | Resolve against SPFx origin | Same relative paths |
| Channel availability | push + email + in-app | email + in-app only | SPFx limited per §8 |
| Feed priority mapping | immediate→now, watch→soon, digest→watch | Same mapping | Identical |

---

## 12. First-Release Notification Readiness

Per [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md), notification registration readiness by source:

| Source | Notification Status | Event Count | Action Required |
|---|---|---|---|
| **Provisioning** | ✅ Ready | 15 events | None — reference implementation |
| **Estimating Bid Readiness** | ❌ Not defined | 0 | Define registrations following Provisioning pattern |
| **BD Score Benchmark** | ❌ Not defined | 0 | Define registrations following Provisioning pattern |
| **BD Strategic Intelligence** | ❌ Not defined | 0 | Define registrations following Provisioning pattern |
| **Project Hub Health Pulse** | ❌ Not defined | 0 | Define registrations following Provisioning pattern |

### 12.1 Minimum Viable Notification Set

For pilot launch, each source MUST define at minimum:
- 1 action-required event (e.g., `estimating.bid-readiness-changed` with `immediate` tier)
- 1 awareness event (e.g., `estimating.bid-readiness-resolved` with `watch` tier)

Full event catalogs may expand post-pilot, but the minimum set ensures the notification adapter produces meaningful work items for each source.

---

## 13. Acceptance Gate Reference

| Field | Value |
|---|---|
| **Gate** | Signal gate |
| **Pass condition** | Notifications act as signals into the hub rather than a competing work system |
| **Evidence required** | Mapping policy (this document), interaction review, launch checks |
| **Primary owner** | Platform / Core Services |

### Gate Evidence

- Signal doctrine locked: notifications feed the hub, not a competing inbox ✓
- Tier-to-lane mapping defined and consistent with publication-model §6 ✓
- Deduplication with BIC items defined (BIC wins at 0.9 vs notification 0.5) ✓
- Cross-lane consistency enforced for notification semantics ✓
- First-release notification readiness: Provisioning ready; 4 sources require Wave 1 registration work

---

## 14. Locked Decisions

| Decision | Locked Resolution | P2-C2 Consequence |
|---|---|---|
| Notification relationship | **Notifications feed the hub via `@hbc/notification-intelligence`; hub remains the main work surface** | All notification events must route through notification-intelligence; no direct hub integration |
| First-release source scope | **Wave 1 business-core scope** | Notification registrations required for all 5 named sources |

---

## 15. Policy Precedence

| Deliverable | Relationship to P2-C2 |
|---|---|
| **P2-C1** — Source Tranche Register | P2-C1 classifies sources; P2-C2 defines how their notifications map to work items |
| **P2-A2** — Ranking Policy | Notification-driven items use the same scoring model; source weight 0.5 applies per P2-A2 §4 |
| **P2-B0** — Lane Ownership | Cross-lane consistency rule 3 requires identical notification semantics across surfaces |
| **P2-C3** — Work-Item Navigation Matrix | P2-C3 defines what happens when a user acts on a notification-driven item (deep link, preview, handoff) |
| **P2-C4** — Handoff Criteria Matrix | P2-C4 determines whether notification items route to Project Hub or remain in the hub |

If a downstream deliverable introduces notification behavior that conflicts with this policy, this policy takes precedence for tier mapping, classification rules, and cross-lane consistency.

---

**Last Updated:** 2026-03-19
**Governing Authority:** [Phase 2 Plan §9.1, §10.3](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
