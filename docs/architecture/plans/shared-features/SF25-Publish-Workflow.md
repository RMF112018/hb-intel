# SF25 - Publish Workflow (`@hbc/features-*` adapters over `@hbc/publish-workflow`)

**Plan Version:** 1.0
**Date:** 2026-03-12
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-25-Shared-Feature-Publish-Workflow.md`
**Priority Tier:** 2 - Application Layer (shared package; cross-module publication governance)
**Estimated Effort:** 4-5 sprint-weeks
**ADR Required:** `docs/architecture/adr/0109-publish-workflow.md` + companion `@hbc/publish-workflow` ADR

> **Doc Classification:** Canonical Normative Plan - SF25 implementation master plan for Publish Workflow; governs SF25-T01 through SF25-T09.

---

## Purpose

SF25 defines shared publication governance as module adapters over Tier-1 `@hbc/publish-workflow`, standardizing publish readiness, approval flow, supersession/revocation, distribution routing, receipt traceability, offline replay, and telemetry across platform modules.
Industry baseline framing: enterprise suites provide document approval and issue workflows, but SF25 remains differentiated by immutable version traceability, deterministic supersession governance, and first-class offline publication continuity.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Publish lifecycle, readiness/approval engine, supersession/revocation flow, receipt state, offline behavior, AI actions, BIC orchestration, and telemetry are owned by Tier-1 `@hbc/publish-workflow` |
| L-02 | BIC ownership | Readiness/approval/supersession/revocation/post-publish acknowledgment steps create granular BIC ownership with avatar projection in `HbcPublishPanel` + My Work |
| L-03 | Panel visibility | Full `HbcPublishPanel` visibility across all complexity modes (locked Decision 2; no mode-hidden panel behavior) |
| L-04 | Offline resilience | Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync replay + optimistic statuses |
| L-05 | AI embedding | Inline AI actions/placeholders only in panel/checklist/receipt surfaces; source citation + explicit approval required |
| L-06 | Deep-linking/provenance/telemetry | Deep-links via `@hbc/related-items`, My Work via `@hbc/project-canvas`, immutable provenance/snapshot via `@hbc/versioned-record`, five UX KPIs |

---

## Package Directory Structure

```text
packages/publish-workflow/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- types/
|  |- model/
|  |- api/
|  |- hooks/
|  |- components/
|  |- rules/
|  |- adapters/
|- testing/

packages/features/business-development/
|- src/publish-workflow/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/

packages/features/estimating/
|- src/publish-workflow/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/
```

---

## Definition of Done

- [ ] SF25 is documented as module adapters over `@hbc/publish-workflow`
- [ ] all L-01 through L-06 decisions are represented in plan-family documents
- [ ] BIC ownership and avatar projection contracts are documented for publish readiness/approval/supersession/revocation steps
- [ ] full panel visibility across all modes is explicit and test-gated
- [ ] offline queue/replay model with `Saved locally` and `Queued to sync` is documented
- [ ] inline AI citation/approval constraints are documented with no sidecar behavior
- [ ] deep-link, canvas, provenance, and snapshot freeze contracts are documented
- [ ] five SF25 telemetry KPIs are documented in primitive contracts and adapter projection rules
- [ ] SF25-T09 includes SF11-grade closure and PH7 governance checks
- [ ] `current-state-map.md` update requirements include SF25 and ADR-0109 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF25-T01-Package-Scaffold.md` | primitive + adapter scaffolds and README requirements |
| `SF25-T02-TypeScript-Contracts.md` | canonical primitive contracts + adapter projections |
| `SF25-T03-Publish-Lifecycle-and-Storage.md` | publish lifecycle states, approvals, supersession/revocation, offline replay |
| `SF25-T04-Hooks-and-State-Model.md` | primitive hooks + adapter orchestration contracts |
| `SF25-T05-HbcPublishPanel-and-PublishTargetSelector.md` | panel and target selector UX contracts |
| `SF25-T06-PublishApprovalChecklist-and-PublishReceiptCard.md` | checklist/receipt behavior and traceability projections |
| `SF25-T07-Reference-Integrations.md` | Tier-1 integration boundaries |
| `SF25-T08-Testing-Strategy.md` | fixtures, scenario matrix, quality gates |
| `SF25-T09-Testing-and-Deployment.md` | closure checklist + ADR/docs/index/state-map updates |

