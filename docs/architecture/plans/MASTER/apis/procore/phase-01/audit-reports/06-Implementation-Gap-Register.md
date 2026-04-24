# 06 – Implementation Gap Register

## G-01 — No durable Procore connection registry
- **Type:** Structural extension
- **Why it matters:** Without durable connector records, Procore credentials, company scope, health, and policy state cannot be governed.
- **Current seam:** `backend/functions/src/functions/adminApi/connection-routes.ts`, `backend/functions/src/services/connection-registry-service.ts`
- **Required fix:** Replace in-memory registry with durable storage and Key Vault secret references.

## G-02 — No Procore token broker / connector runtime
- **Type:** Structural extension
- **Why it matters:** There is no repo-owned Procore OAuth/token acquisition or REST client layer yet.
- **Required fix:** Add a Procore connector service family under `backend/functions/src/services/` with resilient token acquisition, pagination, retries, throttling awareness, and subject-area clients.

## G-03 — No raw landing / replay layer
- **Type:** Structural extension
- **Why it matters:** Without replayable raw custody, failures, version drift, and partial reruns become operationally brittle.
- **Required fix:** Add Blob-backed raw payload custody plus run and page checkpoints.

## G-04 — No canonical relational store
- **Type:** Structural extension
- **Why it matters:** The Procore package cannot be credibly implemented in SharePoint lists or Azure Tables alone.
- **Required fix:** Add Azure SQL (or approved equivalent) for canonical dimensions/facts/bridges/publications.

## G-05 — No governed publication model for Procore read models
- **Type:** Refinement + extension
- **Why it matters:** Consumers need stable published read models, not direct connector tables.
- **Required fix:** Define publication contracts in models/data-access/query-hooks and backend publication services.

## G-06 — Project registry still mock-only
- **Type:** Structural extension
- **Why it matters:** Cross-source project identity resolution is fundamental to mapping Procore project ids into HB Intel surfaces.
- **Current seam:** `packages/data-access/src/factory.ts`
- **Required fix:** Implement durable project registry and project crosswalk storage.

## G-07 — Proxy startup wiring incomplete
- **Type:** Refinement
- **Why it matters:** Even after publication APIs exist, PWA consumers cannot safely use proxy-backed repositories without startup context wiring.
- **Current seam:** `packages/data-access/src/factory.ts`, `apps/pwa/src/main.tsx`
- **Required fix:** Wire `setProxyContext()` and reconcile auth token acquisition/base URL configuration.

## G-08 — Source assembly still mock-driven
- **Type:** Refinement
- **Why it matters:** Consumer surfaces are still partially mocked, which blocks adoption of real Procore-backed publications.
- **Current seam:** `apps/pwa/src/sources/sourceAssembly.ts`
- **Required fix:** Replace mock query functions with repository-backed read-model providers.

## G-09 — No Procore-specific observability ledger
- **Type:** Refinement + extension
- **Why it matters:** Production sync needs run health, rate-limit visibility, dead-letter, replay, and publication status.
- **Required fix:** Add run ledger, checkpoint telemetry, subject-area freshness, publication lag, and admin diagnostics.

## G-10 — No rollout-safe Procore materialization strategy
- **Type:** Design/implementation gap
- **Why it matters:** Without a locked publication strategy, teams will default toward oversized SharePoint lists or direct-table coupling.
- **Required fix:** Implement curated SharePoint materializations only after external canonical model and publication APIs exist.

## G-11 — Route/repository parity remains incomplete
- **Type:** Refinement
- **Why it matters:** Existing proxy-mode mismatches will become more painful as new connector-backed data enters the app.
- **Required fix:** Reconcile backend API inventory with repository expectations as part of publication rollout.

## G-12 — No Procore install / company-scope governance
- **Type:** Structural extension
- **Why it matters:** Enterprise sync requires per-company installation and verified DMSA permissions in Procore.
- **Required fix:** Add explicit company/install scope metadata and connection test workflows.
