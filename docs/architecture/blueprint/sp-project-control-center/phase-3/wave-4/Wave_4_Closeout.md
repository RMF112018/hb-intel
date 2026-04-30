# Phase 3 / Wave 4 — Closeout

**Phase:** 3 — SPFx Project Control Center.
**Wave:** 4 — Project Home / Command Center Backend Integration and Read-Model Consumption Hardening.
**Status:** Closed (documentation closeout).
**Date:** 2026-04-30.
**Audited HEAD before closeout commit:** `819e0c284` (Prompt 06 commit).
**Closeout artifact:** this file (Prompt 07; documentation-only).

This document is the wave-level closeout. It summarizes the **six landed Wave 4 execution prompts** (01–06) and acts as the index into the per-prompt closeout records under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/`. Prompt 07 is the documentation-only final closeout artifact and lands as a single doc commit.

---

## 1. Executive summary

Wave 4 introduced **explicit opt-in backend read-model consumption** for Project Home / Command Center, hardened the controlled-consumption guard, and preserved the fixture-default no-runtime posture across the SPFx app, the backend Functions host, and the shared models package.

- Default mount/app behavior is bit-identically Wave 2 fixture rendering.
- Backend reads occur only when explicit `_config.readModel = { readModelMode: 'backend', backendBaseUrl }` is supplied via the SPFx mount entry.
- Project Home is the sole opt-in consumer; the seam is threaded only to the `'project-home'` branch of `PccSurfaceRouter`.
- Backend HTTP traffic is GET-only across the seven Wave 3 read-only routes; Project Home consumes only two of them (`/home`, `/document-control`); the client supports all seven for future surfaces.
- All failure modes (missing config, fetch reject, non-2xx, malformed JSON, missing/non-envelope `data`, missing global `fetch`) deliver safe `backend-unavailable` envelopes through a fixture-fallback delegate; no constructor crash, no app crash.
- The dormancy guard was generalized into a controlled-consumption guard with 37 `it()` blocks, a robust character-by-character comment+string stripper, recursive `fetch(` allowlisting, narrow per-file api-import allowlist, identifier exception list, and source-level GET-only / fixture-default / single-consumer assertions.
- No tenant mutation, write routes, Graph/PnP/SharePoint REST, Procore/DC/Adobe Sign runtime, provisioning execution, Site Health repair, Team & Access mutation, approval execution, packaging, or deployment occurred.
- `pnpm-lock.yaml` md5 (`c56df7b79986896624536aab74d609f4`) is identical before and after every Wave 4 commit. No `package.json`, SPFx manifest, workflow, or deployment file changed.

## 2. Prompt-by-prompt index (six landed execution prompts + Prompt 07 closeout)

| Prompt | Commit | Conventional summary | Per-prompt closeout / record |
| --- | --- | --- | --- |
| 01 | `02c5237fb` | docs(pcc): open wave 4 project home backend consumption planning | `Wave_4_Scope_Lock.md` + `Wave_4_Open_Decisions.md` (Prompt 01 produced these scope-lock + open-decision records in lieu of an implementation closeout) |
| 02 | `2b7b7e2e4` | feat(spfx-pcc): add fixture-default read-model mode seam | `Wave_4_SPFX_Mode_Contract_Closeout.md` |
| 03 | `c098b5e3c` | feat(spfx-pcc): add opt-in backend read-model client | `Wave_4_Backend_HTTP_Client_Closeout.md` |
| 04 | `fd98bbb48` | feat(spfx-pcc): add project home read-model adapter | `Wave_4_Project_Home_Adapter_Closeout.md` |
| 05 | `c992f591d` | feat(spfx-pcc): wire project home to opt-in read-model client | `Wave_4_Project_Home_Opt_In_Wiring_Closeout.md` |
| 06 | `819e0c284` | test(spfx-pcc): harden wave 4 backend opt-in guardrails | `Wave_4_Guardrails_and_Fallback_Closeout.md` |
| 07 | (this commit) | docs(pcc): close wave 4 project home backend consumption hardening | this file (`Wave_4_Closeout.md`) |

The Wave 4 implementation chain is six commits across Prompts 01–06. Prompt 07 lands one documentation commit. There are no unrelated chore/config commits in the Wave 4 chain.

## 3. Implemented files (grouped)

### `apps/project-control-center/src/api/`

- `pccReadModelClientFactory.ts` (Prompt 02) — owns `PccReadModelMode`, `IPccReadModelConfig`, `IResolvedPccReadModelConfig`, `resolvePccReadModelConfig`, `createPccReadModelClient`. Default mode `'fixture'`. Backend branch dispatches to `createPccBackendReadModelClient` when `backendBaseUrl` is non-empty; otherwise delegates to fixture-with-`simulateBackendUnavailable`.
- `pccReadModelClientFactory.test.ts` (Prompt 02; extended Prompts 03/05).
- `pccBackendReadModelClient.ts` (Prompt 03) — sole `fetch(` callsite; GET-only; `{ data: PccReadModelEnvelope<T> }` body unwrap; safe fixture-fallback for all 5 failure modes; base-URL normalization across 4 corner cases; safe fetch-availability guard.
- `pccBackendReadModelClient.test.ts` (Prompt 03).
- `index.ts` (modified Prompts 02/03) — re-exports factory + backend client + types.
- Pre-existing Wave 3 files unchanged: `pccReadModelClient.ts`, `pccFixtureReadModelClient.ts`, `pccFixtureReadModelClient.test.ts`, `pccReadModelClient.test.ts`, `pccReadModelStateMapping.ts`, `pccReadModelStateMapping.test.ts`.

### `apps/project-control-center/src/surfaces/projectHome/`

- `projectHomeViewModel.ts` (Prompt 04; extended Prompt 05) — `IPccProjectHomeViewModel` (5 slots), per-slot `IPccProjectHomeViewModelSlot<T>`, narrow consumer interface `IPccProjectHomeReadModelClient` (2 methods).
- `projectHomeAdapter.ts` (Prompt 04) — pure `buildPccProjectHomeViewModel({ home, documentControl })`. Single allowed `src/api/` import: `mapPccSourceStatusToPreviewState`.
- `projectHomeAdapter.test.ts` (Prompt 04).
- `useProjectHomeReadModel.ts` (Prompt 05) — async hook (parallel `getProjectHome` + `getDocumentControl`), cancellation flag.
- `useProjectHomeReadModel.test.ts` (Prompt 05).
- `PccProjectHomeReadModelContent.tsx` (Prompt 05) — opt-in child; calls hook unconditionally; renders 10-card Fragment with view-model props on the 5 read-model-backed cards.
- `PccProjectHome.tsx` (modified Prompt 05) — one-line dispatcher (default Fragment vs opt-in child).
- 5 cards (modified Prompt 04): `PccProjectIntelligenceCard.tsx`, `PccPriorityActionsCard.tsx`, `PccSiteHealthSummaryCard.tsx`, `PccDocumentControlCard.tsx`, `PccMissingConfigurationsCard.tsx` — optional read-model props with fixture fallback.
- `shared.ts` (modified Prompt 04) — `PccCardState` extended with `'unauthorized-persona'`.

### `apps/project-control-center/src/`

- `mount.tsx` (modified Prompts 02/05) — separate value + type imports; conditional client instantiation; passes optional client to `PccApp`.
- `PccApp.tsx` (modified Prompt 05) — accepts and threads `readModelClient`.
- `shell/PccSurfaceRouter.tsx` (modified Prompt 05) — passes `readModelClient` only to `'project-home'` branch.

### `apps/project-control-center/src/tests/`

- `pcc-api-dormancy.test.ts` (modified Prompts 02/04/05/06) — 37 `it()` blocks at Prompt 06 closeout.
- `PccProjectHome.test.tsx` (modified Prompt 04) — `PCC_CARD_STATES` assertion updated.
- `PccProjectHome.states.test.tsx` (modified Prompt 04) — `unauthorized-persona` parametric assertion added.
- `PccApp.optIn.test.tsx` (Prompt 05) — mount/app/router integration.

### `apps/project-control-center/README.md`

- Modified Prompts 05 + 06 — added "Wave 4 Opt-In Backend Reads (Project Home)" section; superseded the "Wave 3 Read-Model Client Boundary (Dormant)" heading; corrected route count claim (Project Home consumes only 2 of 7 routes).

### `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/`

- `Wave_4_Scope_Lock.md` (Prompt 01).
- `Wave_4_Open_Decisions.md` (Prompt 01).
- 5 prompt closeouts (Prompts 02–06).
- `Wave_4_Closeout.md` (Prompt 07; this file).

### `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-04/`

- 1 README + 7 Prompt_NN_*.md files (committed in Prompt 01 alongside the blueprint records).

### Unchanged across Wave 4

- `backend/**` (no edits to runtime, routes, providers, tests; the existing Wave 3 `pcc-read-model-no-runtime.test.ts` and `pcc-read-model-routes.test.ts` already satisfied the no-runtime / GET-only bar).
- `packages/models/**` (the @hbc/models PCC types and fixtures used by Wave 4 are unchanged).
- All package manifests, `pnpm-lock.yaml`, SPFx manifests, `.github/`, deployment files.

## 4. Final Wave 4 runtime posture

- **Default mount/app** (`mount(el)`, `mount(el, ctx)`, `mount(el, ctx, undefined)`, `mount(el, ctx, { previewLabel })`, `<PccApp />` with no `readModelClient` prop): Wave 2 fixture-only rendering, bit-identical to pre-Wave-4. No client instantiation. No `fetch(` invocation. No async hook firing.
- **Explicit fixture mode** (`mount(el, ctx, { readModel: { readModelMode: 'fixture' } })`): the factory instantiates a fixture client; PccProjectHome enters the opt-in child and renders 10 cards with adapter-derived (fixture-equivalent) view-model data. No `fetch(`.
- **Explicit backend mode with `backendBaseUrl`** (`mount(el, ctx, { readModel: { readModelMode: 'backend', backendBaseUrl: 'https://<host>' } })`): the factory instantiates the backend HTTP client; PccProjectHome's hook fires exactly two parallel GET requests (`/home`, `/document-control`); the adapter maps envelopes to card slots; cards render with envelope-derived state and data. Other surfaces remain fixture/preview-driven.
- **Explicit backend mode without `backendBaseUrl`** (or whitespace-only): the factory falls back to the fixture-with-`simulateBackendUnavailable` client; PccProjectHome's hook still fires but the fixture-fallback path produces `backend-unavailable` envelopes; cards render at `state="error"`. No fetch attempted. No crash.
- **10-card bento order, single `data-pcc-active-surface-panel="project-home"` invariant** preserved across both render paths.

## 5. Default-fixture proof

- **Source level (Prompt 06):** `pccReadModelClientFactory.ts` source asserted to contain `readModelMode: input?.readModelMode ?? 'fixture'`. A regression that swaps the literal will fail the regex match.
- **Behavioral (Prompt 02):** `resolvePccReadModelConfig({})` and `resolvePccReadModelConfig()` both yield `readModelMode: 'fixture'`.
- **Integration (Prompt 05):** `PccApp.optIn.test.tsx` "default fixture path" — `<PccApp />` renders 10 cards with no `fetch(` invocation; `fetchSpy.not.toHaveBeenCalled()` passes.

## 6. Backend-opt-in proof

- **Factory (Prompt 02 + 03):** `{ readModelMode: 'backend', backendBaseUrl: '<url>' }` returns the real backend HTTP client; missing/whitespace baseUrl returns the fixture-with-`backend-unavailable`.
- **Backend client (Prompt 03):** parameterized over all 7 routes, asserts the constructed URL is `${apiBaseUrl}/pcc/projects/${encodeURIComponent(projectId)}/<name>` with `{ method: 'GET' }`. Base-URL normalization tested across `host`, `host/`, `host/api`, `host/api/`. Project ID URL-encoding tested.
- **Integration (Prompt 05):** `mount(el, undefined, { readModel: { readModelMode: 'backend', backendBaseUrl: 'https://example.invalid' } })` triggers exactly two GET fetches against the canonical Project Home URLs.
- **Source-scan (Prompt 06):** backend client source contains the literal `'GET'`; does not contain `'POST'`/`'PUT'`/`'PATCH'`/`'DELETE'`.

## 7. Project Home consumption summary

```
mount(el, ctx, _config?)
  └─ if _config.readModel: createPccReadModelClient(_config.readModel)         (Prompt 02 factory)
        └─ <PccApp readModelClient={…} />                                       (Prompt 05)
              └─ <PccSurfaceRouter activeSurfaceId='project-home' readModelClient={…} />
                    └─ <PccProjectHome readModelClient={…} />                   (one-line dispatcher)
                          └─ <PccProjectHomeReadModelContent client={…} />     (calls hook unconditionally)
                                └─ useProjectHomeReadModel(client, projectId)   (Prompt 05; useEffect)
                                      └─ Promise.all([getProjectHome, getDocumentControl])
                                            └─ buildPccProjectHomeViewModel({ home, documentControl })   (Prompt 04 adapter)
                                                  └─ 5 read-model-backed cards receive view-model slot props
```

The hook is **invoked unconditionally** inside `PccProjectHomeReadModelContent` (no conditional hook calls). The `'project-home'` branch of `PccSurfaceRouter` is the **single** point where `readModelClient={...}` is threaded — proven by the Prompt 06 source-scan asserting exactly one `readModelClient=` JSX-prop usage in the router.

`projectId` is sourced from `SAMPLE_PROJECT_PROFILE.projectId` (`'fixture-pcc-project-001'`) per Wave 4 scope. Shell-state-driven project selection is deferred to a future wave.

## 8. Backend HTTP route list and response convention

Per the Wave 3 contract (unchanged in Wave 4):

| Route | Backend handler | Wired in Wave 4? |
| --- | --- | --- |
| `GET /api/pcc/projects/{projectId}/profile` | `getPccProjectProfile` | No (available to client; not consumed by Project Home in Wave 4) |
| `GET /api/pcc/projects/{projectId}/modules` | `getPccProjectModules` | No |
| `GET /api/pcc/projects/{projectId}/home` | `getPccProjectHome` | **Yes** (Project Home opt-in) |
| `GET /api/pcc/projects/{projectId}/priority-actions` | `getPccProjectPriorityActions` | No (priority actions are denormalized into the home envelope) |
| `GET /api/pcc/projects/{projectId}/document-control` | `getPccProjectDocumentControl` | **Yes** (Project Home opt-in) |
| `GET /api/pcc/projects/{projectId}/external-links` | `getPccProjectExternalLinks` | No (missing-config denormalized into the home envelope) |
| `GET /api/pcc/projects/{projectId}/site-health` | `getPccProjectSiteHealth` | No (site-health denormalized into the home envelope) |

- All routes register with `methods: ['GET']` and `authLevel: 'anonymous'` (Wave 3 backend posture).
- Response body shape: `{ data: PccReadModelEnvelope<T> }` (verified by `pcc-read-model-routes.test.ts:118`).
- `viewerPersona` is **not** conveyed in the request; envelopes pass it through as a passthrough field.
- The backend HTTP client supports all seven routes; **only the two Project Home routes are wired in Wave 4**. Future surfaces may opt in via additional adapter modules without expanding the backend client.

## 9. Fallback / state mapping

`mapPccSourceStatusToPreviewState` (Wave 3 helper) and `PREVIEW_TO_CARD_STATE` (Wave 4 adapter) compose to map all 7 source statuses through the 8-state preview catalog into the 6-state card vocabulary:

| `PccReadModelSourceStatus` | `PccPreviewStateKind` (8) | `PccCardState` (6, after Prompt 04 extension) |
| --- | --- | --- |
| `available` | `preview` | `preview` |
| `stale` | `preview` | `preview` |
| `backend-unavailable` | `error` | `error` |
| `source-unavailable` | `unavailable-fixture` | `unavailable-fixture` |
| `missing-config` | `missing-config` | `missing-config` |
| `unauthorized` | `unauthorized-persona` | `unauthorized-persona` |
| `forbidden` | `unauthorized-persona` | `unauthorized-persona` |

Failure-mode → fallback envelope matrix (Prompt 03 backend client; W4-OD-007):

| Failure mode | Behavior |
| --- | --- |
| Empty / whitespace `backendBaseUrl` (per call) | No fetch; fixture-fallback envelope (`mode: 'fixture'`, `sourceStatus: 'backend-unavailable'`). |
| Global `fetch` undefined and no `options.fetch` | Constructor does NOT throw; per-call fallback as above. |
| `fetch` reject (TypeError, network) | Fallback. |
| Non-2xx response (e.g., 401, 500) | Fallback. |
| `response.json()` throws (malformed JSON) | Fallback. |
| Body missing `data` field | Fallback. |
| `data` is not a valid envelope shape | Fallback. |

`viewerPersona` is preserved in fallback envelopes (passthrough via the fixture-fallback delegate).

## 10. Guardrail / test inventory

### SPFx PCC suite

- 24 test files, **295 tests passing**, 0 failing, 0 skipped.
- Build emits `dist/spfx-project-control-center.css` (20.98 KB / 3.82 KB gzipped) and `dist/project-control-center-app.js` (231.03 KB / 68.58 KB gzipped) from 2,203 transformed modules.

### Hardened controlled-consumption guard (`pcc-api-dormancy.test.ts`)

37 `it()` blocks. Highlights:

- 11 stripper smoke tests (block/line/string/regex/template handling; `${...}` expression preservation).
- 1 sanity (scope non-empty) + 1 factory-seam-exists.
- 1 source-level fixture-default assertion.
- 1 narrow per-file api-import allowlist (3 rules: mount.tsx ×2, projectHomeAdapter.ts ×1).
- 8 forbidden-identifier scans with a 1-entry identifier exception list (`createPccReadModelClient` allowed in mount.tsx).
- 1 recursive `fetch(` allowlist across `apps/project-control-center/src/**` (allowed paths: `pccBackendReadModelClient.ts` + its test).
- 8 forbidden-runtime-import scans on non-api source.
- 1 forbidden-runtime-import scan on `src/api/**` (recursive).
- 1 forbidden-runtime-token scan on `src/api/**` (recursive: `MSGraphClient`, `GraphServiceClient`, `sp.web`, `_api/web`, `ProcoreClient`, `DocumentCrunchClient`, `AdobeSignClient`).
- 1 GET-only source-scan on `pccBackendReadModelClient.ts`.
- 1 single-`readModelClient=` threading assertion on `PccSurfaceRouter`.
- 1 mount-may-invoke-only positive-style assertion (Prompt 05).

### Backend host (Wave 3 carried into Wave 4 unchanged)

- `pcc-read-model-no-runtime.test.ts` scans `backend/functions/src/hosts/pcc-read-model/` for forbidden import patterns and runtime tokens (Graph/PnP/Procore/SDK/MSGraph/sp.web/etc).
- `pcc-read-model-routes.test.ts` asserts each registered route is GET-only and `authLevel: 'anonymous'`.

### Models

- 31 test files, 224 tests passing.

### Functions

- 138 test files, 2,282 tests passing (3 skipped).

## 11. Validation evidence (captured at Prompt 07 execution)

```bash
git status --short                                       # empty (clean tree before closeout commit)
md5 pnpm-lock.yaml                                       # c56df7b79986896624536aab74d609f4
pnpm --filter @hbc/models check-types                    # PASS
pnpm --filter @hbc/models test                           # PASS — 31 files / 224 tests
pnpm --filter @hbc/functions check-types                 # PASS
pnpm --filter @hbc/functions test                        # PASS — 138 files / 2282 tests (3 skipped)
pnpm --filter @hbc/functions build                       # PASS
pnpm --filter @hbc/spfx-project-control-center check-types  # PASS
pnpm --filter @hbc/spfx-project-control-center test      # PASS — 24 files / 295 tests
pnpm --filter @hbc/spfx-project-control-center build     # PASS — 2203 modules; 231.03 KB JS, 20.98 KB CSS
md5 pnpm-lock.yaml                                       # c56df7b79986896624536aab74d609f4 (unchanged)
git status --short                                       # empty
```

## 12. Package / version / lockfile / manifest / deployment posture

- **`pnpm-lock.yaml`:** md5 `c56df7b79986896624536aab74d609f4` is identical to the pre-Wave-4 baseline and identical across all Wave 4 commits. No dependency added, removed, or version-bumped.
- **`package.json` files:** unchanged for `@hbc/models`, `@hbc/functions`, `@hbc/spfx-project-control-center`.
- **SPFx manifests:** unchanged.
- **`.github/` workflows:** unchanged.
- **Deployment / app-catalog / `.sppkg`:** none generated, none uploaded, none touched.
- **Package versions:** unchanged from pre-Wave-4 baseline.

## 13. W4-OD-001 through W4-OD-010 disposition

| ID | Title | Status | Resolved by |
| --- | --- | --- | --- |
| W4-OD-001 | SPFx read-model mode/config name and default | **Resolved** | Prompt 02 (factory + tests); Prompt 06 (source-level default-fixture assertion) |
| W4-OD-002 | Backend base URL / config source | **Resolved** | Prompt 02 (`IPccReadModelConfig` type); Prompt 05 (mount-config wiring) |
| W4-OD-003 | Backend HTTP client placement | **Resolved** | Prompt 03 (`apps/project-control-center/src/api/pccBackendReadModelClient.ts`) |
| W4-OD-004 | `fetch(` source-scan exception scope | **Resolved** | Prompt 06 (recursive allowlist scoped to backend client + test only) |
| W4-OD-005 | First wired consumer | **Resolved** | Prompt 05 (Project Home only); Prompt 06 (single-consumer source-scan on router) |
| W4-OD-006 | API dormancy guard replacement with controlled-consumption guard | **Resolved** | Prompts 02 / 04 / 05 / 06 (37 `it()` blocks; multi-rule allowlist + identifier exceptions) |
| W4-OD-007 | Fallback behavior for missing config and backend-unavailable responses | **Resolved** | Prompt 03 (factory + backend client safe-fallback paths); Prompt 04 (adapter state mapping) |
| W4-OD-008 | Package / lockfile / version posture | **Resolved** | All prompts (md5 unchanged) |
| W4-OD-009 | Scoped-host ADR / architecture record disposition | **Deferred** | No ADR authored in Wave 4. The scoped-host pattern at `backend/functions/src/hosts/pcc-read-model/` remains documented across Wave 3 + Wave 4 closeout chain. **Recommended next step:** open a dedicated ADR prompt — out of Wave 4 scope; not blocking Wave 5. |
| W4-OD-010 | Wave 5 readiness dependency | **Resolved** | Wave 4 closes; Priority Actions Rail standalone module is unblocked for Wave 5 kickoff |

## 14. Deferred work (intentionally excluded from Wave 4)

The following are deliberate non-goals of Wave 4. They are NOT defects or regressions; they are explicit boundaries.

- **Auth wiring / token acquisition** — no `@hbc/auth/spfx`, `@microsoft/sp-http`. Real-tenant fetches will receive 401 → `backend-unavailable` envelope (honest fallback).
- **Persona / role / permission derivation** from SPFx context.
- **Live tenant integration** — Microsoft Graph / PnP / SharePoint REST.
- **Procore / Document Crunch / Adobe Sign** runtime, SDK, secrets, sync, mirror, write-back.
- **Provisioning execution.**
- **Site Health scanner / repair execution.**
- **Team & Access permission execution.**
- **Approval execution.**
- **Write-route surface** — `POST` / `PUT` / `PATCH` / `DELETE` clients.
- **Surfaces other than Project Home** consuming the seam (Wave 5+).
- **W4-OD-009 ADR** — scoped-host architecture record (recommended follow-up).
- **Wave 4A** — controlled non-production hosted visual validation (operator-pending; separate phase).
- **Project ID selection** wired through shell state (Wave 4 hardcodes `SAMPLE_PROJECT_PROFILE.projectId`).
- **Package / version / SPFx manifest changes**, `.sppkg` generation, app catalog upload, deployment, CI/CD edits.

## 15. Forbidden claims / non-claims (per `feedback_no_implicit_hosted_proof` and `feedback_operator_pending_proof`)

The closeout makes the following explicit non-claims:

- Wave 4 did **NOT** deploy. No `.sppkg` was generated. The app catalog was not touched.
- Wave 4 did **NOT** mutate any tenant.
- Wave 4 did **NOT** introduce write routes; all consumed routes are GET-only.
- Wave 4 did **NOT** introduce live Microsoft Graph, PnP, or SharePoint REST operations.
- Wave 4 did **NOT** introduce Procore / Document Crunch / Adobe Sign runtime.
- Wave 4 did **NOT** introduce a Site Health scanner or repair executor.
- Wave 4 did **NOT** introduce Team & Access permission execution.
- Wave 4 did **NOT** introduce approval execution.
- Wave 4 did **NOT** introduce a provisioning executor.
- Wave 4 did **NOT** modify CI/CD workflows, change package versions, or modify the lockfile.
- "Project Home backend opt-in works" means **factory + integration test proof at the package boundary**, NOT hosted/tenant proof. Hosted proof is **operator-pending** and is the subject of Wave 4A.
- Test passing is necessary but not sufficient evidence: Wave 4 also had to preserve fixture default rendering, prevent silent runtime cutover, and constrain the seam to a single surface. Those architectural-completeness checks are baked into the controlled-consumption guard (37 `it()` blocks) and cross-package validation.

## 16. Wave 4A clear separation

**Wave 4A** is the controlled non-production hosted visual validation phase. It is a **separate phase** from Wave 4 implementation and from Wave 5 implementation.

- Wave 4A is **operator-pending** — it requires explicit user authorization, a non-production tenant, and operator-controlled rollout.
- Wave 4A does **not** unblock Wave 5; Wave 5 implementation may proceed in parallel against the seam landed in Wave 4.
- Wave 4A does **not** entail any code change unless its own scope explicitly authorizes one.
- Wave 4A is bounded to visual / behavioral validation; tenant mutation, write routes, deployment, and app-catalog upload remain forbidden unless re-authorized.

The Wave 4 closeout (this document) does **not** advance Wave 4A and does **not** claim hosted proof.

## 17. Wave 5 readiness recommendation

- **Priority Actions Rail standalone module is unblocked** (W4-OD-010). Wave 5 may proceed pending user authorization.
- **Reusable patterns established in Wave 4:**
  - Narrow consumer interfaces (`IPccProjectHomeReadModelClient`) over the full `IPccReadModelClient`, per `feedback_narrow_consumer_interface.md`.
  - One-line dispatcher + opt-in child component pattern in surface roots, so React hooks remain unconditional.
  - Guard exceptions are narrow per-file, per-identifier, and per-path; never broad relaxation.
  - Pure helpers from `src/api/**` (e.g., `mapPccSourceStatusToPreviewState`) are admitted to non-api consumers via a guard allowlist entry, not via re-export.
  - Factory always defaults to `'fixture'`; backend mode requires explicit `readModelMode: 'backend'` AND non-empty `backendBaseUrl`.
  - Failure paths delegate to fixture-fallback through the existing fixture client; constructors never throw on missing global state (e.g., missing `fetch`).
  - Lockfile, package, manifest, workflow, and deployment posture are preserved across the entire wave.
- **Wave 5+ surfaces opting in must:**
  - Reuse `pccBackendReadModelClient` (do not create new transport-layer files);
  - Reuse `mapPccSourceStatusToPreviewState` via a guard-allowlisted adapter file;
  - Extend the api-import allowlist + identifier exception set narrowly;
  - Surface their own optional read-model props on cards (additive); fall back to fixtures by default;
  - Document any new W5-OD entries in a new Wave 5 open-decision register.

## 18. Final readiness statement

Phase 3 / Wave 4 is **closed** as documented:

- Six landed implementation prompts (01–06); one closeout prompt (07).
- Validation green across `@hbc/models`, `@hbc/functions`, `@hbc/spfx-project-control-center`.
- Lockfile and package posture unchanged.
- Default fixture rendering preserved.
- Backend mode is explicit opt-in only; Project Home is the sole consumer.
- Guardrails generalized into a controlled-consumption guard with 37 `it()` blocks.
- W4-OD-001..008 and W4-OD-010 resolved; W4-OD-009 deferred.
- Wave 4A operator-pending; Wave 5 readiness baseline established.

Wave 5 may proceed pending user authorization. Wave 4A is operator-pending and separately gated. The W4-OD-009 ADR is recommended as a follow-up prompt and is out of Wave 4 scope.
