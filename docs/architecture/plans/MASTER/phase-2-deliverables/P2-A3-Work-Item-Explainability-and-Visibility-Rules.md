# P2-A3: Work-Item Explainability and Visibility Rules

| Field | Value |
|---|---|
| **Doc ID** | P2-A3 |
| **Phase** | Phase 2 |
| **Workstream** | A — Personal Work Hub Operating Model |
| **Document Type** | Governance Policy |
| **Owner** | Experience / Shell Team |
| **Update Authority** | Experience lead; changes require review by Platform lead and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-D1](P2-D1-Role-to-Hub-Entitlement-Matrix.md); [interaction-contract §6](../../../reference/work-hub/interaction-contract.md); `IMyWorkItem.ts`; `IMyWorkQuery.ts`; `IMyWorkRegistry.ts`; `HbcMyWorkReasonDrawer`; `notificationAdapter.ts`; `@hbc/complexity`; `@hbc/auth` |

---

## Policy Statement

Every work item in the Personal Work Hub must carry sufficient explainability data for users to understand why it appears, what stage it is in, what they can do with it, and what restrictions apply. Visibility and permission rules must remain personal-first, role-governed, and cross-surface consistent. Users must never encounter opaque ranking, unexplained disabled actions, or hidden access-boundary behavior.

This policy locks the explainability field semantics, disclosure rules, complexity-tier behavior, visibility posture, permission enforcement rules, reasoning payload contract, and cross-surface consistency expectations for Phase 2.

This refined version also distinguishes between:

- **locked target-state policy** that downstream implementation must follow, and
- **current repo-truth drift** that must be corrected before this policy can be treated as execution-complete.

---

## Policy Scope

### This policy governs

- Semantics and population rules for all explainability fields on `IMyWorkItem`
- Display and disclosure rules for list view, reasoning drawer, and internal-only data
- Explainability access and depth by `@hbc/complexity` tier
- Personal, delegated, and elevated-role team visibility posture for first release
- Permission field semantics and strict enforcement expectations
- Permission inheritance during deduplication
- Reasoning payload assembly and drawer behavior
- Cross-lane visibility consistency between PWA and SPFx surfaces
- Required reconciliation notes where current shared package behavior still drifts from the locked policy

### This policy does NOT govern

- Scoring coefficients, tie-breaking rules, or lane assignment math — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Responsibility-lane structure and operating-model invariants — see [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md)
- PWA/SPFx lane ownership and shell coexistence doctrine — see [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md)
- Freshness thresholds and stale/offline trust rules beyond explainability implications — see P2-B3
- The detailed role-to-entitlement matrix — see [P2-D1](P2-D1-Role-to-Hub-Entitlement-Matrix.md)
- Source tranche classification and adapter rollout sequencing — see P2-C1 through P2-C5

---

## Definitions

| Term | Meaning |
|---|---|
| **Explainability field** | A structured data field on a work item that explains ranking, lifecycle, origin, merge history, or permission state |
| **Reasoning payload** | The bundle of explainability data for a single work item, assembled for display in the reasoning drawer |
| **Reasoning drawer** | A user-invoked disclosure surface that explains why an item surfaced, what state it is in, and what the user can or cannot do |
| **Disclosure level** | The detail layer at which a field is shown: list-view cue, reasoning-drawer detail, or internal-only |
| **Complexity tier** | The user-experience depth selected through `@hbc/complexity` (`essential`, `standard`, `expert`) |
| **Visibility entitlement** | The set of items and explainability data a user is authorized to see based on ownership, delegation state, role, and governing entitlements |
| **Team summary / escalation surface** | A manager-facing summary surface showing governed team indicators, counts, or escalation candidates without treating team work as a standing personal-work lane |
| **Direct-report item feed** | A full item-level `my-team` feed showing direct-report work items; this is not considered first-release complete until org-chart and entitlement plumbing is implemented |
| **Permission inheritance** | The merge rules applied to permission state when multiple source items for the same canonical record are deduplicated into one |
| **Supersession** | The process by which one work item replaces another and marks the older item as `superseded` |

---

