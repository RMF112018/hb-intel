# P3-E11: Project Startup Module — Master Index

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification — T-File Master Index |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Specification — locked architecture; T-files govern |
| **Related contracts** | P3-E1 §3.10, P3-E2 §13, P3-E3 §9.7, P3-H1 §18.6, P3-D1 (Activity), P3-D2 (Health), P3-D3 (Work Queue), P3-D4 (Related Items) |

---

## T-File Index

This document is the master index for the P3-E11 Project Startup Module T-file set. The original single-file specification has been superseded by 10 T-files, each covering a distinct architectural concern. **The T-files govern where they conflict with any earlier prose.**

| T-File | Title | Key coverage |
|---|---|---|
| [T01](P3-E11-T01-Operating-Model-Scope-Surface-Map-Lifecycle-Continuity.md) | Operating Model, Scope, Surface Map, Lifecycle Continuity | Startup as top-level readiness program; why five-surface composite model is superseded; three-tier architecture; full 8-state lifecycle (Draft → Active Planning → Readiness Review → Ready for Mobilization → Mobilized → Stabilizing → Baseline Locked → Archived); program status vs. sub-surface certification status; always-on lifecycle positioning; stabilization window governing rules; SoT boundary matrix (18 data concerns); Closeout continuity interface |
| [T02](P3-E11-T02-Record-Families-Identity-Lifecycle-Certifications-Waivers.md) | Record Families, Identity, Lifecycle, Certifications, Waivers | All 28 record families across 4 validated tiers; split org-governed template vs. project-scoped operational identity model; canonical provenance rules; `@hbc/versioned-record` requirements; `PublicationState` applicability by record family; `ReadinessGateRecord` + `ReadinessGateCriterion`; governed gate criteria per sub-surface; `ProgramBlocker`; `ExceptionWaiverRecord` lapse model; `StartupProgramVersion` audit log; role-scoped certification ownership; `StartupBaseline` full field architecture |
| [T03](P3-E11-T03-Startup-Program-Checklist-Library-Readiness-Tasks-Blockers-Evidence.md) | Startup Program Checklist Library, Readiness Tasks, Blockers, Evidence | Governed template-instance checklist architecture with no separate top-level library record; MOE-owned `StartupTaskTemplate` catalog → per-project `StartupTaskInstance` set; 55-task, 4-section template catalog; task category/severity/gating taxonomy; dependency and SLA model anchored to planned launch dates; `TaskBlocker` first-class records; evidence expectations; task completion vs. readiness approval distinction |
| [T04](P3-E11-T04-Contract-Obligations-Register-Operating-Model.md) | Contract Obligations Register Operating Model | Owner Contract Review replaced by an active Contract Obligations monitoring ledger; canonical obligation lifecycle; `flagForMonitoring` routing and due-date/recurrence model; certification review rules; Procore setup reference |
| [T05](P3-E11-T05-Responsibility-Routing-and-Accountability-Engine.md) | Responsibility Routing and Accountability Engine | Responsibility Matrix as a routing engine, not a spreadsheet artifact; 7 PM assignment columns with 71 assignment-bearing rows plus 11 reminder rows; 5 Field assignment columns with 27 assignment-bearing rows; category-level primary coverage and critical acknowledgment gates |
| [T06](P3-E11-T06-Project-Execution-Baseline-Startup-Baselines-and-Closeout-Continuity.md) | Project Execution Baseline, Startup Baselines, and Closeout Continuity | PM Plan as Project Execution Baseline; 11-section structured baseline; key baseline fields by section; baseline lock event; StartupBaseline snapshot; Closeout continuity handoff record |
| [T07](P3-E11-T07-Startup-Safety-Readiness-and-Permit-Posting-Verification.md) | Startup Safety Readiness and Permit Posting Verification | 32-item safety readiness surface; remediation-capable Fail model; Permit Posting Verification (Section 4); evidence-and-cross-reference model; Safety and Permits module non-interference rules |
| [T08](P3-E11-T08-Spine-Publication-Reports-Executive-Review-and-Cross-Module-Consumption.md) | Spine Publication, Reports, Executive Review, and Cross-Module Consumption | Activity Spine events; Health Spine metrics; Work Queue items; Related Items relationships; Reports integration; executive review annotation model; cross-module consumption surfaces |
| [T09](P3-E11-T09-Permissions-Role-Matrix-Lane-Ownership-and-Shared-Package-Reuse.md) | Permissions, Role Matrix, Lane Ownership, and Shared Package Reuse | Master role permission matrix; PE mobilization authorization authority; lane depth (PWA vs. SPFx); shared package integration contracts; prohibited dependencies |
| [T10](P3-E11-T10-Implementation-and-Acceptance-Guide.md) | Implementation and Acceptance Guide | Where to start; shared package blocker check; 7-stage implementation sequence with per-stage acceptance gates; cross-module API contracts; acceptance criteria; testing concerns |

