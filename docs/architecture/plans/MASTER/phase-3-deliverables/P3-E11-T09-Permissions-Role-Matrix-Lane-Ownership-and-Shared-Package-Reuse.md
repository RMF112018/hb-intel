# P3-E11-T09 — Permissions, Role Matrix, Lane Ownership, and Shared Package Reuse

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11-T09 |
| **Parent** | [P3-E11 Project Startup Module](P3-E11-Project-Startup-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T09 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Role Permission Matrix

### 1.1 Sub-Surface Permission Grid

| Role | Read all sub-surfaces | Edit — Task Library (items/results) | Edit — Safety Readiness | Edit — Permit Posting (Sec 4) | Edit — Contract Obligations Register | Edit — Responsibility Matrix (PM sheet) | Edit — Responsibility Matrix (Field sheet) | Edit — Execution Baseline (PM Plan) | Approve PM Plan | Submit ReadinessCertification | Review/Accept Certification | Issue Mobilization Authorization | Lock Baseline | Annotate (any surface) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **PX (Project Executive)** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | **Yes (PX only)** | Yes | **Yes (PX only)** | **Yes (PX only)** | **Yes (PX only)** | Yes |
| **Sr. PM / PM2 / PM1** | Yes | Yes | Yes | Yes | Yes | Yes | No | Yes | No | Yes | No | No | No | Yes |
| **PA (Project Administrator)** | Yes | Yes | No | No | Yes | No | No | No | No | No | No | No | No | Yes |
| **QAQC Manager** | Yes | Yes | No | No | No | No | No | No | No | No | No | No | No | Yes |
| **Safety Manager** | Yes | No | Yes | No | No | No | No | No | No | No | No | No | No | Yes |
| **Project Accountant** | Yes | No | No | No | Yes (read-only) | No | No | No | No | No | No | No | No | Yes |
| **Field Superintendent** | Yes | No | Yes | Yes | No | No | Yes | No | No | No | No | No | No | No |
| **PER (Project Executive Reviewer)** | Yes | No | No | No | No | No | No | No | No | No | No | No | No | Yes |
| **Read-Only** | Yes | No | No | No | No | No | No | No | No | No | No | No | No | No |

### 1.2 Detailed Permission Notes

**PX mobilization authorization and baseline lock are exclusive to PX role.** No other role may create a `PEMobilizationAuthorization` record, lock the baseline, or accept/return a `ReadinessCertification`. These are hard system constraints enforced at the API layer — not soft guidelines. Non-PX attempts return HTTP 403.

**PM roles (Sr. PM, PM2, PM1) may submit certifications** for all sub-surfaces where their edit permissions apply. PA may edit the Contract Obligations Register but may not certify it.

**Safety Manager:** Edits Safety Readiness surface only. Cannot edit Task Library items, Responsibility Matrix PM sheet, PM Plan, or Contract Obligations Register. This is an intentional scope boundary — safety input is restricted to the startup safety assessment, not the broader program.

**Field Superintendent:** Edits Section 4 (Permit Posting), Safety Readiness items, and the Responsibility Matrix Field sheet. Cannot edit PM sheet roles, PM Plan sections, or Contract Obligations Register.

**Project Accountant:** Read access to Contract Obligations Register (receives Work Queue items for obligation monitoring); does not have write access. Write access is intentionally withheld — the PM owns obligation entries; the accountant monitors only.

**PER:** Annotation via `@hbc/field-annotations` is permitted on all sub-surfaces. PER may not initiate any certification submission, gate review, mobilization authorization, or baseline lock. Annotation does not advance any status.

---

## 2. PM vs. Superintendent vs. Safety vs. QAQC — Authority Boundaries

| Authority area | PM role | Superintendent | Safety Manager | QAQC Manager | PX |
|---|---|---|---|---|---|
| Task Library (startup checklist items) | Write all | No write | No write | Write all | Write all |
| Safety Readiness items | Write | Write | Write | No write | Write |
| Permit Posting (Section 4) | Write | Write | No write | No write | Write |
| Contract Obligations Register | Write | No write | No write | No write | Write |
| Responsibility Matrix — PM sheet assignments | Write | No write | No write | No write | Write |
| Responsibility Matrix — Field sheet assignments | Write | Write | No write | No write | Write |
| PM Plan / Execution Baseline | Write | No write | No write | No write | Approve |
| ReadinessCertification submission | Yes (all surfaces) | No | No | No | Yes |
| ReadinessCertification acceptance/return | No | No | No | No | **Yes (exclusive)** |
| Mobilization Authorization | No | No | No | No | **Yes (exclusive)** |
| Baseline lock | No | No | No | No | **Yes (exclusive)** |
| Annotation | Yes | No | Yes | Yes | Yes |

---

## 3. Multi-Party Readiness Certification Rules

Certifications for some sub-surfaces require co-signers beyond the submitting PM. The `ReadinessCertification.certifiedBy[]` array captures all certifiers.

| Sub-surface | Required submitter | Required co-certifier(s) | PE review |
|---|---|---|---|
| `STARTUP_TASK_LIBRARY` | PM | None | Yes — PE accepts or returns |
| `SAFETY_READINESS` | PM | Safety Manager must co-certify | Yes — PE reviews `failCount` and open remediations |
| `PERMIT_POSTING` | PM | None | Yes |
| `CONTRACT_OBLIGATIONS` | PM | None | Yes |
| `RESPONSIBILITY_MATRIX` | PM | None; but critical category `acknowledgedAt` gate must be satisfied | Yes |
| `EXECUTION_BASELINE` | PM | PX must have set `status = Approved` on the PM Plan before certification can be submitted | PE review counts as certification gate acceptance |

**Safety Readiness co-certification:** When PM submits the `SAFETY_READINESS` certification, the system requires a Safety Manager acknowledgment record before the submission is accepted. The Safety Manager does not independently submit; they co-sign the PM's submission. If no Safety Manager is named on the project, PM must document the gap in the certification notes. PE reviews the co-certification state before accepting.

---

## 4. PE Mobilization Authorization — Authority Rules

The `PEMobilizationAuthorization` is the formal PE act that transitions the program from `READY_FOR_MOBILIZATION` to `MOBILIZED` and begins the stabilization window.

| Rule | Description |
|---|---|
| **Exclusive to PX** | Only the PX role (`roleCode = PX`) may create `PEMobilizationAuthorization`. Non-PX returns HTTP 403 regardless of other permissions |
| **All certifications must be ACCEPTED or WAIVED** | API enforces that every `ReadinessCertification` for all 6 sub-surfaces is in `ACCEPTED` or `WAIVED` state before `PEMobilizationAuthorization` creation is permitted. Non-compliant attempt returns HTTP 400 with `UNACCEPTED_CERTIFICATIONS` |
| **No open ProgramBlockers of scope PROGRAM** | API enforces that no `ProgramBlocker` with `scope = PROGRAM` and `status = OPEN` exists at the time of authorization |
| **Stabilization window duration is required** | `stabilizationWindowDays` must be populated (typically 14–30 days); PE sets this explicitly at authorization time |
| **Revocation is permitted but material** | PE may revoke authorization; revocation reverts the program state to `READY_FOR_MOBILIZATION` and requires PE note; all stabilization-locked task instances reopen |

---

## 5. Waiver and Exception Authority

| Waiver type | Authority | Required fields |
|---|---|---|
| `ExceptionWaiverRecord` — waives a `ReadinessCertification` sub-surface gate | PX only | `waiverNote` describing the exception basis; `approvedBy` = PX userId |
| `ContractObligation.obligationStatus = WAIVED` | PX only | `waiverNote` describing contractual basis |
| `TaskBlocker` waiver | PM (for non-gating blockers); PX required for blockers tied to CRITICAL gating tasks | `resolvedBy`, `waiverNote` |
| `ProgramBlocker` waiver | PX only | `waiverNote`, `resolvedBy` |
| `SafetyRemediationRecord` acknowledged-but-open at certification | PE review and acceptance constitutes implicit waiver for certification purposes | PE acceptance recorded in `ReadinessCertification.reviewNotes` |

All waiver records are preserved permanently. There is no hard-delete path for any waiver record.

---

## 6. Annotation Visibility

| Annotation | Who places it | Who sees it |
|---|---|---|
| Field-level annotation by PX on any sub-surface | PX | All project members with read access to that sub-surface |
| Field-level annotation by PER on any sub-surface | PER | PX, PER, PM/PA on the project (per P3-A2 annotation visibility rules) |
| Safety Readiness item annotation | PX, PER, PM, Safety Manager | All roles with read access to Safety Readiness |
| Post-BASELINE_LOCKED annotation | PX, PER | All roles with read access (records are read-only; annotations continue) |

**Internal vs. restricted audience:** All Startup annotations are visible within the project boundary (project members only). No Startup annotation is published to external parties or included in owner-facing reports. PER annotations are visible to the project team when the PER has review scope — they are not hidden from the PM team.

---

## 7. Lane Ownership — PWA vs. SPFx

Per P3-G1 §4.8.2, Project Startup is a lifecycle module with full parity across both lanes. Both lanes deliver the complete Startup experience; there is no escalation to PWA required for any core Startup certification or gate action.

### 7.1 PWA Depth

PWA delivers the full Startup experience:
- Complete readiness state machine visualization with state history timeline
- All six sub-surface workspaces with full editing and certification UI
- `ReadinessGateRecord` criterion evaluation UI (per-criterion PASS/FAIL/WAIVED/NOT_APPLICABLE)
- `ProgramBlocker` and `TaskBlocker` management UI
- `ExceptionWaiverRecord` creation and management
- `ExecutionAssumption` authoring and success-criteria entry
- `PermitVerificationDetail` photo evidence upload and verification
- `SafetyRemediationRecord` full remediation UI with evidence upload
- Certification submission, PE review, and mobilization authorization UI
- Stabilization window countdown and baseline lock confirmation dialog
- Post-lock read-only `StartupBaseline` summary view

### 7.2 SPFx Depth

SPFx delivers broad operational parity:
- All six sub-surface workspaces directly accessible in SPFx
- Task library item result entry, safety result entry, obligation row entry, assignment entry
- Contract Obligations Register entry and monitoring flag management
- PM Plan section editing (all sections including structured fields and `ExecutionAssumption` authoring)
- `ReadinessCertification` submission
- PE certification review, gate criterion entry, and mobilization authorization
- Baseline lock action
- `SafetyRemediationRecord` note entry and assignment

**SPFx deferred to PWA (Launch-to-PWA):**
- Full state machine visualization with history timeline (state transitions work in SPFx; timeline view is PWA-depth)
- `PermitVerificationDetail` photo evidence upload (metadata entry works in SPFx; photo upload is PWA-depth)
- Advanced blocker dependency chain visualization

### 7.3 Lane-Consistent Contracts

Both lanes must implement identically:
- All `StartupReadinessState` state transitions and guard rules (HTTP 409 for invalid transitions in both lanes)
- `ReadinessCertification` lifecycle and submission gates
- Immutability enforcement at `BASELINE_LOCKED` (HTTP 405 in both lanes)
- All record field contracts defined in T02–T07
- Role permission enforcement (HTTP 403 for unauthorized gate actions in both lanes)

---

## 8. Package Identity

| Property | Value |
|---|---|
| Package name | `@hbc/project-startup` |
| Layer | L5 Feature |
| Surface classification | Lifecycle module — always-on |
| Owner | Project Hub Leadership |

No other feature package may import from `@hbc/project-startup`. All cross-module data flows go through the Spine publication contracts, Work Queue registration, and the `StartupBaseline` read API.

---

## 9. Required Shared Package Integrations

### 9.1 Hard Blockers (required before any Startup UI ships)

| Shared package | Purpose in Startup | Blocker risk |
|---|---|---|
| `@hbc/field-annotations` | Executive review annotations on all sub-surface fields | **Hard blocker.** No annotation surface without it. Do not substitute local annotation storage. |
| `@hbc/versioned-record` | Audit trail on `obligationStatus`, `assignedPersonName`/`value`, task `result`, `BaselineSectionField.value`, `SafetyReadinessItem.result`, `ReadinessCertification.certStatus` | **Hard blocker.** All result changes must be versioned per T02 §2.2. |
| `@hbc/project-canvas` | Startup readiness tile in project canvas (pre- and post-lock states) | **Hard blocker.** Startup must surface in project canvas from project creation onward. |
| `@hbc/my-work-feed` | `StartupWorkAdapter` — all Work Queue items per T08 §3 | **Hard blocker.** Startup is a primary driver of Work Queue items across the project lifecycle. |
| `@hbc/activity-spine` | Activity event publication per T08 §1 | **Hard blocker.** Startup must publish lifecycle events. |
| `@hbc/health-spine` | Health metric publication per T08 §2 | **Hard blocker.** Startup readiness state is a core project health signal. |

### 9.2 High-Value Integrations (required but not blocking core Startup implementation)

| Shared package | Purpose in Startup | Risk if deferred |
|---|---|---|
| `@hbc/related-items` | Cross-module record relationships per T08 §4 | Degrades cross-module navigation; defer Section 4 ↔ Permits and Safety ↔ Safety module links. Do not substitute local link storage. |
| `@hbc/notification-intelligence` | Startup readiness alerts; overdue obligation and remediation notifications | No push notifications without it. Startup items remain in Work Queue; notification delivery is deferred. |
| `@hbc/workflow-handoff` | Safety co-certification workflow (PM submits, Safety Manager acknowledges) | Without it, co-certification requires a manual workaround (PM notes Safety Manager review in certification notes). Implement before the Safety Readiness certification gate is considered production-ready. |
| `@hbc/session-state` | Offline draft support for Task Library item entry and PM Plan section authoring | Without it, network interruptions lose in-progress entries. PWA offline capability is degraded; SPFx is unaffected (server-round-trip model). |

### 9.3 Integrations That Should Be Evaluated, Not Assumed

| Shared package | Evaluation question | Startup-specific guidance |
|---|---|---|
| `@hbc/complexity` | Should Startup surface a complexity indicator based on obligation count, open blockers, or pending certifications? | Evaluate whether the Health spine metrics already provide sufficient complexity signal. Do not add complexity scores if Health metrics are adequate. |
| `@hbc/smart-empty-state` | Should empty sub-surfaces (no items yet entered) use `HbcSmartEmptyState` with contextual guidance? | Yes — all six sub-surface workspaces should use `HbcSmartEmptyState` when no records exist. Behavior: display actionable guidance for starting each surface, not blank areas. Required for UI conformance (P3-H1 §6.8.9). |

### 9.4 Prohibited Dependencies

| Prohibited import | Reason |
|---|---|
| Direct import from `@hbc/project-closeout` | No cross-feature imports. Closeout reads Startup via API only. |
| Direct import from `@hbc/safety` | No cross-feature imports. Cross-reference is via Related Items only. |
| Direct import from `@hbc/permits` | No cross-feature imports. Startup reads Permits via API for display context only. |
| Direct import from `@hbc/financial` | No cross-feature imports. Financial data used only for pre-fill suggestions via API. |
| Spine publications that bypass `@hbc/activity-spine`, `@hbc/health-spine`, or `@hbc/my-work-feed` package contracts | All spine publication must go through established spine package contracts. |
| Creating visual primitives (buttons, cards, tables, status badges) outside `@hbc/ui-kit` | All reusable UI must come from `@hbc/ui-kit`. Feature-local composition shells are permitted within `@hbc/project-startup`. |

---

## 10. Canvas Integration

Project Startup contributes to the project canvas via `@hbc/project-canvas`. The Startup tile is a mandatory governance-tier core tile (per P3-C2 §3) until `BASELINE_LOCKED`. After baseline lock, the tile transitions to read-only baseline summary weight.

**Canvas tile registration:** `StartupCanvasTileAdapter` registers the tile with the canvas registry at module initialization.

Canvas tile requirements:
- Displays current `StartupReadinessState.stateCode` with human-readable label and color-coded state indicator
- Displays count of open `ProgramBlocker` records and open `TaskBlocker` records
- Displays `ReadinessCertification` progress summary (X of 6 certified)
- Displays overdue obligation count when > 0
- Links to Startup workspace from tile
- Post-lock: displays baseline lock date and link to `StartupBaseline` summary

---

## 11. Cross-Reference

| Concern | Governing source |
|---|---|
| Permissions model | This file (T09) |
| Certification rules | T02 §3.3 — ReadinessCertification model |
| Mobilization authorization rules | T02 §3.4 — PEMobilizationAuthorization model |
| Waiver model | T02 §3.4 — ExceptionWaiverRecord |
| ProgramBlocker model | T02 §3.4 — ProgramBlocker |
| Lane depth P3-G1 section | P3-G1 §4.8.2 |
| Package boundary rules | `.claude/rules/03-package-boundaries.md` |
| Canvas tile definition | P3-C2 §3 |
| Annotation model | T08 §7; `@hbc/field-annotations` |

---

*[← T08](P3-E11-T08-Spine-Publication-Reports-Executive-Review-and-Cross-Module-Consumption.md) | [Master Index](P3-E11-Project-Startup-Module-Field-Specification.md) | [T10 →](P3-E11-T10-Implementation-and-Acceptance-Guide.md)*