## 1. Explainability Fields Reference

Every `IMyWorkItem` carries explainability data. This section defines the semantics, population rules, and intended use of each field.

### 1.1 `rankingReason: IMyWorkRankingReason`

**Type definition:** `packages/my-work-feed/src/types/IMyWorkItem.ts`

| Field | Type | Meaning |
|---|---|---|
| `primaryReason` | `string` | The single highest-impact reason the item surfaced where it did (for example: "Overdue item", "Blocked BIC item", "Unread notification") |
| `contributingReasons` | `string[]` | Additional factors that contributed to surfacing or ordering |
| `score` | `number` (optional) | Internal numeric ranking output produced by the additive ranking model |

**Population:** Computed by ranking/normalization during feed aggregation.

**Policy rule:** `primaryReason` and `contributingReasons` MUST truthfully explain the actual ordering outcome. Numeric `score` may exist in the model for system logic, audit, or telemetry, but remains internal-only.

### 1.2 `lifecycle: IMyWorkLifecyclePreview`

**Type definition:** `packages/my-work-feed/src/types/IMyWorkItem.ts`

| Field | Type | Meaning |
|---|---|---|
| `previousStepLabel` | `string \| null` | The workflow state the item just came from |
| `currentStepLabel` | `string \| null` | The state the item is currently in |
| `nextStepLabel` | `string \| null` | The immediate next expected state if the user or owning actor acts |
| `blockedDependencyLabel` | `string \| null` | The dependency currently blocking progress, if any |
| `impactedRecordLabel` | `string \| null` | The record, entity, or artifact materially affected by the item |

**Population:** Set by source adapters during item mapping.

**Policy rule:** `nextStepLabel` must describe the immediate next meaningful movement, not a distant or generic future state.

### 1.3 `dedupe: IMyWorkDedupeMetadata`

**Type definition:** `packages/my-work-feed/src/types/IMyWorkItem.ts`

| Field | Type | Meaning |
|---|---|---|
| `dedupeKey` | `string` | Canonical merge key used by normalization |
| `mergedSourceMeta` | `IMyWorkSourceMeta[]` | Source list combined into the surviving item |
| `mergeReason` | `string` | Human-readable explanation of why items were merged |

**Population:** Set only when deduplication occurs.

**Policy rule:** The user-facing disclosure must explain that sources were merged, but must not expose raw canonical keys or internal key format.

### 1.4 `supersession: IMyWorkSupersessionMetadata`

**Type definition:** `packages/my-work-feed/src/types/IMyWorkItem.ts`

| Field | Type | Meaning |
|---|---|---|
| `supersededByWorkItemId` | `string` | Internal ID of the item that replaced this one |
| `supersessionReason` | `string` | Human-readable explanation of why the prior item was replaced |
| `originalRankingReason` | `IMyWorkRankingReason` | Ranking explanation the superseded item had before replacement |

**Population:** Set during supersession handling when one item formally replaces another.

**Policy rule:** Superseded items are excluded from the active feed and only exposed through governed history/audit contexts.

### 1.5 `permissionState: IMyWorkPermissionState`

**Type definition:** `packages/my-work-feed/src/types/IMyWorkItem.ts`

| Field | Type | Meaning |
|---|---|---|
| `canOpen` | `boolean` | User can navigate to the source surface or detail context |
| `canAct` | `boolean` | User can execute feed actions or source-domain actions from the work item |
| `canDelegate` | `boolean` (optional) | User can delegate the item |
| `canBulkAct` | `boolean` (optional) | User can include the item in bulk operations |
| `cannotActReason` | `string \| null` (optional) | Required explanation whenever `canAct: false` |

**Population:** Set by source adapters and preserved through normalization/deduplication rules.

**Policy rule:** `cannotActReason` MUST be populated whenever `canAct: false`. A disabled action without a reason is a policy violation.

---

## 2. Display and Disclosure Rules

Explainability data is displayed at three disclosure levels.

### 2.1 Disclosure Levels

