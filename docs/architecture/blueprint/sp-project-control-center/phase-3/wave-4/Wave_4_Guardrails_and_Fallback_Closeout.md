# Phase 3 / Wave 4 — Prompt 06 Closeout — Guardrails, Validation, and Fixture Fallback Hardening

**Classification:** Canonical Normative Plan (prompt closeout, active wave).
**Audited HEAD before commit:** `c992f591d` (Wave 4 Prompt 05 commit).
**Wave:** Phase 3 / Wave 4 — Project Home / Command Center backend integration.
**Companion:** Wave 4 scope lock + open decisions + Prompts 02–05 closeouts.

---

## Files changed

| Status | Path | Notes |
| --- | --- | --- |
| `M` | `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` | Replaced regex-based comment+string stripper with a robust char-by-char state machine (handles regex literals, template `${...}` expressions); subsumed the two prior `fetch(` tests with one comprehensive recursive scan; added forbidden-runtime + forbidden-token scans for `src/api/**`; added GET-only source-scan for the backend HTTP client; added single-consumer assertion for `readModelClient` threading in `PccSurfaceRouter`; added source-level fixture-default assertion; added 11 stripper smoke tests. |
| `M` | `apps/project-control-center/README.md` | Re-headed the Wave 3 boundary section to "Superseded by Wave 4 Opt-In Below" with a leading note; corrected the closing paragraph to reflect that Wave 4 / Prompt 03 landed the backend client and Project Home consumes it in opt-in mode; corrected the Wave 4 opt-in section to specify Project Home consumes only 2 of the 7 Wave 3 routes (home + document-control). |
| `A` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Guardrails_and_Fallback_Closeout.md` | This closeout. |

`backend/**`, `packages/models/**`, every `src/api/**` runtime file, `mount.tsx`, `PccApp.tsx`, the surface router, every Project Home file (incl. tests added in Prompts 04/05), all manifests, lockfile, workflows, and deployment files are **unchanged**.

## Comprehensive guard list now in force

The hardened controlled-consumption guard at `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` runs the following `it()` blocks. Counts in parentheses indicate parametrized expansion.

**Stripper smoke tests** (11 cases):

- block comment containing `fetch(` is stripped
- line comment containing `fetch(` is stripped
- single-quoted string containing `fetch(` is stripped
- double-quoted string containing `fetch(` is stripped
- regex literal containing `fetch(` is stripped
- regex literal with character class (incl. backtick + escaped chars) does not over-consume
- static template-literal text containing `fetch(` is stripped
- `fetch(` inside template `${...}` expression body **is preserved**
- bare code `fetch(` is preserved
- nested template `${...}` containing another template literal preserves `fetch(` inside the innermost expression
- `/` division operator is not confused for a regex literal

**Boundary guard tests:**

- sanity: scope is non-empty
- factory seam exists (`pccReadModelClientFactory.ts` + `export function createPccReadModelClient`)
- factory default mode is `'fixture'` at the source level (regex match for `readModelMode: ... ?? 'fixture'`)
- non-api/non-test src/api imports limited to the per-file `API_IMPORT_RULES` allowlist (3 rules)
- per-identifier scans for 8 forbidden api identifiers (8 cases) with the narrow `IDENTIFIER_EXCEPTIONS` allowlist (mount.tsx may reference `createPccReadModelClient`)
- **recursive `fetch(` allowlist across `src/**`**: only `pccBackendReadModelClient.ts` and `pccBackendReadModelClient.test.ts` may contain `fetch(` callsites
- forbidden-runtime imports in non-api/non-test source (8 paths × 1 case = 8 cases)
- **NEW** — no `src/api/**` runtime file imports a forbidden runtime path (recursive)
- **NEW** — no `src/api/**` runtime file references a forbidden runtime token (recursive: `MSGraphClient`, `GraphServiceClient`, `sp.web`, `_api/web`, `ProcoreClient`, `DocumentCrunchClient`, `AdobeSignClient`)
- **NEW** — backend HTTP client uses only GET (literal `'GET'` present; literals `'POST'`, `'PUT'`, `'PATCH'`, `'DELETE'` absent)
- **NEW** — `PccSurfaceRouter` threads `readModelClient` to exactly one surface (single `readModelClient={...}` JSX prop usage)
- mount.tsx may invoke only `createPccReadModelClient` and no other client/factory constructor or fetch (Prompt 05 positive-style assertion preserved)

Total `it()` blocks in the file: 11 stripper + 1 sanity + 1 factory-seam + 1 default-fixture + 1 api-import + 8 identifier + 1 recursive-fetch + 8 forbidden-runtime + 1 api-runtime-import + 1 api-runtime-token + 1 GET-only + 1 router-single-consumer + 1 mount-may-invoke = 37.

## Fallback states proven

- **`backend-unavailable`** — covered by `pccBackendReadModelClient.test.ts` (failure paths: non-2xx, fetch reject, malformed JSON, missing `data`, non-envelope `data`, empty/whitespace `backendBaseUrl`, missing global fetch); by `pccReadModelClientFactory.test.ts` (backend mode without `backendBaseUrl`); by `projectHomeAdapter.test.ts` (`backend-unavailable` envelope → `state: 'error'` for all 5 slots); by `PccApp.optIn.test.tsx` (mount with backend mode + missing baseUrl renders `[data-pcc-state="error"]` markers).
- **`source-unavailable`** — `projectHomeAdapter.test.ts` maps to `unavailable-fixture` card state.
- **`missing-config`** — `projectHomeAdapter.test.ts` maps to `missing-config` card state.
- **`stale`** — `projectHomeAdapter.test.ts` maps to `preview` card state per `mapPccSourceStatusToPreviewState`.
- **`unauthorized` / `forbidden`** — `projectHomeAdapter.test.ts` maps both to `unauthorized-persona` card state; `PccProjectHome.states.test.tsx` parametrically renders the `unauthorized-persona` state across every card.

## Default-fixture proof

- **Source-level** (NEW Prompt 06 assertion): `pccReadModelClientFactory.ts` source contains `readModelMode: input?.readModelMode ?? 'fixture'`. A future change that swaps `'fixture'` for `'backend'` will fail the regex match and break this test.
- **Behavioral** (Prompt 02): `resolvePccReadModelConfig` defaults — omitted → `readModelMode: 'fixture'`.
- **Integration** (Prompt 05): `PccApp.optIn.test.tsx` "default fixture path" — `<PccApp />` renders 10 cards with no `fetch(` invocation.

## Backend opt-in proof

- **Factory** (Prompt 02 + Prompt 03 tests): `{ readModelMode: 'backend', backendBaseUrl: '<url>' }` returns the real backend HTTP client; `{ readModelMode: 'backend' }` (no baseUrl) returns the fixture-with-backend-unavailable fallback.
- **Backend client** (Prompt 03 tests): all 7 routes generate the correct GET URL with normalized base URL across 4 corner cases (`https://h`, `https://h/`, `https://h/api`, `https://h/api/`).
- **Integration** (Prompt 05): `PccApp.optIn.test.tsx` "backend mode with baseUrl" — `mount(...)` triggers exactly two GET fetches for `/home` and `/document-control` URLs.

## Recursive `fetch(` allowlist proof

`apps/project-control-center/src/**/*.{ts,tsx}` (recursive, all files) is scanned via the new char-by-char stripper. Allowlisted callsite paths:

- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.test.ts`

