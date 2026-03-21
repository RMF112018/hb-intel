# P3-G1: Lane Capability Matrix (PWA / SPFx)

| Field | Value |
|---|---|
| **Doc ID** | P3-G1 |
| **Phase** | Phase 3 |
| **Workstream** | G — Dual-lane capability and coexistence |
| **Document Type** | Specification |
| **Owner** | Experience / Shell Team + Architecture |
| **Update Authority** | Architecture lead; changes require review by Experience lead and Project Hub platform owner |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 3 Plan §10](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md); [P3-A2](P3-A2-Membership-Role-Authority-Contract.md); [P3-A3](P3-A3-Shared-Spine-Publication-Contract-Set.md); [P3-B1](P3-B1-Project-Context-Continuity-and-Switching-Contract.md); [P2-B0](../phase-2-deliverables/P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [PH7-BW plans](../../ph7-breakout-webparts/); [current-state-map](../../../blueprint/current-state-map.md) |

---

## Specification Statement

This matrix defines the per-capability and per-module depth expectations for both the PWA and SPFx lanes in Phase 3 Project Hub. It establishes what is shared, what differs, and what rules govern the differences.

Phase 3 uses a **shared-canonical cross-lane model** (Phase 3 plan §4.1):

- The **PWA** is a robust first-class Project Hub product — the richer lane for cross-project continuity, advanced workflow depth, and recovery/persistence.
- The **SPFx** lane is a **broad operational project-site companion** — not a thin launcher shell, but a surface with substantial direct working capability across most always-on core modules.
- Both lanes consume the **same canonical shared contracts** for project identity, context, membership, spines, and reporting.
- Lane differences are about **depth, continuity, and host behavior**, not about inventing different project semantics.

**Repo-truth audit — 2026-03-20.** The PWA has 24 workspace routes including `project-hub` (non-parameterized, MVP scaffold with portfolio dashboard). The SPFx project-hub app has 4 internal routes (dashboard, preconstruction, documents, team) with 1 implemented page and 3 empty-state placeholders. Both lanes consume shared infrastructure (`@hbc/auth`, `@hbc/shell`, `@hbc/ui-kit`, `@hbc/models`, `@hbc/data-access`, `@hbc/query-hooks`). The `@hbc/features-project-hub` shared feature package exports health-pulse components consumed by both lanes. 11 domain SPFx apps exist in the workspace per the PH7-BW architecture. See §1 for full reconciliation.

---

## Specification Scope

### This specification governs

- The cross-capability matrix defining shared, PWA-specific, and SPFx-specific capabilities
- Module-level lane depth expectations for all always-on core modules
- Interaction and workflow depth rules (what SPFx can do vs what must escalate to PWA)
- Canvas and composition rules by lane
- Cross-lane navigation and handoff rules

### This specification does NOT govern

- Project registry, identity, or activation rules — see [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md)
- Project membership and module visibility — see [P3-A2](P3-A2-Membership-Role-Authority-Contract.md)
- Shared spine publication — see [P3-A3](P3-A3-Shared-Spine-Publication-Contract-Set.md)
- Project context continuity and switching — see [P3-B1](P3-B1-Project-Context-Continuity-and-Switching-Contract.md)
- Personal Work Hub lane doctrine — see [P2-B0](../phase-2-deliverables/P2-B0-Lane-Ownership-and-Coexistence-Rules.md)
- SPFx webpart entry point implementation — governed by PH7-BW plans

---

## Definitions

| Term | Meaning |
|---|---|
| **Full** | Complete capability with no lane-imposed limitations |
| **Broad** | Substantial direct working capability; may lack deepest power-user workflows available in the richer lane |
| **Launch-to-PWA** | SPFx provides summary/entry point but routes to PWA for deeper interaction |
| **Not applicable** | Capability does not apply to this lane due to host constraints |
| **Shared canonical contract** | A cross-lane contract that both lanes must consume identically (same types, same semantics, same validation) |
| **Host-aware fallback** | Behavior that adapts to SPFx host constraints (e.g., no cross-project navigation within SharePoint site scope) |
| **Operational surface** | A module page where users can view, create, edit, and manage records — not just a summary |

---

## 1. Current-State Reconciliation

### 1.1 PWA Project Hub — current implementation

| Aspect | Status | Detail |
|---|---|---|
| Route | `project-hub` (non-parameterized) | MVP scaffold; PH7 plans define `$projectId` parameterized routes |
| Page | `ProjectHubPage` | Portfolio dashboard with 3 summary cards + `HbcDataTable` |
| Module pages | None | No Financial, Schedule, Constraints, Permits, Safety, or Reports pages |
| Cross-project navigation | Full | All 24 workspace routes accessible; landing resolver active |
| Project setup/provisioning | Live | `/project-setup`, `/projects`, `/projects/$requestId`, `/provisioning/$projectId` |
| Shared feature package | Consumes `@hbc/features-project-hub` | Health-pulse integration available |

### 1.2 SPFx Project Hub — current implementation

| Aspect | Status | Detail |
|---|---|---|
| Webpart entry | `ProjectHubWebPart.tsx` | Fully wired with auth bridge (`bootstrapSpfxAuth`, `resolveSpfxPermissions`) |
| Routes | 4 internal | `/` (dashboard), `/preconstruction`, `/documents`, `/team` |
| Pages | 1 implemented, 3 placeholders | `DashboardPage` (same structure as PWA); `TeamPage`, `DocumentsPage`, `PreconstructionPage` are empty-state |
| Shell mode | Simplified | `WorkspacePageShell` with tool-picker nav; no cross-workspace switching |
| Data layer | Mock only | 2 hardcoded projects via `bootstrap.ts` |
| Shared packages | Same as PWA | `@hbc/auth`, `@hbc/shell`, `@hbc/ui-kit`, `@hbc/models`, `@hbc/data-access`, `@hbc/query-hooks`, `@hbc/smart-empty-state`, `@hbc/complexity` |

### 1.3 Shared feature package

`@hbc/features-project-hub` (v0.0.1) currently exports:
- `projectHubProjectsEmptyStateConfig` — empty-state configuration
- Health-pulse components, computors, governance, hooks, integrations (SF21)

Module-level page components are not yet in the shared feature package — they currently live in `apps/project-hub/src/pages/`. PH7-BW-0 identifies migration to shared feature packages as the target architecture.

---

## 2. Shared-Canonical Contract Baseline

The following MUST be identical across both lanes. No lane may deviate from these shared contracts:

| Contract | Governing deliverable | Shared package |
|---|---|---|
| Project identity (registry record) | P3-A1 | `@hbc/models` (canonical type) |
| Project membership and role resolution | P3-A2 | `@hbc/auth` + `@hbc/models` |
| Activity spine | P3-A3 | Future `@hbc/project-activity` or shared package |
| Health spine | P3-A3 | `@hbc/features-project-hub` (health-pulse) |
| Work queue spine | P3-A3 | `@hbc/my-work-feed` |
| Related-items spine | P3-A3 | `@hbc/related-items` |
| Project context identity authority | P3-B1 | `@hbc/shell` (projectStore) |
| Module visibility by role | P3-A2 §4 | `@hbc/auth` (FeaturePermissionRegistration) |
| Report definitions, runs, release model | P3-F1 | Future reports package |
| Auth and role resolution | P2-D1 / P3-A2 | `@hbc/auth` |
| Telemetry event vocabulary | P2-B0 §Cross-Lane Consistency | Shared telemetry contracts |

---

## 3. Cross-Capability Matrix

| Capability | Shared Contract | PWA | SPFx | Rule |
|---|---|---|---|---|
| **Project identity** | Route/URL canonical | **Full** — `$projectId` in URL | **Full** — site-URL registry lookup | Both resolve same `projectId` |
| **Project switching** | Smart same-page model | **Full** — cross-project within app | **Full** — with host-aware fallbacks | SPFx switches within site scope or launches PWA |
| **Project home/canvas** | Same governance + mandatory core | **Full** — richer continuity/customization | **Broad** — site-native companion canvas | Both show mandatory operational core tiles |
| **Health spine** | Same normalized semantics | **Full** | **Full** | Same `IProjectHealthPulse` rendering |
| **Activity spine** | Same normalized semantics | **Full** | **Full** | Same `IProjectActivityEvent` rendering |
| **Work queue spine** | Same normalized semantics | **Full** | **Full** | Same project-scoped `IMyWorkItem` rendering |
| **Related-items spine** | Same normalized semantics | **Full** | **Full** | Same relationship rendering |
| **Financial module** | Same authority boundaries | **Full** — first-class working surface | **Broad** — operational surface | SPFx supports CRUD; PWA richer for forecasting workflows |
| **Schedule module** | Same authority boundaries | **Full** — first-class working surface | **Broad** — operational surface | SPFx supports view + milestone management; PWA richer for file ingestion |
| **Constraints module** | Same authority boundaries | **Full** — first-class working surface | **Broad** — operational surface | SPFx supports full CRUD |
| **Permits module** | Same authority boundaries | **Full** — first-class working surface | **Broad** — operational surface | SPFx supports full CRUD |
| **Safety module** | Same authority boundaries | **Full** — first-class working surface | **Broad** — operational surface | SPFx supports full CRUD |
| **Reports module** | Same report definitions/runs/release | **Full** — richer history/continuity/recovery | **Broad** — report interaction + launch | SPFx supports view/generate; PWA richer for draft management |
| **QC module** | Baseline-visible lifecycle | **Baseline-visible** | **Baseline-visible** | Deeper depth deferred to Phase 6 |
| **Warranty module** | Baseline-visible lifecycle | **Baseline-visible** | **Baseline-visible** | Deeper depth deferred to Phase 6 |
| **Cross-project continuity** | Shared identity rules | **Richest** | **Limited** — host-constrained | PWA supports multi-project navigation; SPFx scoped to site |
| **Personal/workspace continuity** | N/A | **Full** | **Not applicable** | SPFx does not provide cross-workspace switching |
| **Advanced workflow depth** | Shared baseline contracts | **Richest** | **Broad** — not canonical owner of deepest flows | Multi-step wizards, complex imports, and advanced configuration route to PWA |
| **Session recovery** | Shared baseline contracts | **Full** — IndexedDB + localStorage | **Limited** — localStorage only | PWA has richer draft recovery via `@hbc/session-state` |
| **Offline/degraded behavior** | Same trust-state vocabulary | **Full** — primary trust model | **Limited** — status cues where applicable | PWA owns primary offline model |
| **Per-project return-memory** | P3-B1 §4 | **Full** | **Not applicable** | SPFx uses site-scoped navigation |
| **Canvas personalization** | Same governance types | **Full** — governed adaptive composition | **Broad** — governed adaptive composition | Both support `@hbc/project-canvas` for Project Hub |

---

## 4. Module-Level Lane Depth Matrix

For each always-on core module, the following defines what each lane MUST support:

### 4.1 Financial

| Capability | PWA | SPFx |
|---|---|---|
| View Financial Summary | **Required** | **Required** |
| Edit Financial Summary working state | **Required** | **Required** |
| Budget import (CSV upload) | **Required** | **Broad** — supported |
| GC/GR working model (view + edit) | **Required** | **Required** |
| Cash Flow working model (view + edit) | **Required** | **Required** |
| Forecast checklist completion | **Required** | **Required** |
| Exposure tracking | **Required** | **Required** |
| Export | **Required** | **Required** |
| Buyout support | **Required** | **Required** |

### 4.2 Schedule

| Capability | PWA | SPFx |
|---|---|---|
| View schedule summary | **Required** | **Required** |
| Milestone tracking | **Required** | **Required** |
| Manual milestone management | **Required** | **Required** |
| Schedule file ingestion (XER/XML/CSV) | **Required** | **Launch-to-PWA** |
| Governed forecast overrides | **Required** | **Required** |
| Upload history / restore | **Required** | **Launch-to-PWA** |

### 4.3 Constraints

| Capability | PWA | SPFx |
|---|---|---|
| Create / update / close constraints | **Required** | **Required** |
| Manage Change Tracking entries | **Required** | **Required** |
| Manage Delay Log entries | **Required** | **Required** |
| Manage due dates / BIC / responsibility / comments | **Required** | **Required** |
| Quantify delay impact | **Required** | **Required** |
| Export | **Required** | **Required** |

### 4.4 Permits

| Capability | PWA | SPFx |
|---|---|---|
| Permit log management | **Required** | **Required** |
| Linked required inspections | **Required** | **Required** |
| Inspection results/status summaries | **Required** | **Required** |
| Expiration/status tracking | **Required** | **Required** |
| Comments/notes | **Required** | **Required** |
| Export | **Required** | **Required** |

### 4.5 Safety

| Capability | PWA | SPFx |
|---|---|---|
| Project safety-plan state | **Required** | **Required** |
| Subcontractor acknowledgments | **Required** | **Required** |
| Safety orientation records | **Required** | **Required** |
| Checklist / inspection aggregation | **Required** | **Required** |
| JHA log records | **Required** | **Required** |
| Emergency-plan acknowledgment | **Required** | **Required** |
| Incident-report working state | **Required** | **Required** |
| Linked safety follow-up actions | **Required** | **Required** |

### 4.6 Reports

| Capability | PWA | SPFx |
|---|---|---|
| View report list and status | **Required** | **Required** |
| Generate / queue report run | **Required** | **Required** |
| View report output / preview | **Required** | **Required** |
| PM narrative override / draft editing | **Required** | **Broad** — basic editing supported |
| Draft refresh and staleness handling | **Required** | **Broad** — staleness warnings shown |
| Run-ledger and history browsing | **Required** | **Launch-to-PWA** |
| Export | **Required** | **Required** |
| Approval (PX Review) | **Required** | **Required** |
| Release / distribution state | **Required** | **Broad** — view status; release action supported |

### 4.7 QC and Warranty

| Capability | PWA | SPFx |
|---|---|---|
| Baseline-visible lifecycle placement | **Required** | **Required** |
| Deeper field-first depth | Deferred to Phase 6 | Deferred to Phase 6 |

---

## 5. Interaction and Workflow Depth Rules

### 5.1 SPFx direct working scope

The SPFx lane MUST support **substantial direct working capability** for most always-on core modules. "Broad" means the user can complete the majority of operational tasks directly in SPFx without being forced to PWA.

SPFx MAY handle:
- All CRUD operations on module records (constraints, permits, safety items, etc.)
- Basic editing and status management
- Report viewing, generation, and approval
- Canvas interaction and governed tile management
- Work queue item review and acknowledgment

### 5.2 Launch-to-PWA escalation

The following interactions MUST route to the PWA because they require capabilities the SPFx host does not reliably support:

| Interaction | Reason for PWA escalation |
|---|---|
| Schedule file ingestion (XER/XML/CSV upload + parsing) | Complex file processing and upload UX |
| Schedule upload history / restore | Multi-step history browsing and restore workflow |
| Report run-ledger full history browsing | Rich timeline and comparison UI |
| Cross-project navigation and continuity | SPFx is scoped to a single project site |
| Advanced draft recovery workflows | Requires IndexedDB-backed `@hbc/session-state` |
| Multi-project reporting or portfolio views | SPFx site scope does not support cross-project surfaces |

### 5.3 Escalation mechanism

When SPFx escalates to PWA:
1. Construct a deep-link URL targeting the specific project and module in the PWA.
2. Open in a new tab or navigate away from the current site (host-dependent).
3. Include `?returnTo=` parameter if return navigation is appropriate.
4. The PWA deep-link handler (P3-B1 §6.1) processes the arrival.

---

## 6. Canvas and Composition Rules by Lane

### 6.1 Phase 3 Project Hub canvas rules

| Aspect | PWA | SPFx | Rule |
|---|---|---|---|
| Canvas foundation | `@hbc/project-canvas` — governed adaptive | `@hbc/project-canvas` — governed adaptive | Both lanes use the same canvas package |
| Mandatory operational core | Identity header, Health, Work Queue, Activity, Related Items | Identity header, Health, Work Queue, Activity, Related Items | Same mandatory tiles in both lanes |
| Tile governance | Mandatory locked + role-default + user-managed | Mandatory locked + role-default + user-managed | Same governance model |
| Personalization depth | Full governed adaptive composition | Governed adaptive composition | Both support role-based defaults and user customization |

### 6.2 Distinction from Phase 2 Personal Work Hub canvas rules

P2-B0 restricts SPFx to **curated composition** (no freeform canvas) for the Personal Work Hub. Phase 3 Project Hub uses a **different lane doctrine**: SPFx is a broad operational companion and MAY use governed adaptive composition via `@hbc/project-canvas`.

This is not a contradiction — P2-B0's curated-composition constraint applies to the **Personal Work Hub lane doctrine** specifically. Phase 3 Project Hub defines its own lane doctrine where SPFx has broader capability.

---

## 7. Cross-Lane Navigation and Handoff Rules

### 7.1 PWA-to-SPFx navigation

| Scenario | Mechanism |
|---|---|
| User wants to access the project within SharePoint context | Link/button opens SPFx project site URL in new tab |
| User wants to view project documents in SharePoint | Navigate to project `siteUrl` from registry |

### 7.2 SPFx-to-PWA navigation

| Scenario | Mechanism |
|---|---|
| User needs cross-project navigation | Launch-to-PWA with project selector deep link |
| User needs advanced workflow (file ingestion, history restore) | Launch-to-PWA with module-specific deep link |
| User wants Personal Work Hub | Launch-to-PWA with `/my-work` deep link |

### 7.3 Handoff identity preservation

All cross-lane navigation MUST preserve project identity:
- SPFx-to-PWA: Include `projectId` in the deep-link URL path or query parameter.
- PWA-to-SPFx: Use the project's `siteUrl` from the registry to construct the SharePoint site link.
- On arrival, the receiving lane resolves project identity per P3-B1 §2 (route-canonical) or P3-B1 §2.3 (site-URL resolution).

---

## 8. Repo-Truth Reconciliation Notes

1. **SPFx project-hub has 1 of 11+ planned pages implemented — controlled evolution**
   Only `DashboardPage` is implemented; `TeamPage`, `DocumentsPage`, and `PreconstructionPage` are empty-state placeholders. PH7 plans define the full module page set. Phase 3 must deliver broad operational capability per this matrix. Classified as **controlled evolution**.

2. **PWA project-hub is MVP scaffold — controlled evolution**
   The PWA `ProjectHubPage` is a portfolio dashboard, not a per-project operating layer. Phase 3 must implement `$projectId`-parameterized routes per PH7.2 and P3-B1. Classified as **controlled evolution**.

3. **Module pages live in app directories, not shared feature package — controlled evolution**
   PH7-BW-0 identifies migration of page components to `@hbc/features-project-hub` as the target architecture. Current pages live in `apps/project-hub/src/pages/`. Phase 3 should follow the shared feature package pattern so both lanes consume the same page components. Classified as **controlled evolution**.

4. **`@hbc/project-canvas` usage is broad for both lanes — compliant**
   P2-B0 restricts SPFx to curated composition for the Personal Work Hub only. Phase 3 Project Hub defines its own lane doctrine (§6) where both lanes use governed adaptive composition. This is **compliant** — P2-B0 §SPFx Composition Constraint explicitly notes the constraint applies to "Personal Work Hub lane doctrine" and "does not declare package-wide PWA exclusivity."

5. **11 domain SPFx apps exist — compliant**
   All 11 domain SPFx apps exist in the workspace per PH7-BW-1, with `project-hub` being the first to have a wired webpart entry point. The shared infrastructure package `@hbc/spfx` provides SPFx utilities. Classified as **compliant**.

6. **Shared package consumption is identical across lanes — compliant**
   Both `apps/pwa` and `apps/project-hub` consume the same shared packages (`@hbc/auth`, `@hbc/shell`, `@hbc/ui-kit`, `@hbc/models`, `@hbc/data-access`, `@hbc/query-hooks`, `@hbc/smart-empty-state`, `@hbc/complexity`). Classified as **compliant**.

---

## 9. Acceptance Gate Reference

**Gate:** Cross-lane contract gates (Phase 3 plan §18.1)

| Field | Value |
|---|---|
| **Pass condition** | Both lanes consume the same canonical contracts; module capabilities match this matrix; no lane silently exceeds or falls below its defined depth |
| **Evidence required** | P3-G1 (this document), module page implementations in both lanes, cross-lane identity resolution tests, launch-to-PWA escalation tests, canvas governance verification |
| **Primary owner** | Architecture + Experience / Shell |

---

## 10. Policy Precedence

This specification establishes the **lane capability foundation** that downstream Phase 3 deliverables must conform to:

| Deliverable | Relationship to P3-G1 |
|---|---|
| **P3-A1–A3** — Workstream A contracts | Provide the shared canonical contracts that both lanes must consume identically (§2) |
| **P3-B1** — Project Context Contract | Defines route-canonical identity and switching that both lanes must honor |
| **P3-C1–C3** — Canvas-first Project Home | Must implement canvas rules per §6, respecting lane-specific composition depth |
| **P3-E1** — Module Classification Matrix | Must align module classifications with lane depth expectations in §4 |
| **P3-E2** — Module Source-of-Truth / Action-Boundary Matrix | Must respect interaction depth rules per §5 |
| **P3-G2** — Cross-Lane Navigation and Handoff Map | Must implement navigation patterns per §7 |
| **P3-G3** — Lane-Specific Acceptance Matrix | Must validate each lane meets the depth expectations in §3–§4 |
| **P3-H1** — Acceptance Checklist | Must include lane capability gate evidence |

If a downstream deliverable conflicts with this specification, this specification takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 3 Plan §10](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