| Level | Surface | When Shown | Purpose |
|---|---|---|---|
| **List view** | Work item row / card in feed surfaces | Always when the item is visible | Quick context without extra interaction |
| **Reasoning drawer** | User-invoked explainability surface | On explicit user request and only when allowed by complexity tier | Full human-readable explanation |
| **Internal only** | Not shown to end users | Never displayed in user-facing surfaces | System logic, telemetry, audit, diagnostics |

### 2.2 Field-to-Disclosure Mapping

| Field | List View | Reasoning Drawer | Internal Only |
|---|---|---|---|
| `rankingReason.primaryReason` | Shown as concise cue / label | Shown with fuller context | — |
| `rankingReason.contributingReasons` | Not shown | Shown | — |
| `rankingReason.score` | Not shown | Not shown | Yes |
| `lifecycle.currentStepLabel` | Shown when meaningful | Shown | — |
| `lifecycle.nextStepLabel` | Shown as action hint when meaningful | Shown | — |
| `lifecycle.previousStepLabel` | Not shown | Shown | — |
| `lifecycle.blockedDependencyLabel` | Shown when blocked | Shown | — |
| `lifecycle.impactedRecordLabel` | Shown as contextual subtitle where useful | Shown | — |
| `dedupe.mergeReason` | Not shown | Shown | — |
| `dedupe.mergedSourceMeta` | Not shown | Shown as named sources / provenance | — |
| `dedupe.dedupeKey` | Not shown | Not shown | Yes |
| `supersession.supersessionReason` | Not shown in active feed | Shown only in history/audit contexts | — |
| `supersession.supersededByWorkItemId` | Not shown | Not shown as raw ID | Yes |
| `supersession.originalRankingReason` | Not shown in active feed | History/audit only | — |
| `permissionState.canOpen` | Reflected in open affordance state | Shown | — |
| `permissionState.canAct` | Reflected in action enabled/disabled state | Shown | — |
| `permissionState.cannotActReason` | Accessible wherever an action is disabled | Shown | — |
| `permissionState.canDelegate` | Reflected in delegate affordance visibility/state | Shown | — |
| `permissionState.canBulkAct` | Reflected in bulk-select affordance visibility/state | Shown | — |

### 2.3 Display Invariants

- Raw numeric ranking score MUST NOT be displayed to end users at any complexity tier.
- Disabled or unavailable actions MUST always have an accessible human-readable explanation.
- Superseded items MUST NOT appear in active feed rendering.
- Internal identifiers such as `dedupeKey`, raw work item IDs, and raw supersession target IDs MUST NOT be surfaced in end-user UI.
- Explainability must remain human-readable. The system may retain machine-oriented metadata internally, but it must not leak internal contract details into user-facing copy.

---

## 3. Explainability Access by Complexity Tier

Explainability depth is governed through the existing `@hbc/complexity` shared feature package.

### 3.1 Locked Tier Behavior

| Complexity Tier | Drawer Access | Required Explainability Depth |
|---|---|---|
| **essential** | No reasoning drawer | List-level cues only (`primaryReason`, current status, action state, blocked cue if applicable) |
| **standard** | Yes | "Why surfaced" plus lifecycle and permission explanation |
| **expert** | Yes | Everything in `standard` plus source provenance, dedupe summary, and supersession summary where applicable |

### 3.2 Tier Rules

- `essential` MUST NOT open a reasoning drawer.
- `standard` MUST include enough information for a user to understand why the item surfaced and what they can or cannot do.
- `expert` MAY show deeper provenance and merge/supersession context, but MUST NOT show raw numeric ranking score.
- Team-related summary or item visibility follows the same complexity-tier disclosure boundaries; elevated role does not override complexity policy.
- Complexity tier affects disclosure depth, not entitlement. A user must still be entitled to view the underlying item or summary.

### 3.3 Drawer Content Rules

| Drawer Step | Standard | Expert |
|---|---|---|
| Why Surfaced | Yes | Yes |
| Lifecycle & Permissions | Yes | Yes |
| Source Provenance | No | Yes |
| Dedupe Summary | Optional if relevant | Yes if relevant |
| Supersession Summary | History/audit contexts only | History/audit contexts only |
| Raw Numeric Score | No | No |