This subsumes the Prompt 03 top-level-only `src/api/**` scan and the Prompt 02 non-api/non-test scan. The new scan correctly skips `pcc-api-dormancy.test.ts` itself (which contains `\bfetch\s*\(` in regex literals and template literals — the new stripper handles both).

## Forbidden-runtime extension

Two new scans target `src/api/**` (recursive, runtime files only — `.test.ts` excluded):

1. **Import paths**: scans for `@pnp/sp`, `@pnp/graph`, `@microsoft/sp-pnp-js`, `@microsoft/sp-http`, `@hbc/auth/spfx`, `msgraph`, `graph.microsoft.com`, `procore`. Currently 0 offenders.
2. **Runtime tokens**: scans for `MSGraphClient`, `GraphServiceClient`, `sp.web`, `_api/web`, `ProcoreClient`, `DocumentCrunchClient`, `AdobeSignClient`. Currently 0 offenders.

Note: `@microsoft/sp-http` was added to the existing forbidden-runtime list in this prompt (it is referenced explicitly in the Prompt 03 forbidden-imports brief; this codifies it).

## Backend client GET-only source scan

`pccBackendReadModelClient.ts` is read raw, comment-stripped (string literals preserved), then asserted:

- contains the literal `'GET'`;
- does NOT contain any of `'POST'`, `'PUT'`, `'PATCH'`, `'DELETE'`.

This is the source-level proof complementing the Prompt 03 behavioral test "never generates POST/PUT/PATCH/DELETE requests across all 7 methods" (which spies on the mocked fetch).

## Project Home-only consumer proof

`PccSurfaceRouter.tsx` is read and stripped via the new char-by-char stripper. The regex `readModelClient\s*=\s*\{` (JSX prop usage) is matched globally; the assertion is exactly **1 match**. Today the only such usage is `<PccProjectHome readModelClient={readModelClient} />` in the `'project-home'` case branch.

