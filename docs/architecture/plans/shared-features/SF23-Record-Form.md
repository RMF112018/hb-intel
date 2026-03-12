# SF23 - Record Form (`@hbc/features-*` adapters over `@hbc/record-form`)

**Plan Version:** 1.0
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Priority Tier:** 2 - Application Layer (shared package; cross-module record lifecycle)
**Estimated Effort:** 4-6 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0111-record-form.md` + companion `@hbc/record-form` ADR

> **Doc Classification:** Canonical Normative Plan - SF23 implementation master plan for Record Form; governs SF23-T01 through SF23-T09.

---

## Purpose

SF23 defines a shared record authoring runtime as module adapters over Tier-1 `@hbc/record-form`, standardizing create/edit/duplicate/template flows, draft recovery, review and submission handoffs, offline replay, and telemetry across platform modules.
Industry baseline framing: enterprise platforms commonly expose configurable scoring/forms and explainability controls, but SF23 remains differentiated by governed cross-module authoring runtime, immutable provenance, and first-class offline submission continuity.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Lifecycle runtime, offline behavior, AI actions, BIC orchestration, and telemetry are owned by Tier-1 `@hbc/record-form` |
| L-02 | BIC ownership | Review/approval and post-submit handoff steps create granular BIC ownership with avatar projection in submit bar + My Work |
| L-03 | Complexity behavior | Essential minimal fields + simple submit bar; Standard full renderer + inline validation + read-only review; Expert retrospective adjustments + full preview + configure link |
| L-04 | Offline resilience | Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync replay + optimistic statuses |
| L-05 | AI embedding | Inline AI actions/placeholders only in field/review/submit surfaces; source citation + explicit approval required |
| L-06 | Deep-linking/provenance/telemetry | Deep-links via `@hbc/related-items`, My Work via `@hbc/project-canvas`, immutable provenance/snapshot via `@hbc/versioned-record`, five UX KPIs |

---

## Package Directory Structure

```text
packages/record-form/
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
|  |- adapters/
|- testing/

packages/features/business-development/
|- src/record-form/
|  |- profiles/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/

packages/features/estimating/
|- src/record-form/
|  |- profiles/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/
```

---

## Definition of Done

- [ ] SF23 is documented as module adapters over `@hbc/record-form`
- [ ] all L-01 through L-06 decisions are represented in plan-family documents
- [ ] BIC ownership and avatar projection contracts are documented for review/handoff steps
- [ ] complexity behavior is explicit for Essential/Standard/Expert
- [ ] offline queue/replay model with `Saved locally` and `Queued to sync` is documented
- [ ] inline AI citation/approval constraints are documented with no sidecar behavior
- [ ] deep-link, canvas, provenance, and snapshot freeze contracts are documented
- [ ] five SF23 telemetry KPIs are documented in primitive contracts and adapter projection rules
- [ ] SF23-T09 includes SF11-grade closure and PH7 governance checks
- [ ] `current-state-map.md` update requirements include SF23 and ADR-0111 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF23-T01-Package-Scaffold.md` | primitive + adapter scaffolds and README requirements |
| `SF23-T02-TypeScript-Contracts.md` | canonical primitive contracts + adapter projections |
| `SF23-T03-Record-Lifecycle-and-Storage.md` | lifecycle states, persistence, offline replay, snapshot freeze |
| `SF23-T04-Hooks-and-State-Model.md` | primitive hooks + adapter orchestration contracts |
| `SF23-T05-HbcRecordForm-and-HbcRecordSubmitBar.md` | form and submit bar UX contracts |
| `SF23-T06-HbcRecordReviewPanel-and-Recovery-Banner.md` | review/recovery behavior and complexity projections |
| `SF23-T07-Reference-Integrations.md` | Tier-1 integration boundaries |
| `SF23-T08-Testing-Strategy.md` | fixtures, scenario matrix, quality gates |
| `SF23-T09-Testing-and-Deployment.md` | closure checklist + ADR/docs/index/state-map updates |
