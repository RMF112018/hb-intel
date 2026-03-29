# Financial Acceptance and Release Readiness Model

| Field | Value |
|---|---|
| **Doc ID** | Financial-ARRM |
| **Document Type** | Acceptance and Release Readiness Model |
| **Owner** | Architecture lead + Release owner |
| **Created** | 2026-03-29 |
| **Status** | Active — governs go/no-go decisions for Financial module |
| **References** | [FIN-PR1](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md); [P3-H1 §6.1](../P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md); [Financial-RGC](Financial-Runtime-Governance-Control.md); [Financial-LMG](Financial-Lifecycle-and-Mutation-Governance.md); [Financial-ABMC](Financial-Action-Boundary-and-Mutation-Control.md); [Control Index](Financial-Doctrine-Control-Index.md) |

---

## 1. Purpose

This document defines what "ready" means for the Financial module at each gate in the path from architecture to production. It prevents overclaiming by requiring specific evidence classes at each stage. A release owner, developer, or reviewer can use this model to determine exactly what has been proven and what has not.

**Anti-overclaiming rule:** No Financial capability may be claimed at a readiness stage unless every required evidence class for that stage is satisfied with verifiable artifacts. See FIN-PR1 §4 for the complete anti-overclaiming framework.

---

## 2. Readiness Stages

| # | Stage | What It Proves | Gate |
|---|-------|---------------|------|
| R1 | **Doctrine Complete** | Requirements, boundaries, and behavioral expectations are locked in governing plan documents | All governing doctrine files exist and are locked |
| R2 | **Contract Complete** | Type system, interfaces, business logic, and domain rules are implemented and tested | Code artifacts pass unit tests; types compile |
| R3 | **Route/Lane Complete** | Canonical PWA routes and workspace shell are implemented; SPFx lane posture is documented; cross-lane handoff contracts exist | PWA routes render with deep-link entry; workspace shell wraps all surfaces; lane doctrine locked |
| R4 | **Implementation Complete** | Data access layer wired, repositories registered, real data flows through the capability | `IFinancialRepository` facade returns real project data; hooks consume facade |
| R5 | **Operationally Proven** | End-to-end workflow completes with real data; runtime honesty, blockers, and posture are visible | A PM can complete a full monthly reporting cycle on a real project |
| R6 | **Pilot Proven** | Real users have used the capability on real projects for at least one reporting cycle | Feedback collected; critical issues resolved; parallel-run with spreadsheets demonstrates parity |
| R7 | **Release Ready** | Capability approved for general availability; spreadsheet workflow can be retired for adopting projects | Cutover criteria met; rollback plan documented; support/training available |

**Stage mapping:** ARRM stages align with [FIN-PR1](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md) stages as follows: R1 = Stage 1 (Doctrine-Defined), R2 = Stage 2–3 (Architecturally Defined to Implementation Scaffold), R3 = Stage 3 with route/lane completion, R4 = Stage 4 (Partially Operational), R5 = Stage 5 (Operational in Current Lane), R6 = Stage 8 (Pilot-Proven), R7 = Stage 9 (Production-Ready). FIN-PR1 governs per-tool maturity classification; ARRM governs go/no-go gates and evidence requirements.

---

## 3. Evidence Classes

Each readiness stage requires specific evidence types. These are not optional — a capability cannot advance to the next stage without all evidence classes for the current stage.

### R1 — Doctrine Complete

| Evidence Class | What It Requires | Example Artifact |
|---------------|-----------------|-----------------|
| Plan/doctrine | Governing plan file exists and is locked | FIN-01, FIN-02, FIN-03, FIN-04, PH3-FIN-SOTL |
| Source-of-truth model | Domain authority and entity ownership defined | Financial-SOTEC, Financial-RGC §2 |
| Action boundaries | Write/read/mutation rules defined | Financial-ABMC |
| Acceptance criteria | What "complete" means is defined | This document; P3-H1 §6.1 |

### R2 — Contract Complete

