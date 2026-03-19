# P2-A3: Work-Item Explainability and Visibility Rules

| Field | Value |
|---|---|
| **Doc ID** | P2-A3 |
| **Phase** | Phase 2 |
| **Workstream** | A — Personal Work Hub Operating Model |
| **Document Type** | Governance Policy |
| **Owner** | Experience / Shell Team |
| **Update Authority** | Experience lead; changes require review by Platform lead and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [interaction-contract §6](../../../reference/work-hub/interaction-contract.md); `IMyWorkItem.ts`; `IMyWorkRegistry.ts`; `dedupeItems.ts` |

---

## Policy Statement

Every work item in the Personal Work Hub must carry sufficient explainability data for users to understand why it appears, where it is ranked, and what they can do with it. Visibility and permission rules must be role-governed, consistent across surfaces, and transparent — users must never encounter opaque ranking, unexplained restrictions, or invisible entitlement logic. This policy locks the explainability field semantics, display rules, visibility model, permission inheritance rules, and reasoning payload contract.

---

## Policy Scope

### This policy governs

- Semantics and population rules for all five explainability fields
- Display and disclosure rules (what users see in list view, reasoning drawer, and detail view)
- User visibility model by team mode (personal, delegated-by-me, my-team)
- Permission field semantics and adapter defaults
- Permission inheritance during deduplication
- Role-based entitlement for explainability data
- Reasoning payload contract and drawer behavior
- Update timing and consistency guarantees

### This policy does NOT govern

- Scoring coefficients, tie-breaking rules, or lane assignment — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Responsibility-lane structure and operating-model invariants — see [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md)
- PWA/SPFx lane ownership — see [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md)
- Freshness thresholds and staleness trust — see P2-B3
- Complete role-to-hub entitlement matrix — see P2-D1
- Source tranche classification — see P2-C1

---

## Definitions

| Term | Meaning |
|---|---|
| **Explainability field** | A structured data field on a work item that explains an aspect of its ranking, lifecycle, origin, history, or permission state |
| **Reasoning payload** | The complete bundle of explainability data for a single work item, assembled for display in the reasoning drawer (`IMyWorkReasoningPayload`) |
| **Reasoning drawer** | A slide-out or expandable UI surface that shows the full reasoning payload for a selected work item |
| **Visibility entitlement** | The set of items and explainability data a user is authorized to see, determined by ownership, team mode, and role |
| **Permission inheritance** | The rules that determine how permissions are preserved or merged when multiple source items are deduplicated into one |
| **Supersession** | The process by which a work item replaces another (e.g., when ownership transfers), marking the old item as `superseded` |
| **Disclosure level** | The tier of detail shown to a user: list-view summary, reasoning drawer detail, or internal-only (never shown to users) |

---

## 1. Explainability Fields Reference

Every `IMyWorkItem` carries five explainability fields. This section defines the semantics, population rules, and intended use of each.

### 1.1 `rankingReason: IMyWorkRankingReason`

**Type definition:** `packages/my-work-feed/src/types/IMyWorkItem.ts`

| Field | Type | Meaning |
|---|---|---|
| `primaryReason` | `string` | The single highest-impact scoring factor (e.g., "Overdue item", "Blocked BIC item", "Unacknowledged") |
| `contributingReasons` | `string[]` | All scoring factors that contributed to the score (e.g., `["Overdue", "Project context", "Unread"]`) |
| `score` | `number` (optional) | The numeric score produced by the additive scoring model (P2-A2 §1) |

**Population:** Computed by `rankItems.ts::scoreItem()` during feed aggregation. Recalculated on every feed computation.

**Invariant:** The `primaryReason` and `score` MUST match the actual ranking position — if an item ranks first, its `rankingReason` must explain why.

### 1.2 `lifecycle: IMyWorkLifecyclePreview`

**Type definition:** `packages/my-work-feed/src/types/IMyWorkItem.ts`

| Field | Type | Meaning |
|---|---|---|
| `previousStepLabel` | `string \| null` | The workflow step the item just came from (e.g., "Sent", "Requested") |
| `currentStepLabel` | `string \| null` | Where the item is now (e.g., "Received", "Active", "Awaiting approval") |
| `nextStepLabel` | `string \| null` | The intended next step if the user acts (e.g., "Acknowledged", "Approved") |
| `blockedDependencyLabel` | `string \| null` | Why the item is blocked, if applicable (e.g., "Awaiting approval", "Waiting on requester") |
| `impactedRecordLabel` | `string \| null` | Which record or entity is affected by this item |

