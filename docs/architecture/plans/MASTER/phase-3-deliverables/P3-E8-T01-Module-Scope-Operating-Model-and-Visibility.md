# P3-E8-T01 — Module Scope, Operating Model, and Visibility Doctrine

**Doc ID:** P3-E8-T01
**Parent:** P3-E8 Safety Module — Master Index
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 1 of 10
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. What This Module Is

The Safety Module is the **operative safety operating platform** for every active construction project. It owns:

- The Site Specific Safety Plan (SSSP) that governs how work is performed on a project
- The weekly inspection program — scheduled, executed, and scored by the Safety Manager
- The centralized corrective action ledger fed by inspections, incidents, JHAs, and direct safety observations
- Incident and case management, with tiered privacy
- Job Hazard Analysis (JHA) records governing high-risk scopes of work
- Daily pre-task planning instances that reference JHAs
- Toolbox talk records — governed weekly execution with prompt intelligence tied to the project schedule
- Worker orientation and acknowledgment records
- Subcontractor safety-plan submissions and compliance tracking
- Certifications, qualifications, and competent-person designations
- HazCom / SDS records
- The readiness decision surface: Ready / Ready with Exception / Not Ready — at project, subcontractor, and activity levels

The module is not an inspection log tool. It is not a standalone checklist application. It is not a deficiency tracker that happens to store incident reports. Every record family serves the same purpose: governing the safety lifecycle of an active construction project through an operative platform that expresses health, drives corrective action, and informs readiness.

---

## 2. What This Module Is Not

| Excluded | Reason |
|---|---|
| Financial or cost tracking | Owned by Cost module |
| Schedule float or logic | Owned by Schedule module |
| General document management | Owned by Documents module |
| Owner/AHJ permitting or code compliance | Owned by Permits module |
| HR or employment records | Out of scope for Phase 3 |
| System-of-record for HR certifications | Safety module tracks project-specific compliance state; HR owns the credential authority |
| Annotation layer for Executive Review | Explicitly excluded per P3-E1 §9.3 |
| Push-to-team content for PER | Excluded; PER receives tiered read-only summaries only |

---

## 3. Record Families Overview

The Safety Module is a **governed multi-record workspace**. Every item below is a first-class record family — not a nested array, not a sub-table, not a field group appended to a parent record.

| Record Family | Owned By | Governed By |
|---|---|---|
| SSSP Base Plan | Safety Manager (governed sections) + Project Team (instance sections) | Safety Manager / Safety Officer |
| SSSP Addendum | Project Team + Safety Manager approval | Joint per addendum approval matrix |
| Inspection Checklist Template | Safety Manager | Safety Manager exclusively |
| Completed Weekly Inspection | Safety Manager | Safety Manager exclusively |
| Safety Corrective Action | Any originator → owned by Safety Manager | Centralized corrective action ledger |
| Incident / Case | Safety Manager / Safety Officer | Tiered privacy model |
| Job Hazard Analysis (JHA) | Safety Manager with project team input | Safety Manager approves |
| Daily Pre-Task Plan | Project team (foreman / superintendent) | JHA reference required |
| Toolbox Talk Prompt | Safety Manager (governed library) | Issuance governed; acknowledgment required |
| Weekly Toolbox Talk Record | Safety Manager | Governed record family; proof model required |
| Worker Orientation Record | Safety Manager / Safety Officer | Governed acknowledgment record |
| Subcontractor Safety-Plan Submission | Subcontractor submits → Safety Manager reviews | Governed submission record |
| Certification / Qualification Record | Safety Manager | Governed compliance record |
| HazCom / SDS Record | Safety Manager | Governed record family |
| Competent-Person Designation | Safety Manager | Project-specific designation record |

All 15 record families above reside in the Safety workspace. The module exposes projections and summary composites outward to Project Hub, PER, and the work queue. It does not push full record payloads outside the workspace.

---

## 4. Lane Ownership Split: Safety Manager vs. Project Instance

The most important structural decision in this module is the **governed authority split** between the Safety Manager / Safety Officer tier and the project team tier.

### 4.1 Safety Manager / Safety Officer Owns

- SSSP base plan governed sections (hazard identification, emergency procedures, safety program standards, regulatory citation blocks, competent-person requirements, subcontractor compliance standards)
- All inspection checklist templates and scoring weights
- Template versioning and the version pinning of completed inspections
- Toolbox prompt library content and issuance decisions
- Schedule risk detection rule mappings (governed mappings; intelligent assistance supplements gaps)
- Readiness rules — what constitutes a blocker, what can be excepted, what requires override
- Incident/case record creation and privacy tier assignment
- Corrective action ownership assignments and close-out approval
- SSSP base plan approval (joint, see T03)
- SSSP addendum approval (always required; PM/Super required when operationally affected)
- Competent-person designation records

### 4.2 Project Team Owns (Within Safety-Manager-Governed Structures)

- Project-instance SSSP sections: project-specific contacts, subcontractor list, project location / site description, emergency assembly point and site layout fields, project-specific orientation schedule
- Daily pre-task plan creation and sign-off
- JHA contributor fields (project superintendent, foreman inputs)
- Toolbox talk sign-in sheets (attendee records) as supporting evidence
- Subcontractor safety submission upload (company pushes; project team routes to Safety Manager)

### 4.3 Authority Enforcement

Safety-Manager-only fields in the Safety workspace carry a `safetyManagerOnly: true` flag. The platform enforces this at the API layer. Project team users see but cannot edit governed sections. There is no delegation mechanism in Phase 3 — the Safety Manager role is a hard permission boundary.

---

