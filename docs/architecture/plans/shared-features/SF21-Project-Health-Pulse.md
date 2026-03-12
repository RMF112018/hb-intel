# SF21 - Project Health Pulse (`@hbc/features-project-hub`)

**Plan Version:** 2.0  
**Date:** 2026-03-12  
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`  
**Priority Tier:** 2 - Application Layer (Project Hub differentiator)  
**Estimated Effort:** 5-6 sprint-weeks  
**ADR Required:** `docs/architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md`

> **Doc Classification:** Canonical Normative Plan - SF21 implementation master plan for Project Health Pulse; governs SF21-T01 through SF21-T09.

---

## Purpose

SF21 delivers a confidence-aware, explainable, action-prioritized four-dimension project health system for project and portfolio decisions. The model remains predictive-first (leading indicators 70%) and now includes compound-risk detection, reason-coded recommendations, triage-first portfolio workflows, and manual-entry governance.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Package alignment | Implement in `@hbc/features-project-hub`; no standalone pulse package |
| D-02 | Health formula | Each dimension uses `leading 70% + lagging 30%` scoring |
| D-03 | Composite weighting | Overall score uses admin-configurable weights (default field/time/cost/office = 40/30/15/15) |
| D-04 | Status bands | `on-track`, `watch`, `at-risk`, `critical`, `data-pending` |
| D-05 | Missing/stale metrics | Stale/missing stub metrics are excluded (not zeroed) with re-normalized scoring |
| D-06 | Inline edit policy | Stub metrics editable only in detail panel with role permissions |
| D-07 | Pulse confidence | Overall + dimension confidence tiers (`high/moderate/low/unreliable`) with reason codes |
| D-08 | Compound risk | Cross-dimension interaction rules drive escalation and triage priority |
| D-09 | Top action model | Top Recommended Action is prioritized and reason-coded (`owner`, `urgency`, `impact`, `confidenceWeight`) |
| D-10 | Portfolio triage | Portfolio table includes triage buckets: Attention Now, Trending Down, Data Quality Risk, Recovering |
| D-11 | Explainability | UI must expose `Why this status`, `What changed`, `Top contributors`, `What matters most` |
| D-12 | Governance | Manual override metadata/approval/audit and Office suppression controls are required |
| D-13 | Telemetry | Decision-quality telemetry is required (lead time, false alarms, pre-lag detection, action adoption, review cycle) |
| D-14 | Testing sub-path | `@hbc/features-project-hub/testing` exports canonical pulse fixtures including confidence/compound/triage states |

---

## Package Directory Structure

```text
packages/features/project-hub/
|- src/health-pulse/
|  |- types/
|  |- computors/
|  |  |- confidence/
|  |  |- compound-risk/
|  |  |- recommendation/
|  |  |- office-suppression/
|  |- hooks/
|  |- components/
|  |- telemetry/
|  |- governance/
|- testing/
```

Note: structure may be implemented as folders or collocated modules, but these boundaries must be represented in task outputs and contracts.

---

## Definition of Done

- [ ] confidence model and reason semantics documented and testable
- [ ] compound-risk rules documented and surfaced to UI/triage
- [ ] top action prioritization schema (not string-only) documented
- [ ] explainability payload documented and consumed in detail UI
- [ ] enriched Time/Cost/Field signal requirements documented
- [ ] Office Health suppression policy documented and integrated
- [ ] manual-entry governance (reason/actor/timestamp/approval visibility) documented
- [ ] portfolio triage mode documented with sort/filter rules
- [ ] telemetry schema expanded with decision-quality KPIs
- [ ] T08/T09 gates include confidence/compound/explainability/governance/triage validation
- [ ] `current-state-map.md` linkage remains consistent with SF21/ADR-0110 governance

---

## Task File Index

| File | Contents |
|---|---|
| `SF21-T01-Package-Scaffold.md` | scaffold + README requirements including confidence/compound/explainability/governance/telemetry boundaries |
| `SF21-T02-TypeScript-Contracts.md` | canonical contracts (confidence, compound risk, explainability, recommendation, governance, telemetry) |
| `SF21-T03-Health-Computation-and-Admin-Config.md` | dimension calculators + confidence/compound/suppression + admin governance config |
| `SF21-T04-Hooks-and-State-Model.md` | hook orchestration for confidence, compound risk, explainability, triage projections |
| `SF21-T05-ProjectHealthPulseCard-and-Detail.md` | card/detail behavior including confidence indicators and explainability drawer |
| `SF21-T06-HealthDimensionTab-and-PortfolioHealthTable.md` | tab/inline-edit/portfolio triage/admin governance controls |
| `SF21-T07-Reference-Integrations.md` | integration boundaries + provenance/audit/telemetry emission paths |
| `SF21-T08-Testing-Strategy.md` | fixture and scenario matrix including confidence/compound/triage/governance/suppression telemetry |
| `SF21-T09-Testing-and-Deployment.md` | release checklist + updated closure gates for decision-quality model |
| `SF21-T03A-CompoundRisk-and-Action-Prioritization.md` *(optional split)* | isolate high-complexity decision engine if risk grows |
| `SF21-T06A-PortfolioTriage-and-Explainability-Surfaces.md` *(optional split)* | isolate triage/explainability UI complexity if risk grows |
