# SF24 - Export Runtime (`@hbc/features-*` adapters over `@hbc/export-runtime`)

**Plan Version:** 1.1
**Date:** 2026-03-12
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Priority Tier:** 2 - Application Layer (shared package; cross-module output infrastructure)
**Estimated Effort:** 4-5 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0114-export-runtime.md` + companion `@hbc/export-runtime` ADR

> **Doc Classification:** Canonical Normative Plan - SF24 implementation master plan for Export Runtime; governs SF24-T01 through SF24-T09.

---

## Purpose

SF24 defines a shared export and rendering runtime as module adapters over Tier-1 `@hbc/export-runtime`, standardizing CSV/XLSX/PDF/Print output, branding, artifact naming, provenance stamping, handoff ownership, offline replay, and telemetry across platform modules.
Industry baseline framing: enterprise suites offer export and report features, but SF24 remains differentiated by governed implementation-truth stamping, deterministic artifact provenance, and first-class export receipt continuity.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Export lifecycle, render pipeline, receipt state, offline behavior, AI actions, BIC orchestration, and telemetry are owned by Tier-1 `@hbc/export-runtime` |
| L-02 | BIC ownership | Review/approval and post-export handoff steps create granular BIC ownership with avatar projection in export surfaces + My Work |
| L-03 | Complexity behavior | Essential CSV/XLSX button; Standard full menu + branded PDF/Print; Expert report composition + full receipt card + configure link |
| L-04 | Offline resilience | Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync replay + optimistic statuses |
| L-05 | AI embedding | Inline AI actions/placeholders only in menu/composition/receipt surfaces; source citation + explicit approval required |
| L-06 | Deep-linking/provenance/telemetry | Deep-links via `@hbc/related-items`, My Work via `@hbc/project-canvas`, immutable provenance/snapshot via `@hbc/versioned-record`, five UX KPIs |

---

## Architectural Enhancement Status

This enhancement pass realigns SF24 to the same mold-breaker standards now expected across PH7 shared-feature families.

- export truth is now explicit: users must be able to tell what record/view/version/filter/column state an artifact represents and whether it is a snapshot or current-view projection
- receipt and progress trust are now first-class concerns: queued, rendering, complete, failed, degraded, and restored receipt states must all explain themselves
- repeated export friction is reduced through recommended-action logic, clearer export-intent distinctions, deterministic naming, recent export recall expectations, and guarded duplicate/clear behavior
- review and handoff semantics are now operationally specific: blocking vs non-blocking, owner attribution, reassignment history, and My Work / Canvas visibility are all explicit plan concerns
- reusable visual component ownership is realigned to `@hbc/ui-kit` per `CLAUDE.md` while preserving `@hbc/export-runtime` as the runtime/orchestration owner

---

## Export Truth and Trust Expectations

The SF24 family must use a shared vocabulary across all tasks:

- `working-data export`
- `current-view export`
- `record-snapshot export`
- `presentation export`
- `composite report export`
- `saved-locally`
- `queued-to-sync`
- `rendering`
- `complete`
- `failed`
- `degraded`
- `restored receipt`
- `artifact confidence`
- `top recommended export`
- `blocking review step`
- `non-blocking handoff step`

The package must make it clear to the user:

- exactly what record/view/version the artifact reflects
- whether filters, sorts, visible columns, selected rows, or report composition were applied
- whether the artifact is local-only, queued, rendering, complete, degraded, failed, or restored
- whether receipt metadata is trustworthy enough to download, retry, re-export, review, or hand off
- why a format is enabled, disabled, deferred, or review-gated

Users must not be forced to infer artifact meaning from filename or timing alone.

---

## Export Pattern Differentiation

SF24 must explicitly distinguish the supported export patterns rather than relying on vague “multiple formats” language.

- simple table export
  - CSV/XLSX for working analysis with row/column truth and deterministic naming
- current-view export
  - export of current filters, sort order, visible columns, and selected-row state
- record-snapshot export
  - point-in-time record/version truth with immutable provenance emphasis
- branded presentation export
  - PDF/print output intended for circulation or meeting review
- composite report export
  - section-based narrative/report assembly with expert composition controls
- offline-queued export
  - request created locally with deferred remote completion
- future server-render export
  - long-running or heavier render path with the same truth/receipt contract

The primitive chooses runtime behavior by pattern, but module adapters still own source payloads and export policy.

---

## UI Ownership Alignment

`@hbc/export-runtime` owns runtime, contracts, orchestration hooks, adapters, render/composition lifecycle logic, and headless state interpretation.
Reusable visual primitives and reusable presentational surfaces belong in `@hbc/ui-kit` per the active UI Ownership Rule in `CLAUDE.md`.
Feature and shared packages may provide thin composition shells only when they do not introduce a new reusable visual primitive.

SF24 task docs must therefore:

- reuse `@hbc/ui-kit` primitives first
- treat export action, picker, progress, and receipt surfaces as runtime-driven composition shells
- factor any reusable visual export abstraction into `@hbc/ui-kit` instead of recreating it locally

---

## Package Directory Structure

```text
packages/export-runtime/
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
|  |- composers/
|  |- renderers/
|  |- templates/
|- testing/

