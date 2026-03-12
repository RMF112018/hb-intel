# SF24 - Export Runtime (`@hbc/features-*` adapters over `@hbc/export-runtime`)

**Plan Version:** 1.0
**Date:** 2026-03-12
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Priority Tier:** 2 - Application Layer (shared package; cross-module output infrastructure)
**Estimated Effort:** 4-5 sprint-weeks
**ADR Required:** `docs/architecture/adr/0108-export-runtime.md` + companion `@hbc/export-runtime` ADR

> **Doc Classification:** Canonical Normative Plan - SF24 implementation master plan for Export Runtime; governs SF24-T01 through SF24-T09.

---

## Purpose

SF24 defines a shared export and rendering runtime as module adapters over Tier-1 `@hbc/export-runtime`, standardizing CSV/XLSX/PDF/Print output, branding, artifact naming, provenance stamping, handoff ownership, offline replay, and telemetry across platform modules.
Industry baseline framing: enterprise suites offer export and report features, but SF24 remains differentiated by governed context-stamped artifacts, immutable provenance, and first-class offline queue continuity.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Export lifecycle, render pipeline, receipt state, offline behavior, AI actions, BIC orchestration, and telemetry are owned by Tier-1 `@hbc/export-runtime` |
| L-02 | BIC ownership | Review/approval and post-export handoff steps create granular BIC ownership with avatar projection in `ExportActionMenu` + My Work |
| L-03 | Complexity behavior | Essential CSV/XLSX button; Standard full menu + branded PDF/Print; Expert report composition + full receipt card + configure link |
| L-04 | Offline resilience | Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync replay + optimistic statuses |
| L-05 | AI embedding | Inline AI actions/placeholders only in menu/composition/receipt surfaces; source citation + explicit approval required |
| L-06 | Deep-linking/provenance/telemetry | Deep-links via `@hbc/related-items`, My Work via `@hbc/project-canvas`, immutable provenance/snapshot via `@hbc/versioned-record`, five UX KPIs |

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

---

## Definition of Done

- [ ] SF24 is documented as module adapters over `@hbc/export-runtime`
- [ ] all L-01 through L-06 decisions are represented in plan-family documents
- [ ] BIC ownership and avatar projection contracts are documented for export review/handoff steps
- [ ] complexity behavior is explicit for Essential/Standard/Expert
- [ ] offline queue/replay model with `Saved locally` and `Queued to sync` is documented
- [ ] inline AI citation/approval constraints are documented with no sidecar behavior
- [ ] deep-link, canvas, provenance, and snapshot freeze contracts are documented
- [ ] five SF24 telemetry KPIs are documented in primitive contracts and adapter projection rules
- [ ] SF24-T09 includes SF11-grade closure and PH7 governance checks
- [ ] `current-state-map.md` update requirements include SF24 and ADR-0108 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF24-T01-Package-Scaffold.md` | primitive + adapter scaffolds and README requirements |
| `SF24-T02-TypeScript-Contracts.md` | canonical primitive contracts + adapter projections |
| `SF24-T03-Export-Lifecycle-and-Storage.md` | export lifecycle states, persistence, offline replay, context stamping |
| `SF24-T04-Hooks-and-State-Model.md` | primitive hooks + adapter orchestration contracts |
| `SF24-T05-ExportActionMenu-and-ExportFormatPicker.md` | entry menu and format picker UX contracts |
| `SF24-T06-ExportProgressToast-and-ExportReceiptCard.md` | progress/receipt behavior and traceability projections |
| `SF24-T07-Reference-Integrations.md` | Tier-1 integration boundaries |
| `SF24-T08-Testing-Strategy.md` | fixtures, scenario matrix, quality gates |
| `SF24-T09-Testing-and-Deployment.md` | closure checklist + ADR/docs/index/state-map updates |
