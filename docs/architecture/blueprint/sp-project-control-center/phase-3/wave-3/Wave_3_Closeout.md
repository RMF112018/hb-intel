# Phase 3 — Wave 3 Closeout

**Phase:** 3
**Wave:** 3 — PCC Backend Read-Model Foundation
**Status:** Complete (read-model foundation; no live operations)
**Date:** 2026-04-30
**Closeout commit base (HEAD short):** `a72e8ab43`
**Wave 3 implementation commits (chronological):**

```text
35a09af15  docs(pcc): open wave 3 backend read-model planning            (Prompt 01)
fde255244  docs(pcc): lock Wave 3 backend read-model source placement    (Prompt 02)
49b12d48d  feat(models-pcc): add pcc backend read-model contracts        (Prompt 03)
93cb13a1e  feat(functions-pcc): add mock pcc read-model provider         (Prompt 04)
511e9c6f2  feat(functions-pcc): add read-only pcc mock read-model routes (Prompt 05)
a72e8ab43  feat(spfx-project-control-center): add pcc read-model         (Prompt 06)
           client boundary
```

The unrelated Claude/config commit `a378ac353` is **not** part of the
Wave 3 implementation chain and is excluded from this closeout.

## Executive Summary

Wave 3 establishes the Project Control Center backend read-model
foundation as a controlled, fixture-driven, no-runtime, no-mutation
surface. Across Prompts 01–06 it locks scope and decisions, freezes the
backend route namespace and DTO placement, lands additive read-model
contracts in `@hbc/models/pcc`, scaffolds a mock backend read-model
provider, registers seven read-only `GET` routes in a scoped Functions
host, and introduces a dormant SPFx client boundary that no surface,
shell, or mount path consumes. The Wave 2 SPFx app remains
fixture-driven and visually identical; the SPFx production bundle is
byte-for-byte equivalent to Wave 2 baseline. No tenant call, Graph/PnP
runtime, Procore/Document Crunch/Adobe Sign runtime, scanner, repair
runner, approval execution, permission mutation, persistence write,
provisioning execution, package, manifest, lockfile, deployment, or
production rollout is introduced. Validation across `@hbc/models`,
`@hbc/functions`, and `@hbc/spfx-project-control-center` is green. The
PCC remains a controlled read-model foundation, not a live operational
release. The verbatim Wave 3 readiness statement appears once, as the
final paragraph of this document.

## Prompt-by-Prompt Closeout Index

Authoritative per-prompt records live alongside this file. This master
closeout cross-references rather than re-narrates them.

**Governance:**

- `Wave_3_Scope_Lock.md` — Prompt 01 scope lock (commit `35a09af15`)
- `Wave_3_Open_Decisions.md` — Wave 3 decision register; W3-OD-001 …
  W3-OD-018 (paired with Prompt 01; W3-OD-003 closed by Prompt 02)

**Per-prompt closeouts:**

| Prompt | Title | Closeout File | Commit |
| --- | --- | --- | --- |
| 01 | Open Wave 3 backend read-model planning (scope lock + decision register) | `Wave_3_Scope_Lock.md` (paired with `Wave_3_Open_Decisions.md`) | `35a09af15` |
| 02 | Lock Wave 3 backend route, DTO, and source placement (W3-OD-003) | `Wave_3_Backend_Route_and_DTO_Placement.md` | `fde255244` |
| 03 | PCC read-model contracts in `@hbc/models/pcc` | `Wave_3_Read_Model_Contracts_Closeout.md` | `49b12d48d` |
| 04 | Backend mock read-model provider | `Wave_3_Backend_Mock_Provider_Closeout.md` | `93cb13a1e` |
| 05 | Read-only backend route family in mock mode | `Wave_3_Read_Only_Routes_Closeout.md` | `511e9c6f2` |
| 06 | Dormant SPFx read-model client boundary | `Wave_3_SPFX_Client_Boundary_Closeout.md` | `a72e8ab43` |
| 07 | Wave 3 closeout, proof, and Wave 4 readiness | this document | (this commit) |

## Implemented Files

### `packages/models/src/pcc/` (Prompt 03)

- `PccReadModels.ts` — additive type-only read-model contracts, mode +
  source-status enums, registry, response map, nine read-model DTOs.
