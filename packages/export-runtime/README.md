# @hbc/export-runtime

Shared export runtime primitive for HB Intel. Provides export lifecycle orchestration, render pipeline contracts, receipt state management, artifact provenance stamping, offline replay, and module adapter seams for all Phase 3 modules.

## Overview

`@hbc/export-runtime` is the Tier-1 shared package that owns the export lifecycle, render pipeline, receipt state, offline behavior, AI actions, BIC orchestration, and telemetry across all HB Intel modules (L-01). Individual feature modules create lightweight adapters over this primitive rather than building bespoke CSV/XLSX/PDF pipelines. Layer 8 shared-feature primitive.

## Adapter-over-Primitive Boundary Rules

- **Adapters consume primitive public exports only** — no internal imports.
- **Module-specific payload composition remains adapter-owned** — adapters map domain data to export contracts (projection-only).
- **Runtime and orchestration ownership stays in `@hbc/export-runtime`** — export lifecycle state machines, receipt management, confidence computation, retry logic, and render pipeline coordination.
- **Reusable visual primitives belong in `@hbc/ui-kit`** per CLAUDE.md UI Ownership Rule. Local components in this package must remain thin composition shells over runtime state and `@hbc/ui-kit` building blocks.

## Export Truth Vocabulary

SF24 distinguishes seven export patterns. Users must be able to tell exactly what record/view/version an artifact represents.

| Pattern | Description |
|---|---|
| `working-data` | CSV/XLSX for working analysis with row/column truth |
| `current-view` | Export of current filters, sort order, visible columns, selected rows |
| `record-snapshot` | Point-in-time immutable record with provenance emphasis |
| `presentation` | PDF/print output intended for circulation or meeting review |
| `composite-report` | Section-based narrative/report assembly with expert composition |
| `offline-queued` | Request created locally with deferred remote completion |
| `server-render` | Heavier render path delegated to server with same truth/receipt contract |

Every export artifact carries an `IExportSourceTruthStamp` identifying the module, project, record, snapshot time, snapshot type, applied filters, sort, and visible columns.

## Receipt/Progress/Replay Model

Seven receipt states with user-facing explainability:

| Status | User-Facing Meaning |
|---|---|
| `saved-locally` | Export saved to device, not yet synced |
| `queued-to-sync` | Waiting for network to upload/complete |
| `rendering` | Export is being generated |
| `complete` | Export finished successfully |
| `failed` | Export failed (see failure diagnostics) |
| `degraded` | Export completed but with reduced truth confidence |
| `restored-receipt` | Receipt recovered from offline cache — review recommended |

**Artifact confidence levels:** `trusted-synced`, `queued-local-only`, `completed-with-degraded-truth`, `failed-or-partial`, `restored-needs-review`.

**Offline resilience (L-04):** Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync replay + optimistic statuses.

## Top Recommended Export and Review/Handoff Semantics

- **Next recommended action** derives the most useful next step (download, review, approve, circulate, publish, retry, re-export) with a user-facing reason.
- **Review steps** are blocking or non-blocking with owner attribution and reassignment history (L-02).
- **BIC ownership** creates granular post-export handoff with avatar projection in export surfaces + My Work.
- **My Work / Canvas visibility** via `@hbc/project-canvas` integration (L-06).

## Renderer/Composer/Template Export Table

| Directory | Responsibility | Implementation Task |
|---|---|---|
| `src/renderers/` | Format-specific render pipeline (CSV, XLSX, PDF, Print) | SF24-T03 |
| `src/composers/` | Section assembly and composite report orchestration (Expert tier) | SF24-T05 |
| `src/templates/` | Branded PDF layouts, print templates, report templates | SF24-T05/T06 |
| `src/model/` | Lifecycle state derivation, confidence computation | SF24-T03 |
| `src/api/` | Storage persistence, sync orchestration | SF24-T03 |
| `src/hooks/` | Export orchestration React hooks | SF24-T04 |
| `src/components/` | Thin composition shells over `@hbc/ui-kit` | SF24-T05/T06 |

## Testing

```typescript
import { /* test factories */ } from '@hbc/export-runtime/testing';
```

Test factories and mock adapters are exported from the `/testing` subpath, excluded from production bundles. Coverage threshold: 95/95/95/95.

## Related

- [SF24 Master Plan](../../docs/architecture/plans/shared-features/SF24-Export-Runtime.md)
- [SF24-T09 — Testing and Deployment](../../docs/architecture/plans/shared-features/SF24-T09-Testing-and-Deployment.md)
- ADR-0114 (export-runtime architecture decision)
- Companion `@hbc/export-runtime` primitive ADR
