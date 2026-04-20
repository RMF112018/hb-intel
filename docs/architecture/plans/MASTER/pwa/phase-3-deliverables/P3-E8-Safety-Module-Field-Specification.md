# P3-E8 Safety Module — Master Index

**Doc ID:** P3-E8
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Type:** Master Index
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## Operating Model Overview

The Safety Module is a **governed multi-record workspace** that manages the company's full construction safety lifecycle — from the Site Specific Safety Plan that governs a project, through weekly inspections, daily hazard analysis, toolbox talks, incident response, orientation, and subcontractor compliance. It is not an inspection log. It is not a checklist tool. It is the operative safety operating platform for every active construction project.

The module separates **Safety-Manager-governed content** from **project-instance content**. The Safety Manager or Safety Officer owns and controls the governed core: SSSP base templates, inspection checklist templates and scoring weights, toolbox prompt libraries, schedule risk detection rules, and readiness rules. Project teams own the day-to-day operational record creation within those governed structures.

Safety health is expressed as a **composite scorecard** — not as the latest inspection score. The scorecard combines inspection score trend, open/overdue corrective actions, readiness status, blocker/exception state, and required compliance completion indicators. No single metric is the dominant signal.

Safety is **excluded from Phase 3 Executive Review annotation** per P3-E1 §9.3. PER posture grants tiered read access to governed operational summaries only. No annotation layer. No push-to-team.

---

## Source Files

| File | Contents |
|---|---|
| This file | Master index, operating model, reading guide, file index |
| P3-E8-T01 | Module scope, operating model, source-of-truth boundaries, lane ownership, visibility doctrine |
| P3-E8-T02 | Safety workspace architecture, record-family map, lifecycle map, authority and governance model |
| P3-E8-T03 | SSSP base plan, addenda, governed sections, project-instance sections, approval matrix |
| P3-E8-T04 | Inspection program, checklist template governance, versioning, scoring model, scorecard/trend publication |
| P3-E8-T05 | Corrective action ledger, incidents/cases, privacy/sensitivity tiers, evidence model, audit/provenance |
| P3-E8-T06 | JHA, daily pre-task planning, toolbox prompt intelligence, weekly toolbox-talk execution model |
| P3-E8-T07 | Orientation/acknowledgment, subcontractor submissions, qualifications/certifications, SDS/HazCom, competent-person designation |
| P3-E8-T08 | Readiness evaluation model, blocker/exception matrix, override workflow, project/sub/activity readiness surfaces |
| P3-E8-T09 | Project Hub, PER, reports workspace, work queue, related items, activity spine, publication contracts |
| P3-E8-T10 | Implementation guide, sequencing, blockers, shared-package reuse, acceptance criteria |

---

## File Index

| # | File | Part | Key Contents |
|---|------|------|--------------|
| — | P3-E8 (this file) | Master Index | Operating model, file index, locked decisions, reading guide |
| T01 | P3-E8-T01-Module-Scope-Operating-Model-and-Visibility.md | 1 of 10 | Boundary, record families overview, lane ownership, Safety Manager vs. project-instance authority, visibility doctrine |
| T02 | P3-E8-T02-Workspace-Architecture-and-Record-Family-Map.md | 2 of 10 | All record family interfaces, identity model, lifecycle states, governance layer |
| T03 | P3-E8-T03-SSSP-Base-Plan-Addenda-and-Approval-Governance.md | 3 of 10 | SSSP structure, controlled sections vs. editable sections, base plan lifecycle, addenda model, joint approval matrix |
| T04 | P3-E8-T04-Inspection-Program-Template-Governance-and-Scorecard.md | 4 of 10 | Checklist template versioning, 12-section scoring model (normalized), scorecard composition, trend publication |
| T05 | P3-E8-T05-Corrective-Actions-Incidents-Evidence-and-Privacy.md | 5 of 10 | Centralized Safety Corrective Action Ledger, incident/case model, tiered privacy, evidence record family, audit trail |
| T06 | P3-E8-T06-JHA-Pre-Task-Toolbox-Prompt-and-Toolbox-Talk.md | 6 of 10 | JHA/daily pre-task distinctions, toolbox prompt intelligence (schedule-driven), weekly toolbox-talk governed record, proof model |
| T07 | P3-E8-T07-Orientation-Subcontractor-Qualifications-SDS-CompetentPerson.md | 7 of 10 | Orientation/acknowledgment ledger, subcontractor safety-plan submissions, cert/qualification records, HazCom/SDS, competent-person designations |
| T08 | P3-E8-T08-Readiness-Evaluation-Blocker-Matrix-and-Override-Workflow.md | 8 of 10 | Readiness decision surface (Ready/Ready with Exception/Not Ready), blocker/exception matrix, override governance, project/sub/activity readiness |
| T09 | P3-E8-T09-Publication-Contracts-Project-Hub-PER-and-Reports.md | 9 of 10 | Activity spine, health spine composite scorecard, work queue rules, related items, Project Hub projection, PER tiered access, Reports workspace |
| T10 | P3-E8-T10-Implementation-and-Acceptance.md | 10 of 10 | Package blockers, implementation stages, sequencing, migration/replacement notes, acceptance criteria (AC-SAF-01 through AC-SAF-60) |

