# P3-E13: Subcontract Execution Readiness Module — Master Index

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E13 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification — T-File Master Index |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Specification — locked architecture; T-files govern; **T08 implementation complete (all 7 stages, 16/16 acceptance criteria verified, 410 tests, v0.1.80)** |
| **Related contracts** | P3-E1 §3.11, P3-E2 §16, P3-E4 §6, P3-D1, P3-D2, P3-D3, P3-D4, P3-G1 §4.8.3, P3-G2 §8.8, P3-H1 |

---

## T-File Index

This document is the master index for the P3-E13 Subcontract Execution Readiness Module T-file set. The earlier single-file P3-E12 checklist-and-waiver specification is superseded by this package. P3-E12 remains in the plan library as historical context only. The T-files below govern where they conflict with any earlier prose.

| T-File | Title | Key coverage |
|---|---|---|
| [T01](P3-E13-T01-Operating-Model-Scope-and-Boundaries.md) | Operating Model, Scope, and Boundaries | Business purpose; not-a-flat-checklist doctrine; owned surfaces; boundary map versus Financial, Startup, Reports, Health, Work Queue, and future vendor-master systems |
| [T02](P3-E13-T02-Record-Families-Identity-Lifecycle-and-Readiness-Decision.md) | Record Families, Identity, Lifecycle, and Readiness Decision | Parent case model; lineage; lifecycle; workflow status versus readiness decision; downstream projections as read models |
| [T03](P3-E13-T03-Requirement-Profiles-Item-Evaluation-and-SDI-Prequalification.md) | Requirement Profiles, Item Evaluation, and SDI / Prequalification | Governed profile binding; generated items; artifact state; evaluation state; typed metadata; SDI / prequalification outcome family |
| [T04](P3-E13-T04-Exception-Packets-Approvals-Delegation-and-Global-Precedent.md) | Exception Packets, Approvals, Delegation, and Global Precedent | Parent exception case; immutable submission iterations; approval slots; delegation audit; precedent publication rules |
| [T05](P3-E13-T05-Workflow-SLA-Escalation-Publication-and-Shared-Package-Use.md) | Workflow, SLA, Escalation, Publication, and Shared Package Use | Timers; reminders; escalations; shared-package usage; activity, health, work, and notification outputs |
| [T06](P3-E13-T06-Lanes-Permissions-Review-Annotations-and-UX-Surfaces.md) | Lanes, Permissions, Review Annotations, and UX Surfaces | Authority matrix; PWA / SPFx depth split; review-capable surfaces; annotation isolation; UX expectations |
| [T07](P3-E13-T07-Cross-Module-Contracts-and-Downstream-Integrations.md) | Cross-Module Contracts and Downstream Integrations | Financial gate contract; Startup / Reports / Health / Work Queue / Related Items publication; future-system input boundaries |
| [T08](P3-E13-T08-Implementation-and-Acceptance-Guide.md) | Implementation and Acceptance Guide | Delivery order; blockers; acceptance criteria; validation checklist; migration from P3-E12; cross-reference update checklist |

---

## Module Overview

Subcontract Execution Readiness is an **always-on Project Hub module** that determines whether HB Intel may move a subcontract award path into contract execution. It is centered on a parent `SubcontractReadinessCase` keyed by:

- `projectId`
- governed award / buyout intent
- subcontractor legal entity

The module is not a flat checklist and it is not a waiver-only routing surface. It exists to unify five distinct business concerns inside one governed operating model:

1. Pre-award package completeness
2. Subcontract execution readiness
3. Risk / compliance deficiency resolution
4. Exception handling when standard requirements cannot be satisfied
5. Financial gate consumption for contract execution

### Primary operational surfaces

| # | Surface | Architectural role | Description |
|---|---|---|---|
| 1 | **Readiness Case Registry** | Case discovery and routing | List and filter active cases by project, subcontractor, buyout line, readiness state, deficiency posture, and renewal status |
| 2 | **Readiness Case Workspace** | Primary source-of-truth workspace | Parent case header, requirement profile binding, item status, lineage, linked buyout context, and readiness summary |
| 3 | **Requirement Evaluation Workbench** | Specialist review surface | Artifact review, compliance evaluation, deficiency issuance, applicability rulings, and typed metadata validation |
| 4 | **Exception Packet Workspace** | Governed exception surface | Parent exception case, immutable submission iterations, approval-slot routing, delegation history, and decision-support artifacts |
| 5 | **Readiness Decision Surface** | Formal gate output | Issued readiness decision, blocked rationale, supersede / void posture, and Financial gate projection |
| 6 | **Review Overlay Surface** | Review-only annotation layer | PER and other authorized review actors can annotate supported surfaces without mutating operational state |

### Architecture model

```text
CLASS 1 — PRIMARY OPERATIONAL LEDGERS
  SubcontractReadinessCase
  ReadinessRequirementItem
  RequirementArtifact
  RequirementEvaluation
          |
          | unresolved governed deficiency
          v
CLASS 2 — EXCEPTION GOVERNANCE
  ExceptionCase
  ExceptionSubmissionIteration
  ExceptionApprovalSlot
  ExceptionApprovalAction
  ExceptionDelegationEvent
          |
          | specialist issuance
          v
CLASS 3 — GATE AND DOWNSTREAM PROJECTIONS
  ExecutionReadinessDecision
  ReadinessGateProjection
  Health / Work Queue / Activity / Related Items publications
  GlobalPrecedentReference
```

