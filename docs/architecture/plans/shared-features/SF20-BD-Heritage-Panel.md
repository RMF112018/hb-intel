# SF20 - BD Heritage Panel & Living Strategic Intelligence (`@hbc/features-business-development` adapter over `@hbc/strategic-intelligence`)

**Plan Version:** 2.1
**Date:** 2026-03-12
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Priority Tier:** 2 - Application Layer (BD and cross-module differentiator)
**Estimated Effort:** 6-7 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md` + companion `@hbc/strategic-intelligence` ADR

> **Doc Classification:** Canonical Normative Plan - SF20 implementation master plan for BD Heritage Panel and Living Strategic Intelligence; governs SF20-T01 through SF20-T09.

---

## Purpose

SF20 implements heritage and living intelligence as a BD adapter over the reusable Tier-1 `@hbc/strategic-intelligence` primitive. BD owns profile defaults, UX composition, and module-fit behavior; core intelligence model/workflow/offline/versioning/telemetry contracts are primitive-owned.

---

## Architectural Realignment Status

Realignment patch applied: 2026-03-12

- explicit separation of immutable Heritage Snapshot from additive Living Strategic Intelligence
- trust model expanded beyond approval status (reliability, provenance, recency, stale-state)
- formal Handoff Review Mode + participant acknowledgment workflow added
- Commitment Register introduced as first-class lifecycle artifact
- supersession/contradiction/resolution and stale-renewal governance modeled
- suggestion/explainability contracts added for proactive reuse
- sensitivity and redacted cross-module projection policies added

---

## Locked Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Entire heritage/intelligence model and lifecycle is provided by Tier-1 `@hbc/strategic-intelligence` |
| L-02 | Knowledge layer separation | Heritage Snapshot is immutable historical context; Living Strategic Intelligence is additive and versioned |
| L-03 | Trust model ownership | Reliability tier, provenance class, recency/stale indicators are primitive-owned contracts |
| L-04 | Workflow ownership | Handoff review mode, participant acknowledgment state, commitment register lifecycle, and conflict-resolution lifecycle are primitive-owned |
| L-05 | Progressive disclosure | `@hbc/complexity` controls Essential/Standard/Expert behavior across panel/feed/form/queue/review surfaces |
| L-06 | Offline resilience | Service worker cache + IndexedDB via `@hbc/versioned-record` + Background Sync + optimistic indicators |
| L-07 | Inline AI | Inline AI actions only; citation + explicit approval required; AI-assisted drafts are trust-downgraded until approved |
| L-08 | Sensitivity and redaction | Sensitivity classification and redacted cross-module projections are primitive policy contracts with adapter-level rendering rules |
| L-09 | Integration governance | BIC ownership, My Work projection, related-item deep-linking, notification routing, and acknowledgment interoperability use public primitive contracts only |
| L-10 | Decision/workflow telemetry | Telemetry includes handoff quality, commitment fulfillment, stale backlog, conflict-resolution latency, and suggestion explainability engagement |

---

## Package Directory Structure

```text
packages/strategic-intelligence/
|- src/types/
|- src/model/
|  |- heritage-snapshot/
|  |- living-intelligence/
|  |- trust/
|  |- commitments/
|  |- acknowledgment/
|  |- sensitivity/
|  |- conflict-resolution/
|  |- suggestions/
|- src/api/
|- src/hooks/
|- src/components/
|- testing/

packages/features/business-development/
|- src/strategic-intelligence/
|  |- profiles/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/
|  |- index.ts
|- testing/
```

Core intelligence lifecycle/workflow, trust/reliability, sensitivity/redaction, offline queue semantics, provenance, and telemetry schema live in `@hbc/strategic-intelligence`.

---

## Definition of Done

- [ ] all SF20 docs use locked L-01 through L-10 and no legacy D-* semantics
- [ ] canonical contracts are primitive-owned (`IStrategicIntelligence*`), with adapter projections documented
- [ ] Heritage Snapshot vs Living Intelligence separation is explicit across contracts/hooks/UI/workflows
- [ ] trust/reliability/provenance/recency/stale indicators are modeled, rendered, and tested
- [ ] handoff review acknowledgment workflow and Commitment Register lifecycle are documented end-to-end
- [ ] sensitivity controls and redacted projection contracts are documented and tested
- [ ] supersession/conflict-resolution and stale-renewal governance contracts are documented and tested
- [ ] proactive suggestion + explainability contracts are documented and tested
- [ ] complexity behavior is explicit for Essential/Standard/Expert across panel/feed/form/queue/review surfaces
- [ ] offline strategy includes SW cache, IndexedDB persistence, Background Sync, optimistic badges, and replay-safe governance events
- [ ] `@hbc/related-items`, `@hbc/project-canvas`, `@hbc/versioned-record`, `@hbc/notification-intelligence`, `@hbc/acknowledgment`, `@hbc/health-indicator`, and `@hbc/score-benchmark` interop contracts are documented
- [ ] SF20-T09 includes PH7 governance closure checks and companion primitive ADR linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF20-T01-Package-Scaffold.md` | primitive + adapter scaffolds and README requirements including trust/workflow/governance submodules |
| `SF20-T02-TypeScript-Contracts.md` | canonical primitive contracts (snapshot/living split, trust, commitments, acknowledgment, sensitivity, conflict, suggestions) + adapter projections |
| `SF20-T03-Heritage-Data-and-Intelligence-Storage.md` | primitive lifecycle/storage/indexing/provenance contracts including stale/conflict/acknowledgment semantics |
| `SF20-T04-Hooks-and-State-Model.md` | primitive hooks + BD adapter orchestration across trust, workflow, suggestion, and offline replay states |
| `SF20-T05-BdHeritagePanel-and-StrategicIntelligenceFeed.md` | complexity-aware panel/feed behavior with trust indicators, suggestions, explainability, and redaction states |
| `SF20-T06-IntelligenceEntryForm-and-ApprovalQueue.md` | contributor form + approval queue + handoff review/commitment workflows + conflict/stale actions |
| `SF20-T07-Reference-Integrations.md` | Tier-1 integration boundaries including `@hbc/acknowledgment` and redacted projection policies |
| `SF20-T08-Testing-Strategy.md` | fixtures and scenario matrix including trust/workflow/sensitivity/conflict/suggestion telemetry |
| `SF20-T09-Testing-and-Deployment.md` | closure gates, ADR/docs/index/state-map governance, and decision/workflow telemetry validation |
| `SF20-T05A-Trust-Suggestions-and-Explainability-Surfaces.md` | optional risk-isolation task for high-complexity trust/suggestion UI surfaces |
| `SF20-T06A-Handoff-and-Commitment-Governance-Workflows.md` | optional risk-isolation task for handoff acknowledgment + commitment workflows |

<!-- IMPLEMENTATION PROGRESS & NOTES
SF20 completed: 2026-03-12
Adapter-over-primitive boundary verified (`@hbc/features-business-development` -> `@hbc/strategic-intelligence`).
Locked decisions L-01..L-10 validated across docs and tests.
ADR-0109 updated and companion strategic-intelligence ADR linked.
Trust/workflow/sensitivity/conflict/suggestion contracts verified.
Offline replay, inline AI approval path, handoff acknowledgment workflow, commitment accountability, BIC ownership projection, and KPI telemetry verified.
All mechanical enforcement gates passed.
-->