**Population:** Set by source adapters during item mapping. Domain adapters are responsible for providing meaningful labels. The aggregation pipeline does not modify lifecycle labels.

**Semantic rule:** `nextStepLabel` MUST describe the immediate next step the user is expected to take, not a distant future state.

### 1.3 `dedupe: IMyWorkDedupeMetadata`

**Type definition:** `packages/my-work-feed/src/types/IMyWorkItem.ts`

| Field | Type | Meaning |
|---|---|---|
| `dedupeKey` | `string` | The canonical key that identified the merged items (`{moduleKey}::{recordType}::{recordId}`) |
| `mergedSourceMeta` | `IMyWorkSourceMeta[]` | The complete list of sources that were merged into this item |
| `mergeReason` | `string` | Human-readable merge explanation (e.g., "Merged 2 items with key 'provisioning::request::req-123'") |

**Population:** Set by `dedupeItems.ts::dedupeItems()` only when deduplication occurs. Items that were not deduplicated do not carry this field.

**Rule:** The higher-weight source survives deduplication (P2-A2 §4). The lower-weight item's `sourceMeta` is merged into the survivor.

### 1.4 `supersession: IMyWorkSupersessionMetadata`

**Type definition:** `packages/my-work-feed/src/types/IMyWorkItem.ts`

| Field | Type | Meaning |
|---|---|---|
| `supersededByWorkItemId` | `string` | The ID of the work item that replaced this one |
| `supersessionReason` | `string` | Why the item was superseded (e.g., "Ownership transferred from Controller to Requester") |
| `originalRankingReason` | `IMyWorkRankingReason` | The ranking reason the item had before supersession |

**Population:** Set by `supersession.ts::applySupersession()` when a higher-weight source replaces a lower-weight source for the same record, or when BIC ownership transfers.

**Rule:** Superseded items have `state: 'superseded'` and are excluded from active feed rendering. They are retained for audit and history purposes.

### 1.5 `permissionState: IMyWorkPermissionState`

**Type definition:** `packages/my-work-feed/src/types/IMyWorkItem.ts`

| Field | Type | Meaning |
|---|---|---|
| `canOpen` | `boolean` | User can navigate to the item's source surface via `context.href` |
| `canAct` | `boolean` | User can perform feed mutations (mark-read, defer, pin) or trigger domain actions |
| `canDelegate` | `boolean` (optional) | User can hand this item off to another person |
| `canBulkAct` | `boolean` (optional) | User can select this item for bulk operations |
| `cannotActReason` | `string \| null` (optional) | If `canAct: false`, explains why (e.g., "Insufficient permissions", "Item is in read-only state") |

**Population:** Set by source adapters during item mapping. Default adapter permissions:

| Adapter | `canOpen` | `canAct` | Rationale |
|---|---|---|---|
| BIC adapter | `true` | `true` | User is the BIC owner — full action rights |
| Handoff adapter | `true` | `true` | User is the handoff recipient — can acknowledge/act |
| Notification adapter | `true` | `false` | Informational signal — user can view but not act on the notification itself |

---

## 2. Display and Disclosure Rules

Explainability data is displayed at three disclosure levels. Each field has an assigned level that determines where and how it appears.

### 2.1 Disclosure Levels

| Level | Surface | When Shown | Purpose |
|---|---|---|---|
| **List view** | Feed item row in the primary/watch/blocked lanes | Always visible in the feed | Quick context without interaction |
| **Reasoning drawer** | Slide-out panel triggered by explicit user action | On user request (click/tap "Why?") | Full explainability for a single item |
| **Internal only** | Not shown to users | Never | System telemetry and audit data |

### 2.2 Field-to-Disclosure Mapping

| Field | List View | Reasoning Drawer | Internal Only |
|---|---|---|---|
| `rankingReason.primaryReason` | Shown as a subtle label (e.g., "Overdue", "Blocked") | Shown with full context | — |
| `rankingReason.contributingReasons` | Not shown | Shown as bulleted list | — |
| `rankingReason.score` | Not shown | Not shown (numeric score is internal) | Logged for telemetry |
| `lifecycle.currentStepLabel` | Shown as item status | Shown with full lifecycle | — |
| `lifecycle.nextStepLabel` | Shown as action hint when available | Shown with full lifecycle | — |
| `lifecycle.previousStepLabel` | Not shown | Shown with full lifecycle | — |
| `lifecycle.blockedDependencyLabel` | Shown when item is blocked | Shown with dependency context | — |
| `lifecycle.impactedRecordLabel` | Shown as subtitle/context | Shown | — |
| `dedupe.mergeReason` | Not shown | Shown | — |
| `dedupe.mergedSourceMeta` | Not shown | Shown as source list | — |
| `dedupe.dedupeKey` | Not shown | Not shown | Logged for audit |
| `supersession.supersessionReason` | Not shown (item is hidden from active list) | Available via history | — |
| `supersession.supersededByWorkItemId` | Not shown | Available via history | — |
| `supersession.originalRankingReason` | Not shown | Available via history | — |
| `permissionState.canOpen` | Reflected in "Open" button enabled/disabled state | Shown | — |
| `permissionState.canAct` | Reflected in action button enabled/disabled state | Shown | — |
| `permissionState.cannotActReason` | Shown as tooltip on disabled actions | Shown with full explanation | — |
| `permissionState.canDelegate` | Reflected in "Delegate" action visibility | Shown | — |
| `permissionState.canBulkAct` | Reflected in checkbox visibility for bulk selection | Shown | — |