---

## 4. User Visibility Model

### 4.1 First-Release Visibility Posture

Phase 2 remains **personal-first**. Team visibility is additive and governed, not a standing fifth personal-work lane.

| Mode / Surface | First-Release Status | What Is Visible |
|---|---|---|
| `personal` | Locked for first release | Items the user owns, receives, or personally needs to review/act on |
| `delegated-by-me` | Locked for first release | Items the user delegated to others, subject to governed read-only visibility where the delegator no longer owns the action |
| Team summary / escalation surfaces | Locked for first release for eligible elevated roles | Counts, escalation candidates, or governed summary indicators derived from eligible team items |
| Full direct-report item-level `my-team` feed | Deferred | Not considered complete until org-chart and entitlement plumbing is implemented |

### 4.2 Team Visibility Rule

For first release, elevated users may receive governed team summary or escalation visibility, but the plan must not assume that full direct-report item-level visibility is already fully implemented. Full direct-report item feeds require future completion of:

- org-chart / manager-of-record resolution,
- role-governed entitlement plumbing,
- boundary validation that prevents exposure outside the true report chain.

### 4.3 Locked Future Note

**Required implementation note:**  
Future completion of the org-chart / entitlement plumbing is required before true direct-report item visibility is considered complete. Until that work is finished, this policy treats team visibility as summary/escalation-first rather than a fully realized standing item feed.

### 4.4 Visibility Invariants

- No user may see another user’s personal feed through `personal` mode.
- Delegated-by-me visibility does not automatically imply action authority.
- Team visibility must be entitlement-governed and limited to valid reporting boundaries.
- Explainability disclosure for team contexts must remain consistent with complexity tier and role entitlement.
- Team visibility is not allowed to silently bypass personal-first operating model rules from P2-A1.

---

## 5. Permission Rules and Enforcement

### 5.1 Permission Evaluation Stages

| Stage | When | Responsibility |
|---|---|---|
| Adapter mapping | Source item is mapped into `IMyWorkItem` | Source adapter sets initial permission state |
| Normalization / deduplication | Multiple items for same canonical record are merged | Shared normalization preserves or merges permission state |
| UI rendering | Item is rendered on any surface | Shared UI honors permission state and disables or hides actions accordingly |
| Action execution | User attempts an action | Action layer rejects execution that is not allowed by permission state |

### 5.2 Strict Enforcement Rules

- `cannotActReason` is required whenever `canAct: false`.
- UI components MUST NOT render an action as effectively executable when `permissionState` says it is unavailable.
- Action hooks / dispatch layers MUST reject attempts to execute actions that permission state does not allow.
- "You cannot act on this item" is acceptable only as a fallback. Adapters should provide a specific reason whenever the source can supply one.
- Read-only visibility for delegated or team-related contexts must remain visually clear.

### 5.3 Permission Inheritance During Deduplication

| Rule | Logic | Rationale |
|---|---|---|
| **canAct: any-true-wins** | If any merged source grants action rights, the surviving merged item may remain actionable | Prevents informational sources from stripping legitimate action rights |
| **cannotActReason: required when merged result is not actionable** | If merged result ends with `canAct: false`, a reason must survive normalization | Prevents disabled-without-explanation outcomes |
| **blocked state: any-true-wins** | If any merged source says blocked, the merged item remains blocked | Preserves meaningful stop signals |
| **delegate / bulk flags** | Preserve only where the resulting action remains valid for the merged item | Prevents overstating action rights after merge |

### 5.4 Permission Invariants

- `canOpen` and `canAct` are distinct and must not be conflated.
- Informational signals may be viewable while remaining non-actionable.
- A manager seeing governed team summary or read-only team information is not automatically granted action authority.
- Cross-surface rendering must not disagree about whether an item is actionable.

---

## 6. Role-Based Entitlement Rules

### 6.1 Entitlement by Role Class

