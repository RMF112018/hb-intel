# FIN-PR1: Financial Production-Readiness Maturity Model

| Field | Value |
|---|---|
| **Doc ID** | FIN-PR1 |
| **Phase** | Phase 3 |
| **Document Type** | Canonical Reference |
| **Owner** | Architecture lead |
| **Update Authority** | Architecture lead; updated as maturity evidence accumulates |
| **Created** | 2026-03-28 |
| **References** | [P3-H1](../P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md); [P3-E4-T09](../../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [FRM-05](FRM-05-Repo-Truth-Gaps-and-Implementation-Readiness.md); [Reconciliation Summary](_reconciliation/financial-repo-truth-reconciliation-summary.md); [Normalization Summary](_reconciliation/financial-maturity-model-normalization-summary.md); [Closure Note](_reconciliation/financial-repo-truth-reconciliation-closure.md) |

---

## 1. Purpose

This document defines the canonical maturity model for the Financial module's production readiness. It provides a single, evidence-based framework that all governing documents, acceptance checklists, and implementation plans must use when describing Financial completion status.

**This model prevents overclaiming** by requiring explicit evidence at each stage and clearly stating what does not qualify.

---

## 2. Maturity Stages

### Stage 1 — Doctrine-Defined

The tool or capability has been described in a governing plan, specification, or doctrine document. Requirements, boundaries, and behavioral expectations are locked.

**Evidence required:**
- Governing plan or specification exists and is locked (e.g., P3-E4 T-file, FIN-01 through FIN-04, SOTL)
- Source-of-truth and action-boundary rules are defined (P3-E2)

**Not sufficient to advance:** No code exists. The capability is entirely on paper.

---

### Stage 2 — Architecturally Defined

The data model, type system, interfaces, and domain boundaries have been specified in code-level detail. Contracts exist but no runtime behavior is implemented.

**Evidence required:**
- TypeScript interfaces and types are defined and exported
- Domain constants, enums, and configuration are defined
- Architecture relationships (ownership, dependency direction, lane assignment) are documented

**Not sufficient to advance:** Types and interfaces alone do not constitute implementation. No functions, hooks, or components exist.

---

### Stage 3 — Implementation Scaffold Present

Business logic, UI components, and/or test infrastructure exist. The capability has code artifacts that can be inspected and tested, but the code does not operate against real data or support real user workflows.

**Evidence required:**
- Pure business logic functions implemented and tested (computors, validators, governance resolvers)
- UI components exist and render (may use mock data)
- Unit tests pass for business logic
- Route may be registered
- Hook signatures exist (may return mock data)

**Not sufficient to advance:**
- **Rendered UI is not sufficient** — a component that renders with hardcoded mock data is scaffold, not operational
- **Placeholder routes are not sufficient** — a registered route that renders a shell page is scaffold
- **Domain models alone are not sufficient** — types and logic without a data access layer are scaffold
- **Package registration alone is not sufficient** — exporting from an index file does not make a capability operational
- **Target-state doctrine is not sufficient** — plan text describing future behavior does not prove current implementation

---

### Stage 4 — Partially Operational

The capability has a real data access path and can perform at least some of its intended operations against real (non-mock) data. Not all workflows are complete, but the foundation for real operation exists.

**Evidence required:**
- Data access layer exists and is registered (e.g., `IFinancialRepository` port implemented and wired in factory)
- At least one workflow path fetches, displays, and/or persists real data
- Sub-tool navigation is URL-routed (deep-linkable, survives refresh)
- Project context is durable and route-safe for the capability

**Not sufficient to advance:** Some workflows may still be incomplete. Mock data may remain for secondary paths. SPFx lane may not be wired.

---

### Stage 5 — Operational in Current Lane

The capability is fully functional in its primary lane (typically PWA). All intended workflows operate against real data. Users can complete end-to-end tasks without fallback to spreadsheets or external tools.

**Evidence required:**
- All CRUD operations for the capability work in the primary lane
- All view hooks consume real repository data (no mock fallbacks in the primary workflow)
- All sub-surfaces are URL-routed and deep-linkable
- Posture states (actionable / view-only / escalate / blocked / stale / waiting) are visually correct
- Shared spine publication (Activity, Health, Work Queue, Related Items) is data-connected
- Role-based access enforcement is active (governance resolver wired to real auth context)

**Not sufficient to advance:** The secondary lane (SPFx) may not yet be operational. Cross-lane handoff may not be verified. No acceptance evidence collected yet.

---

### Stage 6 — Cross-Lane Operational

The capability works correctly in both PWA and SPFx lanes according to the lane capability matrix (P3-G1 §4.1). Cross-lane navigation and handoff patterns function per P3-G2.

**Evidence required:**
- SPFx Financial lane surfaces render with real data
- PWA-to-SPFx and SPFx-to-PWA handoff patterns work per P3-G2 §8.1
- Lane-specific capability depth matches P3-G1 (e.g., Launch-to-PWA for buyout savings disposition)
- Density control and shell integration work in both lanes

**Not sufficient to advance:** No formal acceptance testing has been performed. No staging validation.

---

### Stage 7 — Acceptance-Proven

The capability has passed its formal acceptance criteria as defined in the governing T-file and P3-H1. Evidence has been collected and recorded.

**Evidence required:**
- All P3-H1 §6.1 checklist items for the capability are marked Complete with evidence
- All Financial Governance and Operating-Surface Verification items are checked
- P3-E4-T09 §20 detailed acceptance gate items are satisfied
- Spreadsheet replacement validation (FRC-00 crosswalk) demonstrates equivalent or superior capability

**Not sufficient to advance:** Acceptance in a test or staging environment does not prove production behavior.

---

### Stage 8 — Pilot-Proven

The capability has been validated by real users on real project data in a controlled pilot. Feedback has been collected and critical issues resolved.

**Evidence required:**
- At least one real project has used the capability for a complete reporting cycle
- Parallel-run with spreadsheet workflow demonstrates data parity
- User feedback collected and critical issues resolved
- Performance acceptable under real data volume

**Not sufficient to advance:** A single pilot does not prove readiness for all projects. Edge cases may remain.

---

### Stage 9 — Production-Ready

The capability is approved for general availability. Spreadsheet workflow can be retired for adopting projects.

**Evidence required:**
- Multiple projects have used the capability successfully
- Cutover readiness criteria met (FRC-00 §6)
- Rollback plan documented
- Support and training materials available
- No unresolved critical or high-severity issues

---

## 3. Classification Dimensions

The maturity model applies independently across multiple dimensions. A capability may be at different stages in different dimensions.

### 3.1 Module-Level Classification

The Financial module as a whole is classified at the **lowest stage** among its critical-path tools.

### 3.2 Tool-Level Classification

Each Financial tool is classified independently:

| Tool | Description | Current Stage (2026-03-28) | Evidence |
|------|-------------|---------------------------|----------|
| **Budget Import** | CSV upload, identity resolution, reconciliation | Stage 3 — Implementation Scaffold | T02 business logic + tests; `BudgetPage` UI with mock data; no `IFinancialRepository` |
| **Forecast Summary** | PM-editable working state, derived fields | Stage 2 — Architecturally Defined | T04 pending; `ForecastSummaryPage` UI exists but types incomplete |
| **Forecast Versioning** | Version lifecycle, checklist gate, confirmation | Stage 3 — Implementation Scaffold | T03 logic + tests; no runtime version persistence |
| **GC/GR Model** | Version-scoped division-level projections | Stage 2 — Architecturally Defined | T04 pending; no UI component |
| **Cash Flow** | Actuals + forecast, A/R aging, cumulative chart | Stage 3 — Implementation Scaffold | T05 logic + tests; `CashFlowPage` UI with mock data |
| **Buyout** | Procurement tracking, savings disposition | Stage 3 — Implementation Scaffold | T06 logic + tests; `BuyoutPage` UI with mock data |
| **Business Rules** | Sign conventions, thresholds, calculations | Stage 3 — Implementation Scaffold | T07 logic + tests; consumed by UI components |
| **Platform Integration** | Spine events, health metrics, work queue items | Stage 3 — Implementation Scaffold | T08 contracts + tests; spine adapters not data-connected |
| **Report Publication** | Report-candidate designation, P3-F1 handoff | Stage 2 — Architecturally Defined | Stub-ready via `promoteToPublished()`; B-FIN-03 |
| **PER Annotation** | Executive review on confirmed versions | Stage 3 — Implementation Scaffold | T08 annotation contracts; `@hbc/field-annotations` v0.2.0 |

**Module-level classification: Stage 2 — Architecturally Defined** (constrained by Forecast Summary and GC/GR pending T04).

### 3.3 Route and Context Readiness

| Dimension | Current Stage | Evidence |
|-----------|--------------|----------|
| PWA route registered | Stage 3 | `/project-hub/:projectId/financial` renders `FinancialControlCenter` |
| Project context durable | Stage 3 | Route-canonical `projectId`, store-reconciled; but context serves mock data |
| Sub-tool URL routing | Stage 1 | Not implemented — state-based `surfaceMode` via `useState` |
| Deep-link support | Stage 1 | No deep links to `/financial/budget` etc. |

### 3.4 Lane Readiness

| Lane | Current Stage | Evidence |
|------|--------------|----------|
| PWA | Stage 3 — Implementation Scaffold | Route renders, UI components present, all data mock |
| SPFx | Stage 2 — Architecturally Defined | Lane constants/types exist; no data-connected surfaces |

### 3.5 Shared-Spine Readiness

| Spine | Current Stage | Evidence |
|-------|--------------|----------|
| Activity | Stage 3 — Implementation Scaffold | 10 event type contracts defined; canvas tile renders with mock data |
| Health | Stage 3 — Implementation Scaffold | 10 metric definitions; canvas tile renders with mock data |
| Work Queue | Stage 3 — Implementation Scaffold | 8 item type contracts; canvas tile renders with mock data |
| Related Items | Stage 3 — Implementation Scaffold | Relationship type mappings defined; adapter pattern in place |

### 3.6 Release-Readiness Evidence

| Gate | Current Stage | Evidence |
|------|--------------|----------|
| P3-H1 §6.1 checklist | Stages 2–3 | 7 of 12 items Complete at contract level; 5 In Progress |
| P3-E4-T09 §20 detailed gate | Stage 3 | 37 of 48 items at contract level; 4 pending T04; 7 runtime scope |
| Financial Governance verification | Stage 1 | All 8 items unchecked — require operational evidence |
| Spreadsheet replacement readiness | Stage 3 | FRC-00 crosswalk complete; pending runtime surfaces and parallel-run |

---

## 4. Anti-Overclaiming Guidance

**The following do not, by themselves, prove operational readiness:**

1. **Rendered UI is not sufficient.** A component that renders with hardcoded mock data proves scaffold presence (Stage 3), not operational behavior (Stage 5). Users cannot complete real work with mock data.

2. **Placeholder routes are not sufficient.** A registered route that renders a page component proves scaffold presence (Stage 3). Operational readiness requires URL-routed sub-tools, deep-link support, and real data access.

3. **Domain models alone are not sufficient.** TypeScript interfaces, types, enums, and constants prove architectural definition (Stage 2). Implementation requires functions that compute, validate, and transform real data.

4. **Business logic alone is not sufficient.** Pure functions with unit tests prove implementation scaffold (Stage 3). Operational readiness requires those functions to be wired through a data access layer to real persistence.

5. **Package registration alone is not sufficient.** Exporting from an index file and consuming in a page component proves scaffold integration. Operational readiness requires the exported code to operate against real data.

6. **Target-state doctrine is not sufficient.** Plan text describing future behavior proves doctrine definition (Stage 1). No plan language, however detailed, substitutes for running code verified against real data.

7. **Contract-level test passage is not sufficient.** Unit tests passing for business logic computors and validators proves scaffold correctness (Stage 3). Operational readiness requires integration tests with real data access and end-to-end workflow validation.

8. **"Complete" at contract level is not "Complete" for release.** A P3-H1 checklist item marked "Complete" with contract-level evidence means the business logic specification is implemented and tested. It does not mean the capability is operational, acceptance-proven, or production-ready.

---

## 5. Usage

### In P3-H1 and acceptance checklists
Use the stage name (e.g., "Stage 3 — Implementation Scaffold") in status or evidence columns to classify completion claims. Never use bare "Complete" without specifying the maturity dimension.

### In implementation plans and prompts
Reference this model when describing what needs to happen to advance a tool from its current stage to the next. Example: "Budget Import is at Stage 3; advancing to Stage 4 requires implementing `IFinancialRepository` and wiring `useBudgetSurface` to real data."

### In reconciliation passes
Use this model to audit whether documentation language matches actual repo evidence. Any claim of a stage must be verifiable against the evidence requirements defined above.

---

## 6. Stage Advancement Checklist

For any tool or dimension to advance from Stage N to Stage N+1, the following must be true:

- [ ] All evidence requirements for Stage N+1 are met
- [ ] Evidence is recorded in the relevant P3-H1 row or acceptance artifact
- [ ] No evidence requirement for Stage N+1 is satisfied only by Stage N artifacts
- [ ] The advancement claim has been verified against live repo state

---

## 7. Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-03-28 | Initial creation; all tools classified against verified repo truth from Prompt 01 reconciliation | Architecture |