---

## Module Overview

Project Startup is a **top-level readiness program** — not a collection of five peer forms. It provides HB Intel with a governed, evidence-gated, PE-authorized launch process for every project. The sub-surfaces beneath it are subordinate ledgers, verification surfaces, and baseline records that together satisfy the readiness program's certification and mobilization requirements.

The module activates at project creation, operates through an early-execution stabilization window, then locks a project-scoped baseline that survives into the Closeout/Autopsy phase for delta analysis.

At the record layer, T02 governs a four-tier architecture: Tier 1 program-core governance records, Tier 2 governed template/task-library records, Tier 3 project-scoped operational surface records, and Tier 4 immutable continuity records. This split is important because the org-governed `StartupTaskTemplate` family is versioned and copied into projects, while project-scoped operational records are certification-reviewed and baseline-locked.

At the checklist layer, T03 governs a template-instance operating model rather than a separate `StartupTaskLibrary` record. The "library" is the combination of the MOE-owned `StartupTaskTemplate` catalog and the project-scoped `StartupTaskInstance` set generated for each Startup program.

At the contract-review layer, T04 governs the Contract Obligations Register as an active monitoring ledger with certification-review rules; it is not a one-time extraction artifact that disappears after startup entry.

### Program Sub-Surfaces

| # | Sub-surface | Architectural role | Description |
|---|---|---|---|
| 1 | **Startup Program Checklist** | Readiness task library | 55-item MOE-governed mobilization readiness task library; tri-state result (N/A / Yes / No); blocker and evidence attachment model |
| 2 | **Startup Safety Readiness** | Verification surface — remediation-capable | 32-item startup-phase safety check (Pass/Fail/N/A); Fail items require remediation notes; distinct from Safety module ongoing inspections |
| 3 | **Permit Posting Verification** | Verification surface — evidence and cross-reference | Section 4 of the startup checklist; verifies permits are posted on jobsite; cross-references Permits module for context but does not write to it |
| 4 | **Contract Obligations Register** | Ledger — obligations lifecycle | Structured extraction and active monitoring of Owner contract obligations; certification review is based on documented routing/acknowledgment, not blanket closure |
| 5 | **Responsibility Routing Engine** | Ledger — accountability routing | Workbook-grounded PM/Field assignment engine with reminder-row preservation, category-level primary coverage, critical-category acknowledgment, and immutable governed task descriptions |
| 6 | **Project Execution Baseline** | Baseline record — structured commitments | 11-section PM Plan structured as project execution baseline; baseline fields capture explicit commitments for Closeout delta analysis; PM Plan is the primary delivery vehicle |

### Architecture Model

