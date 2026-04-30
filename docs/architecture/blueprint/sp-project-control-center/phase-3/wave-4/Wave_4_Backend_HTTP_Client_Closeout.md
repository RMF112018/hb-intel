# Phase 3 / Wave 4 — Prompt 03 Closeout — Backend HTTP Read-Model Client Opt-In Implementation

**Classification:** Canonical Normative Plan (prompt closeout, active wave).
**Audited HEAD before commit:** `2b7b7e2e4` (Wave 4 Prompt 02 commit).
**Wave:** Phase 3 / Wave 4 — Project Home / Command Center backend integration.
**Companion:** `Wave_4_Scope_Lock.md`, `Wave_4_Open_Decisions.md`, `Wave_4_SPFX_Mode_Contract_Closeout.md`.

---

## Files changed

| Status | Path | Notes |
| --- | --- | --- |
| `A` | `apps/project-control-center/src/api/pccBackendReadModelClient.ts` | New backend HTTP `IPccReadModelClient`. Sole `fetch(` callsite in the SPFx app. |
| `A` | `apps/project-control-center/src/api/pccBackendReadModelClient.test.ts` | New backend client tests (request, parsing, failure, fallback). |
| `M` | `apps/project-control-center/src/api/index.ts` | Re-exports the backend client + types. |
| `M` | `apps/project-control-center/src/api/pccReadModelClientFactory.ts` | Backend branch wires the real HTTP client when base URL is non-empty; missing/whitespace base URL still falls back. |
| `M` | `apps/project-control-center/src/api/pccReadModelClientFactory.test.ts` | Adds backend-config-fallback and backend-wired tests. |
| `M` | `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` | Adds two backend client identifiers to forbidden list; adds `fetch(` allowlist scan within `src/api/**`. |
| `A` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Backend_HTTP_Client_Closeout.md` | This closeout. |

`PccApp.tsx`, `mount.tsx`, the shell, the router, every surface, every backend / models / manifest / lockfile / workflow / deployment file are unchanged.

## Backend client file path

`apps/project-control-center/src/api/pccBackendReadModelClient.ts`

Public exports:

- `type PccReadModelFetch = typeof globalThis.fetch` — local alias to keep TS unambiguous about the injectable fetch type.
- `interface PccBackendReadModelClientOptions { backendBaseUrl: string; fetch?: PccReadModelFetch }`.
- `function createPccBackendReadModelClient(options): IPccReadModelClient`.

## Routes consumed (7 GET routes)

URL pattern: `${apiBaseUrl}/${PCC_READ_MODEL_ROUTE_PATHS[routeId].replace('{projectId}', encodeURIComponent(projectId))}`. `apiBaseUrl` is the normalized form (always ends with `/api`, no trailing slash).

- `https://<host>/api/pcc/projects/{encodedProjectId}/profile`
- `https://<host>/api/pcc/projects/{encodedProjectId}/modules`
- `https://<host>/api/pcc/projects/{encodedProjectId}/home`
- `https://<host>/api/pcc/projects/{encodedProjectId}/priority-actions`
- `https://<host>/api/pcc/projects/{encodedProjectId}/document-control`
- `https://<host>/api/pcc/projects/{encodedProjectId}/external-links`
- `https://<host>/api/pcc/projects/{encodedProjectId}/site-health`

Method is **always `GET`**. No `POST` / `PUT` / `PATCH` / `DELETE` is ever constructed (verified by per-route tests and a parameterized "no write methods" sanity test).

## Base URL normalization (4 corner cases)

`normalizeBackendApiBaseUrl(input)` trims whitespace, strips trailing slashes, and conditionally appends `/api` only if the trimmed value does not already end in `/api`. The four operator-friendly inputs all produce the same final URL for every route — verified by parameterized test cases:

| Input | Final base | Example route URL |
| --- | --- | --- |
| `https://example.invalid` | `https://example.invalid/api` | `https://example.invalid/api/pcc/projects/<id>/home` |
| `https://example.invalid/` | `https://example.invalid/api` | `…/home` |
| `https://example.invalid/api` | `https://example.invalid/api` | `…/home` |
| `https://example.invalid/api/` | `https://example.invalid/api` | `…/home` |

No `/api/api/` duplication.

## Response parsing convention

Backend responds with `{ data: PccReadModelEnvelope<T> }` (verified by Wave 3 backend tests at `pcc-read-model-routes.test.ts:118`). The client parses `body.data` after `Response.json()`, validates the envelope shape via a structural type guard (`mode: string`, `sourceStatus: string`, `readOnly: true`, `warnings: array`, `data` present), and returns the envelope verbatim on success.

`viewerPersona` is not conveyed in the request (Wave 3 contract). On client-side fallback envelopes, `viewerPersona` is preserved via the fixture-fallback delegate.

## Failure / fallback semantics (W4-OD-007)

Every failure path delegates to `createPccFixtureReadModelClient({ simulateBackendUnavailable: true })`. The fallback envelope reports `mode: 'fixture'`, `sourceStatus: 'backend-unavailable'`, warning code `'backend-unavailable'`, with `viewerPersona` preserved.

