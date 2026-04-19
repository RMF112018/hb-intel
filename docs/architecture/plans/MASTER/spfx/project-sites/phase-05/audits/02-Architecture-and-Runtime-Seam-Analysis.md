# Architecture and Runtime Seam Analysis

## Scope

This seam analysis is limited to the backend runtime and operational seams required for the legacy fallback lane to work correctly.

## High-level runtime map

### Shared default host

`backend/functions/src/index.ts` is the default Functions v4 composition root currently targeted by the shared package manifest and packaging script.

It imports:

- provisioning saga,
- proxy,
- timerFullSpec,
- signalR,
- project requests,
- acknowledgments,
- notifications,
- legacy fallback discovery,
- health,
- cleanup timer,
- and many domain CRUD routes.

This host is broad by design.

### Legacy fallback discovery registration lane

`backend/functions/src/functions/legacyFallbackDiscovery/index.ts` registers:

- `legacyFallbackDiscoveryRun` — `POST /api/admin/legacy-fallback/discovery/run`
- `legacyFallbackDiscoveryTimer` — timer trigger

That file builds the discovery runtime graph from:

- `LegacyFallbackDiscoveryGraphClient`
- `LegacyFallbackDiscoveryRepository`
- `LegacyFallbackMatchingEngine`
- `LegacyFallbackProjectIndexProvider`
- `LegacyFallbackDiscoveryService`

### Legacy fallback review/admin registration lane

`backend/functions/src/functions/adminApi/legacy-fallback-routes.ts` registers:

- review queue list/read routes,
- manual bind / ignore / disable routes,
- revalidate route.

These routes are imported by `backend/functions/src/functions/adminApi/index.ts`, which in turn is imported by the dedicated `backend/functions/src/hosts/admin-control-plane/index.ts` host.

## Material seam groups

### Seam group A — Function host composition

This is the seam between:

- what routes the repo implements,
- what routes the selected entrypoint actually imports,
- and what routes the artifact will really register after deploy.

**Current issue:** the default shared entrypoint and the dedicated admin-control-plane entrypoint express different route-registration surfaces for the legacy fallback lane.

### Seam group B — HTTP authz and operator access

Discovery and review routes depend on:

- `withAuth`,
- delegated scope checks,
- admin-role checks,
- request-id extraction,
- telemetry wrappers.

This seam is structurally present and reasonably clear.

**Current issue:** closure evidence is stronger for discovery registration than for the review/admin route surface.

### Seam group C — SharePoint persistence boundary

The first hosted durable write occurs in `LegacyFallbackDiscoveryRepository.startSyncRun()`.

That boundary depends on:

- `DefaultAzureCredential`,
- SharePoint token acquisition for `<tenant-origin>/.default`,
- PnP `spfi()` usage with injected bearer token,
- existence and correct schema of the `Legacy Project Fallback Sync Runs` list.

**Current issue:** this is still the first unclosed durable runtime seam.

### Seam group D — Project index load and matching input quality

The discovery flow loads the project index before enumerating folders and then feeds that index into the matching engine.

This means match quality depends directly on the `LegacyFallbackProjectIndexProvider` being correct.

**Current issue:** the provider resolves field names dynamically but then reads hard-coded `field_2` / `field_3` values. That breaks the stated abstraction boundary.

### Seam group E — Source resolution and Graph enumeration

The discovery graph client resolves:

- site,
- drive,
- root folders.

It includes retry logic for transient Graph failures.

**Current issue:** the graph client seam is reasonably bounded; the more material risk now is not enumeration logic itself but whether the hosted run ever reaches and persists beyond it.

### Seam group F — Sync-run and registry schema contracts

The service computes and returns richer summary data than the structured model/list schema fully exposes.

**Current issue:** operations will over-rely on `SummaryJson` unless the sync-run contract is hardened.

### Seam group G — Hosting model and deployment pipeline

The repo currently spreads hosting truth across:

- `infra/legacy-fallback-hosting.bicep`,
- staging/prod parameter files,
- `scripts/provision-legacy-fallback-hosting.ts`,
- `scripts/package-functions-artifact.ts`,
- `.github/workflows/deploy-functions.yml`,
- and the administrator runbooks.

**Current issue:** these artifacts do not yet tell one coherent story about the actual hosting model and approved deployment method.

## Root-cause map

| Symptom | Closest root cause |
|---|---|
| Deployed legacy fallback surface is hard to reason about | Broad shared default host and unresolved host-selection doctrine |
| Review/admin routes may not align with deployed default entrypoint | Route registration is split across default and dedicated host surfaces |
| Hosted run can stall at first durable boundary | SharePoint list write/auth/config seam still unclosed |
| Matching can be wrong even if run succeeds | Project index provider breaks the canonical field-resolution contract |
| Operators can deploy the wrong way | Hosting IaC, workflow, and runbooks are not fully reconciled |
| Operational metrics are harder to query than they should be | Sync-run schema under-models service-level counters |

## Correct target architecture for this objective

The target state does **not** require a repo-wide backend rewrite.

It does require one explicit answer to each of these questions:

1. Which host entrypoint is authoritative for the legacy fallback lane?
2. Which legacy fallback routes must register from that host?
3. Which runtime packages are truly required by that host?
4. Which deployment method is approved for the real hosting model?
5. Which SharePoint writes must succeed before closure can be claimed?
6. Which sync-run fields must be persisted as first-class operational state?

The current repo only answers those questions partially and in multiple places.