### 2.3 Display Invariants

- The numeric `score` MUST NOT be displayed to users. Ranking is explained through `primaryReason` and `contributingReasons`, not raw numbers.
- `cannotActReason` MUST always be accessible (via tooltip or drawer) when `canAct: false` — users must never encounter unexplained disabled actions.
- Superseded items MUST NOT appear in the active feed list. They are accessible only through history/audit views.
- The `dedupeKey` format (`{moduleKey}::{recordType}::{recordId}`) is an internal identifier and MUST NOT be displayed to users.

---

## 3. User Visibility Model

### 3.1 Item Visibility by Team Mode

| Team Mode | Items Visible | Populated By |
|---|---|---|
| `personal` | Items the user personally owns or needs to act on | BIC items where user is owner; handoff items where user is recipient; notification items for user |
| `delegated-by-me` | Items the user delegated to others | Items where `delegatedBy` matches current user |
| `my-team` | Items owned by the user's direct reports | Items where owner is a direct report of current user (requires elevated role) |

### 3.2 Explainability Data Visibility by Team Mode

| Field | Personal Mode | Delegated-By-Me Mode | My-Team Mode |
|---|---|---|---|
| `rankingReason` | Full access | Full access (user delegated the work) | `primaryReason` and `contributingReasons` visible; `score` remains internal |
| `lifecycle` | Full access | Full access | Full access (managers need to see workflow state) |
| `dedupe` | Full access | Full access | `mergeReason` visible; `mergedSourceMeta` visible |
| `supersession` | Full access (for own superseded items) | Not applicable | Not applicable (superseded items are not shown in team view) |
| `permissionState` | Full access | Read-only visibility (delegator cannot act on delegated items) | Read-only visibility (manager sees permissions but cannot act unless they are also the owner) |

### 3.3 Visibility Invariants

- Users MUST only see items they are entitled to view based on ownership, delegation, or team membership.
- A manager viewing team-mode feed MUST NOT see items owned by people outside their direct reports.
- Delegated-by-me mode shows items the user delegated — the delegator sees the item but cannot act on it (the delegatee owns the action).
- No user can see another user's personal feed in `personal` team mode.

---

## 4. Permission Rules and Inheritance

### 4.1 Permission Evaluation

Permissions are evaluated at two stages:

| Stage | When | Who Sets Permissions |
|---|---|---|
| **Adapter mapping** | When source data is mapped to `IMyWorkItem` | Each adapter (BIC, handoff, notification) sets initial permissions based on source context |
| **Deduplication** | When multiple items for the same record are merged | Permission preservation rules apply (§4.2) |

Permissions are NOT re-evaluated on every render. They are computed during feed aggregation and cached in the `IMyWorkItem`. If the user's role changes, permissions update on the next feed refresh.

### 4.2 Permission Inheritance During Deduplication

When multiple items are deduplicated, permissions are merged using these rules:

**Reference implementation:** `packages/my-work-feed/src/normalization/dedupeItems.ts`

| Rule | Logic | Rationale |
|---|---|---|
| **canAct: any-true-wins** | If any source item has `canAct: true`, the merged item has `canAct: true` | If any source grants action rights (e.g., BIC ownership), the user can act regardless of informational sources (notifications) that don't grant action |
| **isBlocked: any-true-wins** | If any source item has `isBlocked: true`, the merged item has `isBlocked: true` | Blocked status from any source is a signal that should not be hidden by merging |
| **cannotActReason: first-available** | If `canAct: false` after merge, use the first non-null `cannotActReason` from the source items | Provides the most specific explanation available |

### 4.3 Permission Rules