### Governance boundaries

- `@hbc/features-project-hub` owns all primary readiness records. No other feature package may write readiness cases, requirement items, exception packets, decisions, or lineage records.
- Financial enforces contract-execution gate transitions but reads readiness outputs only. Financial never authors readiness truth.
- Startup may link to readiness state only where startup context benefits from visibility. Startup never absorbs readiness ownership.
- Reports, Health, Work Queue, Related Items, and activity surfaces consume downstream projections or publication artifacts. They are not primary ledgers for readiness.
- Future vendor-master, prequalification, Procore, or external risk systems may later contribute facts, artifacts, or advisories. They do not displace the parent readiness case as the project-level Phase 3 source of truth.

---

## Locked Architecture Decisions

The following decisions are binding. All T-files conform to them. Any implementation that contradicts them requires explicit architecture review.

| # | Decision |
|---|---|
| 1 | The module is a parent-case operating model, not a flat checklist module. |
| 2 | Financial gates on an issued `ExecutionReadinessDecision`, not on generic checklist completion. |
| 3 | Requirement items are generated from governed requirement profiles, not from a universal fixed 12-item model. |
| 4 | Every requirement item carries both artifact state and compliance evaluation state. |
| 5 | SDI / prequalification is a governed requirement family with multiple valid outcomes and future integration seams. |
| 6 | Exception handling is based on immutable `ExceptionSubmissionIteration` records, not mutable waiver headers. |
| 7 | Approval delegation is controlled reassignment inside preserved approval slots with full audit history. |
| 8 | `GlobalPrecedentReference` is reference publication only and never auto-satisfies future cases. |
| 9 | Compliance / Risk owns routine evaluation and readiness issuance; PX participates in flagged business-risk visibility and defined exception approvals. |
| 10 | One active case exists per same legal entity plus same underlying award intent; material identity changes require supersede / void plus new case. |
| 11 | Workflow status is separate from readiness decision / outcome. |
| 12 | Downstream Health / Work Queue / Reports / Related Items / activity artifacts are projections or publications, not primary ledgers. |
| 13 | Timer-driven reminders, escalations, and routed work must use shared work-intelligence primitives rather than local substitutes. |

---

## Cross-Reference Map

| Concern | Governing source |
|---|---|
| Module classification | P3-E1 §3.11 |
| SoT and action boundary | P3-E2 §16 |
| Financial / Buyout gate | P3-E4 §6 + T07 §1 |
| Activity publication | P3-D1 + T05 §4 |
| Health publication | P3-D2 + T05 §5 |
| Work Queue publication | P3-D3 + T05 §4 |
| Related Items publication | P3-D4 + T07 §5 |
| Lane capability | P3-G1 §4.8.3 + T06 §4 |
| Cross-lane escalation | P3-G2 §8.8 + T06 §4 |
| Acceptance evidence | P3-H1 + T08 §5-§7 |

---

## Implementation Read Order

1. **T01** — understand the operating model, purpose, and boundary rules first.
2. **T02** — implement the parent case, identity, lineage, lifecycle, and decision separation.
3. **T03** — implement governed requirement profiles, generated items, and typed evaluation state.
4. **T04** — implement exception packets, immutable iterations, approval slots, and precedent publication.
5. **T05** — implement workflow timing, routed work, notifications, and shared-package integrations.
6. **T06** — implement role behavior, PWA / SPFx depth, review visibility, and annotation isolation.
7. **T07** — wire Financial gate consumption and downstream publications.
8. **T08** — verify blockers, acceptance gates, migration posture, and update checklist.

---

## What This T-File Set Supersedes

The P3-E12 single-file specification remains in the library as historical context only. The governing architecture changes are:

| Original (superseded) | Correct (P3-E13 governs) |
|---|---|
| Flat `Subcontract Checklist` drives the gate | Parent `SubcontractReadinessCase` plus issued `ExecutionReadinessDecision` drives the gate |
| One universal 12-item core model | Governed requirement profiles instantiate project-specific requirement sets |
| Document receipt is effectively the main state model | Artifact state and compliance evaluation state are distinct and both required |
| Compass SDI behaves like a binary requirement row | SDI / prequalification is a governed requirement family with multiple valid outcomes |
| Waiver is a mutable top-level record | `ExceptionCase` uses immutable `ExceptionSubmissionIteration` snapshots |
| Delegation replaces the approver role | Delegation is controlled reassignment inside a preserved approval slot |
| `GlobalLevel` implies reusable approval | `GlobalPrecedentReference` is reference publication only |
| Workflow and decision are effectively the same | Workflow lifecycle and readiness decision / outcome are separate artifacts |
| Financial checks readiness by checklist completion | Financial consumes a gate projection sourced from an issued readiness decision |

---

*[T01 →](P3-E13-T01-Operating-Model-Scope-and-Boundaries.md)*
