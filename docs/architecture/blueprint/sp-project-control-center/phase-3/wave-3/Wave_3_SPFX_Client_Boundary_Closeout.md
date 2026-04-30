# Wave 3 — SPFx Read-Model Client Boundary Closeout (Prompt 06)

**Status.** Complete (operator-pending hosted/tenant proof — none required for this prompt; no manifest, app-catalog, deploy, or live runtime work was performed).

**Baseline.** `main` at `511e9c6f29aef5d891766a0d49d424b4fbe20c00`.

**Package.** `@hbc/spfx-project-control-center@0.0.1` — version unchanged.

## Objective

Introduce a typed SPFx-side read-model client boundary so a future
prompt can consume the seven Wave 3 backend GET routes without
silently cutting the PCC app over to live runtime mode. The boundary
is dormant in this prompt: surfaces remain fixture-driven via direct
`@hbc/models/pcc` imports.

## Files Changed

```text
apps/project-control-center/src/api/pccReadModelClient.ts                   (new)
apps/project-control-center/src/api/pccFixtureReadModelClient.ts            (new)
apps/project-control-center/src/api/pccReadModelStateMapping.ts             (new)
apps/project-control-center/src/api/index.ts                                (new)
apps/project-control-center/src/api/pccReadModelClient.test.ts              (new)
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts       (new)
apps/project-control-center/src/api/pccReadModelStateMapping.test.ts        (new)
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts              (new)
apps/project-control-center/README.md                                       (modified — file tree + Wave 3 dormant-boundary section)
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_SPFX_Client_Boundary_Closeout.md  (new — this file)
```

`packages/models/**`, `backend/functions/**`, `package.json`,
`pnpm-lock.yaml`, manifests, workflows, deploy artifacts, and package
version metadata are **not** modified.

## Client Boundary Structure

| Module | Role |
| --- | --- |
| `pccReadModelClient.ts` | Exports `IPccReadModelClient` interface (7 typed `get*` methods), `PCC_READ_MODEL_NAMESPACE`, `PCC_READ_MODEL_ROUTE_IDS`, `PCC_READ_MODEL_ROUTE_PATHS`, and the `PccReadModelRouteId` literal union. Static route-path templates only — no base URL resolution, no HTTP execution, no parsing, no auth. |
| `pccFixtureReadModelClient.ts` | `createPccFixtureReadModelClient(options?)` factory. Default: returns `mode: 'fixture'`, `sourceStatus: 'available'`, `readOnly: true` envelopes assembled from existing `@hbc/models/pcc` fixtures. With `simulateBackendUnavailable: true`: returns `sourceStatus: 'backend-unavailable'` envelopes for every method (with a single `code: 'backend-unavailable'` warning) so consumers can unit-test the fallback path without an HTTP client. `now` is injectable for deterministic timestamps. |
| `pccReadModelStateMapping.ts` | Pure helper `mapPccSourceStatusToPreviewState(status)` mapping every `PccReadModelSourceStatus` to one of the existing eight `PccPreviewStateKind` values from `src/ui/PccPreviewState.tsx`. Not consumed by any surface. |
| `index.ts` | Barrel exporting the interface, route metadata, factory, and mapping helper. |

The interface mirrors the seven backend GET routes registered by
`backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`:
`profile`, `modules`, `home`, `priority-actions`, `document-control`,
`external-links`, `site-health`. The backend provider methods for
`team-access` and `settings` exist but have no HTTP routes yet, so
the client boundary intentionally does not expose them.

## Default Data Mode Confirmation

The PCC SPFx app remains **fixture-driven by default**. No surface,
shell file, mount file, app entry point, or test-setup file imports
from `src/api/`. Surfaces continue to consume `SAMPLE_*` constants
from `@hbc/models/pcc` directly. There is no runtime mode flag, no
mount-time client injection, no context provider wiring, and no
default backend cutover.

## Explicit No Surface / Mount / App Rewiring Confirmation

- `apps/project-control-center/src/PccApp.tsx` — **not modified**.
- `apps/project-control-center/src/mount.tsx` — **not modified**.
- `apps/project-control-center/src/shell/**` — **not modified**.
- `apps/project-control-center/src/surfaces/**` — **not modified**.
- `apps/project-control-center/src/state/**` — **not modified**.
- `apps/project-control-center/src/preview/**` — **not modified**.
- `apps/project-control-center/src/preview.tsx` — **not modified**.

The dormancy is enforced by `tests/pcc-api-dormancy.test.ts`, which
scans every non-api, non-test source file under
`apps/project-control-center/src/**` and asserts no occurrence of
`src/api`, `./api`, `../api`, `pccReadModelClient`,
`pccFixtureReadModelClient`, `createPccFixtureReadModelClient`, or
`IPccReadModelClient`.

## Fixture Fallback Confirmation

All seven `IPccReadModelClient` methods, when invoked with
`simulateBackendUnavailable: true`, return
`sourceStatus: 'backend-unavailable'` envelopes with type-valid
placeholder `data` shapes and a single
`code: 'backend-unavailable'` warning. For unknown project ids
(default mode), the fixture client returns
`sourceStatus: 'source-unavailable'`. These behaviors mirror the
backend mock provider conventions and are unit-tested in
`pccFixtureReadModelClient.test.ts`.

The state-mapping helper assigns the existing eight `PccPreviewStateKind`
values to the seven `PccReadModelSourceStatus` values:

| `sourceStatus` | `PccPreviewStateKind` |
| --- | --- |
| `available` | `preview` |
| `backend-unavailable` | `error` |
| `source-unavailable` | `unavailable-fixture` |
| `missing-config` | `missing-config` |
| `stale` | `preview` |
| `unauthorized` | `unauthorized-persona` |
| `forbidden` | `unauthorized-persona` |