| Entitlement | Standard Roles | Elevated Roles | Admin |
|---|---|---|---|
| View own items (`personal`) | Yes | Yes | Yes |
| View delegated items (`delegated-by-me`) | Yes, if relevant | Yes | Yes |
| View team summary / escalation surfaces | No | Yes, when granted by `@hbc/auth` | Yes |
| View full direct-report item feed | Deferred | Deferred until plumbing is complete | Deferred until plumbing is complete unless explicitly governed later |
| Access reasoning drawer | Per complexity tier | Per complexity tier | Per complexity tier |
| Act on another user’s item solely because it is visible in team context | No | No | No, unless separately entitled and also the effective actor/owner |

### 6.2 Entitlement Rules

- Role-based entitlement is resolved through `@hbc/auth`. No parallel bespoke role system is allowed.
- "Elevated role" means a role granted the relevant summary/team visibility entitlements in P2-D1.
- Complexity tier does not create entitlement; it only governs explainability depth.
- Entitlement rules must remain consistent between PWA and SPFx surfaces.

---

## 7. Reasoning Payload Contract

### 7.1 Payload Shape

Reasoning payload assembly continues to rely on the shared registry / reasoning hooks, but downstream implementation must treat this policy as the governing disclosure contract.

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

### 7.2 Payload Assembly Rules

- The reasoning payload is assembled from the canonical work-item fields, not from a separate competing explainability model.
- The reasoning drawer must remain a display of existing governed fields, not a place to invent new ranking logic or entitlement logic.
- Missing source provenance or permission explanation should be treated as adapter-quality issues, not as justification to bypass this policy.

### 7.3 Drawer Rules

| Rule | Specification |
|---|---|
| **Trigger** | Explicit user action only |
| **Complexity gating** | Drawer availability and depth follow Section 3 |
| **Score display** | Raw numeric score is never shown |
| **Lifecycle / permission explanation** | Standard and expert tiers must explain current state and actionability |
| **Source provenance** | Expert tier may show source names, timestamps, and human-readable provenance |
| **Dedupe disclosure** | Show human-readable merge explanation, not raw canonical keys |
| **Supersession disclosure** | Show human-readable supersession explanation only in governed history/audit contexts |
| **Accessibility** | Drawer must be keyboard navigable and screen-reader accessible |

---

## 8. Update Timing and Consistency

### 8.1 Computation Timing

| Field | Timing | Update Behavior |
|---|---|---|
| `rankingReason` | Feed aggregation time | Recomputed whenever ranking is recomputed |
| `lifecycle` | Adapter mapping time | Updates on next refresh when source state changes |
| `dedupe` | Deduplication pass | Updates when source set or merge outcome changes |
| `supersession` | Supersession pass | Set when replacement occurs; not part of active list rendering |
| `permissionState` | Adapter mapping plus normalization | Refreshes on next feed computation after source/role changes |

### 8.2 Consistency Guarantees

- Ranking explanation must remain consistent with actual ordering.
- Explainability data may become stale if sources are stale, but stale items must not silently disappear solely because of explainability uncertainty.
- The same visible item must carry the same permission state and same core explainability fields across PWA and SPFx displays.
- Surfaces may show less information because of surface constraints or complexity tier, but they must not show contradictory information.

---

## 9. Cross-Lane Visibility Consistency

Per P2-B0, PWA owns the full personal-work home and SPFx remains a governed companion surface. Explainability and entitlement semantics must remain consistent across both.

| Rule | PWA | SPFx | Enforcement |
|---|---|---|---|
| Personal visibility | Full owned experience | Governed companion subset | Same entitlement source |
| Delegated visibility | Supported where allowed | Supported only where companion doctrine allows | Same entitlement source |
| Team summary / escalation visibility | Full governed summary surface | Companion summary only | Same entitlement source |
| Full direct-report item feed | Deferred | Deferred | Must not be claimed complete before plumbing is delivered |
| Permission state | Full display and enforcement | Same underlying state for displayed items | Same `IMyWorkPermissionState` semantics |
| Explainability | Full by complexity tier | Condensed by surface and complexity tier | Same canonical data, different presentation depth |

### 9.1 Cross-Lane Invariants

- The same item must not be actionable in one surface and non-actionable in another without a real entitlement difference.
- SPFx may show a smaller subset of explainability data, but it must not contradict the PWA representation.
- Team and delegated visibility must use the same entitlement vocabulary and checks across both hosts.