| Evidence Class | What It Requires | Example Artifact |
|---------------|-----------------|-----------------|
| Type definitions | Interfaces and types compile with no errors | `@hbc/features-project-hub/src/financial/types/` |
| Business logic | Pure functions implemented and tested | Governance, versioning, import, computors — 1,979+ test lines |
| UI scaffold | Components render (may use mock data) | 34 UI components across 9 tool pages |
| Route registration | Route exists in the route tree | `FINANCIAL_TOOL_REGISTRY` with 9 slugs |

### R3 — Route/Lane Complete

| Evidence Class | What It Requires | Example Artifact |
|---------------|-----------------|-----------------|
| Deep-link entry | Direct URL navigation resolves correctly | `resolveFinancialToolEntry()` with 28 route tests |
| Project-switch safety | Tool preserved on project switch; context isolated | `resolveProjectHubSwitchTarget()` with tool preservation |
| Return-memory | Last-visited tool restored on re-entry | `financialContextState` with 13 context tests |
| Lane posture | PWA depth documented and implemented; SPFx depth documented only — SPFx operational is R5 (PWA) / R6 (SPFx) scope | Financial-LODM, Financial-CLHLC |
| Workspace shell | WorkspacePageShell wrapper with breadcrumbs, state ribbon, density | `FinancialWorkspaceShell` |

### R4 — Implementation Complete

| Evidence Class | What It Requires | Example Artifact |
|---------------|-----------------|-----------------|
| Repository facade | `IFinancialRepository` exists and is registered in factory | `packages/data-access/src/factory.ts` |
| Real data access | View hooks consume facade, not hardcoded mock data | `useFinancialControlCenter()` returns project-scoped data |
| Write operations | Mutation operations work (FTC edit, checklist toggle, etc.) | Integration test with real persistence |
| Confirmation gate | G1–G4 validators enforced at service layer | Gate blocks confirmation with real stale-budget and checklist data |
| Spine adapters | Activity, Health, Work Queue adapters publish real events | Adapter test with real Financial events |

### R5 — Operationally Proven

| Evidence Class | What It Requires | Example Artifact |
|---------------|-----------------|-----------------|
| Workflow completion | PM completes full monthly cycle (import → edit → confirm → publish) | Scenario test with real project data |
| Runtime honesty | Operational banner shows correct live/stale/blocked/editable state | `useFinancialOperationalState` wired to real data |
| Recovery paths | Failed/partial sessions show correct recovery guidance | Session history with real import/confirmation sessions |
| Review workflow | PER can annotate, PM can disposition, custody transitions work | Review page with real annotation data |
| Cross-tool cascade | Budget import staleness blocks confirmation; FTC edits cascade | Integration test proving cross-tool invalidation |

### R6 — Pilot Proven

| Evidence Class | What It Requires | Example Artifact |
|---------------|-----------------|-----------------|
| Real user validation | At least one PM has used the capability on a real project | User feedback document |
| Parallel-run parity | Financial module produces equivalent results to spreadsheet workflow | FRC-00 crosswalk verification against real project data |
| Data volume proof | Performance acceptable under real data volume | Load test with production-scale budget lines |
| Edge case coverage | Known edge cases handled (mid-period import, multi-reconciliation, etc.) | Edge case test results |

### R7 — Release Ready

| Evidence Class | What It Requires | Example Artifact |
|---------------|-----------------|-----------------|
| Cutover plan | Migration from spreadsheets to runtime is documented | FRC-00 §6 cutover criteria |
| Rollback plan | Documented path to revert if issues arise | Rollback procedure document |
| Support readiness | Training materials and support contacts available | User guide, help content |
| No unresolved critical issues | All critical/high bugs resolved | Issue tracker clean for Financial |

---

## 4. Current Readiness Assessment (2026-03-29)

### Per-Capability Status