## 5. Visibility Doctrine

### 5.1 Within-Module Visibility

Project team members (PM, Superintendent, Field Engineers) see the full Safety workspace for their project:
- All inspection records and scores
- All corrective actions
- Completed JHAs and toolbox talk records
- Worker orientation status (aggregate; individual records subject to privacy rules)
- Readiness decision surface

Project team members cannot edit Safety-Manager-owned content.

### 5.2 Project Hub Projection

The Safety Module publishes a governed **composite safety scorecard** to Project Hub. This scorecard is the only safety signal that surfaces in the project-level dashboard view. It is derived (never stored as a raw score) and combines:

- Inspection score trend (rolling window; T04)
- Open and overdue corrective actions (T05)
- Current readiness posture (T08)
- Active blocker or exception state (T08)
- Required compliance completion indicators (T07, T08)

The composite scorecard is an **immutable published projection** — Project Hub consumes it; it does not write back. Full checklist execution and record management stays in the Safety workspace.

### 5.3 PER / Executive Visibility (Tiered)

PER posture grants read-only access to **governed operational summaries only**. Three tiers:

| Tier | What PER Sees |
|---|---|
| Leadership operational summary | Composite scorecard indicators, current readiness posture, count of open blockers, open corrective action aging |
| PER sanitized indicators | Inspection score trend band (HIGH / MED / LOW — not raw score), corrective action count, compliance completion % |
| Incident summary | Incident counts by type, anonymized — no individual identifying details, no injury specifics |

Safety is **excluded from Phase 3 Executive Review annotation** per P3-E1 §9.3. There is no annotation layer for Safety. PER users have no push-to-team capability for Safety content. All PER Safety content is read-only.

### 5.4 Incident Privacy Tiers

Incidents and cases use a tiered privacy model (detail in T05). The privacy tier is set by the Safety Manager at record creation and controls which users and surfaces see what fields. The PER surface always receives anonymized incident summary data — never individual-level incident detail.

---

## 6. Cross-Contract Positioning

| Module / Surface | Safety Relationship |
|---|---|
| Project Hub | Consumes composite safety scorecard projection and readiness posture indicator |
| Schedule | Safety reads schedule activity data to drive toolbox prompt intelligence (schedule-driven high-risk detection) |
| Subcontractors | Safety owns subcontractor safety compliance records; Subcontractor module owns trade scope, contract, and workforce identity base |
| Documents | Safety module manages SSSP as a hybrid record (in-app structured + rendered formal document output); Documents module is not the system of record for the SSSP |
| Permits | No direct cross-module dependency; both modules publish to Project Hub |
| PER | Read-only tiered summaries; no annotation; no push-to-team |
| `@hbc/acknowledgment` | Used for toolbox talk acknowledgment, orientation acknowledgment, SSSP section acknowledgment |
| `@hbc/workflow-handoff` | Used for corrective action escalation, SSSP approval routing, override workflows |
| `@hbc/bic-next-move` | Safety workspace next-move prompts (incomplete inspection, overdue corrective action, readiness gap) |
| `@hbc/my-work-feed` | Safety is a registered source module for work queue items |
| `@hbc/related-items` | Corrective actions, incidents, JHAs linked via relationship registry |
| `@hbc/versioned-record` | Inspection records, SSSP versions, toolbox records use versioned record pattern |

---

## 7. Operating Model Principles

**Principle 1 — Governance before execution.** The Safety Manager configures the governed layer (templates, rules, thresholds, prompt library, readiness rules) before project teams generate operational records. Without the governed layer in place, the platform cannot produce governed safety records.

**Principle 2 — Composite health, not single-metric score.** No single field represents "the safety score." The health signal is always derived from multiple record families. A perfect inspection score does not override a critical corrective action or a Not Ready readiness decision.

**Principle 3 — Centralized corrective action ledger.** A corrective action generated from an inspection, from an incident, from a JHA, or from a direct safety observation all land in the same centralized ledger. The source is recorded but does not change the corrective action's lifecycle or ownership rules.

**Principle 4 — Readiness is a formal governed decision, not a gate.** In Phase 3 v1, readiness is not a hard technical stop. It is a formal governed decision surface that expresses the current compliance posture for a project, a subcontractor, or an activity. Project teams see the readiness decision; they can request exceptions; they cannot unilaterally override it.

**Principle 5 — Evidence is governed.** Safety evidence records (photos, documents, reports) are not unstructured attachments. They are governed records with metadata, review state, sensitivity tier, and retention category.

**Principle 6 — Inspection program is the Safety Manager's program.** Weekly inspections are completed by the Safety Manager, not by the project team. The project team sees results and is responsible for corrective actions. The Safety Manager controls the scoring model and inspection schedule.

---

## 8. Locked Decisions Reinforced in This File

| Decision | Reinforced Here |
|---|---|
| 1 — Safety is a governed multi-record workspace | §3 |
| 3 — Weekly inspections completed by Safety Manager | §4.1, §7 (Principle 6) |
| 7 — Safety Manager-only fields restricted to Safety editing | §4.3 |
| 16 — Incident/case visibility uses tiered privacy model | §5.4 |
| 22 — Readiness is a formal governed decision surface | §7 (Principle 4) |
| 37 — PER/executive visibility tiered | §5.3 |
| 39 — Composite scorecard published to Project Hub / PER | §5.2 |

---

*[← Master Index](P3-E8-Safety-Module-Field-Specification.md) | [Master Index](P3-E8-Safety-Module-Field-Specification.md) | [T02 →](P3-E8-T02-Workspace-Architecture-and-Record-Family-Map.md)*
