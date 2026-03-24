# P3-G1: Lane Capability Matrix (PWA / SPFx)

| Field | Value |
|---|---|
| **Doc ID** | P3-G1 |
| **Phase** | Phase 3 |
| **Workstream** | G — Dual-lane capability and coexistence |
| **Document Type** | Specification |
| **Owner** | Experience / Shell Team + Architecture |
| **Update Authority** | Architecture lead; changes require review by Experience lead and Project Hub platform owner |
| **Last Reviewed Against Repo Truth** | 2026-03-24 |
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
- Executive review lane depth (PWA = full experience; SPFx = broad direct interaction on supported surfaces)

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
| **Full executive review experience** | The complete PER workflow available in the PWA: annotations, review run generation, Push-to-Project-Team, closure confirmation, thread management, multi-run comparison, and review history browsing |
| **Broad executive review** | The SPFx executive review capability subset: annotations on supported surfaces, reviewer-generated review runs, Push-to-Project-Team; deeper history, multi-run comparison, and thread management stay in PWA |

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
| Report definitions, runs, release model | P3-F1; P3-E9 T-file family (T01–T10) | Future reports package |
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
| View Financial Summary (confirmed/published versions) | **Required** | **Required** |
| Edit Financial Summary working state (PM-editable fields) | **Required** | **Required** |
| Budget import (CSV upload) with identity resolution | **Required** | **Broad** — supported |
| Budget line reconciliation condition resolution | **Required** | **Required** |
| Version management: confirm, derive, designate report candidate | **Required** | **Required** |
| Version list view (all version types) | **Required** | **Required** |
| GC/GR working model (view + edit) | **Required** | **Required** |
| Cash Flow working model — actuals view | **Required** | **Required** |
| Cash Flow working model — forecast edit (18 months) | **Required** | **Required** |
| Cash flow cumulative chart with deficit shading | **Required** | **Required** |
| A/R aging display (read-only) | **Required** | **Required** |
| Forecast checklist completion and confirmation gate | **Required** | **Required** |
| Budget line `forecastToComplete` inline editing | **Required** | **Required** |
| Buyout log management (view, add, edit, advance status) | **Required** | **Required** |
| Buyout savings disposition workflow | **Required** | **Launch-to-PWA** — multi-step disposition modal is PWA-native |
| Dollar-weighted buyout completion metric | **Required** | **Required** |
| PER annotation on confirmed versions | **Required** | **Launch-to-PWA** |
| Export (budget CSV, GC/GR CSV, cash flow CSV, buyout CSV, forecast summary snapshot) | **Required** | **Required** |

### 4.2 Schedule

| Capability | PWA | SPFx |
|---|---|---|
| View schedule summary (Published layer) | **Required** | **Required** |
| Schedule file ingestion (XER/XML/CSV) | **Required** | **Launch-to-PWA** |
| Version history and upload history | **Required** | **Launch-to-PWA** |
| Canonical source designation and baseline management | **Required** | **Launch-to-PWA** |
| Managed commitment layer (dual-truth reconciliation) | **Required** | **Required** |
| Stage-gated publication workflow | **Required** | **Launch-to-PWA** |
| Milestone tracking (view — derived from Published layer) | **Required** | **Required** |
| Field work packages — create / manage | **Required** | **Required** |
| Commitment management | **Required** | **Required** |
| Blocker and readiness tracking | **Required** | **Required** |
| Look-ahead planning with PPC | **Required** | **Required** |
| Progress claims and three-tier verification | **Required** | **Launch-to-PWA** |
| Scenario branch management | **Required** | **Launch-to-PWA** |
| Schedule grading and confidence scoring | **Required** | **Required** |
| Cross-platform workflow integration (`@hbc/related-items`, `@hbc/workflow-handoff`) | **Required** | **Required** |
| Offline-first field execution (intent-log, sync) | **Required** | **Not Required** |
| Export (published snapshots, look-ahead, grading, PPC trend) | **Required** | **Launch-to-PWA** |

### 4.3 Constraints