## viewerPersona Decision

The boundary's `viewerPersona?: PccPersona` parameter is **passthrough
only**. The fixture client copies it onto the returned envelope when
provided and omits it when not provided. The boundary does not:

- derive persona from SPFx context, auth, or any runtime source;
- compute capabilities;
- gate UI rendering;
- alter envelope contents based on persona.

No mount-time persona threading is introduced. The existing
`PccTeamAccessSurface` `previewPersona?` prop pattern is unchanged.
A future prompt may wire persona derivation; that work is out of
scope here.

## Response-Shape Reference

Wave 3 backend routes produce HTTP bodies of shape
`{ data: PccReadModelEnvelope<T> }` — the envelope is at
`jsonBody.data` and the read-model `T` is at `envelope.data`. The
envelope shape is documented in
`packages/models/src/pcc/PccReadModels.ts`.

This prompt did **not** add a backend HTTP client. No `fetch`,
`XMLHttpRequest`, `@hbc/auth`, `bootstrapSpfxAuth`, Graph/PnP/SharePoint
REST, Procore, Document Crunch, Adobe Sign, SPFx auth token
acquisition, runtime mode flag, surface rewiring, or mount-time
injection was introduced. A future prompt that wires HTTP must do so
explicitly behind `IPccReadModelClient`, must keep fixtures as the
default, and must handle the envelope unwrap (`jsonBody.data` →
`PccReadModelEnvelope<T>`).

## Import Guard / No-Runtime Validation

`apps/project-control-center/src/tests/pcc-import-guards.test.ts`
continues to scan `apps/project-control-center/src/**` (excluding
`tests/`) in two modes — module-specifier extraction and
fully-stripped executable-seam scanning — across the existing
forbidden lists (`@pnp/`, `@microsoft/microsoft-graph-client`,
`@microsoft/sp-http`, Procore SDKs, `/backend/`, `paired-row`,
`fetch(`, `XMLHttpRequest`, `localStorage`, `sessionStorage`,
`window.open`, `tenant.`, `MSGraphClient`, `GraphServiceClient`, etc.).

All new files in `src/api/` cleared both scans. The new
`tests/pcc-api-dormancy.test.ts` adds a dedicated assertion that the
api boundary is not imported from any non-api, non-test source file.

## Validation Results

| Command | Result |
| --- | --- |
| `git status --short` (pre) | clean working tree on `511e9c6f2` |
| `pnpm --filter @hbc/models check-types` | **PASS** (confirmation-only — models not modified) |
| `pnpm --filter @hbc/models test` | **PASS** — 31 files, 224 tests |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** |
| `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — 19 files (was 15), 203 tests (was 173); +30 tests across `pccReadModelClient.test.ts`, `pccFixtureReadModelClient.test.ts`, `pccReadModelStateMapping.test.ts`, `pcc-api-dormancy.test.ts` |
| `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — `dist/project-control-center-app.js` 222.13 kB · gzip 66.22 kB; `dist/spfx-project-control-center.css` 20.98 kB · gzip 3.82 kB. **Bundle size identical to the Wave 2 / Prompt 09 baseline**, confirming the dormant boundary is tree-shaken because no entry point imports it. |
| `pnpm --filter @hbc/functions check-types` | **PASS** (confirmation-only — backend not modified) |
| `pnpm --filter @hbc/functions test` | **PASS** — 138 files, 2282 tests passed (3 skipped) |

## Pre/Post Lockfile Checksum

```text
md5 pnpm-lock.yaml (pre-validation)  : c56df7b79986896624536aab74d609f4
md5 pnpm-lock.yaml (post-validation) : c56df7b79986896624536aab74d609f4
```

No drift. No new dependencies were added.

## Manifest / Version

Manifest version **not bumped**. The package version remains
`0.0.1`. This is consistent with the Wave 3 scope lock: additive
internal seam, no host or manifest contract change, no runtime
behavior change, no consumer-visible export of new behavior at the
app entry point. No `.sppkg` is generated, no app catalog work is
performed.

## Hosted / Tenant Proof

**OPERATOR-PENDING** — not applicable to this prompt. No hosted,
tenant, browser, app catalog, or deployed-artifact validation was
performed because none was required: no manifest change, no live
runtime, no user-visible UI change, no behavioral change in any
existing surface. Package truth is verified locally; runtime truth
is unchanged from Wave 2.

## Recommended Next Prompt

A future prompt that wires the backend HTTP client should:

1. Introduce a separate `pccBackendReadModelClient.ts` under `src/api/`
   that implements `IPccReadModelClient` against the seven static
   route-path templates already exported.
2. Keep the fixture client as the default. Adopt an explicit,
   opt-in mode flag (mount-time configuration) — never a silent
   default cutover.
3. Add a narrow, reviewed exception to
   `pcc-import-guards.test.ts` so the backend client may use `fetch(`
   inside `src/api/pccBackendReadModelClient.ts` only, while keeping
   the seam absent everywhere else.
4. Update `pcc-api-dormancy.test.ts` in the same change to permit the
   reviewed mount-time wiring path, scoped to the specific files
   authorized by that prompt.
5. Decide explicitly whether persona derivation flows from the SPFx
   context. If yes, document the source of truth (auth runtime vs.
   profile API vs. injected configuration) and the consumer
   responsibilities.
6. Validate the envelope-unwrap: `jsonBody.data` →
   `PccReadModelEnvelope<T>`; surface `T` at `envelope.data`.
7. Capture pre/post lockfile checksums, run package-local validation
   plus a hosted/tenant proof if any manifest, deployment, or live
   runtime change is in scope (which would itself require gatekeeper
   review).