- **canOpen** is `true` unless the deep link (`context.href`) is broken or the user lacks view entitlement to the source surface.
- **canAct** is `true` when the user has the authority to perform feed mutations or trigger domain actions on this item.
- **canDelegate** is `true` only when the item supports delegation and the user has delegation authority.
- **canBulkAct** is `true` only when the item is eligible for bulk operations (same action type, same permission level).
- **cannotActReason** MUST be populated whenever `canAct: false` — an empty reason with a disabled action is a policy violation.

---

## 5. Role-Based Entitlement Rules

### 5.1 Entitlement by Role

| Entitlement | Standard Roles | Elevated Roles | Admin |
|---|---|---|---|
| View own items (`personal` mode) | Yes | Yes | Yes |
| View delegated items (`delegated-by-me` mode) | Yes (if delegations exist) | Yes | Yes |
| View team items (`my-team` mode) | No | Yes | Yes |
| See ranking reasons for own items | Yes | Yes | Yes |
| See ranking reasons for team items | N/A | Yes — `primaryReason` and `contributingReasons` | Yes |
| See lifecycle labels for team items | N/A | Yes | Yes |
| Act on team items | N/A | No (read-only visibility) | Only if also the item owner |
| Access reasoning drawer | Yes (own items) | Yes (own + team items) | Yes |

### 5.2 Entitlement Invariants

- Role-based entitlement is resolved from `@hbc/auth` role definitions — no parallel custom role logic (per P2-B0).
- "Elevated role" means a role that has the `my-team` team-mode entitlement. The exact role set is defined by `@hbc/auth` and documented in P2-D1.
- Entitlement rules are the same in PWA and SPFx (per P2-B0 cross-lane consistency rule 6).
- A manager seeing team items has **read-only** visibility by default — they can see ranking reasons and lifecycle state but cannot act on items they don't own.

---

## 6. Reasoning Payload Contract

### 6.1 Payload Type

**Reference:** `packages/my-work-feed/src/types/IMyWorkRegistry.ts`

```
IMyWorkReasoningPayload {
  workItemId: string
  canonicalKey: string
  title: string
  rankingReason: IMyWorkRankingReason
  lifecycle: IMyWorkLifecyclePreview
  permissionState: IMyWorkPermissionState
  sourceMeta: IMyWorkSourceMeta[]
  dedupeInfo?: IMyWorkDedupeMetadata
  supersessionInfo?: IMyWorkSupersessionMetadata
}
```

### 6.2 Payload Assembly

The reasoning payload is built by `useMyWorkReasoning.ts::buildReasoningPayload()` from the `IMyWorkItem` fields. It assembles all explainability data for a single item into a display-ready bundle.

### 6.3 Reasoning Drawer Rules

| Rule | Specification |
|---|---|
| **Trigger** | Explicit user action — click/tap on a "Why?" or reasoning affordance. Not shown automatically |
| **Content** | All reasoning-drawer-level fields from §2.2 |
| **Score display** | Numeric `score` is NOT shown; ranking is explained through `primaryReason` and `contributingReasons` |
| **Source metadata** | Show source names and last-updated timestamps. Do NOT show internal source identifiers or dedupeKey format |
| **Deduplication info** | If present, show `mergeReason` and list of merged sources by name. Do NOT show `dedupeKey` |
| **Supersession info** | If the user has superseded items in history, show `supersessionReason`. Do NOT show `supersededByWorkItemId` as a raw ID |
| **Permission explanation** | Show `cannotActReason` when applicable. Show which actions are available and which are restricted |
| **Accessibility** | Reasoning drawer MUST be keyboard-navigable and screen-reader accessible |

---

## 7. Update Timing and Consistency

### 7.1 When Explainability Fields Are Computed

| Field | Computation Timing | Update Behavior |
|---|---|---|
| `rankingReason` | Recomputed on every feed aggregation | Always reflects the current scoring model |
| `lifecycle` | Set at adapter mapping time | Updates when source data changes (on next feed refresh) |
| `dedupe` | Set during deduplication pass | Updates if source set changes (new source appears, source retracts) |
| `supersession` | Set during supersession pass | One-time — superseded items do not change state |
| `permissionState` | Set at adapter mapping time | Updates on next feed refresh after role/permission change |

### 7.2 Consistency Guarantees

| Guarantee | Rule |
|---|---|
| **Ranking-reason accuracy** | `rankingReason` MUST match the actual ranking position. If the ranking algorithm places item A above item B, item A's `rankingReason.score` must be ≥ item B's score |
| **Lifecycle freshness** | Lifecycle labels reflect the state at last feed computation. They may be stale if the source surface has changed since the last refresh |
| **Permission freshness** | Permission state is evaluated at feed computation time. Role changes take effect on the next feed refresh, not in real-time |
| **Cross-surface consistency** | The same item viewed in PWA full feed, PWA panel, and SPFx companion MUST show the same explainability data (P2-B0 cross-lane consistency) |

