# P3-E7 Permits Module — Master Index

**Doc ID:** P3-E7
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Type:** Master Index
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## Operating Model Overview

The Permits Module governs the full lifecycle of construction permits from pre-application through post-closeout. It replaces a prior single-record `IPermit` model with a governed **multi-record ledger architecture** in which every significant permit event, inspection visit, deficiency, lifecycle action, and evidence item is its own first-class record with identity, provenance, and auditability.

The module owns two distinct concern areas:

- **Pre-issuance governance** — permit application, submission tracking, jurisdiction response
- **Post-issuance operations** — permit status, required inspections, inspection visits, deficiency resolution, renewal, and closeout

Compliance health and compliance scores are **derived** from record truth (deficiencies, expiration proximity, blocking inspection outcomes). No manual numeric score is stored or accepted.

A **thread model** connects related permits — master permit, subpermits, phased releases, revisions, temporary approvals, and closeout paths — into a governed regulatory package.

Shared packages required: `@hbc/related-items`, `@hbc/workflow-handoff`, `@hbc/acknowledgment`, `@hbc/field-annotations`, `@hbc/versioned-record`, `@hbc/bic-next-move`.

---

## Source Files

| File | Contents |
|------|----------|
| This file | Master index, operating model, reading guide, file index |
| P3-E7-T01 | Product shape, scope, doctrine, and permit thread model |
| P3-E7-T02 | Record architecture, identity model, and responsibility envelopes |
| P3-E7-T03 | Lifecycle states, actions, and governance (PermitLifecycleAction) |
| P3-E7-T04 | Inspection, deficiency, and derived compliance control |
| P3-E7-T05 | Workflow publication, spine contracts, and downstream surfaces |
| P3-E7-T06 | UX surface, operational views, PER annotation scope, and reporting |
| P3-E7-T07 | Data migration, required inspections import, and future integration |
| P3-E7-T08 | Implementation guide, package blockers, and acceptance gate |

---

## File Index

| # | File | Part | Key Contents |
|---|------|------|--------------|
| — | P3-E7 (this file) | Master Index | Operating model, file index, reading guide |
| T01 | P3-E7-T01-Product-Shape-Scope-and-Doctrine.md | 1 of 8 | Module purpose, boundary, permit thread model, cross-contract positioning |
| T02 | P3-E7-T02-Record-Architecture-and-Identity-Model.md | 2 of 8 | 7 first-class record families, identity fields, responsibility envelopes, enums |
| T03 | P3-E7-T03-Lifecycle-State-Actions-and-Governance.md | 3 of 8 | PermitApplication states, IssuedPermit states, PermitLifecycleAction record, transition rules |
| T04 | P3-E7-T04-Inspection-Deficiency-and-Compliance-Control.md | 4 of 8 | RequiredInspectionCheckpoint, InspectionVisit, InspectionDeficiency, derived compliance |
| T05 | P3-E7-T05-Workflow-Publication-and-Downstream-Surfaces.md | 5 of 8 | Activity spine, health spine, work queue rules, related-items, bic-next-move |
| T06 | P3-E7-T06-UX-Surface-Operational-Views-and-Reporting.md | 6 of 8 | Permit list, detail view, inspection log, compliance dashboard, PER surface |
| T07 | P3-E7-T07-Data-Migration-Import-and-Future-Integration.md | 7 of 8 | Migration from flat model, xlsx template import, evidence upload, jurisdiction API |
| T08 | P3-E7-T08-Implementation-and-Acceptance.md | 8 of 8 | Package blockers, implementation stages, cross-file notes, acceptance gate (AC-PRM-01–AC-PRM-52) |

---

## Reading Guide

**To understand what the module owns and why:** Start at T01.

**To understand the data model:** Read T02 for record families and identity, then T03 for lifecycle, then T04 for inspection and compliance details.

**To understand platform integration:** Read T05 (spines and work queue).

**To understand the UI:** Read T06.

**To implement or migrate:** Read T07 for migration and import, then T08 for the implementation guide and acceptance gate.

**To update cross-module contracts:** Cross-references in T01 §5 point to P3-E1, P3-E2, P3-D1–D4, P3-G1–G3, P3-H1. Consult those files for their view of the Permits boundary.

---

## Key Locked Decisions

All decisions below are **locked (B)** and must not be revisited without an explicit architecture decision:

1. `PermitApplication` is a first-class record (pre-issuance lifecycle).
2. `IssuedPermit` is a first-class record separate from application.
3. `RequiredInspectionCheckpoint` is governed by a template library (not free-text).
4. `InspectionVisit` is a first-class record (replaces nested `IInspection[]`).
5. `InspectionDeficiency` is a first-class record (replaces nested `IInspectionIssue[]`).
6. `PermitLifecycleAction` is a first-class record replacing status-enum-mutation as the lifecycle mechanism.
7. `PermitEvidenceRecord` is a first-class record for documents, photos, and certificates.
8. Responsibility envelopes are applied to `IssuedPermit`, `InspectionVisit`, and `InspectionDeficiency`.
9. No manual `complianceScore` field exists anywhere in the model.
10. Compliance health is derived from record truth: deficiencies, expiration, blocking inspection outcomes.
11. A thread model connects master permits, subpermits, phased releases, revisions, temporary approvals, and closeout paths.
12. The governed template library drives `RequiredInspectionCheckpoint` creation per permit type.
13. Work Queue items are published across the full permit lifecycle (not just expiration).
14. PER annotation scope covers all `IssuedPermit` and `InspectionVisit` fields using `@hbc/field-annotations`.
15. `@hbc/versioned-record` provides audit trail; `@hbc/workflow-handoff` manages cross-party handoffs.

---

*← No previous file | Master Index | [T01 →](P3-E7-T01-Product-Shape-Scope-and-Doctrine.md)*
