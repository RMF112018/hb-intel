# P2-C3: Work-Item Navigation Matrix

| Field | Value |
|---|---|
| **Doc ID** | P2-C3 |
| **Phase** | Phase 2 |
| **Workstream** | C — Shared Work Sources, Signals, and Handoff Rules |
| **Document Type** | Specification |
| **Owner** | Experience / Shell + Product |
| **Update Authority** | Experience lead; changes require review by Product and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §9.3, §9.4, §10.3, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md); [P2-C2](P2-C2-Notification-to-Work-Mapping-Policy.md); [P2-C4](P2-C4-Handoff-Criteria-Matrix.md); [interaction-contract §4–§5](../../../reference/work-hub/interaction-contract.md); [setup-handoff-routes](../../../reference/workflow-experience/setup-handoff-routes.md) |

---

## Specification Statement

Work items do not all open the same way. This specification defines the approved destination patterns for first-release work items, maps each Wave 1 source to its required navigation behavior, establishes the boundary between feed mutations and destination-surface work, and locks the SPFx companion navigation envelope so the companion lane does not drift into a second full operating home.

**Repo-truth audit — 2026-03-20.** All material verifiable claims confirmed against live code. Route paths in §4 are repo-true: `/project-review/$requestId` confirmed in `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`; `clarification-return` mode confirmed in `apps/pwa/src/routes/project-setup/ProjectSetupPage.tsx` and `apps/pwa/src/routes/projects/ProjectsPage.tsx`; admin provisioning-oversight seam confirmed in `apps/accounting` and `apps/estimating/src/components/project-setup/RetrySection.tsx`. `project-health-pulse` source key confirmed as repo truth in `packages/features/project-hub/src/health-pulse/integrations/bicNextMoveAdapter.ts` (`moduleKey: 'project-health-pulse'`). Pattern 4 offline-capable action set matches `MY_WORK_REPLAYABLE_ACTIONS` exactly. §2.4 implementation gap (`acknowledge`, `reject`, `dismiss` absent from replayable set) confirmed against `useMyWorkActions()` in `packages/my-work-feed/src/hooks/useMyWorkActions.ts`. `docs/reference/work-hub/interaction-contract.md` reference confirmed live. No inaccuracies found.

This document is also a **reconciliation specification**. Current repo truth contains a mix of live routes, cross-app launch seams, and Wave 1 callback placeholders. This file therefore distinguishes between:

- **repo-true current destinations**,
- **repo-true launch seams**, and
- **target-state destination posture**.

No downstream implementation may present a target-state route as if it were already live without explicitly marking it as a future seam.

---

## Spec Scope

### This specification governs

- Allowed destination patterns for first-release work items
- Per-source navigation assignments for the Wave 1 source tranche
- Action-type classification: navigation vs feed mutation vs destination-surface mutation
- Deep-link / launch-seam construction rules
- SPFx companion navigation limits
- Project-significance routing posture relative to Project Hub
- Fallback behavior for missing / invalid destinations
- Return-continuity expectations after destination-surface work

### This specification does NOT govern