---

## 10. Required Repo-Truth Reconciliation Notes

This section is intentionally normative. These items are known current-state drifts that must be reconciled for execution readiness.

### 10.1 Stale lane encoding

Current shared type definitions still include a `delegated-team` lane. That conflicts with the tightened personal-first operating model direction from P2-A1, where delegated/team visibility is governed as a projection or secondary surface concern rather than a standing primary responsibility lane.

**Required consequence:** downstream implementation must not treat `delegated-team` as the policy truth for first release. Package cleanup or compatibility handling must be planned.

### 10.2 Complexity drawer behavior is partly right, partly drifting

Current reasoning drawer behavior already uses `@hbc/complexity` and already gates the drawer out for `essential`. That is aligned with this policy. However, current expert-tier behavior still exposes raw numeric ranking score.

**Required consequence:** keep the complexity-tier model, but remove end-user score exposure.

### 10.3 Non-actionable notification items are under-specified

Current notification mapping produces non-actionable items, but known repo state does not consistently guarantee a populated `cannotActReason`.

**Required consequence:** adapters must be tightened so any non-actionable item supplies a reason, and shared UI/action layers must enforce it.

### 10.4 Team feed contracts exist before full team plumbing is complete

Current shared query and team-feed contracts include `teamMode` and a team-feed result projection. That does not, by itself, prove that direct-report item visibility is release-complete.

**Required consequence:** implementation and planning docs must carry an explicit note that true direct-report item visibility remains dependent on future org-chart / entitlement plumbing.

---

## 11. Acceptance Gate Reference

P2-A3 contributes evidence for the Work-surface gate.

| Field | Value |
|---|---|
| **Gate** | Work-surface gate |
| **Pass condition** | Hub remains task-first and responsibility-first, not a generic dashboard or opaque surveillance surface |
| **P2-A3 evidence** | Explainability remains human-readable, visibility stays entitlement-governed, and permission boundaries are explicit and enforceable |
| **Primary owner** | Product / Design + Experience |

Explainability prevents the hub from becoming an opaque algorithmic feed. Visibility rules prevent it from becoming a role-leak or surveillance surface. Strict permission-state enforcement prevents false action affordances that would erode user trust.

---

## 12. Locked Decisions

The following decisions are now locked for this policy version.

| Decision | Locked Resolution | P2-A3 Consequence |
|---|---|---|
| Explainability disclosure depth | Governed by `@hbc/complexity` | Essential has no drawer; standard/expert have graduated disclosure |
| Raw ranking score exposure | Hidden from all end users | Expert tier may get more provenance, but never raw score |
| Team visibility in first release | Hybrid | Personal-first home, with governed team summary/escalation surfaces only |
| Direct-report item feed completeness | Deferred | Requires future org-chart / entitlement plumbing before treated as complete |
| Permission enforcement | Strict now | Adapters, UI, and action hooks must all honor permission state |
| Role governance source | `@hbc/auth` | No parallel custom role logic |

---

## 13. Policy Precedence

| Deliverable | Relationship to P2-A3 |
|---|---|
| **P2-A1** — Operating Model Register | P2-A3 must not contradict the personal-first operating model, lane posture, or visibility doctrine locked in P2-A1 |
| **P2-A2** — Ranking Policy | P2-A3 governs how ranking output is explained, not how ranking is calculated |
| **P2-B0** — Lane Ownership and Coexistence | P2-A3 must remain consistent with PWA-owned full home and SPFx companion doctrine |
| **P2-D1** — Role-to-Hub Entitlement Matrix | P2-D1 defines exact role mappings using the rules established here |
| **P2-C1–C5** — Work Sources and Handoff | Source adapters must populate explainability and permission fields consistently with this policy |

If any downstream deliverable conflicts with this document on explainability semantics, disclosure, visibility posture, or permission enforcement, this policy takes precedence unless Architecture formally supersedes it.

---

**Last Updated:** 2026-03-20  
**Governing Authority:** [Phase 2 Plan §10.1](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