## Documentation alignment summary

`apps/project-control-center/README.md`:

- Heading: `Wave 3 Read-Model Client Boundary (Dormant)` → `Wave 3 Read-Model Client Boundary (Superseded by Wave 4 Opt-In Below)`.
- Added a one-line note at the top of that section pointing to "Wave 4 Opt-In Backend Reads (Project Home)" and correcting the dormancy claim.
- Closing paragraph: replaced "deferred to a future prompt and would be an explicit, opt-in mode" with the Wave 4 reality: backend client landed in Prompt 03, Project Home consumes it under explicit opt-in (Prompt 05), guard generalized to controlled-consumption (Prompts 02 / 04 / 05 / 06).
- "Wave 4 Opt-In Backend Reads" section: corrected route count claim — Project Home consumes only 2 of the 7 Wave 3 read-only routes (home + document-control); the backend HTTP client supports all 7 for future surface adoption but only 2 are wired in Wave 4.

No broad rewrite. No edits to Wave 2/3 product/architecture documentation outside that section.

## Validation results

```bash
git status --short                                       # 2 modified, all in scope
md5 pnpm-lock.yaml                                       # c56df7b79986896624536aab74d609f4
pnpm --filter @hbc/models check-types                    # PASS
pnpm --filter @hbc/models test                           # PASS — 31 files / 224 tests
pnpm --filter @hbc/functions check-types                 # PASS
pnpm --filter @hbc/functions test                        # PASS — 138 files / 2282 tests (3 skipped)
pnpm --filter @hbc/functions build                       # PASS
pnpm --filter @hbc/spfx-project-control-center check-types  # PASS
pnpm --filter @hbc/spfx-project-control-center test      # PASS — 24 files / 295 tests (was 279 in Prompt 05; +16: 11 stripper smoke + 5 new guard assertions)
pnpm --filter @hbc/spfx-project-control-center build     # PASS — 2203 modules; dist 231.03 KB JS, 20.98 KB CSS
md5 pnpm-lock.yaml                                       # c56df7b79986896624536aab74d609f4 (unchanged)
git status --short                                       # unchanged after validation
git diff --stat HEAD                                     # 2 modified files (+460 / -71)
git diff --name-only HEAD                                # 2 paths, all in scope
```

`pnpm-lock.yaml` md5 before/after identical. No paths under `backend/`, `packages/`, `.github/`. No manifest, `package.json`, lockfile, workflow, or deployment changes.

## No write-route / no mutation proof

- **Source-level** (NEW): backend HTTP client GET-only assertion (no `POST`/`PUT`/`PATCH`/`DELETE` literals).
- **Behavioral** (Prompt 03): backend client test parameterized over all 7 read-model methods asserts every captured `fetch` call has `init.method === 'GET'`.
- **Backend** (Wave 3): `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts` asserts every registered route is GET-only with `authLevel: 'anonymous'`.
- **Backend host scan** (Wave 3): `backend/functions/src/services/__tests__/pcc-read-model-no-runtime.test.ts` already scans the host files for forbidden tokens including `provision`, `executeRepair`, `permissionMutate`, `writeBack`, `mirror`. No backend modifications were needed in Prompt 06.

## Confirmations

- Fixture remains the default; backend mode is explicit opt-in only.
- No backend Functions edits; no `packages/models` edits.
- No `package.json` / `pnpm-lock.yaml` / SPFx manifest / workflow / deployment / app-catalog changes.
- No new `fetch(` callsites; the recursive allowlist limits callsites to the 2 backend-client paths.
- No auth wiring; no `@hbc/auth/spfx`, `@microsoft/sp-http`, MSGraph, PnP imports anywhere in `src/api/**` or non-api source.
- No tenant mutation; no write routes; no Graph/PnP/SharePoint/Procore/DC/Adobe Sign runtime.
- No Wave 4A; no `.sppkg` / app-catalog upload / tenant validation / production rollout.
- All Wave 4 product files (mount, app, router, Project Home, cards, adapter, hook, opt-in child) are unchanged in Prompt 06.

## Recommended next prompt

**Prompt 07 — Wave 4 Closeout Proof and Wave 5 Readiness.**

Prompt 07 will:

- author the Wave 4 closeout document listing all 6 Wave 4 prompts with their commit SHAs;
- list the open decisions resolved (W4-OD-001..010) and any deferred items (e.g., W4-OD-009 ADR disposition);
- record the Wave 5 readiness baseline (Priority Actions Rail standalone module unblocked once Wave 4 closes);
- record Wave 4A (controlled non-production hosted visual validation) as a separate phase that occurs only after Wave 4 closeout.

Prompt 07 may proceed only after user approval.