| Capability | PWA | SPFx |
|---|---|---|
| Risk Ledger — create / update / manage lifecycle and riskScore | **Required** | **Required** |
| Constraint Ledger — create / update / manage lifecycle and BIC tracking | **Required** | **Required** |
| Delay Ledger — create / update (Integrated + ManualFallback schedule reference modes) | **Required** | **Required** |
| Delay time/commercial impact separation and evidence gates | **Required** | **Required** |
| Change Ledger — create / update / manage lifecycle (manual-native mode) | **Required** | **Required** |
| Change event line items and approval workflow | **Required** | **Required** |
| Cross-ledger spawn lineage (Risk→Constraint, Constraint→Delay, Constraint→Change) | **Required** | **Required** |
| Delay ↔ Change Event peer linking | **Required** | **Required** |
| Published snapshots and review packages | **Required** | **Launch-to-PWA** |
| `@hbc/related-items` cross-module relationships panel | **Required** | **Required** |
| Export (all four ledger types, cross-ledger summary, review package PDF) | **Required** | **Required** |
| Offline-first logging (constraint / delay entry) | **Required** | **Not Required** |

### 4.4 Permits

| Capability | PWA | SPFx | Notes |
|---|---|---|---|
| Permit application management (PermitApplication CRUD) | **Required** | **Required** | Pre-issuance lifecycle |
| Issued permit record management (IssuedPermit CRUD) | **Required** | **Required** | Core permit ledger |
| Lifecycle action creation (PermitLifecycleAction) | **Required** | **Required** | All 20 action types; no direct status mutation |
| Required inspection checkpoint management | **Required** | **Required** | Template library + per-permit instances |
| xlsx required inspections import | **Required** | **Launch-to-PWA** | Full upload UX in PWA; SPFx links to PWA |
| Inspection visit logging (InspectionVisit) | **Required** | **Required** | |
| Inspection deficiency tracking (InspectionDeficiency) | **Required** | **Required** | Full resolution workflow |
| Deficiency acknowledgment and resolution workflow | **Required** | **Broad** — view + status update | Full workflow in PWA |
| Expiration risk tracking (daysToExpiration, expirationRiskTier) | **Required** | **Required** | Derived; no manual score |
| Derived compliance health (derivedHealthTier) | **Required** | **Required** | Computed from record truth; no complianceScore field |
| Permit thread view (master + subpermits) | **Required** | **Broad** — thread list displayed; no full tree | Full thread tree in PWA |
| Work queue items (WQ-PRM-01 through WQ-PRM-15) | **Required** | **Required** | Full work queue integration |
| Evidence upload (PermitEvidenceRecord) | **Required** | **Launch-to-PWA** | Upload in PWA; view in both |
| PER annotation layer (IssuedPermit + InspectionVisit) | **Required** | **Required** | `@hbc/field-annotations` per P3-E7-T05 §7 |
| Compliance dashboard (project-level aggregate) | **Required** | **Required** | Health spine aggregate tiles |
| Permit list export (CSV) | **Required** | **Required** | |
| Annotated permit summary export (PER) | **Launch-to-PWA** | **Launch-to-PWA** | PER surface export |

### 4.5 Safety

Note: Safety is excluded from PER annotation layer (P3-E1 §9.3). PER sees read-only tiered summaries only. No annotation affordance in Safety workspace on either lane.

| Capability | PWA | SPFx |
|---|---|---|
| SSSP base plan — view and project-instance editing | **Required** | **Required** |
| SSSP governed sections — Safety Manager editing | **Required** | **Broad** — view governed sections; editing via PWA |
| SSSP approval workflow (joint 3-party) | **Required** | **Required** |
| SSSP addendum creation and approval | **Required** | **Broad** |
| Inspection checklist template management | **Required** | **Broad** — view templates; template management via PWA |
| Weekly inspection execution (Safety Manager) | **Required** | **Required** |
| Inspection scorecard and trend view | **Required** | **Required** |
| Corrective action ledger — view and manage | **Required** | **Required** |
| Corrective action verification workflow | **Required** | **Required** |
| Incident and case management (with privacy tier enforcement) | **Required** | **Broad** — STANDARD tier; SENSITIVE/RESTRICTED creation via PWA |
| JHA creation, contributor input, approval | **Required** | **Required** |
| Daily Pre-Task Plan creation and completion | **Required** | **Required** |
| Toolbox talk prompt library and issuance | **Required** | **Broad** |
| Weekly toolbox talk record and proof capture | **Required** | **Required** |
| Worker orientation record creation and acknowledgment | **Required** | **Required** |
| Subcontractor safety submission review | **Required** | **Broad** |
| Certification and competent-person record management | **Required** | **Broad** |
| HazCom / SDS record management | **Required** | **Broad** |
| Readiness decision surface (project/subcontractor/activity) | **Required** | **Required** |
| Readiness exception granting (Safety Manager) | **Required** | **Broad** |
| Readiness override workflow | **Required** | **Required** |
| Composite safety scorecard (Project Hub projection) | **Required** | **Required** |
| PER tiered read-only summary | **Required** | **Required** |
| Safety reports workspace | **Required** | **Launch-to-PWA** |
| Schedule integration (toolbox prompt intelligence) | **Required** | **Required** (read-only) |

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