- Ranking, scoring, or lane assignment — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Source readiness classification — see [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md)
- Notification tier mapping — see [P2-C2](P2-C2-Notification-to-Work-Mapping-Policy.md)
- Detailed handoff-significance scoring — see [P2-C4](P2-C4-Handoff-Criteria-Matrix.md)
- Return-memory implementation details — see [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Destination pattern** | A locked navigation behavior governing what happens when a user acts on a work item |
| **Repo-true current destination** | A route or page that exists in current code and can be cited as live repo truth |
| **Launch seam** | A current code path that launches into another app / surface via env-based URL or callback seam rather than a fully governed route contract |
| **Target-state destination** | A planned authoritative destination not yet fully established as a repo-true live route |
| **Preview** | A summary / detail disclosure shown before full navigation |
| **Light in-place action** | A single-step feed-level action that does not require leaving the current surface |
| **Project-significant work** | Work whose primary value lies in project-level coordination context rather than solely in personal next action |

---

## 1. Approved Destination Patterns

Phase 2 first release locks four approved destination patterns. Every first-release work item must use one or more of these patterns.

### Pattern 1 — Direct Deep-Link

| Aspect | Specification |
|---|---|
| **Behavior** | The user navigates directly to the authoritative destination surface or route/launch seam |
| **When used** | The destination is simple, unambiguous, and does not require preview-first handling |
| **Typical use** | Approvals, provisioning review, most domain-owned personal work |
| **Examples** | Accounting project review detail; clarification-return PWA route |

### Pattern 2 — Preview / Summary First, Then Domain Open

| Aspect | Specification |
|---|---|
| **Behavior** | The user first sees contextual preview / summary, then chooses to open the destination surface |
| **When used** | The item benefits from context framing before full navigation, or the final destination is still partly a Wave 1 seam |
| **Typical use** | Project Hub handoff signals; selected project-significant items |

### Pattern 3 — Escalation into Project Hub

| Aspect | Specification |
|---|---|
| **Behavior** | The item routes toward Project Hub because the work is materially project-coordination-oriented |
| **When used** | The project-significance rule is satisfied |
| **Typical use** | Health pulse / project-level coordination signals |

### Pattern 4 — Light In-Place Action

| Aspect | Specification |
|---|---|
| **Behavior** | The user completes an approved feed action without leaving the current surface |
| **When used** | The action is a feed mutation and does not require deeper workflow context |
| **Typical use** | `mark-read`, `defer`, `undefer`, `pin-today`, `pin-week`, `waiting-on` |

### Pattern Invariants

- Every first-release item should support **Pattern 1** whenever a meaningful destination exists and `canOpen` is true.
- Pattern 2 does not replace Pattern 1; it introduces a governed preview stage before open.
- Pattern 3 is reserved for project-significant work and must not be applied merely because an item has a `projectId`.
- Pattern 4 is limited to feed-level mutations and must not masquerade as destination-surface work.

---

## 2. Action-Type Classification

This section locks the taxonomy used by the matrix.

### 2.1 Navigation Actions

| Action | Feed state changes? | Navigates? | Notes |
|---|---:|---:|---|
| `open` | No | Yes | Standard destination open |
| `view` | No | Yes | Equivalent to open when separate labeling is useful |

### 2.2 Feed Mutations

| Action | Feed state changes? | Navigates? | Offline-capable? |
|---|---:|---:|---:|
| `mark-read` | Yes | No | Yes |
| `defer` | Yes | No | Yes |
| `undefer` | Yes | No | Yes |
| `pin-today` | Yes | No | Yes |
| `pin-week` | Yes | No | Yes |
| `waiting-on` | Yes | No | Yes |
| `acknowledge`* | Contract says yes | No | implementation gap |
| `reject`* | Contract says yes | No | implementation gap |
| `dismiss`* | Contract says yes | No | implementation gap |

### 2.3 Destination-Surface Mutations

| Behavior | Specification |
|---|---|
| **Where they happen** | At the authoritative destination surface, not in the feed |
| **Examples** | Approve request, retry provisioning, update score, complete project review, create destination record |
| **Feed impact** | Indirect — feed reflects results after refresh / return |

### 2.4 Reconciliation Note — shared contract vs current implementation

The shared interaction contract treats `acknowledge`, `reject`, and `dismiss` as feed mutations. Current `useMyWorkActions()` implementation exposes a narrower replayable action set and does not yet implement those action keys. The tightened matrix therefore treats these as **contract-valid feed mutations with current implementation gap**, not as destination-surface mutations. Downstream implementation must either add support or explicitly mark them deferred.

---

## 3. Deep-Link and Launch-Seam Rules

### 3.1 `context.href` / destination rules

| Rule | Requirement |
|---|---|
| **Format** | Relative path when the destination lives within the same app/surface |
| **Cross-app launch** | Use current repo-true env-based cross-app seam where that is the live pattern |
| **Preview-first items** | The preview may show summary before invoking the destination route / launch seam |
| **Stability** | The destination reference must remain valid for the item’s intended lifetime or degrade clearly |

### 3.2 Current repo-truth rule

When the repo currently uses an env-based cross-app launch seam rather than a stable shared route contract, the matrix must say so explicitly. It must not present that seam as if it were already a settled canonical route family.

### 3.3 Fallback rules

- If no destination is available, disable open and show a governed unavailable-state message.
- If a launch seam is misconfigured (for example, missing Admin app URL), surface a clear “destination unavailable in this environment” message.
- If the route exists but the user lacks permission, the destination surface owns denial handling.

---

## 4. Wave 1 Source Navigation Matrix

This matrix reflects the tightened first-release source scope and distinguishes **repo-true current destination posture** from **target-state posture** where needed.

| Source | Source Key / Module Posture | Primary Pattern | Secondary Pattern(s) | Repo-True Current Destination / Launch Seam | Target-State Destination Posture |
|---|---|---|---|---|---|
| **Provisioning / Admin Exceptions** | `provisioning` + admin launch seam | Direct deep-link | Light in-place action | Accounting review detail route `/project-review/$requestId`; clarification-return PWA route `/project-setup/new?mode=clarification-return&requestId={id}`; admin launch seam uses env-based admin URL + `/provisioning-oversight?projectId={projectId}` | Governed provisioning/admin destination surfaces across apps |
| **Approvals** | Approval proof route currently anchored to provisioning/admin review | Direct deep-link | Light in-place action | Same current Accounting review detail route `/project-review/$requestId` for Wave 1 proof path | Broader approval family may later vary by subtype |
| **Estimating Bid Readiness** | `estimating-bid-readiness` | Direct deep-link | Light in-place action | Current repo does not establish a single settled end-user route in this file’s review evidence | Estimating-owned detail surface once fully governed |
| **BD Score Benchmark** | `bd-score-benchmark` | Direct deep-link | Light in-place action | Current repo does not establish a single settled end-user route in this file’s review evidence | BD-owned score detail / dashboard surface |
| **BD Strategic Intelligence** | `bd-strategic-intelligence` | Direct deep-link | Light in-place action | Current repo does not establish a single settled end-user route in this file’s review evidence | BD intelligence entry/detail surface |
| **Project Hub Handoff Signals** | Cross-module handoff contract; destination creation still a Wave 1 seam | Preview / summary first, then domain open | Direct deep-link after preview | Repo-true handoff config and receiver pattern exist; Project Hub destination record creation remains a documented Wave 1 seam | Handoff receiver/detail flow with authoritative Project Hub continuation once callback bodies are implemented |
| **Project Hub Health Pulse** | `project-health-pulse` (not `project-hub-health-pulse`) | Escalation into Project Hub | Preview / summary first | Live Health Pulse BIC projection uses `project-health-pulse` | Project Hub project-level health surface |

### Matrix Notes

1. **Approvals are explicit in Wave 1.** They are not folded into generic provisioning language in the tightened matrix.
2. **Project Hub is split into two navigation rows.** Handoff signals and Health Pulse are not the same work type and must not share a generic Project Hub navigation posture.
3. **Health Pulse naming is normalized to repo truth.** The stale `project-hub-health-pulse` key is not used in the tightened file.
4. **Missing route certainty is handled honestly.** Where the review evidence did not prove a stable current route family, the matrix keeps the target-state destination posture without fabricating repo-true URLs.

---

## 5. SPFx Companion Navigation Boundary

### 5.1 Locked first-release boundary

The SPFx companion follows a **hybrid** rule:

- SPFx may **direct-launch simple direct-link destinations**.
- Any **preview-first**, **project-significant**, or **deeper-work** item must **launch to PWA**.

This aligns `P2-C3` to `P2-B0` while still preserving SPFx as a bounded companion lane.

### 5.2 SPFx-approved behaviors

| Behavior | Allowed? | Notes |
|---|---:|---|
| Count / summary display | Yes | Companion-only summary posture |
| Governed limited item list | Yes | Companion posture only |
| `mark-read` | Yes | Approved light action |
| Direct-launch simple destination | Yes | Only when the destination is a simple direct-link case |
| Preview-first flow inside SPFx | No | Launch to PWA |
| Project-significant / Project Hub escalation flow | No | Launch to PWA |
| Deeper-work / multi-step continuation | No | Launch to PWA |

### 5.3 Boundary invariant

SPFx must never become the place where deeper navigation logic is adjudicated. If the item requires preview-first reasoning, project-significance judgment, or deeper workflow continuation, SPFx launches to PWA rather than implementing that logic locally.

---

## 6. Project-Significance Rule

### 6.1 Routing doctrine

| Work character | Destination posture |
|---|---|
| **Materially personal-action-oriented** | Stay anchored to Personal Work Hub navigation into the authoritative destination surface |
| **Materially project-coordination-oriented** | Route toward Project Hub |

### 6.2 Wave 1 application

| Source | Default significance posture |
|---|---|
| Provisioning / approvals / admin exceptions | Personal-action-oriented |
| Estimating / BD domain work | Personal-action-oriented unless P2-C4 says otherwise |
| Project Hub handoff signals | Cross-module continuation work; preview-first, not generic project escalation |
| Project Hub health pulse | Project-significant by default |

### 6.3 Invariant

Project significance affects **destination**, not **ranking**. A health pulse item may rank lower or higher independently, but once opened it follows the project-significant destination rule.

---

## 7. Team / Delegated Navigation Rule

Navigation target is the same regardless of personal mode vs team/delegated mode. Feed-level action availability remains read-only by default for non-owners, while destination-surface permissions are still governed by the destination domain.

| Aspect | Personal owner | Delegator / manager view |
|---|---|---|
| Destination target | Same | Same |
| Feed mutation availability | Per `canAct` | Read-only by default |
| Destination-surface permissions | Destination-owned | Destination-owned |

---

## 8. Return Continuity

After destination-surface work, return continuity follows the P2-B2 doctrine:

1. open from hub
2. perform destination-surface work
3. return through shell nav / browser / explicit back affordance
4. restore relevant hub state
5. refresh feed to reflect resulting changes

The hub does not become the source of truth for destination-surface mutations.

---

## 9. Acceptance-Gate Contribution

P2-C3 contributes evidence to the **handoff gate** and the **lane-boundary gate**.

| Gate | Evidence this file provides |
|---|---|
| **Handoff gate** | Project-significance routing posture; explicit split between Project Hub handoff signals and Health Pulse |
| **Lane-boundary gate** | Hybrid SPFx navigation boundary aligned to P2-B0 |

---

## 10. Locked Decisions Reflected in This File

| Decision | Locked Resolution | Consequence in P2-C3 |
|---|---|---|
| Approvals navigation | Direct deep-link first | Accounting review detail is the Wave 1 proof path |
| SPFx companion boundary | Hybrid | Simple direct-launch allowed; preview-first / project-significant / deeper-work launches to PWA |
| Project Hub handoff signals | Preview / summary first | Distinct from Health Pulse |
| Project Hub Health Pulse | Project-significant | Escalation into Project Hub |

---

## 11. Spec Precedence

| Deliverable | Relationship to P2-C3 |
|---|---|
| **P2-B0** | Governs host boundary; this file implements item-level navigation within that boundary |
| **P2-C1** | Governs Wave 1 source scope reflected in this matrix |
| **P2-C2** | Governs notification mapping; notification-sourced items inherit the same destination posture as their underlying work source |
| **P2-C4** | Governs the deeper handoff / significance criteria behind destination choices |
| **interaction-contract** | Governs action-type taxonomy; this file reconciles any current implementation gaps explicitly |

If a downstream deliverable conflicts with this specification on navigation pattern, host boundary, or Project Hub split behavior, this file takes precedence unless Architecture approves a documented exception.

---

**Last Updated:** 2026-03-20  
**Governing Authority:** [Phase 2 Plan §9.3, §9.4, §10.3](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
