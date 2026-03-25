# P1-F1-T01: Operating Model, Scope, and Locked Positions

## 1. Purpose

The native integration backbone is a governed HB Intel program for bringing selected external systems into the HB Intel data plane through consistent custody, normalization, reconciliation, publication, and operator controls.

It is not:

- a generic "connector backlog,"
- a permission to bypass current package boundaries,
- a license to expose raw external-system contracts directly to feature packages,
- or proof that the Azure-first target state has already been implemented.

## 2. Scope

### In scope

- governance for multi-wave native integrations,
- transitional custody model,
- raw to published read-model architecture,
- identity, mapping, replay, reconciliation, and audit posture,
- security and tenancy expectations,
- batch and webhook orchestration model,
- operator-facing operations and recovery model,
- downstream consumer boundary,
- Wave 1, Wave 2, and Wave 3 program structure.

### Out of scope in this family

- connector-specific endpoint maps,
- runtime code changes,
- direct feature-package implementation details,
- full downstream doc rewrites for Phase 1 and Phase 3,
- authoring `P1-F2` through `P1-F19`.

## 3. Connector Runtime vs Published Read-Model Consumption

Connector runtime means:

- source acquisition,
- raw payload custody,
- normalization,
- mapping,
- replay,
- reconciliation,
- audit,
- publication into governed read models.

Published read-model consumption means:

- queries through governed repositories or read-model services,
- query-hooks and feature-layer consumption of already-published HB Intel views,
- project or work-hub modules using published data without owning connector execution.

Connector runtime belongs in backend and data-access seams. Published read-model consumption belongs in governed downstream consumers.

## 4. Relationship to Current Repo Truth

This family adopts the completed audit as its execution basis. That means:

- current backend domain services are already materially Azure Table-backed,
- SharePoint is currently real for provisioning and selected operational surfaces,
- proxy/data-access seams exist but are not fully reconciled,
- PWA source assembly still contains mock domain query seams,
- the target Azure-first custody posture must be treated as a transition target, not as already complete.

## 5. Locked Positions

The following positions are binding for all future connector-family planning:

1. Transitional hybrid custody is retained during implementation transition.
2. Azure owns raw, normalized, replay, reconciliation, audit, and canonical mapping layers.
3. SharePoint may remain a transitional host for selected published operational read models.
4. `v1` is read-only and ingest-first.
5. Batch-led sync is the default, with event/webhook assist where official sources support it.
6. HB Intel uses a thin canonical core over source-aligned normalization.
7. Downstream consumers use published read models or governed repositories only.
8. Wave 1 expansion packs remain preserved.

## 6. Anti-Goals

This family explicitly prohibits:

- direct feature-package connector logic,
- direct connector calls from PWA source modules,
- memory-based route planning,
- broad universal schemas that erase useful source-specific semantics,
- language that claims the Azure-first target is already live in current repo truth.