---

## Reading Guide

**To understand what the module owns and why:** Start at T01.

**To understand the full record architecture:** Read T02 for all record families, then T03 for SSSP, T04 for inspection, T05 for corrective actions/incidents, T06 for JHA/toolbox, T07 for orientation/subcontractor/qualifications.

**To understand the readiness model:** Read T08.

**To understand platform integration:** Read T09 (spines, work queue, PER, reports).

**To implement:** Read T10 for the build sequence, package blockers, and full acceptance gate.

---

## Key Locked Decisions (Summary)

All 39 decisions below are **locked** and must be implemented as specified. Full detail is in the relevant T files.

| # | Decision | Location |
|---|---|---|
| 1 | Safety is a governed workspace with multiple peer record families | T01, T02 |
| 2 | Project-specific scorecard and trend published to Project Hub; checklist execution in Safety workspace | T04, T09 |
| 3 | Weekly inspections completed by Safety Manager, not project team | T01, T04 |
| 4 | SSSP is hybrid: structured in-app + rendered formal document output | T03 |
| 5 | Governed SSSP sections maintained by Safety Manager only | T03 |
| 6 | Project teams can edit only designated project-instance SSSP sections | T03 |
| 7 | Safety Manager-only fields are restricted to Safety editing | T02, T03 |
| 8 | Weekly checklist templates are governed and versioned | T04 |
| 9 | Every completed inspection is tied to the exact template/scoring version used | T04 |
| 10 | Project Hub consumes immutable per-inspection summary projections | T04, T09 |
| 11 | Intelligent toolbox-talk prompts tied to schedule-driven upcoming high-risk activities | T06 |
| 12 | Toolbox prompt issuance is governed and acknowledgment-tracked | T06 |
| 13 | Schedule risk detection is hybrid: governed mappings first, intelligent assistance for gaps | T06 |
| 14 | Toolbox prompt closure uses governed closure model with proof requirements | T06 |
| 15 | Safety Corrective Action Ledger is centralized regardless of source workflow | T05 |
| 16 | Incident/case visibility uses tiered privacy model | T05 |
| 17 | Orientation and acknowledgment records are first-class governed records | T07 |
| 18 | Subcontractor safety-plan submissions are first-class governed records | T07 |
| 19 | SSSP lifecycle: one approved base plan + controlled addenda; full reapproval for material changes only | T03 |
| 20 | Base SSSP approval requires joint sign-off (Safety Manager, PM, Superintendent) | T03 |
| 21 | Addenda approval rules governed: Safety always required; PM/Super when operationally affected | T03 |
| 22 | Safety compliance publishes a governed readiness decision: Ready / Ready with Exception / Not Ready | T08 |
| 23 | Readiness is not a hard technical stop in v1 but is a formal governed decision surface | T08 |
| 24 | Readiness evaluated at project, subcontractor, and activity/work-package levels | T08 |
| 25 | Readiness rules use governed blocker-and-exception matrix, not a weighted score | T08 |
| 26 | Readiness exceptions/overrides use governed joint workflow | T08 |
| 27 | Safety evidence is a governed evidence-record layer with metadata, review state, sensitivity, retention | T05 |
| 28 | JHA and Daily Pre-Task Plan are linked but distinct record families | T06 |
| 29 | Weekly toolbox talks are their own governed record family | T06 |
| 30 | Toolbox talk proof uses hybrid model: baseline count + sign-in evidence; named records for governed high-risk | T06 |
| 31 | Workforce identity uses hybrid model: governed refs where available, provisional/ad hoc allowed | T07 |
| 32 | Subcontractor/company identity uses governed company registry with future external mapping | T07 |
| 33 | Future-state company mapping supports Procore commitment vendor/company identity | T07 |
| 34 | Certifications/qualifications are their own governed compliance records | T07 |
| 35 | HazCom/SDS compliance is its own governed record family | T07 |
| 36 | Competent-person designations are project-specific governed designation records | T07 |
| 37 | PER/executive visibility is tiered: leadership operational summaries; PER sanitized indicators; incident anonymized | T01, T09 |
| 38 | Weekly inspection scoring normalizes for applicable sections only | T04 |
| 39 | Project Hub/PER scorecards combine inspection trend, corrective actions, readiness, blockers, compliance completion | T09 |

---

*← No previous file | Master Index | [T01 →](P3-E8-T01-Module-Scope-Operating-Model-and-Visibility.md)*
