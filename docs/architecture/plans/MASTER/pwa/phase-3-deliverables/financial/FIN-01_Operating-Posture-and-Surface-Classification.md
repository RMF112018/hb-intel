# FIN-01 — Financial Module Operating Posture and Surface Classification

## Document Purpose

This document locks the operating posture of the Financial module for Phase 3 implementation. Its purpose is to prevent a viewer-first, dashboard-only, or workbook-clone implementation by defining what the Financial module **is**, how it behaves as part of Project Hub, which surfaces belong to it, and what operational standard must be met before any Financial surface can be considered complete.

This file should be read in conjunction with:
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-G1-Lane-Capability-Matrix.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/P3-E4-Financial-Module-Spec.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/FRM-00-Financial-Runtime-Model.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/FRM-04-Financial-Repository-and-Provider-Seam-Plan.md`

---

## 1. Locked Module Posture

### 1.1 Primary Classification

The Financial module is classified as:

- **Core always-on operating module**
- **Project-scoped working surface**
- **Spine-publishing contributor**
- **Collection of deeper workflow surfaces launched within Project Hub**

The Financial module is **not**:
- a passive dashboard
- a reporting-only viewer
- a spreadsheet mirror
- an ERP replacement
- a generic file upload utility
- a loosely grouped collection of unrelated finance widgets

### 1.2 Operating Standard

A Financial implementation is only considered complete when a user can, from the live Project Hub Financial experience:

- understand the current financial posture of the project
- identify what is actionable now
- identify who owns the next step
- distinguish editable vs read-only vs blocked vs escalated work
- move directly into the correct next action without hunting
- understand what changed, what is pending, and what has been published

### 1.3 Anti-Viewer-First Rule

Any Financial surface that only renders project financial data without exposing:
- posture
- ownership
- next action
- blocking condition
- review/publication state

is considered **non-operational** and therefore incomplete.

Static summaries, grids, and charts may appear within the Financial module, but they may only support operational decision-making. They may not define the module’s primary posture.

---

## 2. Financial Module Mission

The Financial module exists to provide a governed project-financial operating layer inside Project Hub that allows project teams to:

- ingest and validate external budget baselines
- manage project-native financial working state
- maintain forecast versions and monthly progression
- control checklist and review gates
- manage GC/GR, cash flow, and buyout workflow
- publish trustworthy monthly financial outputs
- expose financial posture and downstream impacts back into Project Hub shared spines

The Financial module must preserve a clear boundary between:
- **external imported authority**
- **Project Hub working state**
- **review and publication custody**
- **derived summaries and audit history**

---

## 3. Financial Module Sub-Domain Structure

The Financial module contains the following governed sub-domains.

### 3.1 Budget Import and Reconciliation
Purpose:
- ingest externally authoritative budget baseline data
- validate mappings, exceptions, and reconciliation posture
- establish the project’s active financial baseline

Posture:
- deep workflow surface
- operationally critical
- importer/reviewer owned
- upstream to all other Financial activity

### 3.2 Forecast Summary and Versioning
Purpose:
- create and maintain financial forecast working versions
- roll monthly forecasts forward via derivation
- distinguish working vs confirmed vs published versions

Posture:
- always-on operating surface
- PM/PX/PE operational workspace
- one of the primary financial control surfaces

### 3.3 Forecast Checklist
Purpose:
- provide confirmation and gating before internal confirmation or publication
- expose unresolved issues, missing data, and incomplete review steps

Posture:
- gating workflow surface
- always-visible companion surface to forecasting
- actionable when unresolved, read-only when satisfied and locked

### 3.4 GC/GR
Purpose:
- maintain general conditions / general requirements working values
- reflect period-specific operating assumptions and exposures

Posture:
- always-on operational sub-surface
- deep editor surface with summary visibility elsewhere

### 3.5 Cash Flow
Purpose:
- maintain and review projected financial timing and distribution
- align forecast posture with temporal spend expectations

Posture:
- always-on operational sub-surface
- scenario-sensitive planning surface

### 3.6 Buyout
Purpose:
- manage buyout status, savings posture, disposition behavior, and execution readiness
- support procurement and commitment-related financial readiness

Posture:
- always-on operational sub-surface
- deep workflow surface with strong cross-module dependencies

### 3.7 Review, PER, Publication, and Export
Purpose:
- control review custody, publication readiness, and externalized output generation
- distinguish internal working state from published output

Posture:
- gated workflow surface
- primarily review/publication oriented
- not the source of underlying working-state editing

### 3.8 History, Audit, and Derived Reporting
Purpose:
- expose financial progression, historical versions, derivations, and audit trail
- support trust, traceability, and downstream reporting

Posture:
- operationally supporting surface
- mixed read-mostly and drill-through posture
- must remain clearly subordinate to active working surfaces

---

## 4. Financial Module Relationship to Project Hub

### 4.1 Role Within Project Hub

The Financial module is a first-class Project Hub module. It is not an external tool merely linked from the hub.

The module must:
- participate in canonical project routing
- inherit project context from the Project Hub shell
- publish financial posture into Project Hub shared spines
- receive cross-module context where relevant
- preserve role-aware behavior consistent with Project Hub governance

### 4.2 Shared Spine Publication Requirements

The Financial module must publish into the following shared project spines:

- **Activity**
  - import events
  - version derivation / confirmation / publication events
  - review transitions
  - buyout progression events

- **Health**
  - financial health signals
  - exception posture
  - stale or blocked forecast posture
  - publication readiness posture

- **Work Queue / Next Move**
  - unresolved checklist items
  - import exceptions
  - pending review actions
  - pending publication actions
  - required buyout actions

- **Related Items**
  - linked budget lines
  - linked commitments / contracts / packages
  - linked reports and publications
  - linked risk, procurement, or schedule records when applicable

### 4.3 Home-Surface Visibility Requirement

The Project Hub home / control center must be able to surface financial posture without requiring the user to open deep workflow pages. However, that home visibility must be backed by the Financial operating model, not by disconnected summary widgets.

---

## 5. Surface Classification Framework

The following surface classes are locked for Financial implementation.

| Surface | Surface Class | Required Posture | Notes |
|---|---|---|---|
| Financial landing / home summary | project-scoped operating overview | posture + next move + exceptions | not a passive dashboard |
| Budget Import | deep workflow | multi-step, exception-driven, reviewer-owned | may escalate to richer lane |
| Forecast Summary | core always-on operating surface | primary working surface | central to monthly financial control |
| Checklist | gating companion surface | actionable when incomplete | must visibly control confirmation/publish gates |
| GC/GR | deep editor surface | editable working state | summary may appear elsewhere |
| Cash Flow | deep editor surface | editable working state + scenario reasoning | summary may appear elsewhere |
| Buyout | deep workflow / operating sub-surface | status, savings, disposition, readiness | strong cross-module dependency |
| Review / PER | review-custody workflow | escalation / confirmation / hold posture | not raw data entry |
| Publication / Export | controlled output workflow | publish or generate official artifacts | downstream-facing surface |
| History / Audit | support surface | read-mostly, drill-through, trustworthy lineage | not primary operating surface |

---

## 6. Role-Aware Operating Posture

The Financial module must be role-aware from the outset.

### 6.1 Project Manager (PM)
- primary owner of working-state preparation
- can create and revise working versions where policy permits
- resolves checklist and forecast preparation tasks
- may submit for internal confirmation or review

### 6.2 Project Executive (PX/PE)
- higher-order review, escalation, exception disposition, and directional decisions
- may approve, hold, return, or designate candidate state depending on workflow policy
- may act on buyout and forecast exception posture

### 6.3 Finance / Controller / Accounting Support
- participates in import governance, reconciliation verification, publication, and export quality
- may have stronger review/publication rights than PM
- may remain read-only in certain working-state surfaces

### 6.4 Executive / Leadership
- posture and summary visibility
- limited direct mutation rights unless explicitly granted
- emphasis on financial health, variance, exposure, and publication trustworthiness

### 6.5 Operational Design Rule
No role should be presented with a surface that visually implies editability or ownership where policy only permits review, comment, or escalation.

---

## 7. Completion Criteria for Financial Surfaces

A Financial surface is only implementation-complete when all of the following are true:

1. Surface posture is explicit.
2. Primary owner is clear.
3. Allowed actions are explicit.
4. Read-only / blocked / stale / waiting states are visible.
5. Route and project context are canonical.
6. Deeper workflow escalation is clear where needed.
7. Shared-spine publication obligations are satisfied.
8. Role-aware access and action affordances are correct.
9. Review and publication consequences are explicit.
10. The surface can be described as part of an operating workflow rather than a data viewer.

---

## 8. Non-Goals and Anti-Patterns

The following are explicitly prohibited as end-state implementations.

### 8.1 Workbook Clone Anti-Pattern
Recreating Excel sheets in-browser without operational posture, lifecycle governance, or action ownership.

### 8.2 Viewer-Only Financial Page
A page that only shows totals, charts, or tables but does not support action-taking or directed escalation.

### 8.3 ERP Collapse Anti-Pattern
Treating Project Hub as the accounting system-of-record instead of a project-financial operational layer with defined boundaries.

### 8.4 Lane Blur Anti-Pattern
Allowing PWA and SPFx to become ambiguous duplicates without clear depth, ownership, and escalation rules.

### 8.5 Summary-First Home Pattern
Leading with financial summary widgets while hiding unresolved checklist, review, or publication posture.

---

## 9. Implementation Consequences

This posture file implies the following downstream planning and implementation requirements:

- FIN-02 must define action posture and user-owned work per Financial surface.
- FIN-03 must lock capability-level lane ownership between PWA and SPFx.
- FIN-04 must define canonical route, context, switching, and deep-link behavior.
- UI work must start from operating surfaces and workflows, not from charts or KPI cards.
- Shared spine publication must be implemented as part of Financial completion, not as a later enhancement.

---

## 10. Acceptance Standard for This Document

This document is satisfied when:
- all Financial implementers can identify the module’s posture before writing UI
- all Financial surfaces are classifiable using the locked surface classes above
- viewer-first interpretations are ruled out
- Financial is clearly understood as a first-class, always-on operating module inside Project Hub
- downstream FIN-02 through FIN-04 artifacts can inherit the posture defined here without contradiction
