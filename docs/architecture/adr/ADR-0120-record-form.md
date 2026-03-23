# ADR-0120: Record Form Shared Primitive Architecture

**Status:** Accepted
**Date:** 2026-03-23
**Deciders:** Architecture Lead
**Package:** `@hbc/record-form`
**Governing Plan:** `docs/architecture/plans/shared-features/SF23-Record-Form.md`

## Context

HB Intel Phase 3 modules all require record authoring capabilities — create, edit, duplicate, template, and review workflows with draft recovery, validation, review/handoff, and offline resilience. SF23 defines `@hbc/record-form` as the Tier-1 shared record authoring runtime.

## Decision

### Locked Decisions (L-01 through L-06)

**L-01 — Primitive Abstraction:** Lifecycle runtime, offline behavior, AI actions, BIC orchestration, and telemetry owned by `@hbc/record-form`.

**L-02 — BIC Ownership:** Review/approval and post-submit handoff steps create granular BIC ownership with avatar projection in submit bar + My Work.

**L-03 — Complexity Behavior:** Essential (minimal fields + simple submit bar), Standard (full renderer + inline validation + read-only review), Expert (retrospective adjustments + full preview + configure link).

**L-04 — Offline Resilience:** Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync replay + optimistic statuses.

**L-05 — AI Embedding:** Inline AI actions/placeholders only in field/review/submit surfaces. Source citation + explicit approval required.

**L-06 — Deep-linking/Provenance/Telemetry:** Deep-links via `@hbc/related-items`, My Work via `@hbc/project-canvas`, immutable provenance via `@hbc/versioned-record`, five UX KPIs.

### Architecture Boundaries

- `@hbc/record-form` owns lifecycle, draft persistence, review orchestration, offline resilience
- Reusable visual primitives (`HbcRecordForm`, `HbcRecordSubmitBar`, `HbcRecordReviewPanel`, `HbcRecordRecoveryBanner`) belong in `@hbc/ui-kit`
- Module adapters consume public exports only — schemas and validation rules are adapter-owned

### Lifecycle Model

8-status monotonic transitions: not-started → draft → dirty → valid-with-warnings | blocked → submitting → submitted | failed. Separate `RecordSyncState` (6 states) and `RecordStateConfidence` (5 levels). Generic `IRecordFormDefinition<TRecord>` top-level contract.

### Trust/Explainability Model

Every form state explains itself: why blocked, why warning, why recovery, why deferred. `IRecordFormExplanationState` with block reasons, validation warnings, recovery state, and defer reasons. Users never see generic status text.

## Consequences

- All Phase 3 modules share consistent record authoring lifecycle and trust behavior
- Module adapters remain thin — no lifecycle logic duplication
- 61 unit tests at 100%/96%/100% coverage validate the model layer

## Related

- [SF23-Record-Form.md](../../plans/shared-features/SF23-Record-Form.md)
- [record-form-adoption-guide.md](../../how-to/developer/record-form-adoption-guide.md)
- [api.md](../../reference/record-form/api.md)
