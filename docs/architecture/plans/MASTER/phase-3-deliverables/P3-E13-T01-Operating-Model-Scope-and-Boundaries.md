# P3-E13-T01 — Operating Model, Scope, and Boundaries

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E13-T01 |
| **Parent** | [P3-E13 Subcontract Execution Readiness Module](P3-E13-Subcontract-Execution-Readiness-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T01 of 8 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. What The Module Is

Subcontract Execution Readiness is the **Project Hub operating surface for determining whether a subcontract package may move into contract execution**. It is a specialist-governed readiness workflow that starts before execution, remains active through normal resubmissions and renewals, and ends when a formal readiness decision is issued, superseded, or voided.

The business purpose of the module is to provide one governed home for:

- pre-award package completeness,
- subcontract execution readiness,
- risk / compliance deficiency resolution,
- exception handling where standard requirements cannot be satisfied,
- and contract execution gating for the Financial / Buyout workflow.

The primary business question is:

> Is this subcontract package ready for execution for this project, this award path, and this legal entity, under current policy and risk posture?

The answer to that question is not a checklist percentage. It is a governed `ExecutionReadinessDecision`.

---

## 2. What The Module Is Not

This module is explicitly **not**:

- a flat checklist module,
- a waiver-only routing form,
- a vendor-master or enterprise prequalification replacement,
- a Financial-owned status tracker,
- a Reports-owned ledger,
- a Work Queue-owned process model.

Those distinctions matter because the module must preserve its own source-of-truth responsibilities rather than dissolving into adjacent surfaces.

---

## 3. Business Purpose By Concern

| Concern | What the module owns |
|---|---|
| Pre-award package completeness | Tracks required artifacts and specialist review posture for governed readiness items |
| Subcontract execution readiness | Produces the authoritative decision used by Financial to allow or block contract execution |
| Risk / compliance deficiency resolution | Records item-level deficiencies, rulings, and specialist evaluation state |
| Exception handling | Routes governed exception submissions, approvals, and delegation history |
| Contract execution gating | Publishes read-only gate state consumed by Buyout / Financial |

---

## 4. Surface Map

### 4.1 Primary surfaces

| Surface | Primary users | Purpose |
|---|---|---|
| **Case Registry / Queue** | PM / APM / PA, Compliance / Risk | Find, sort, and route active readiness cases |
| **Case Detail Workspace** | PM / APM / PA, Compliance / Risk | View parent case state, linked buyout context, profile binding, lineage, and renewal posture |
| **Requirement Evaluation Workbench** | Compliance / Risk | Review artifacts, set evaluation outcomes, issue deficiencies, and resolve applicability |
| **Exception Packet Workspace** | Compliance / Risk, PX, CFO, Compliance Manager where defined | Create, submit, review, and act on governed exception iterations |
| **Readiness Decision / Gate Summary** | Compliance / Risk, PM / APM / PA, Financial consumers | View issued decision, blockers, escalation posture, and gate projection |
| **Review Overlay Surface** | PER and authorized review actors | Read-only / annotation-only review without operational mutation |

### 4.2 Operating layers

| Layer | Description |
|---|---|
| **Primary operational layer** | Parent case, requirement items, artifacts, evaluations, lineage, and renewal state |
| **Exception governance layer** | Exception case, immutable submission iterations, approval slots, actions, and delegation records |
| **Gate and publication layer** | Readiness decision, Financial gate projection, activity / health / work / related-items outputs, and precedent publication |

---

## 5. What Belongs Here Versus Adjacent Modules

### 5.1 Financial

Financial owns:

- buyout line lifecycle,
- commitment / contract-status progression,
- enforcement of the `ContractExecuted` gate.

This module owns:

- readiness records,
- specialist evaluation,
- exception handling,
- issued readiness decision,
- published gate projection.

Financial reads the gate output. It does not author readiness truth.

### 5.2 Startup

Startup may reference readiness state only where startup readiness benefits from knowing subcontract execution posture. Startup does not own readiness evaluation, readiness exceptions, or readiness decision issuance.

### 5.3 Reports

Reports consumes downstream read models if and when a Phase 3 report requires readiness posture. Reports does not own case state, packet history, or specialist evaluation ledgers.

### 5.4 Health

Health consumes derived readiness signals such as blocked cases, pending exception approvals, or overdue evaluations. Health is not the primary ledger for readiness.

### 5.5 Work Queue

Work Queue receives routed actions, reminders, overdue items, and approval tasks. Work Queue is not the underlying workflow authority. The readiness module remains the system of action truth.

### 5.6 Future vendor-master / prequalification systems

Future vendor-master, insurance, licensing, or prequalification systems may later contribute:

- input facts,
- external statuses,
- reference artifacts,
- advisories.

They do not displace the project-level `SubcontractReadinessCase` as the source of truth for whether HB Intel may execute the subcontract on this project.

---

## 6. Operating Ownership

| Concern | Primary owner | Notes |
|---|---|---|
| Case assembly and submission | PM / APM / PA | Assemble package context, upload artifacts, respond to deficiencies |
| Routine item evaluation | Compliance / Risk | Owns normal specialist review and evaluation outcomes |
| Readiness issuance | Compliance / Risk | Owns routine issuance of the readiness decision |
| Business-risk visibility | PX | Participates where the case is flagged or policy demands PX visibility |
| Defined exception approvals | PX, CFO, Compliance Manager where required | Required authorities remain policy-driven and packet-type specific |

The architecture is intentionally not PX-owned end-to-end. PX is part of governed escalation and exception handling, not the default specialist evaluator.

---

## 7. Activation Model

The module is always-on, but a specific `SubcontractReadinessCase` activates when:

- a governed buyout / award path is created,
- a subcontract package is assembled for execution,
- a renewal or resubmission is required for the same identity,
- or Compliance / Risk opens a case proactively because the package must be governed before execution.

One active case exists for the same:

- project,
- subcontractor legal entity,
- underlying award / buyout intent.

Normal resubmissions, renewals, and corrected artifacts remain within the same case. Material identity changes create a successor case per T02.

---

## 8. Source-of-Truth Boundary Map

| Data concern | Authority | Rule |
|---|---|---|
| Parent case identity and lineage | Subcontract Execution Readiness | Canonical source |
| Requirement profile binding | Subcontract Execution Readiness | Specialist-governed |
| Artifact receipts and linked evidence | Subcontract Execution Readiness | Canonical source |
| Compliance evaluation outcomes | Subcontract Execution Readiness | Specialist-governed |
| Exception approvals and delegation history | Subcontract Execution Readiness | Canonical source |
| Contract-execution gate enforcement | Financial | Consumes readiness output only |
| Review annotations | `@hbc/field-annotations` | Separate review layer only |

---

## 9. Cross-Contract Positioning

- Relative to **P3-E4 Financial**: this module is the gate source; Financial is the gate enforcer.
- Relative to **P3-E11 Startup**: startup may link or display readiness context but never owns readiness workflow state.
- Relative to **P3-D2 / P3-D3 / P3-D4**: Health, Work Queue, and Related Items are downstream publication consumers, not primary ledgers.
- Relative to **P3-E12**: the checklist / mutable-waiver framing is historical only. It must not govern implementation decisions.
