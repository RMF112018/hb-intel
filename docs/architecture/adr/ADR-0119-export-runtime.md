# ADR-0119: Export Runtime Shared Primitive Architecture

**Status:** Accepted
**Date:** 2026-03-23
**Deciders:** Architecture Lead
**Package:** `@hbc/export-runtime`
**Governing Plan:** `docs/architecture/plans/shared-features/SF24-Export-Runtime.md`

## Context

HB Intel Phase 3 modules (Financial, Schedule, Constraints, Permits, Safety, Reports, Closeout, Startup, Subcontract Compliance) all require export capabilities — CSV, XLSX, PDF, and Print. Without a shared primitive, each module would build bespoke export pipelines, leading to inconsistent truth stamping, divergent receipt behavior, duplicated offline logic, and fragmented governance.

SF24 defines `@hbc/export-runtime` as the Tier-1 shared export runtime primitive that standardizes export lifecycle orchestration, receipt state, artifact provenance, offline replay, and module adapter seams.

## Decision

### Locked Decisions (L-01 through L-06)

**L-01 — Primitive Abstraction:** Export lifecycle, render pipeline, receipt state, offline behavior, AI actions, BIC orchestration, and telemetry are owned by `@hbc/export-runtime`. Module packages create lightweight adapters over this primitive.

**L-02 — BIC Ownership:** Review/approval and post-export handoff steps create granular BIC ownership with avatar projection in export surfaces and My Work.

**L-03 — Complexity Behavior:** Essential (CSV/XLSX button only), Standard (full menu + branded PDF/Print), Expert (report composition + full receipt card + configure link).

**L-04 — Offline Resilience:** Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync replay + optimistic statuses (`Saved locally`, `Queued to sync`).

**L-05 — AI Embedding:** Inline AI actions/placeholders only in menu/composition/receipt surfaces. Source citation + explicit approval required before persistence or artifact mutation. No sidecar behavior.

**L-06 — Deep-linking/Provenance/Telemetry:** Deep-links via `@hbc/related-items`, My Work via `@hbc/project-canvas`, immutable provenance via `@hbc/versioned-record`, five UX KPIs for operational value measurement.

### Architecture Boundaries

- `@hbc/export-runtime` owns runtime, contracts, orchestration hooks, adapters, render/composition lifecycle
- Reusable visual primitives (`ExportActionMenu`, `ExportFormatPicker`, `ExportProgressToast`, `ExportReceiptCard`) belong in `@hbc/ui-kit`
- Module adapters consume primitive public exports only — no internal imports
- Module-specific payload composition remains adapter-owned (projection-only)

### Export Truth Model

Every artifact carries an `IExportSourceTruthStamp` identifying module, project, record, snapshot time, snapshot type, applied filters, sort order, and visible columns. Users can always tell what record/view/version an artifact represents.

Seven export receipt states: `saved-locally`, `queued-to-sync`, `rendering`, `complete`, `failed`, `degraded`, `restored-receipt`. Five artifact confidence levels: `trusted-synced`, `queued-local-only`, `completed-with-degraded-truth`, `failed-or-partial`, `restored-needs-review`.

### Lifecycle Model

Monotonic status transitions enforced by `VALID_TRANSITIONS` map. `createExportRequest` initializes in `saved-locally`. `transitionExportStatus` validates transitions and updates receipt, telemetry, and truth state. `computeArtifactConfidence` derives confidence from receipt + truth + delta state.

### Renderer Pipeline

Deterministic file naming: `{moduleKey}_{recordId}_{intent}_{YYYYMMDD_HHmmss}.{ext}`. Format extensions: csv, xlsx, pdf, print→pdf. Governance audit trail via `createAuditEntry` with 10 auditable actions.

### Module Integration

`ExportModuleRegistry` singleton (additive, freeze-on-write). Modules register via `IExportModuleRegistration` with `IExportModuleTruthProvider`. `createModuleExportRequest` composes registry lookup with lifecycle creation.

## Consequences

- All Phase 3 modules share consistent export truth, receipt behavior, and provenance
- Module adapters remain thin — no lifecycle logic duplication
- UI ownership is clean: visual primitives in ui-kit, runtime state in export-runtime
- Offline resilience is primitive-owned, not per-module
- 70 unit tests at 99%/95%/100% coverage validate the model layer

## Related

- [SF24-Export-Runtime.md](../../plans/shared-features/SF24-Export-Runtime.md) — Master plan
- [SF24-T09-Testing-and-Deployment.md](../../plans/shared-features/SF24-T09-Testing-and-Deployment.md) — Closure checklist
- [export-runtime-adoption-guide.md](../../how-to/developer/export-runtime-adoption-guide.md) — Adoption guide
- [api.md](../../reference/export-runtime/api.md) — API reference
