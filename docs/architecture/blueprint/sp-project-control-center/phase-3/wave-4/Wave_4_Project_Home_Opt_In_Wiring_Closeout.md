# Phase 3 / Wave 4 — Prompt 05 Closeout — Project Home / Command Center Opt-In Wiring

**Classification:** Canonical Normative Plan (prompt closeout, active wave).
**Audited HEAD before commit:** `fd98bbb48` (Wave 4 Prompt 04 commit).
**Wave:** Phase 3 / Wave 4 — Project Home / Command Center backend integration.
**Companion:** Wave 4 scope lock + open decisions + Prompts 02–04 closeouts.

---

## Files changed

| Status | Path | Notes |
| --- | --- | --- |
| `M` | `apps/project-control-center/src/mount.tsx` | Two separate factory imports (value `createPccReadModelClient` + type-only `IPccReadModelConfig`); creates client when `_config.readModel` is supplied; passes optional client into `PccApp`. |
| `M` | `apps/project-control-center/src/PccApp.tsx` | Adds `readModelClient?: IPccProjectHomeReadModelClient` prop; threads to `PccSurfaceRouter`. |
| `M` | `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` | Adds `readModelClient?` prop; passes only to `<PccProjectHome>`. Other surfaces unchanged. |
| `M` | `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx` | One-line dispatcher: when client is supplied, renders `<PccProjectHomeReadModelContent>`; otherwise renders the Wave 2 fixture-only Fragment unchanged. |
| `M` | `apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts` | Adds narrow consumer interface `IPccProjectHomeReadModelClient` (2 methods only). No `IPccReadModelClient` re-export. |
| `M` | `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` | Restructured into multi-rule `API_IMPORT_RULES` + `IDENTIFIER_EXCEPTIONS`; obsolete mount-no-invoke assertion replaced with positive-style mount-may-invoke-only assertion. |
| `M` | `apps/project-control-center/README.md` | Adds "Wave 4 Opt-In Backend Reads (Project Home)" section (~40 lines). |
| `A` | `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx` | Opt-in child; calls `useProjectHomeReadModel` unconditionally; renders the 10-card Fragment with view-model-driven slot data + state for the 5 read-model-backed cards. |
| `A` | `apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.ts` | Hook: parallel `getProjectHome` + `getDocumentControl` calls → `buildPccProjectHomeViewModel`. Cancellation flag. |
| `A` | `apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.test.ts` | Hook tests: initial loading, fixture resolution, simulateBackendUnavailable, refetch on client identity change. |
| `A` | `apps/project-control-center/src/tests/PccApp.optIn.test.tsx` | Mount/app integration tests: default fixture path, explicit fixture mode, backend mode with baseUrl (URL + GET assertions), backend mode without baseUrl, non-Project-Home surface ignores the client. |
| `A` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Project_Home_Opt_In_Wiring_Closeout.md` | This closeout. |

`packages/models`, the backend, every API client file under `src/api/**`, manifests, lockfile, workflows, deployment files are unchanged.

## Exact opt-in mount config shape

```ts
mount(el, spfxContext, {
  readModel: {
    readModelMode: 'fixture' | 'backend', // default 'fixture'
    backendBaseUrl?: string,               // required when 'backend'
    simulateBackendUnavailable?: boolean,  // default false
  },
});
```

Calls without a `readModel` key (`mount(el)`, `mount(el, ctx)`, `mount(el, ctx, undefined)`, `mount(el, ctx, { previewLabel: '...' })`) skip client instantiation entirely and render the Wave 2 fixture-only path bit-identically.

## Default-fixture proof

- `<PccApp />` (no `readModelClient` prop) → renders the Wave 2 10-card Fragment; existing `PccProjectHome.test.tsx` (and 269 other PCC tests) pass without modification.
- `mount(el)` and `mount(el, ctx, { readModel: { readModelMode: 'fixture' } })` → no `fetch(` invoked (proven by `PccApp.optIn.test.tsx`'s "default fixture path" + "explicit fixture mode" tests, which spy on `globalThis.fetch` and assert `fetchSpy.not.toHaveBeenCalled()`).

## Explicit-backend-opt-in proof

`PccApp.optIn.test.tsx` "backend mode with baseUrl" test:

1. `mount(el, undefined, { readModel: { readModelMode: 'backend', backendBaseUrl: 'https://example.invalid' } })` → factory instantiates the backend HTTP client; `useProjectHomeReadModel` fires; fetch is called exactly twice with:
   - `https://example.invalid/api/pcc/projects/<encodedId>/home` `{ method: 'GET' }`
   - `https://example.invalid/api/pcc/projects/<encodedId>/document-control` `{ method: 'GET' }`
2. Backend mode without baseUrl → no fetch invoked; cards render `[data-pcc-state="error"]` (factory falls back to fixture-with-`backend-unavailable`).
3. Bento invariants under opt-in: 10 cards as direct children of `[data-pcc-bento-grid]`; exactly one `[data-pcc-active-surface-panel="project-home"]`.
4. `PccSurfaceRouter` rendered with `activeSurfaceId="documents"` and a spied client → `getProjectHome` and `getDocumentControl` never invoked.

## Project Home wiring chain

```
mount(el, ctx, _config?)
  → createPccReadModelClient(_config?.readModel)?     (Prompt 02 factory; only when _config.readModel is supplied)
  → <PccApp readModelClient={…} />                    (Prompt 05)
  → <PccSurfaceRouter readModelClient={…} />          (Prompt 05; threads only to project-home branch)
  → <PccProjectHome readModelClient={…} />            (Prompt 05; one-line dispatcher)
  → <PccProjectHomeReadModelContent client={…} />     (Prompt 05; opt-in child, calls hook unconditionally)
  → useProjectHomeReadModel(client, projectId)        (Prompt 05; useEffect → parallel envelope fetches)
  → buildPccProjectHomeViewModel({ home, doc })       (Prompt 04 adapter)
  → 10-card Fragment with view-model props on the 5 read-model-backed cards
```

When `readModelClient` is undefined, `PccProjectHome` falls through to the Wave 2 Fragment (no async, no hook invocation, no DOM change).

## Narrow consumer interface design

The Project Home consumer surface defines its own narrow interface in `surfaces/projectHome/projectHomeViewModel.ts`:

```ts
export interface IPccProjectHomeReadModelClient {
  getProjectHome(projectId, viewerPersona?): Promise<PccReadModelEnvelope<PccProjectHomeReadModel>>;
  getDocumentControl(projectId, viewerPersona?): Promise<PccReadModelEnvelope<PccDocumentControlReadModel>>;
}
```

The full `IPccReadModelClient` (7 methods, defined under `src/api/**`) is structurally compatible with this 2-method shape. `mount.tsx` value-imports `createPccReadModelClient`, gets back the full client, and passes it into `<PccApp readModelClient={…}>` typed as `IPccProjectHomeReadModelClient` — TypeScript structural typing accepts the assignment. **No re-export of `IPccReadModelClient` exists in non-api code**, so the controlled-consumption guard's forbidden-identifier list keeps `IPccReadModelClient` blocked outside `src/api/**` with no per-consumer exceptions needed.

## Other-surfaces-not-wired confirmation

- `PccSurfaceRouter` passes `readModelClient` only to the `'project-home'` branch (line 36). All 7 other surface branches are unchanged.
- The integration test "non-Project-Home surfaces ignore the read-model client" verifies: rendering `<PccSurfaceRouter activeSurfaceId="documents" readModelClient={fixtureClient} />` does not invoke `getProjectHome` or `getDocumentControl` on the spied client.
- Other surfaces (Team & Access, Documents, Site Health, External Systems, Project Readiness, Approvals, Control Center Settings) continue to consume `@hbc/models/pcc` fixtures directly. The dormancy guard's forbidden-identifier scan would catch any accidental client identifier reference in those surfaces.

## Dormancy guard updates

### Restructured `API_IMPORT_RULES` (multi-rule per file)

| File | typeOnly | Source paths | Identifiers | Description |
| --- | --- | --- | --- | --- |
| `mount.tsx` | yes | `./api/pccReadModelClientFactory(.js)` | `IPccReadModelConfig` | mount.tsx type-only IPccReadModelConfig (Prompt 02) |
| `mount.tsx` | no | `./api/pccReadModelClientFactory(.js)` | `createPccReadModelClient` | mount.tsx value-import createPccReadModelClient (Prompt 05) |
| `projectHomeAdapter.ts` | no | `../../api/pccReadModelStateMapping(.js)` | `mapPccSourceStatusToPreviewState` | projectHomeAdapter.ts value-import mapPccSourceStatusToPreviewState (Prompt 04) |

Match logic: for each api-import in a non-api/non-test file, find any rule where `rule.file === filePath && rule.typeOnly === imp.typeOnly && rule.sourcePaths.has(imp.path) && every named specifier ∈ rule.namedSpecifiers`. If no rule matches → fail with all candidate descriptions.

### Identifier exceptions (per-(identifier, file))

| Identifier | File | Justification |
| --- | --- | --- |
| `createPccReadModelClient` | `mount.tsx` | Mount invokes the factory entry point |

All other forbidden identifiers (`IPccReadModelClient`, `pccReadModelClient`, `pccFixtureReadModelClient`, `createPccFixtureReadModelClient`, `pccBackendReadModelClient`, `createPccBackendReadModelClient`, `resolvePccReadModelConfig`) remain blocked everywhere outside `src/api/**` with no exceptions.

### Replaced obsolete mount-no-invoke assertion

The Prompt 02 `it('mount.tsx does not invoke the factory or any client constructor', ...)` is removed (Prompt 05 expects mount to invoke `createPccReadModelClient`). Replaced with a positive-style assertion:

- mount.tsx **must** reference `createPccReadModelClient` (factory entry point present);
- mount.tsx **must not** reference `IPccReadModelClient`, `pccReadModelClient`, `pccFixtureReadModelClient`, `createPccFixtureReadModelClient`, `pccBackendReadModelClient`, `createPccBackendReadModelClient`, `resolvePccReadModelConfig`;
- mount.tsx **must not** call `fetch(`;
- mount.tsx **must not** import any forbidden runtime path (`@pnp/sp`, `@pnp/graph`, `@microsoft/sp-pnp-js`, `@hbc/auth/spfx`, `msgraph`, `graph.microsoft.com`, `procore`).

### Prompt 03 `fetch(` allowlist preserved exactly

`src/api/**` `fetch(` callsites remain limited to `pccBackendReadModelClient.ts` and `pccBackendReadModelClient.test.ts`. The non-api/non-test `fetch(` block continues to assert zero callsites in surface/shell/router source.

## Validation results

```bash
git status --short                                       # 7 modified + 4 untracked, all in scope
md5 pnpm-lock.yaml                                       # c56df7b79986896624536aab74d609f4
pnpm --filter @hbc/models check-types                    # PASS
pnpm --filter @hbc/models test                           # PASS — 31 files / 224 tests
pnpm --filter @hbc/functions check-types                 # PASS
pnpm --filter @hbc/functions test                        # PASS — 138 files / 2282 tests (3 skipped)
pnpm --filter @hbc/functions build                       # PASS
pnpm --filter @hbc/spfx-project-control-center check-types  # PASS
pnpm --filter @hbc/spfx-project-control-center test      # PASS — 24 files / 279 tests (was 270 in Prompt 04; +9: 4 hook tests + 5 integration tests)
pnpm --filter @hbc/spfx-project-control-center build     # PASS — 2203 modules; dist 231.03 KB JS, 20.98 KB CSS
md5 pnpm-lock.yaml                                       # c56df7b79986896624536aab74d609f4 (unchanged)
git status --short                                       # unchanged after validation
git diff --stat HEAD                                     # 7 modified files (+220 / -67)
git diff --name-only HEAD                                # 7 paths, all in scope
```

`pnpm-lock.yaml` md5 before/after identical. No paths under `backend/`, `packages/`, `.github/`. No manifest, `package.json`, lockfile, workflow, or deployment changes.

## Architectural completeness

- **No conditional hook calls.** `useProjectHomeReadModel` is invoked unconditionally inside `PccProjectHomeReadModelContent`. The opt-in branch in `PccProjectHome` switches between two render trees, not between two hook-call paths.
- **No orphan code.** mount.tsx invokes `createPccReadModelClient` only when config is supplied; PccApp/Router thread the optional prop; the hook + opt-in child are exercised by both unit tests and integration tests.
- **No quiet posture drift.** Default mount produces no client; default `<PccApp />` produces no client; existing 270 tests are preserved unchanged.
- **No silent runtime cutover.** Backend mode requires explicit `readModelMode: 'backend'` AND non-empty `backendBaseUrl` (factory falls back to fixture-with-`backend-unavailable` otherwise).
- **Narrow consumer interface.** PccApp/Router/ProjectHome/hook depend on `IPccProjectHomeReadModelClient` (2 methods), not the full 7-method `IPccReadModelClient`.
- **Bento invariants preserved.** Both render paths produce the same 10-card Fragment in the same order; Project Intelligence card carries the single `data-pcc-active-surface-panel="project-home"` marker.

## Confirmations

- Fixture remains the default; backend mode is explicit opt-in only.
- No backend Functions edits; no `packages/models` edits.
- No `package.json` / `pnpm-lock.yaml` / SPFx manifest / workflow / deployment / app-catalog changes.
- No new `fetch(` callsites beyond Prompt 03's allowlist (`pccBackendReadModelClient.ts` + its test).
- No auth wiring; no `@hbc/auth/spfx`, `@microsoft/sp-http`, MSGraph, PnP imports.
- No tenant mutation; no write routes; no Graph/PnP/SharePoint/Procore/DC/Adobe Sign runtime.
- No persona/role/permission derivation from SPFx context; no token acquisition.
- No route navigation beyond the existing `usePccShellState`.
- No edits to non-Project-Home surfaces beyond router prop threading.
- No Wave 4A work; no `.sppkg` / app-catalog upload / tenant validation / production rollout.

## Recommended next prompt

**Prompt 06 — Wave 4 Guardrails, Validation, and Fixture Fallback Hardening.**

Prompt 06 will:

- make the `fetch(` allowlist scan recursive and explicitly include `src/tests/**` (carry-forward from Prompt 04 plan), with a robust comment+string stripper that doesn't trip on regex-literal-internal backticks;
- harden the fixture-fallback path (potentially with additional integration coverage of partial failure modes);
- finalize the controlled-consumption guard for Wave 4 (Project Home is now the only authorized non-api consumer);
- prepare the Wave 5 readiness baseline.

Prompt 06 may proceed only after user approval.
