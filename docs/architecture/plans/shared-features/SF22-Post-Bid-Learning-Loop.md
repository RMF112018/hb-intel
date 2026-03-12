# SF22 - Post-Bid Learning Loop (`@hbc/features-business-development` + `@hbc/features-estimating` adapters over `@hbc/post-bid-autopsy`)

**Plan Version:** 2.0
**Date:** 2026-03-12
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop_UPDATED.md` (required canonical target; currently not present in repo) and `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md` (interim baseline)
**Priority Tier:** 2 - Application Layer (cross-module intelligence; BD + Estimating)
**Estimated Effort:** 5-6 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0112-post-bid-learning-loop.md` + companion `@hbc/post-bid-autopsy` ADR

> **Doc Classification:** Canonical Normative Plan - SF22 implementation master plan for Post-Bid Learning Loop; governs SF22-T01 through SF22-T09.

---

## Purpose

SF22 implements structured post-bid autopsy as a cross-module adapter over the reusable Tier-1 `@hbc/post-bid-autopsy` primitive, turning outcomes into governed intelligence that is confidence-scored, evidence-backed, review-gated, and reusable in future pursuit decisions.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Entire autopsy model/lifecycle is provided by Tier-1 `@hbc/post-bid-autopsy` |
| L-02 | BIC ownership | Per-section autopsy gaps create granular BIC ownership with avatar projection in wizard + My Work |
| L-03 | Complexity behavior | Essential collapsed badge; Standard full wizard; Expert retrospective + diagnostics |
| L-04 | Offline resilience | Service worker caching + IndexedDB via `@hbc/versioned-record` + Background Sync + optimistic statuses |
| L-05 | AI embedding | Inline AI actions only; source citation + explicit approval required before publication |
| L-06 | Deep-linking/provenance | Deep-links via `@hbc/related-items`, My Work via `@hbc/project-canvas`, immutable provenance via `@hbc/versioned-record` |
| L-07 | Evidence model | Findings require evidence objects with typed metadata and provenance lineage |
| L-08 | Confidence model | Confidence tier/reasons are mandatory at section and autopsy aggregate levels |
| L-09 | Lifecycle depth | Lifecycle supports draft/review/approved/published/superseded/archived with reopen/revise paths |
| L-10 | Governance | Sensitivity/visibility controls, manual override governance, disagreement capture, and escalation are first-class |
| L-11 | Flywheel rigor | Corroboration, repeat-pattern detection, and reinsertion into future pursuit decision points are required |
| L-12 | Publication controls | Downstream publication is gated by review state, confidence/evidence checks, and visibility policy |
| L-13 | Integration contracts | Publish-subscribe/event exchange contracts are explicit across BD/Estimating/SF19/SF20/canvas/feed |
| L-14 | Telemetry | Reliability and flywheel KPIs include confidence quality, corroboration, stale/revalidation, and adoption outcomes |

---

## Package Directory Structure

```text
packages/post-bid-autopsy/
|- src/
|  |- types/
|  |- model/
|  |- model/evidence/
|  |- model/confidence/
|  |- model/taxonomy/
|  |- model/governance/
|  |- model/publication/
|  |- api/
|  |- hooks/
|  |- components/
|  |- telemetry/

packages/features/business-development/src/post-bid-learning/
packages/features/estimating/src/post-bid-learning/
|- profiles/
|- adapters/
|- hooks/
|- components/
|- telemetry/
```

---

## Definition of Done

- [ ] SF22 is documented as BD/Estimating adapters over `@hbc/post-bid-autopsy`
- [ ] all L-01 through L-14 decisions are represented in plan-family documents
- [ ] evidence/confidence/taxonomy/sensitivity models are documented and testable
- [ ] lifecycle state-machine and publication-gating semantics are explicit
- [ ] disagreement/escalation/manual-override governance is documented
- [ ] flywheel corroboration/pattern/reinsertion mechanics are documented
- [ ] integration contracts include explicit data exchange/event assumptions
- [ ] T08/T09 include reliability-governance and flywheel-quality validation gates
- [ ] ADR target is consistent with current-state map and ADR index governance

---

## Task File Index

| File | Contents |
|---|---|
| `SF22-T01-Package-Scaffold.md` | primitive + adapter scaffolds and README requirements including evidence/confidence/governance boundaries |
| `SF22-T02-TypeScript-Contracts.md` | canonical contracts for evidence/confidence/taxonomy/lifecycle/governance/publication |
| `SF22-T03-Autopsy-Trigger-and-Lifecycle-Storage.md` | trigger + multi-stage lifecycle + storage + revalidation + publish gating |
| `SF22-T04-Hooks-and-State-Model.md` | primitive hooks + adapter projections for trust/governance/triage state |
| `SF22-T05-PostBidAutopsyWizard-and-AutopsySummaryCard.md` | wizard + summary UX contracts with explainability/trust indicators |
| `SF22-T06-AutopsyListView-and-LearningInsightsDashboard.md` | triage queues, flywheel insights, stale/supersession monitoring |
| `SF22-T07-Reference-Integrations.md` | integration boundaries + publish-subscribe payload contracts |
| `SF22-T08-Testing-Strategy.md` | fixtures, scenario matrix, reliability/flywheel quality gates |
| `SF22-T09-Testing-and-Deployment.md` | closure checklist + ADR/docs/index/state-map consistency checks |
| `SF22-T02A-Evidence-Confidence-and-Taxonomy-Contracts.md` *(optional split)* | isolate dense model contracts |
| `SF22-T03A-Lifecycle-Governance-State-Machine.md` *(optional split)* | isolate lifecycle/publication governance complexity |
| `SF22-T06A-Flywheel-Triage-and-Reinsertion.md` *(optional split)* | isolate flywheel/triage UX and logic complexity |