- `PccReadModels.test.ts` — type-shape and registry tests.
- `index.ts` — barrel exports appended (no removals).

No existing `@hbc/models/pcc` interface was renamed or removed; all
prior live contracts (`IProjectProfile`, `IPccMvpSurface`,
`IPriorityAction`, `IDocumentControlSource`, `ISiteHealthSummary`,
`IExternalSystemLink`, etc.) are reused in the read-model envelopes.

### `backend/functions/src/hosts/pcc-read-model/` (Prompts 04–05)

- `pcc-read-model-routes.ts` — seven `GET` route registrations under the
  scoped host.
- `pcc-read-model-routes.test.ts` — route-shape tests; asserts exactly
  seven routes, all `GET`, all wrapped in `withAuth`, no `POST` /
  `PUT` / `PATCH` / `DELETE` registrations.
- `pcc-read-model-route-guardrails.test.ts` — source-scan guard
  against forbidden imports and mutation tokens within the host.
- `read-models/pcc-read-model-provider.ts` — `IPccReadModelProvider`
  interface (nine read-only methods).
- `read-models/pcc-mock-read-model-provider.ts` —
  `PccMockReadModelProvider` returning fixture-shaped data sourced
  exclusively from `@hbc/models/pcc` constants.

### `backend/functions/src/services/__tests__/` (Prompt 04)

- `pcc-read-model-no-runtime.test.ts` — extended source scan asserting
  no MSGraph / Procore / Document Crunch / Adobe Sign client
  imports and no `executeRepair` / `permissionMutate` / `writeBack` /
  `mirror` execution tokens within the PCC read-model host.

### `apps/project-control-center/src/api/` (Prompt 06)

- `index.ts` — barrel: interface, factory, route metadata, mapping
  helper.
- `pccReadModelClient.ts` — `IPccReadModelClient` interface,
  `PccReadModelRouteId` IDs, route-path constants, namespace constant.
- `pccFixtureReadModelClient.ts` — `createPccFixtureReadModelClient`
  factory; default fixture envelopes; `simulateBackendUnavailable`
  test affordance for the `backend-unavailable` envelope path.
- `pccFixtureReadModelClient.test.ts` — fixture-mode + simulated
  backend-unavailable tests.
- `pccReadModelStateMapping.ts` — pure helper mapping
  `PccReadModelSourceStatus` → existing `PccPreviewStateKind` (eight
  W2-ODR-009 states).
- `pccReadModelStateMapping.test.ts` — mapping coverage.

### `apps/project-control-center/src/tests/` (Prompt 06)

- `pcc-api-dormancy.test.ts` — non-api/non-test source scan asserting
  zero references to `'src/api'`, `'./api'`, `'pccReadModelClient'`,
  `'createPccFixtureReadModelClient'`, or `'IPccReadModelClient'`.

## Route Namespace and Final Route List

**Route namespace (W3-OD-001, frozen for MVP):** `/api/pcc/projects/{projectId}/...`

**Backend host placement (W3-OD-003, frozen for MVP):** `backend/functions/src/hosts/pcc-read-model/`

**Final Wave 3 route list (all `GET`, all wrapped in `withAuth`):**

| # | Method | Path | Handler |
| --- | --- | --- | --- |
| 1 | GET | `pcc/projects/{projectId}/profile` | `getProjectProfile` |
| 2 | GET | `pcc/projects/{projectId}/modules` | `getModuleRegistry` |
| 3 | GET | `pcc/projects/{projectId}/home` | `getProjectHome` |
| 4 | GET | `pcc/projects/{projectId}/priority-actions` | `getPriorityActions` |
| 5 | GET | `pcc/projects/{projectId}/document-control` | `getDocumentControl` |
| 6 | GET | `pcc/projects/{projectId}/external-links` | `getExternalLinks` |
| 7 | GET | `pcc/projects/{projectId}/site-health` | `getSiteHealth` |

Response body shape: `{ data: PccReadModelEnvelope<T> }`. Unknown
project IDs return `sourceStatus: 'source-unavailable'` envelopes
sourced from fixtures rather than throwing or 404-ing through the
data-plane.

`team-access`, `approvals`, `readiness`, `responsibilities`,
`workflows`, `workflow-items`, and `settings` route surfaces remain
deferred per `Wave_3_Backend_Route_and_DTO_Placement.md`.