| Condition | Behavior | Test |
| --- | --- | --- |
| `backendBaseUrl` empty / whitespace at construction | All 7 methods return backend-unavailable; no fetch invoked | `pccBackendReadModelClient.test.ts` |
| `globalThis.fetch` undefined and no `options.fetch` | Constructor does **not** throw; all 7 methods return backend-unavailable; no fetch attempted | `pccBackendReadModelClient.test.ts` |
| `fetch` rejects (TypeError, network error) | backend-unavailable | `pccBackendReadModelClient.test.ts` |
| Non-2xx response (e.g. 500) | backend-unavailable; viewerPersona preserved | `pccBackendReadModelClient.test.ts` |
| `response.json()` throws (malformed JSON) | backend-unavailable | `pccBackendReadModelClient.test.ts` |
| Body missing `data` field | backend-unavailable | `pccBackendReadModelClient.test.ts` |
| `data` is not a valid envelope shape | backend-unavailable | `pccBackendReadModelClient.test.ts` |

## `fetch(` allowlist proof

Allowlist (set in the controlled-consumption guard):

- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.test.ts`

Two assertions enforce this:

1. **Non-api/non-test files** — `it('no non-api/non-test source file contains a fetch( callsite')` continues to assert zero `fetch(` callsites in any non-api/non-test source file.
2. **`src/api/**` files** — new `it('fetch( callsites in src/api/** are limited to the backend client allowlist')` scans every `.ts`/`.tsx` file at the top level of `src/api/` and asserts any `fetch(` callsite (in comment+string-stripped source) lives only in the two allowlisted paths.

The allowlist scan is intentionally scoped to `src/api/**` (not `src/tests/**`) because the dormancy guard test itself lives in `src/tests/**` and contains regex literals whose internal backticks would over-trip the comment+string stripper. The Wave 4 prompt's wording ("backend HTTP client implementation file and its direct tests/mocks") is satisfied because the backend client's direct test file is colocated under `src/api/`.

The forbidden-identifier list also gained `pccBackendReadModelClient` and `createPccBackendReadModelClient`, blocking surface/shell/router/PccApp.tsx/mount.tsx from referencing the new client.

## Validation results (cross-package)

```bash
git status --short                                       # only authorized paths
md5 pnpm-lock.yaml                                       # c56df7b79986896624536aab74d609f4
pnpm --filter @hbc/models check-types                    # PASS
pnpm --filter @hbc/models test                           # PASS — 31 files / 224 tests
pnpm --filter @hbc/functions check-types                 # PASS
pnpm --filter @hbc/functions test                        # PASS — 138 files / 2282 tests (3 skipped)
pnpm --filter @hbc/functions build                       # PASS
pnpm --filter @hbc/spfx-project-control-center check-types  # PASS
pnpm --filter @hbc/spfx-project-control-center test      # PASS — 21 files / 248 tests
pnpm --filter @hbc/spfx-project-control-center build     # PASS — 2195 modules; dist 222.13 KB JS, 20.98 KB CSS
md5 pnpm-lock.yaml                                       # c56df7b79986896624536aab74d609f4 (unchanged)
git status --short                                       # unchanged after validation
git diff --stat HEAD                                     # 4 modified files (+101 / -39 lines)
git diff --name-only HEAD                                # 4 paths, all in scope
```

`pnpm-lock.yaml` md5 before/after identical. No paths under `backend/`, `packages/`, `.github/`. No manifest, `package.json`, lockfile, workflow, or deployment changes.

## Default fixture confirmation

- Factory default behavior (omitted config / explicit `fixture` mode) continues to return the fixture client — verified by existing Prompt 02 tests still passing.
- Backend mode requires explicit `readModelMode: 'backend'` config. Missing or whitespace-only `backendBaseUrl` falls back to the fixture-with-backend-unavailable client.
- No mount/PccApp/shell/router/surface consumes the factory in Prompt 03. Project Home wiring is owned by Prompts 04 and 05.

## Architectural completeness

- **No orphan code** — the new backend client is referenced by the factory's backend branch (production code path) and by its own and the factory tests; the api barrel re-exports it for future consumers.
- **No quiet posture drift** — fixture remains the default; backend mode requires explicit selection AND non-empty base URL; missing config still falls back.
- **No silent runtime cutover** — the controlled-consumption guard continues to block all non-api source files from referencing `src/api/` (with mount.tsx's single type-only `IPccReadModelConfig` exception); the `fetch(` allowlist limits the only `fetch(` callsite to the backend client; the existing non-api `fetch(` block continues to assert zero callsites in surface/shell/router source.
- **No constructor crash** — backend client constructor never throws on missing global fetch (per `feedback_safe_fetch_availability_guard`); failure paths route through the fixture-fallback envelope per W4-OD-007.

## Confirmations

- Fixture remains the default; backend mode is explicit opt-in only.
- No auth wiring; no `@hbc/auth`, `@microsoft/sp-http`, MSGraph, or PnP imports.
- No Graph/PnP/SharePoint REST live operations; no Procore / Document Crunch / Adobe Sign runtime; no provisioning execution; no Site Health scanner/repair; no Team & Access mutation; no approval execution.
- No surface/UI wiring; no Project Home, shell, router, or PccApp.tsx edits.
- No `package.json` / `pnpm-lock.yaml` / SPFx manifest / workflow / deployment / app-catalog changes.
- No tenant mutation; no live external-system runtime confirmation.
- Method is always `GET` — no write routes.

## Recommended next prompt

**Prompt 04 — Wave 4 Project Home Read-Model Adapter and State Mapping.**

Prompt 04 introduces the adapter/view-model layer that maps `PccReadModelEnvelope<PccProjectHomeReadModel>` to Project Home's presentational state (including the `backend-unavailable` and `source-unavailable` states), without yet wiring Project Home through the seam. Prompt 05 owns the actual wiring; Prompt 06 refines the controlled-consumption guard to admit Project Home as the single authorized non-api consumer.
