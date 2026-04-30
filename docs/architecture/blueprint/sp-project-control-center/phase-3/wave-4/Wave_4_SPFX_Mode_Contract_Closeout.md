# Phase 3 / Wave 4 — Prompt 02 Closeout — SPFx Read-Model Mode Contract and Client Factory Scaffold

**Classification:** Canonical Normative Plan (prompt closeout, active wave).
**Audited HEAD before commit:** `02c5237fb` (Wave 4 Prompt 01 commit).
**Wave:** Phase 3 / Wave 4 — Project Home / Command Center backend integration.
**Companion:** `Wave_4_Scope_Lock.md`, `Wave_4_Open_Decisions.md`.

---

## Files changed

| Status | Path | Notes |
| --- | --- | --- |
| `A` | `apps/project-control-center/src/api/pccReadModelClientFactory.ts` | New factory module — owns the public mode/config types. |
| `A` | `apps/project-control-center/src/api/pccReadModelClientFactory.test.ts` | New factory tests (7 scenarios). |
| `M` | `apps/project-control-center/src/api/index.ts` | Re-exports factory + types from the api barrel. |
| `M` | `apps/project-control-center/src/mount.tsx` | Type-only `IPccReadModelConfig` import; `IPccMountConfig.readModel?` added. No factory invocation. |
| `M` | `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` | Replaced Wave 3 dormancy guard with Wave 4 controlled-consumption guard. |
| `A` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_SPFX_Mode_Contract_Closeout.md` | This closeout. |

`PccApp.tsx`, the shell, the router, every surface, every backend file, every `packages/*` file, every manifest, the lockfile, every workflow file, and every deployment file are unchanged.

## Type / factory contract landed

Authoritative location: `apps/project-control-center/src/api/pccReadModelClientFactory.ts`. The API seam owns its public types and does not depend on `mount.tsx`.

```ts
export type PccReadModelMode = 'fixture' | 'backend';

export interface IPccReadModelConfig {
  readonly readModelMode?: PccReadModelMode;
  readonly backendBaseUrl?: string;
  readonly simulateBackendUnavailable?: boolean;
}

export interface IResolvedPccReadModelConfig {
  readonly readModelMode: PccReadModelMode;
  readonly backendBaseUrl?: string;
  readonly simulateBackendUnavailable: boolean;
}

export function resolvePccReadModelConfig(input?: IPccReadModelConfig): IResolvedPccReadModelConfig;
export function createPccReadModelClient(config?: IPccReadModelConfig): IPccReadModelClient;
```

`mount.tsx` carries the contract forward via a type-only import:

```ts
import type { IPccReadModelConfig } from './api/pccReadModelClientFactory.js';

export interface IPccMountConfig {
  readonly previewLabel?: string;
  readonly readModel?: IPccReadModelConfig;
}
```

`mount(el, _spfxContext?, _config?)` continues to ignore `_config`; `mount(el)` remains backward compatible.

## Default fixture proof

Factory tests in `pccReadModelClientFactory.test.ts`:

- `resolvePccReadModelConfig` — defaults `readModelMode` to `'fixture'` when omitted; defaults `simulateBackendUnavailable` to `false`.
- `createPccReadModelClient — fixture default`:
  - omitted config → envelope `mode: 'fixture'`, `sourceStatus: 'available'`.
  - explicit `{ readModelMode: 'fixture' }` → envelope `mode: 'fixture'`, `sourceStatus: 'available'`.
  - `{ readModelMode: 'fixture', simulateBackendUnavailable: true }` → envelope `mode: 'fixture'`, `sourceStatus: 'backend-unavailable'` (test affordance preserved).

Every fixture-default scenario asserts `expect(fetchSpy).not.toHaveBeenCalled()`.

## Backend-mode non-cutover proof

Factory tests `createPccReadModelClient — backend non-cutover (Wave 4 Prompt 02)`:

- `{ readModelMode: 'backend', backendBaseUrl: 'https://example.invalid/api/' }` → all seven envelopes report `mode: 'fixture'` and `sourceStatus: 'backend-unavailable'`; first warning code `backend-unavailable`; `fetchSpy` never invoked.
- `{ readModelMode: 'backend' }` with **no** `backendBaseUrl` → does not throw; envelope reports `backend-unavailable`; `fetchSpy` never invoked.

The factory's backend branch deliberately delegates to `createPccFixtureReadModelClient({ simulateBackendUnavailable: true })` until Prompt 03 supplies the real backend HTTP client.

## Controlled-consumption guard — `src/tests/pcc-api-dormancy.test.ts`

The test file name is preserved per Prompt 02's Allowed Files list. Contents fully replaced.

Scan scope: every `.ts` / `.tsx` file under `apps/project-control-center/src/` excluding `src/api/**` and `src/tests/**`, with non-test files only.

Two scan modes (per `feedback_source_scan_guards_strip_comments.md`):

- **Comment-stripped (string literals preserved)** — used for import-source path detection and forbidden-runtime path scans.
- **Comment- and string-stripped** — used for identifier and `fetch(` callsite scans.

Assertions (12 total `it()` blocks):

1. Sanity: scope is non-empty.
2. Positive seam check: `pccReadModelClientFactory.ts` exists and contains `export function createPccReadModelClient`.
3. **Only `mount.tsx` may import from `src/api`, and only as a type-only `IPccReadModelConfig` import** from `./api/pccReadModelClientFactory(.js)`. Any other api import (in mount.tsx or elsewhere) fails.
4. No non-api / non-test source file references identifier `IPccReadModelClient`.
5. No non-api / non-test source file references identifier `pccReadModelClient`.
6. No non-api / non-test source file references identifier `pccFixtureReadModelClient`.
7. No non-api / non-test source file references identifier `createPccFixtureReadModelClient`.
8. No non-api / non-test source file references identifier `createPccReadModelClient`.
9. No non-api / non-test source file references identifier `resolvePccReadModelConfig`.
10. No non-api / non-test source file contains a `fetch(` callsite.
11. No non-api / non-test source file imports any of: `@pnp/sp`, `@pnp/graph`, `@microsoft/sp-pnp-js`, `@hbc/auth/spfx`, `msgraph`, `graph.microsoft.com`, `procore` (7 sub-tests).
12. `mount.tsx` does not invoke the factory or any client constructor (re-asserts identifier blocks specifically for mount.tsx).

`IPccReadModelConfig` is intentionally **not** in the forbidden-identifier list — it is the one identifier mount.tsx is allowed to reference (in its type-only import + the `readModel?` field type).

Project Home, every surface, the shell, the router, and `PccApp.tsx` remain blocked from API consumption. Project Home consumption allowlisting is **not** in scope for Prompt 02 — it belongs to Prompts 04 / 05 / 06.

## Validation results

```bash
git status --short                                   # 5 paths, all in scope
md5 pnpm-lock.yaml                                   # c56df7b79986896624536aab74d609f4
pnpm --filter @hbc/spfx-project-control-center check-types  # PASS (tsc --noEmit, no output)
pnpm --filter @hbc/spfx-project-control-center test  # PASS — 20 files / 222 tests
pnpm --filter @hbc/spfx-project-control-center build # PASS — 2195 modules; dist 222.13 KB JS, 20.98 KB CSS
md5 pnpm-lock.yaml                                   # c56df7b79986896624536aab74d609f4 (unchanged)
git status --short                                   # unchanged after validation
git diff --stat HEAD                                 # 3 modified files (+228 / -30 lines)
git diff --name-only HEAD                            # 3 modified files (no unauthorized paths)
```

`pnpm-lock.yaml` md5 before and after are identical: `c56df7b79986896624536aab74d609f4`.

`git diff --name-only HEAD` (modifications) and untracked-additions list:

```
M apps/project-control-center/src/api/index.ts
M apps/project-control-center/src/mount.tsx
M apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
?? apps/project-control-center/src/api/pccReadModelClientFactory.test.ts
?? apps/project-control-center/src/api/pccReadModelClientFactory.ts
?? docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_SPFX_Mode_Contract_Closeout.md
```

No paths under `backend/`, `packages/`, `.github/`. No manifest, `package.json`, `pnpm-lock.yaml`, workflow, or deployment changes.

## Architectural completeness

- **No orphan code** — the factory + barrel re-exports are referenced by the new factory tests and the controlled-consumption guard's positive seam check; mount.tsx now references `IPccReadModelConfig` via the `readModel?` field type.
- **No quiet posture drift** — fixture remains the default mode; backend mode is non-cutover and surfaces `backend-unavailable` envelopes; no surface is wired through the API seam.
- **No silent runtime cutover** — every factory test asserts `fetchSpy` was not called; the guard blocks `fetch(` outside tests/api/factory; no `fetch(` exists in app source.
- **Guardrail tests still cover unwired surfaces** — Project Home, every surface, the shell, the router, and `PccApp.tsx` continue to fail the controlled-consumption guard if they import from `src/api/`.

## Confirmations

- No backend HTTP client introduced.
- No `fetch(` introduced (factory delegates to fixture client; tests assert `fetchSpy.not.toHaveBeenCalled`).
- No Project Home wiring; no `PccSurfaceRouter.tsx` edits; no `PccApp.tsx` edits.
- No `packages/models` edits; no backend Functions edits.
- No `package.json` / `pnpm-lock.yaml` / SPFx manifest / workflow / deployment / app-catalog changes.
- No tenant mutation, write routes, Graph/PnP/SharePoint live ops, Procore/DC/Adobe Sign runtime, provisioning, Site Health scanner/repair, Team & Access mutation, or approval execution.
- Fixture remains the default data mode; backend mode remains explicit opt-in only.

## Recommended next prompt

**Prompt 03 — Wave 4 Backend HTTP Read-Model Client Opt-In Implementation.**

Prompt 03 will replace the factory's backend-mode branch with a real HTTP `IPccReadModelClient` implementation (the only authorized `fetch(` callsite) and update the controlled-consumption guard to admit the new file under `src/api/**`. Prompt 04 (Project Home adapter) and Prompt 05 (Project Home wiring) follow.