### 4.8 Lifecycle Modules — Project Closeout, Project Startup, Subcontract Execution Readiness

Per P3-E1 §8, all three lifecycle modules require **Full parity** across PWA and SPFx. The per-module capability tables below define depth expectations within that parity requirement.

#### 4.8.1 Project Closeout

Project Closeout is an always-on lifecycle module (active from closeout phase through archive). Full parity does not mean identical interaction patterns — see SPFx constraints below.

| Capability | PWA | SPFx | Notes |
|---|---|---|---|
| **Closeout Execution Checklist** | | | |
| View checklist and item results | **Required** | **Required** | Daily use surface for field staff |
| Mark checklist items Yes/No/NA | **Required** | **Required** | SUPT marks field-scope items; PM marks all |
| View completion percentage | **Required** | **Required** | Per-section and overall |
| Add overlay items (PM only) | **Required** | **Broad** | Full overlay creation in PWA; view-only in SPFx |
| View milestone status | **Required** | **Required** | |
| **Subcontractor Scorecard** | | | |
| Create and score Interim/FinalCloseout evaluation | **Required** | **Required** | Form-heavy; both types in both lanes |
| Sign off on submission (PM + SUPT acknowledgment) | **Required** | **Required** | |
| View scorecard history per sub | **Required** | **Broad** | Full history in PWA; current evaluation in SPFx |
| PE scorecard approval workflow | **Required** | **Broad** | Approval action supported in both; approval history is PWA-depth |
| **Lessons Learned** | | | |
| Create lesson entry (rolling, any lifecycle phase) | **Required** | **Broad** | Authoring in both; lesson list navigation stays in both |
| Submit `LessonsLearningReport` for PE review | **Required** | **Launch-to-PWA** | Report synthesis and submission is PWA-depth |
| PE lessons approval workflow | **Required** | **Broad** | Approval action supported; full review thread is PWA-depth |
| **Project Autopsy & Learning Legacy** | | | |
| Activate autopsy sub-surface | **Required** | **Broad** | Activation in both; workshop facilitation model is PWA-depth |
| View autopsy summary and findings | **Required** | **Required** | Summary view in both lanes |
| Create findings, actions, legacy outputs | **Required** | **Launch-to-PWA** | Workshop facilitation and authoring is PWA-depth |
| **Org Intelligence Surfaces** | | | |
| View contextual lessons panel (Project Hub) | **Required** | **Required** | Read-only in both lanes |
| View sub vetting intelligence panel | **Required** | **Required** | Role-gated in both lanes |
| View learning legacy feed | **Required** | **Required** | Read-only in both lanes |
| **Governance** | | | |
| Archive-Ready gate review and PE approval | **Required** | **Broad** | Approval action in both; 8-criteria checklist in PWA |

**SPFx constraints specific to Closeout:**
- No `localStorage` or `sessionStorage`; all state must be server-round-tripped.
- Offline checklist item queuing is PWA-only (IndexedDB-backed `@hbc/session-state`).
- Push notification delivery is PWA-only; SPFx may display in-app notifications on polling.
- Autopsy workshop facilitation (pre-survey issuance, findings capture during workshop) is PWA-depth; SPFx shows autopsy summary.

#### 4.8.2 Project Startup

Full parity across both lanes — no core Startup certification or gate action requires escalation to PWA. See T09 §7 for the governing lane depth specification.

