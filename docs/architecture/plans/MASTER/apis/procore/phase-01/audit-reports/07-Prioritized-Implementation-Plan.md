# 07 – Prioritized Implementation Plan

## Priority 1 — Establish the Procore connection control plane
- **Gap(s):** G-01, G-02, G-12
- **Direction:** Extend existing admin connection routes and registry service to support Procore connector records, Key Vault secret references, company/install scope, and connection tests.
- **Impact:** Creates the minimum governed footing for all later work.
- **Cross-layer effects:** admin APIs, backend services, storage, config, Key Vault
- **Timing:** Now
- **Nature:** Structural extension

## Priority 2 — Add raw custody, checkpoints, and replay
- **Gap(s):** G-03, G-09
- **Direction:** Add raw landing storage, extraction-run tables, page checkpoints, dead-letter records, and replay hooks.
- **Impact:** Makes the connector resilient and supportable before large subject-area rollout.
- **Cross-layer effects:** backend services, Blob storage, tables, admin observability
- **Timing:** Now
- **Nature:** Structural extension

## Priority 3 — Introduce canonical relational storage
- **Gap(s):** G-04
- **Direction:** Add Azure SQL schema families for masters, financial core, project-management core, bridges, snapshots, and publication tables.
- **Impact:** Unlocks the package’s model and prevents SharePoint misuse.
- **Cross-layer effects:** backend services, migrations, publication services, reporting
- **Timing:** Now
- **Nature:** Structural extension

## Priority 4 — Define first published read models
- **Gap(s):** G-05, G-10
- **Direction:** Create backend publication services and shared read-model contracts for:
  - project health snapshot
  - cost/change summary
  - open-item summary
  - project team/vendor summaries
- **Impact:** Establishes the consumer-safe boundary for HB Intel surfaces.
- **Cross-layer effects:** backend, packages/models, data-access, query-hooks, frontend consumers
- **Timing:** Now
- **Nature:** Structural extension + refinement

## Priority 5 — Implement durable project registry and project crosswalks
- **Gap(s):** G-06
- **Direction:** Replace mock registry with durable identity/crosswalk service and bind Procore project ids to HB Intel project context.
- **Impact:** Required for reliable project drilldown and project-surface adoption.
- **Cross-layer effects:** backend, shared models, data-access, shell/project context
- **Timing:** Now
- **Nature:** Structural extension

## Priority 6 — Reconcile proxy/runtime consumption seams
- **Gap(s):** G-07, G-08, G-11
- **Direction:** Wire proxy context in PWA startup, reconcile route contracts, and swap mock source assembly behavior for repository-backed publications.
- **Impact:** Moves consumer surfaces from mock to governed real data.
- **Cross-layer effects:** PWA startup, auth bootstrap, data-access, query-hooks, consumer modules
- **Timing:** After first publication endpoints exist
- **Nature:** Refinement

## Priority 7 — First-wave subject-area ingestion
- **Gap(s):** G-02, G-03, G-04, G-05
- **Direction:** Implement foundation masters, financial core, and project-management core ingestion and publications.
- **Impact:** Delivers the first meaningful executive/project intelligence value.
- **Cross-layer effects:** backend, SQL, Blob, admin, frontend
- **Timing:** After priorities 1–4 begin landing
- **Nature:** Structural extension

## Priority 8 — SharePoint materializations and project surfaces
- **Gap(s):** G-10
- **Direction:** Materialize only narrow current-state summaries into SharePoint and/or project-facing SPFx surfaces.
- **Impact:** Delivers collaborative UX without turning SharePoint into the custody plane.
- **Cross-layer effects:** SharePoint, SPFx, backend publication APIs
- **Timing:** After first-wave publications are stable
- **Nature:** Refinement + targeted extension

## Priority 9 — Expand to recommended practical model
- **Gap(s):** future scope expansion
- **Direction:** Add inspections, daily-log headers/segments, document metadata, workflows, and labor/productivity subject areas.
- **Impact:** Moves HB Intel from portfolio health into true project-control intelligence.
- **Timing:** Later wave
- **Nature:** Incremental extension