packages/features/business-development/
|- src/export-runtime/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/

packages/features/estimating/
|- src/export-runtime/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/
```

The primitive remains runtime-first; any reusable visual expansion triggered by SF24 belongs in `@hbc/ui-kit`.

---

## Definition of Done

- [ ] SF24 is documented as module adapters over `@hbc/export-runtime`
- [ ] all L-01 through L-06 decisions are represented in plan-family documents
- [ ] export truth, receipt trust, and top recommended export semantics are explicit across T02-T06
- [ ] queued, rendering, complete, failed, degraded, and restored receipt states are documented with user-facing explainability expectations
- [ ] BIC ownership, review/handoff semantics, reassignment history, and My Work placement contracts are documented
- [ ] complexity behavior is explicit for Essential/Standard/Expert without contradictory artifact truth
- [ ] offline queue/replay model with `Saved locally` and `Queued to sync` is documented
- [ ] stale receipt, retry, clear/dismiss safeguards, and artifact-confidence semantics are documented
- [ ] inline AI citation/approval constraints are documented with no sidecar behavior
- [ ] deep-link, canvas, provenance, snapshot freeze, and session-state boundaries are documented
- [ ] five SF24 telemetry KPIs are documented with operational value emphasis
- [ ] SF24-T09 includes trust/progress/recovery/review closure criteria and PH7 governance checks
- [ ] `current-state-map.md` update requirements include SF24 and ADR-0114 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF24-T01-Package-Scaffold.md` | primitive + adapter scaffolds, headless/runtime seams, README requirements, truth/receipt/recovery exports |
| `SF24-T02-TypeScript-Contracts.md` | canonical primitive contracts, truth/explainability models, receipt semantics, review/handoff state, and next-action projections |
| `SF24-T03-Export-Lifecycle-and-Storage.md` | lifecycle states, local-vs-remote-vs-restored receipt distinctions, replay/retry rules, stale-artifact safeguards |
| `SF24-T04-Hooks-and-State-Model.md` | primitive hooks, derived explainability, artifact-confidence state, next-step computation, and replay-safe orchestration |
| `SF24-T05-ExportActionMenu-and-ExportFormatPicker.md` | menu/picker UX contracts, why-this-format visibility, recommended action, and safe export behavior |
| `SF24-T06-ExportProgressToast-and-ExportReceiptCard.md` | progress/receipt behavior, truth/context stamps, retry guidance, restore semantics, and guarded clear actions |
| `SF24-T07-Reference-Integrations.md` | Tier-1 integration boundaries, provenance obligations, module truth-passing responsibilities, and publish-boundary separation |
| `SF24-T08-Testing-Strategy.md` | fixtures, trust/progress/review scenario matrix, quality gates |
| `SF24-T09-Testing-and-Deployment.md` | closure checklist, ADR/docs/index/state-map updates, and trust/progress/recovery verification commands |