| Capability | PWA | SPFx | Notes |
|---|---|---|---|
| Task Library — item result entry and blocker management | **Required** | **Required** | |
| Task Library — `ReadinessCertification` submission | **Required** | **Required** | |
| Safety Readiness — item result entry and remediation notes | **Required** | **Required** | |
| Safety Readiness — `SafetyRemediationRecord` assignment | **Required** | **Required** | |
| Safety Readiness — certification and PE review | **Required** | **Required** | |
| Contract Obligations Register — entry, flagging, monitoring | **Required** | **Required** | |
| Responsibility Matrix — view and assign (PM and Field sheets) | **Required** | **Required** | |
| Responsibility Matrix — critical-category acknowledgment | **Required** | **Required** | |
| Project Execution Baseline / PM Plan — section authoring | **Required** | **Required** | |
| Project Execution Baseline / PM Plan — `ExecutionAssumption` authoring | **Required** | **Required** | |
| Project Execution Baseline / PM Plan — PX approval workflow | **Required** | **Required** | |
| Permit Posting Verification — metadata entry | **Required** | **Required** | |
| Permit Posting Verification — photo evidence upload | **Required** | **Launch-to-PWA** | SPFx supports metadata entry; photo upload is PWA-depth |
| `ReadinessCertification` — all six sub-surfaces | **Required** | **Required** | |
| PE certification review and gate criterion entry | **Required** | **Required** | |
| `PEMobilizationAuthorization` creation | **Required** | **Required** | |
| Baseline lock action | **Required** | **Required** | |
| `ExceptionWaiverRecord` creation and management | **Required** | **Required** | |
| `ProgramBlocker` management | **Required** | **Required** | |
| State machine visualization with history timeline | **Required** | **Launch-to-PWA** | State transitions work in SPFx; timeline view is PWA-depth |
| Advanced blocker dependency chain visualization | **Required** | **Launch-to-PWA** | |
| Post-lock `StartupBaseline` summary view | **Required** | **Required** | |

#### 4.8.3 Subcontract Execution Readiness

| Capability | PWA | SPFx |
|---|---|---|
| Readiness case — view and maintain | **Required** | **Required** |
| Requirement item artifact intake | **Required** | **Required** |
| Compliance / Risk evaluation workbench | **Required** | **Broad** |
| `ExceptionCase` / `ExceptionSubmissionIteration` — create, revise, and submit | **Required** | **Broad** |
| Exception approval-slot routing on submission iterations | **Required** | **Broad** |
| Controlled reassignment audit trail | **Required** | **Launch-to-PWA** |
| Precedent publication management | **Required** | **Launch-to-PWA** |
| Readiness gate projection surfaced to Financial for `ContractExecuted` enforcement | **Required** | **Required** |

### 4.9 Executive Review (Portfolio Executive Reviewer posture)

Executive review capabilities apply to PER posture only; non-PER users are unaffected by this lane depth distinction. Review-capable module surfaces for Phase 3: Financial, Schedule, Constraints, Permits, Project Health, Reports, Project Closeout, Project Startup, Subcontract Execution Readiness (per P3-E1 §9.1).

| Capability | PWA | SPFx | Notes |
|---|---|---|---|
| View review-capable module surfaces (read) | **Full** | **Full** | PER read-only access in both lanes |
| Place review annotations on supported surfaces | **Full** | **Broad** | Annotation placement supported in both; SPFx may lack advanced anchor depth |
| Generate reviewer-generated review runs | **Full** | **Broad** | Supported in both; run against confirmed PM snapshot per P3-F1 §8.6 |
| Push-to-Project-Team (initiate from review annotation) | **Full** | **Broad** | Initiation supported in both lanes; P3-D3 §13 governs the work item |
| Confirm PER closure of a pushed work item | **Full** | **Broad** | Confirmation action supported in both lanes |
| Review annotation thread management | **Full** | **Launch-to-PWA** | Thread management (replies, history, resolution) is PWA-depth |
| Multi-run comparison | **Full** | **Launch-to-PWA** | Comparing multiple reviewer-generated runs is PWA-depth |
| Review history browsing | **Full** | **Launch-to-PWA** | Full annotation history and review run history browsing is PWA-depth |
| Executive review catalog | **Full** | **Broad** | Catalog visible in both; deeper management stays in PWA |

**Lane depth doctrine for executive review:** PWA provides the full executive review experience. SPFx provides broad direct interaction — a PER can read, annotate, generate runs, and push to team from SPFx without being forced to PWA for common review tasks. Deeper workflows (thread management, multi-run comparison, history browsing) stay in PWA.

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
| Executive review thread management | Replies, thread history, and resolution require PWA-depth interaction |
| Multi-run review comparison | Comparing multiple reviewer-generated runs requires PWA-depth |
| Executive review history browsing | Full annotation history browsing is PWA-depth |
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

**Last Updated:** 2026-03-24 — Updated §4.8.3 and executive-review references to replace the old Subcontract Compliance checklist / waiver lane model with the P3-E13 Subcontract Execution Readiness case / evaluation / exception / precedent model.
**Governing Authority:** [Phase 3 Plan §10](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