```
┌─────────────────────────────────────────────────────────────────────┐
│  TIER 1 — READINESS PROGRAM CORE                                     │
│  (state machine; blocker tracking; evidence gates; exception handling)│
│                                                                       │
│  StartupReadinessStateMachine                                         │
│    DRAFT → ACTIVE_PLANNING → READINESS_REVIEW                        │
│    → READY_FOR_MOBILIZATION → MOBILIZED → STABILIZING                │
│    → BASELINE_LOCKED → ARCHIVED                                      │
│                                                                       │
│  ReadinessCertification  │  ExceptionWaiverRecord  │  PEMobilizationAuth│
└────────────────────────────────────┬────────────────────────────────┘
                                     │  feeds
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  TIER 2 — SUBORDINATE LEDGERS AND VERIFICATION SURFACES              │
│  (project team operates; each certifies independently)               │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ Startup Program  │  │ Startup Safety   │  │ Permit Posting   │   │
│  │ Checklist        │  │ Readiness        │  │ Verification     │   │
│  │ (55-item library)│  │ (32-item + remed)│  │ (Section 4 xref) │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ Contract         │  │ Responsibility   │  │ Project          │   │
│  │ Obligations      │  │ Routing Engine   │  │ Execution        │   │
│  │ Register         │  │ (PM + Field)     │  │ Baseline         │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
└────────────────────────────────────┬────────────────────────────────┘
                                     │  PE mobilization authorization
                                     │  + stabilization window close
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  TIER 3 — BASELINE CONTINUITY RECORDS                                │
│  (locked on baseline; read by Closeout; owned by Startup)            │
│                                                                       │
│  StartupBaseline (snapshot)  ←──── locked at BASELINE_LOCKED         │
│         ↓ Closeout read-only (delta analysis, Autopsy input)         │
│  P3-E10 Closeout / Autopsy  (reads; never writes back)               │
└─────────────────────────────────────────────────────────────────────┘
```

### Governance Boundaries

- `@hbc/project-startup` (L5 Feature) owns all operational state. No other feature package writes to Startup records.
- The Startup Safety Readiness surface does not feed Safety module corrective-action ledgers. Safety and Startup are operationally independent.
- Permit Posting Verification (Section 4) cross-references the Permits module for display context but does not write permit records, resolve permit lifecycle states, or auto-resolve checklist items based on permit status.
- The StartupBaseline snapshot is a Startup-owned read model that survives into Closeout. Closeout reads it for delta analysis. Closeout may not modify it.
- PE mobilization authorization is a formal gate action. It is distinct from PE annotation (`@hbc/field-annotations`), which is non-blocking and does not advance any readiness state.

---

## Locked Architecture Decisions

The following 10 decisions are binding. All T-files conform to these decisions. Any implementation that contradicts them requires an explicit architecture review.

| # | Decision |
|---|---|
| 1 | Project Startup is a top-level readiness program; its sub-surfaces are subordinate ledgers, verification surfaces, and baseline records — not five equal peer forms |
| 2 | Owner Contract Review is a Contract Obligations Register with obligation lifecycle states, active monitoring capability, and certification-review rules; it is not a one-time review form |
| 3 | Startup operates a formal readiness state machine with blocker tracking, evidence gates, readiness review, and exception handling including waivers |
| 4 | The Responsibility Matrix is a role-accountability and routing engine; category-level primary coverage and critical-category acknowledgment govern certification, while task descriptions remain immutable template entries |
| 5 | The PM Plan is a structured Project Execution Baseline; its sections capture explicit commitment records against which Closeout/Autopsy can compute deltas |
| 6 | Startup preserves explicit project-scoped StartupBaseline snapshot records that survive into the Closeout/Autopsy phase for delta analysis; Closeout may read these records but may not write to them |
| 7 | Startup Safety Readiness is a remediation-capable surface: Fail items require remediation notes; the Startup Safety surface does not feed Safety module corrective-action ledgers; the two surfaces are operationally independent |
| 8 | Permit Posting Verification (Section 4) is an evidence-and-cross-reference verification surface; it cross-references the Permits module for context but does not write to it; permit status from P3-E7 does not auto-resolve Section 4 items |
| 9 | The approval model is multi-party readiness certification (each sub-surface certifies independently) plus PE mobilization authorization (PE formally authorizes project mobilization); mobilization authorization is the gate that triggers the stabilization window |
| 10 | Startup remains active through an early-execution stabilization window (configurable, default 14 days post-mobilization authorization); at window close, PE locks the baseline and the StartupBaseline snapshot is created; the snapshot is immutable from that point |