## Read-Model Contract Inventory

Defined in `packages/models/src/pcc/PccReadModels.ts`:

- **Envelope:** `PccReadModelEnvelope<T>` discriminated by `mode`
  (`'fixture' | 'mock' | 'local'`) and `sourceStatus` (seven values).
- **Mode constant set:** `PCC_READ_MODEL_MODES`.
- **Source-status constant set:** `PCC_READ_MODEL_SOURCE_STATUSES`
  (includes `source-unavailable` and `backend-unavailable`).
- **Registry:** `PccReadModelResponseMap` keyed by route ID
  (`profile`, `modules`, `home`, `priority-actions`,
  `document-control`, `external-links`, `site-health`).
- **Read-model DTOs (9):** `PccProjectProfileReadModel`,
  `PccWorkCenterRegistryReadModel`, `PccProjectHomeReadModel`,
  `PccPriorityActionsReadModel`, `PccDocumentControlReadModel`,
  `PccExternalLinksReadModel`, `PccSiteHealthReadModel`,
  `PccTeamAccessReadModel`, `PccSettingsReadModel`.
- **Array discipline:** `readonly T[]` only — no `ReadonlySet`. One
  registry record uses `Readonly<Record<PccMvpSurfaceId, IPccMvpSurface>>`.
- **No runtime additions:** type-only and `as const` enums; no service,
  client, transport, or fetch layer.

## Mock Provider Inventory

Defined in `backend/functions/src/hosts/pcc-read-model/read-models/`:

- **Interface:** `IPccReadModelProvider` — nine read-only methods
  matching the route table plus the deferred `getTeamAccess` and
  `getSettings` shapes.
- **Concrete:** `PccMockReadModelProvider` — returns
  `mode: 'mock'` envelopes assembled from `SAMPLE_PROJECT_PROFILES`,
  `PCC_MVP_SURFACES`, `SAMPLE_PRIORITY_ACTIONS`, document-control
  fixtures, external-system catalog fixtures, and site-health summary
  fixtures, all sourced from `@hbc/models/pcc`.
- **Unknown projectId:** returns `sourceStatus: 'source-unavailable'`
  with placeholder data; no throw, no 404.
- **No live calls:** no MSGraph, PnP, SharePoint REST, Procore, Document
  Crunch, Adobe Sign, Azure SDK, `node-fetch`, or `axios` import.
  Verified by `pcc-read-model-no-runtime.test.ts` and
  `pcc-read-model-route-guardrails.test.ts`.

## SPFx Client-Boundary Inventory

Defined in `apps/project-control-center/src/api/`:

- **Interface:** `IPccReadModelClient` — seven typed methods mirroring
  the backend route table.
- **Default factory:** `createPccFixtureReadModelClient(options?)` —
  fixture-mode client; `simulateBackendUnavailable: true` returns
  `backend-unavailable` envelopes for unit-test fallback paths.
- **Constants:** `PCC_READ_MODEL_NAMESPACE` (`'pcc'`),
  `PCC_READ_MODEL_ROUTE_IDS`, `PCC_READ_MODEL_ROUTE_PATHS` — inert
  string templates with no transport.
- **Mapping helper:** `mapPccSourceStatusToPreviewState()` — pure
  mapping into existing eight W2-ODR-009 preview states.
- **Dormancy:** no app entry point, mount, shell, surface, or layout
  file imports from `src/api/` or any of the named exports. Verified
  by `pcc-api-dormancy.test.ts`.

## Auth Posture

- **Backend routes:** wrapped in `withAuth` (request-id middleware via
  `extractOrGenerateRequestId`, shared response helpers). No new auth
  scheme is introduced; routes register with Azure Functions
  `authLevel: 'anonymous'` and enforce identity inside the `withAuth`
  middleware chain consistent with adjacent backend hosts.
- **SPFx client boundary:** dormant; imports no `@hbc/auth/spfx`,
  invokes no `bootstrapSpfxAuth`, performs no `resolveSpfxPermissions`,
  resolves no base URL, opens no HTTP, and reads no token. The
  fixture client is auth-free by construction.
- **Wave 3 net change to the SPFx auth runtime:** none.

## Default Data Mode