| Capability | R1 Doctrine | R2 Contract | R3 Route/Lane | R4 Implementation | R5 Operational | R6 Pilot | R7 Release |
|-----------|:-----------:|:-----------:|:-------------:|:------------------:|:--------------:|:--------:|:----------:|
| Budget Import | **Done** | **Done** | **Done** | Not started | — | — | — |
| Forecast Summary | **Done** | Partial (T04 pending) | **Done** | Not started | — | — | — |
| Forecast Checklist | **Done** | **Done** | **Done** | Not started | — | — | — |
| GC/GR Forecast | **Done** | Partial (T04 pending) | **Done** | Not started | — | — | — |
| Cash Flow | **Done** | **Done** | **Done** | Not started | — | — | — |
| Buyout | **Done** | **Done** | **Done** | Not started | — | — | — |
| Review / PER | **Done** | **Done** | **Done** | Not started | — | — | — |
| Publication / Export | **Done** | Partial (B-FIN-03) | **Done** | Not started | — | — | — |
| History / Audit | **Done** | **Done** | **Done** | Not started | — | — | — |

### Summary

- **R1 (Doctrine):** Complete for all 9 capabilities — Financial-SOTEC, Financial-ABMC, Financial-RGC, Financial-LMG, Financial-LODM, Financial-CLHLC, Financial-SSIC all locked.
- **R2 (Contract):** Complete for 6 of 9; partial for 3 (Forecast Summary and GC/GR blocked on T04; Publication blocked on B-FIN-03).
- **R3 (Route/Lane):** Complete for all 9 — canonical routes, deep-link entry, project-switch, return-memory, workspace shell, operational banner all implemented. 41 route tests + 13 context tests + 25 operational tests pass.
- **R4 (Implementation):** Not started for any capability — `IFinancialRepository` does not exist; all hooks use mock data.
- **R5–R7:** Not applicable until R4 gates pass.

### Go/No-Go for Next Phase

| Gate | Status | Blocking Item |
|------|--------|--------------|
| Can implement `IFinancialRepository`? | **Go** — all doctrine, contracts, routes, and workspace primitives are in place | None |
| Can advance to R4 for Budget/Buyout? | **Blocked** — requires `IFinancialRepository` creation and factory registration | Repository implementation |
| Can advance to R4 for Forecast Summary/GC/GR? | **Blocked** — requires T04 source contracts first, then repository | T04 + repository |
| Can advance to R5 for any capability? | **Blocked** — requires R4 completion first | R4 gate |

---

## 5. Prohibited Overclaiming Patterns

The following claims are **explicitly prohibited** without the corresponding evidence:

| Prohibited Claim | Why | Required Evidence |
|-----------------|-----|-------------------|
| "Complete" without specifying readiness stage | Conflates contract with operational | Must state "Complete at R2" or "Complete at R5" |
| "Operational" based on rendered UI with mock data | Mock data proves scaffold, not operation | R5 requires real data flowing through a complete workflow |
| "Release-ready" based on contract tests passing | Tests prove logic, not user experience | R7 requires pilot feedback and cutover plan |
| "Lane-complete" based on PWA only | SPFx lane is part of lane acceptance | R3 requires both lane postures documented; R5 requires PWA operational; R6 requires SPFx operational |
| "Spine-integrated" based on type contracts only | Type contracts prove scaffold | R5 requires runtime adapters publishing real events |
| "Operationally honest" based on banner presence with mock data | Banner proves scaffold disclosure (R3); it does not prove runtime truth | R5 requires the banner to reflect real data conditions — real stale-budget counts, real checklist status, real confirmation state |

---

## 6. Remaining Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | T04 source contracts unwritten | Forecast Summary and GC/GR cannot advance past R2 | Author T04 before R4 implementation |
| 2 | `IFinancialRepository` does not exist | No capability can advance to R4 | Create facade + factory registration as next implementation step |
| 3 | Review custody state machine not implemented | Review workflow cannot be operationally proven (R5) | Implement `FinancialReviewCustodyRecord` before R5 |
| 4 | No parallel-run infrastructure | Cannot prove spreadsheet parity (R6) | Design parallel-run approach before pilot |
| 5 | No cutover plan | Cannot claim release-ready (R7) | Draft cutover plan per FRC-00 §6 before release |
