# FIN-04 — Financial Module Route and Context Contract

## Document Purpose

This document defines the canonical Financial route family, project-context behavior, deep-link durability, project switching expectations, and route ownership rules.

It exists to ensure that the Financial module inherits the Project Hub route doctrine correctly and does not devolve into flat, non-durable, or context-unsafe surfaces.

This document should be read with:
- `FIN-01 — Financial Module Operating Posture and Surface Classification`
- `FIN-02 — Financial Module Action Posture and User-Owned Work Matrix`
- `FIN-03 — Financial Module Lane Ownership Matrix`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-B1-Project-Context-Continuity-and-Switching-Contract.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`

---

> **Repo-truth and reconciliation note (2026-03-28).** This document's route family is **locked target-state doctrine** — the required implementation target. Current implementation status: only `/project-hub/:projectId/financial` is registered and renders `FinancialControlCenter`. Sub-tool routes do not exist; navigation is state-based (`surfaceMode` via `useState`). Per [FIN-PR1 §3.3](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md): sub-tool URL routing is at Stage 1 (Doctrine-Defined). The `$projectId` notation below is a documentation convention; implementations must use `:projectId` (React Router syntax). Route path and slug decisions are confirmed in [Financial-RLR](Financial-Route-and-Lane-Reconciliation.md) §2 (R1–R6). Where `_Financial_Module_Route_and_Context_Contract.md` uses different slugs or parent paths, this document's locked slugs govern.

## 1. Locked Route Doctrine

### 1.1 Canonical Financial Route Family

The Financial module must live inside the canonical Project Hub project-scoped route family.

The minimum canonical route family is:

- `/project-hub/$projectId/financial`
- `/project-hub/$projectId/financial/budget`
- `/project-hub/$projectId/financial/forecast`
- `/project-hub/$projectId/financial/checklist`
- `/project-hub/$projectId/financial/gcgr`
- `/project-hub/$projectId/financial/cash-flow`
- `/project-hub/$projectId/financial/buyout`
- `/project-hub/$projectId/financial/review`
- `/project-hub/$projectId/financial/publication`
- `/project-hub/$projectId/financial/history`

Additional sub-routes may be added later if they preserve the same doctrine.

### 1.2 URL Authority Rule

The URL is the authoritative source of:
- active project identity
- active Financial section
- direct deep-link destination

Store, session, and UI shell state may enrich the route, but they may not override it silently.

### 1.3 No Flat Financial Page Rule

A single unscoped `/financial` or non-project-scoped Financial page is not a valid end-state implementation for the Project Hub Financial module.

---

## 2. Route Ownership by Surface

| Route | Primary Purpose | Primary Lane | Notes |
|---|---|---|---|
| `/project-hub/$projectId/financial` | financial home / operating overview | PWA | posture, next move, unresolved items |
| `/financial/budget` | budget import and reconciliation | PWA | deep workflow |
| `/financial/forecast` | working forecast summary / version | PWA | core operating surface |
| `/financial/checklist` | forecast checklist resolution | PWA | gating surface |
| `/financial/gcgr` | GC/GR editor | PWA | deep editor surface |
| `/financial/cash-flow` | cash flow editor | PWA | deep editor / planning surface |
| `/financial/buyout` | buyout workflow | PWA | operational sub-domain |
| `/financial/review` | review / PER / internal confirmation | PWA | review custody |
| `/financial/publication` | publication / export workflow | PWA | controlled output surface |
| `/financial/history` | historical lineage / audit | PWA primary, SPFx broad visibility allowed | read-mostly |

---

## 3. Financial Home Route Contract

### Route
`/project-hub/$projectId/financial`

### Purpose
Provide the project-scoped Financial operating home for the active project.

### Required Behavior
This route must:
- display current Financial posture
- surface unresolved actions and blockers
- expose direct entry into deeper Financial workflows
- make review/publication posture visible
- reflect the active working version / baseline state
- remain route-durable on refresh

### Must Not
- behave as a passive dashboard only
- replace deeper Financial workflows with summary cards alone
- lose project context on refresh or launch

---

## 4. Deep-Link Durability Rules

### 4.1 Deep Link Validity
A deep link to any Financial route must restore:
- the correct project
- the correct Financial section
- enough surface state to continue or inspect the intended work

### 4.2 Query String Use
Query strings may be used for transient surface state such as:
- selected tab within a section
- comparison mode
- filter/sort/view settings
- anchored record or version identifier

Query strings must **not** replace the canonical route hierarchy for section identity.

### 4.3 Refresh Rule
A browser refresh on any valid Financial route must return the user to the same project and same section unless:
- the project is no longer accessible
- the referenced artifact no longer exists
- the user’s permissions no longer allow access

In those cases, the system must render a clear unavailable/no-access fallback rather than silently redirecting to a different project.

---

## 5. Project Switching Rules

### 5.1 Same-Section Preservation
When the user switches projects from inside the Financial module, the application should attempt to preserve the same Financial section.

Example:
- current route: `/project-hub/A/financial/cash-flow`
- switch to project B
- if user has access to B cash flow: navigate to `/project-hub/B/financial/cash-flow`
- otherwise: fall back to `/project-hub/B/financial`

### 5.2 Permission / Capability Fallback
If the target project or user role does not support the same section:
- navigate to the nearest valid Financial home or permitted section
- explain why the original section could not be preserved

### 5.3 Draft Sensitivity Rule
If the current surface contains unsaved or recovery-sensitive working state, the switch flow must:
- warn the user where appropriate
- preserve or discard draft state according to surface policy
- never misapply a draft to the wrong project

---

## 6. Context Requirements for Every Financial Route

Every Financial route must inherit and maintain:
- canonical `projectId`
- project metadata required for section rendering
- user role / permission posture
- applicable financial period / active version context
- lane-aware shell behavior
- return-path awareness where relevant

No Financial section may infer project context from a non-route global store alone.

---

## 7. Route-State and Recovery Guidance

### 7.1 Route-Authoritative State
The following must be route-authoritative or route-resolvable:
- project
- section
- referenced version where appropriate
- referenced review/publication artifact where appropriate

### 7.2 Session / Store State
Session or local state may hold:
- draft edits
- preferred view mode
- filter/sort state
- scroll return memory
- recently viewed version within the same route family

### 7.3 Prohibited Behavior
- silently restoring a different project than the URL indicates
- silently opening a different Financial section than the URL indicates
- applying cached working state from one project to another
- routing deep Financial workflows through non-durable modal-only navigation

---

## 8. SPFx Launch Contract

### 8.1 Launch Rule
SPFx Financial surfaces must launch to canonical PWA Financial routes for deeper workflows.

### 8.2 Valid Launch Examples
- current project financial home
- active forecast working surface
- unresolved checklist section
- budget import run requiring reconciliation
- review or publication workflow requiring custody actions

### 8.3 Launch Parameters
SPFx may supply contextual launch hints such as:
- source lane
- source page
- target artifact ID
- return token if needed

But the launch must still resolve into a valid canonical Financial route.

---

## 9. Surface-Specific Routing Notes

## 9.1 Budget Import
Recommended subordinate states may include:
- run list
- active run
- reconciliation detail
- activation confirmation

If implemented, these should remain under the canonical budget section rather than inventing a separate unscoped import app.

## 9.2 Forecast
Recommended subordinate states may include:
- active working version
- comparison mode
- candidate review context
- version lineage drill-through

## 9.3 Review / Publication
These routes must support strong artifact identity where needed.
For example, a review or publication page may need a referenced version or publication identifier to preserve context.

---

## 10. No-Access, Missing, and Invalid Route Handling

The Financial module must provide explicit in-shell handling for:
- invalid `projectId`
- inaccessible project
- inaccessible Financial section
- missing target artifact (version, publication, import run, etc.)
- role not permitted for the attempted action

Fallback behavior must be honest and specific. It must not silently dump the user into a generic home without explanation.

---

## 11. Acceptance Criteria for Financial Routing

Financial routing is considered implementation-ready only when:
- a canonical route family is defined and adopted
- every major Financial surface has a project-scoped route owner
- deep links are durable on refresh
- project switching behavior is defined and safe
- route and store responsibilities are separated cleanly
- SPFx launch-to-PWA behavior is explicit
- invalid / missing / no-access route handling is defined
- route design supports deeper workflow ownership instead of passive dashboarding

---

## 12. Downstream Implementation Consequences

This route contract requires downstream implementation to:
- refactor any flat Financial placeholder page into the canonical route family
- align navigation and shell state to `projectId`-driven routing
- ensure Financial section components are safe to mount under project-scoped routes
- define artifact identity handling for version, review, publication, import, and history views
- test route durability, switching, and no-access behavior before claiming the Financial module is operationally complete