- **SPFx surfaces:** fixture-driven via direct `@hbc/models/pcc` imports
  (Wave 2 posture preserved). The default data mode for the PCC SPFx
  app is **NOT** backend (W3-OD-012 default `false`).
- **Backend route family:** `mock` mode; provider returns deterministic
  envelopes from `@hbc/models/pcc` fixtures.
- **No runtime cutover:** no surface, shell, mount, or layout file in
  Wave 3 reads through the new client boundary.

## Fixture Fallback

- **Backend (mock provider):** unknown `projectId` → envelope with
  `sourceStatus: 'source-unavailable'` and fallback fixture-shaped
  data. No throw, no 404 from the data plane.
- **SPFx (fixture client):** the default `createPccFixtureReadModelClient()`
  returns envelopes with `mode: 'fixture'` and a healthy
  source-status; `simulateBackendUnavailable: true` returns envelopes
  with `sourceStatus: 'backend-unavailable'` for unit-test coverage of
  the eight W2-ODR-009 preview/fallback states via
  `mapPccSourceStatusToPreviewState()`.
- **Surfaces:** continue to consume fixtures directly; no surface is
  rewired through the boundary in Wave 3.

## No-Mutation Guard Coverage

| Guard | Path | Asserts |
| --- | --- | --- |
| Backend route shape | `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts` | Exactly seven routes; all `GET`; all wrapped in `withAuth`; no `POST` / `PUT` / `PATCH` / `DELETE`. |
| Backend host source scan | `backend/functions/src/hosts/pcc-read-model/pcc-read-model-route-guardrails.test.ts` | No imports of PnP, MSGraph, Procore, Adobe, `node-fetch`, or `axios`; no mutation tokens (`provision`, `execute`, `repair`, `delete`, `mutate`, `approve`, `reject`) in executable code. |
| Backend extended source scan | `backend/functions/src/services/__tests__/pcc-read-model-no-runtime.test.ts` | Same import ban plus extended mutation token list (`MSGraphClient`, `ProcoreClient`, `DocumentCrunchClient`, `AdobeSignClient`, `executeRepair`, `permissionMutate`, `writeBack`, `mirror`). |
| SPFx dormancy | `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` | No non-api/non-test source file imports `'src/api'`, `'./api'`, `'pccReadModelClient'`, `'createPccFixtureReadModelClient'`, or `'IPccReadModelClient'`. |

All four guards pass at HEAD `a72e8ab43`.

## Validation Command Results

Captured in this Prompt 07 run at HEAD `a72e8ab43`, working tree
clean before and after. Commands ran in the order required by the
Wave 3 prompt and the per-prompt validation set (W3-OD-015).