### 7.3 Staleness Handling

When the feed is stale (any source not in `live` state per P2-A1 §8):
- Explainability data from stale sources MUST be treated as potentially outdated.
- The feed MUST display a sync-state indicator per P2-A1 §8.1.
- Stale items MUST NOT be hidden — they are shown with a staleness cue.
- `rankingReason` for stale items still reflects the last-computed ranking; the staleness cue communicates that the underlying data may have changed.

---

## 8. Cross-Lane Visibility Consistency

Per P2-B0 cross-lane consistency rule 6, the following visibility rules MUST remain consistent across PWA and SPFx:

| Rule | PWA | SPFx | Enforcement |
|---|---|---|---|
| Delegated/team visibility entitlement | Full team mode support | Governed companion summary of team items | Same entitlement checks; SPFx shows subset of same data |
| Permission state | Full display | Same permission state for displayed items | Same `IMyWorkPermissionState` data |
| Ranking reason | Full reasoning drawer available | `primaryReason` label visible on items | Same `IMyWorkRankingReason` data |
| Lifecycle labels | Full display | `currentStepLabel` visible on items | Same `IMyWorkLifecyclePreview` data |
| Action vocabulary | Full action set | Light actions only (per P2-B0) | SPFx restricts actions but uses same permission model |

### 8.1 Cross-Lane Invariants

- The same item MUST carry the same `permissionState` regardless of which surface displays it.
- SPFx companion may show fewer explainability fields (due to surface constraints), but MUST NOT show conflicting data.
- Team-mode entitlement checks are resolved identically in both surfaces — `@hbc/auth` is the single source of role resolution.

---

## 9. Acceptance Gate Reference

P2-A3 contributes evidence for the Work-surface gate:

| Field | Value |
|---|---|
| **Gate** | Work-surface gate |
| **Pass condition** | Hub remains task-first and responsibility-first, not a generic dashboard |
| **P2-A3 evidence** | Explainability rules ensure ranking is user-understandable (not opaque algorithm); visibility rules ensure users see only what they're entitled to; permission rules ensure clear action boundaries |
| **Primary owner** | Product/Design + Experience |

Explainability prevents the hub from becoming opaque by ensuring every ranking decision has a human-readable reason. Visibility rules prevent the hub from becoming a surveillance tool by limiting team-mode access to entitled roles with read-only defaults.

---

## 10. Locked Decisions

The following decisions from Phase 2 §16 are locked and directly govern explainability and visibility:

| Decision | Locked Resolution | P2-A3 Consequence |
|---|---|---|
| Work ranking | Weighted mix of ownership, urgency, aging, project importance, blocking status, and role context | All factors must be explainable via `rankingReason` |
| Top-level organization | Responsibility lanes first, with time-horizon cues layered inside | Explainability is per-item within lanes, not per-lane |
| Delegated/team lanes | Limited and only for eligible elevated roles | Team-mode visibility is role-gated, not universally available |
| Multi-role default | Primary active role context | Permission evaluation uses the active role, not all roles |
| Multi-role governance source | `@hbc/auth` role definitions | Entitlement is resolved from `@hbc/auth`, not custom logic |

---

## 11. Policy Precedence

| Deliverable | Relationship to P2-A3 |
|---|---|
| **P2-A1** — Operating Model Register | P2-A3 explains the data produced by the operating model. P2-A3 MUST NOT contradict lane structure, lifecycle rules, or ownership identity rules from P2-A1 |
| **P2-A2** — Ranking Policy | P2-A3 defines how to display the `rankingReason` data that P2-A2's scoring model produces. Display rules MUST NOT expose raw score to users |
| **P2-B0** — Lane Ownership and Coexistence | P2-A3 enforces cross-lane visibility consistency per P2-B0 cross-lane consistency rules |
| **P2-D1** — Role-to-Hub Entitlement Matrix | P2-D1 must use the entitlement framework defined in P2-A3 §5. The detailed role-to-entitlement mapping lives in P2-D1; P2-A3 defines the governing rules |
| **P2-C1–C5** — Work Sources and Handoff | Source adapters must populate explainability fields correctly per the field reference in §1 |

If a downstream deliverable conflicts with this policy, this policy takes precedence for explainability semantics, display rules, and visibility entitlement.

---

**Last Updated:** 2026-03-19
**Governing Authority:** [Phase 2 Plan §10.1](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