---

## Cross-Reference Map

| Concern | Governing source |
|---|---|
| Module classification | P3-E1 §3.10 |
| SoT and action boundary | P3-E2 §13 |
| Activity Spine publication contract | P3-D1 + T08 §1 |
| Health Spine publication contract | P3-D2 + T08 §2 |
| Work Queue items | P3-D3 + T08 §3 |
| Related-items relationship pairs | P3-D4 + T08 §4 |
| Reports integration | P3-E9 (Reports) + T08 §5 |
| Lane capability (PWA / SPFx) | P3-G1 §4.10 + T09 §2 |
| Acceptance criteria | P3-H1 §18.6 + T10 §5 |
| Shared package integration | T09 §3 |
| Role and visibility governance | T09 §1 |
| Permits module boundary | P3-E7 + T07 §4 |
| Safety module boundary | P3-E8 + T07 §3 |
| Closeout continuity | P3-E10 + T06 §6 |

---

## Implementation Read Order

For an implementation team starting Startup work, the recommended read sequence is:

1. **T10 §1** — where to start; shared package blocker check
2. **T01 §1–3** — readiness program model, surface map, and scope
3. **T01 §4–6** — readiness state machine, stabilization window, Closeout continuity
4. **T02** — record families and identity model (implement alongside core state)
5. **T03** — checklist task library (implement first among sub-surfaces)
6. **T07** — safety readiness and permit posting verification (implement alongside T03)
7. **T04** — contract obligations register
8. **T05** — responsibility routing engine
9. **T06** — project execution baseline and baseline lock
10. **T08** — spine publication and cross-module consumption (implement alongside each sub-surface)
11. **T09** — role permissions and lane ownership (implement alongside each sub-surface)

---

## What This T-File Set Supersedes

The original single-file specification (2026-03-23) has been fully superseded. Key architectural corrections from the original:

| Original (superseded) | Correct (T-files govern) |
|---|---|
| Five equal peer sub-surfaces with no governing program layer | Top-level readiness program with subordinate ledgers and verification surfaces; Tier 1 readiness state machine governs all (T01) |
| Flat `NotStarted / InProgress / Complete / Archived` composite status | Formal `StartupReadinessStateMachine` with 8 states, blocker tracking, evidence gates, exception/waiver handling (T01, T02) |
| Owner Contract Review as a one-time structured review form | Contract Obligations Register with obligation lifecycle states, flagging model, and active monitoring capability (T04) |
| Responsibility Matrix as spreadsheet artifact | Role-accountability and routing engine with immutable task descriptions and assignment routing rules (T05) |
| PM Plan as primarily narrative document | Structured Project Execution Baseline with explicit commitment fields supporting Closeout/Autopsy delta analysis (T06) |
| No startup baseline records beyond the module itself | Explicit `StartupBaseline` snapshot locked after stabilization window; Closeout reads for delta analysis (T01, T06) |
| Jobsite Safety Checklist — static Pass/Fail form | Startup Safety Readiness — remediation-capable surface with required remediation notes on Fail items (T07) |
| Section 4 permit items as plain checklist items | Permit Posting Verification — explicit evidence-and-cross-reference surface with Permits module read context (T07) |
| No formal approval model beyond PM Plan Draft→Approved | Multi-party readiness certification per sub-surface plus PE mobilization authorization as the formal program gate (T01, T02, T09) |
| Module closes on composite Complete status | Startup remains active through stabilization window; baseline locks at window close; module records become immutable after lock (T01) |

---

*[T01 →](P3-E11-T01-Operating-Model-Scope-Surface-Map-Lifecycle-Continuity.md)*