| Step | Command | Result |
| --- | --- | --- |
| 1 | `git status --short` | **PASS** — clean working tree (baseline). |
| 2 | `md5 pnpm-lock.yaml` (pre) | `c56df7b79986896624536aab74d609f4` |
| 3 | `pnpm --filter @hbc/models check-types` | **PASS** — `tsc --noEmit`. |
| 4 | `pnpm --filter @hbc/models test` | **PASS** — `Test Files 31 passed (31)`, `Tests 224 passed (224)`. |
| 5 | `pnpm --filter @hbc/functions check-types` | **PASS** — `tsc --noEmit`. |
| 6 | `pnpm --filter @hbc/functions test` | **PASS** — `Test Files 138 passed (138)`, `Tests 2282 passed | 3 skipped (2285)`. |
| 7 | `pnpm --filter @hbc/functions build` | **PASS** — `tsc --project tsconfig.json` (no errors). |
| 8 | `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** — `tsc --noEmit`. |
| 9 | `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — `Test Files 19 passed (19)`, `Tests 203 passed (203)`. |
| 10 | `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — `dist/project-control-center-app.js` 222.13 kB (gzip 66.22 kB); `dist/spfx-project-control-center.css` 20.98 kB (gzip 3.82 kB). Identical to Wave 2 closeout baseline, confirming the dormant SPFx client boundary contributes nothing to the runtime bundle. |
| 11 | `md5 pnpm-lock.yaml` (post) | `c56df7b79986896624536aab74d609f4` (unchanged). |

**Hosted, tenant, and browser proof are OPERATOR-PENDING.** No
deployment, `.sppkg` packaging, app catalog upload, Graph/PnP tenant
operation, Procore API call, provisioning executor, or repair runner
was executed in Wave 3 or in this closeout. None is authorized.

## Package / Lockfile Status

Verified across Prompts 01–06:

- **`package.json`:** no edits; `@hbc/models` remains at `0.5.1`,
  `@hbc/functions` remains at `00.000.151`,
  `@hbc/spfx-project-control-center` remains at `0.0.1`.
- **`pnpm-lock.yaml`:** MD5 `c56df7b79986896624536aab74d609f4` identical
  pre- and post-Wave-3-validation. No new importer metadata was
  introduced; W3-OD-014 (`package.json` / lockfile churn) was never
  exercised because no new dependency was required.
- **SPFx manifests:** unchanged. No `.sppkg` was produced.
- **Workflow / deployment files:** unchanged. No CI/CD edit.

## Deferred Work

The following remain explicitly deferred. None is in scope for Wave 3,
and none is implied by this closeout:

- live Microsoft Graph-backed Document Control file operations;
- live SharePoint / OneDrive document-source discovery;
- Procore runtime (SDK, secrets, sync, mirror, write-back, REST);
- Document Crunch runtime;
- Adobe Sign runtime;
- Team & Access permission execution (group-membership writes,
  audience changes, access-manager actions);
- approval execution (decisions written through);
- Site Health automated scanner and repair runner;
- persistence / write models / write routes (`POST` / `PUT` / `PATCH` /
  `DELETE`);
- provisioning preview and apply execution;
- SPFx packaging and `.sppkg` deployment;
- app-catalog publication;
- hosted SharePoint parity proof;
- production rollout.

## Explicit Forbidden Claims (Non-Claims)

This closeout does **not** claim, and Wave 3 does **not** establish:

- a live backend data source exists;
- tenant calls were made or tested;
- Graph/PnP integration exists;
- Procore integration exists;
- Document Crunch integration exists;
- Adobe Sign integration exists;
- access requests execute;
- approvals execute;
- Site Health scans or repairs run;
- provisioning runs;
- the package was deployed;
- the app catalog was updated;
- production readiness exists.

Wave 3 is a controlled read-model foundation only.

## Wave 4 Readiness Recommendation

**Recommended Wave 4 scope:** *Project Home / Command Center backend
integration and read-model consumption hardening.*

Wave 4 should consume the read-model foundation behind safe seams,
without introducing tenant mutation or live operational behavior:

- introduce a feature-flagged SPFx HTTP client implementation behind
  the existing `IPccReadModelClient` interface, defaulting to the
  fixture client (W3-OD-012 default `false`);
- wire one or two SPFx surfaces (Project Home / priority actions
  recommended first) through the boundary behind that flag, preserving
  fixture fallback under the flag-off and `backend-unavailable` paths;
- extend `mapPccSourceStatusToPreviewState()` consumption so the eight
  W2-ODR-009 preview/fallback states are exercised against real
  envelopes;
- harden role-aware read-model shaping in the backend mock provider
  ahead of any future tenant-backed implementation;
- continue forbidding write routes, Graph/PnP runtime, Procore runtime,
  Document Crunch / Adobe Sign runtime, scanner/repair execution,
  approval execution, permission mutation, packaging, deployment, and
  app-catalog publication.

**Open decisions to settle in Wave 4 planning:**

- the W3-OD-012 feature-flag name, defaulting `false`, and the seam
  where it is read;
- which one or two SPFx surfaces to wire through the boundary first;
- whether the backend HTTP base-URL resolution lives in shared SPFx
  config or is injected by the app shell;
- whether to introduce an ADR for the scoped-host pattern (W3-OD-018
  remains deferred and is a reasonable Wave 4 entry artifact).

Wave 4 must not begin tenant mutation, workflow writes, packaging, or
deployment.

## Final Readiness Statement

Phase 3 Wave 3 is complete when PCC shared read-model contracts, mock
backend provider scaffolding, read-only backend route family, SPFx
client boundary, fixture fallback, validation proof, and no-mutation
guardrails are implemented and documented. The PCC remains a controlled
read-model foundation and is not a live operational release, tenant
execution surface, provisioning executor, Procore runtime, or
production-ready rollout.
