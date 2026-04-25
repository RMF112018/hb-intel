# Safety Field Excellence — Package Truth Proof (Wave 07)

**Scope statement:** This document proves *package artifact and source* truth only. It does **not** prove deployment, hosted bundle load, or hosted runtime behavior. Hosted proof lives in `safety-field-excellence-hosted-runtime-proof.md` and remains `OPERATOR-PENDING` until captured against the live HBCentral homepage.

| Field | Value |
|---|---|
| Date | 2026-04-25 |
| Branch | main |
| Commit (HEAD) | `3022358e6fe2b8acd3769d66c657f6b0f41b7618` |
| Wave | 07 (Phase 02) |
| Surface | Safety Field Excellence dynamic homepage surface |
| Source manifest version | `0.0.8.0` (`SafetyFieldExcellenceWebPart.manifest.json`) |
| Package-solution version | `1.0.3.0` (`apps/hb-webparts/config/package-solution.json`) |
| Solution name | `hb-webparts` |
| Solution id | `39b8f2ea-59bd-45b7-b4ec-b590b316833b` |
| Feature id | `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96` (version `1.0.1.3`) |
| Webpart id | `89ca5ff3-21f4-4b23-a953-4b7306ea1029` |
| Runtime-proof window key | `__hbIntel_safetyFieldExcellenceRuntimeProof` |
| Backend endpoint | `/api/safety-field-excellence/homepage/current` |
| Authority docs | `cut-over-plan/06_Verification_and_Hosted_Proof.md`, `cut-over-plan/07_Risk_Register_and_Governance.md` |

## Files inspected

- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceRuntimeProof.ts`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDataAdapter.ts`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePreviewFallback.ts`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePayloadMapper.ts`
- `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts`
- `apps/hb-webparts/config/package-solution.json`
- `tools/build-spfx-package.ts`
- `dist/sppkg/hb-webparts.sppkg` (existing pre-Wave-06 artifact — see Stale-package exclusion)

## Local verification commands and exit codes

| Command | Exit code | Notes |
|---|---|---|
| `git rev-parse HEAD` | 0 | `3022358e6fe2b8acd3769d66c657f6b0f41b7618` |
| `pnpm --filter @hbc/ui-kit check-types` | 0 | Clean |
| `pnpm --filter @hbc/features-safety check-types` | 0 | Clean |
| `pnpm --filter @hbc/functions check-types` | 0 | Clean |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | 2 | 3 pre-existing errors, **none in safetyFieldExcellence**. See Build-blocker section below. |
| `pnpm exec vitest run --config vitest.config.ts src/webparts/safetyFieldExcellence` (in `apps/hb-webparts/`) | 0 | 6 test files, 52 tests passed in 4.18s |

## Source-side string proof (required-present)

Verified against the working tree at HEAD `3022358e6`. The fresh `.sppkg` bundle is build-blocked (see below); these source-side proofs establish that the strings are in the code that *would* be bundled.

| Token | Source location | Result |
|---|---|---|
| `__hbIntel_safetyFieldExcellenceRuntimeProof` | `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceRuntimeProof.ts:58` | PRESENT |
| `dynamic-with-curated-fallback` | `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts`, `SafetyFieldExcellenceDynamicProvider.tsx` (+ 2 tests) | PRESENT |
| `dynamic-preview` | same set | PRESENT |
| `dynamic-only` | same set | PRESENT |
| `curated-only` | same set | PRESENT |
| `/api/safety-field-excellence/homepage/current` | `SafetyFieldExcellenceDataAdapter.ts:56` (`HOMEPAGE_CURRENT_PATH`) | PRESENT |
| `Live data temporarily unavailable` | `packages/ui-kit/src/HbcSafetyHomepageSurface/index.tsx` | PRESENT |
| `High confidence` / `Medium confidence` / `Low confidence` | `packages/ui-kit/src/HbcSafetyHomepageSurface/index.tsx` | PRESENT |
| `Stale`, `Preview` (chip labels) | `packages/ui-kit/src/HbcSafetyHomepageSurface/index.tsx` | PRESENT (Wave 06) |

## Source-side string proof (required-absent — production)

| Token | Search scope | Matches | Verdict |
|---|---|---|---|
| `safety-field-excellence/rollup` / `/highlights/.*/approve` / `/highlights/.*/publish` / `/candidates` | `apps/hb-webparts/src` (production homepage) | 0 | ABSENT (homepage does not call admin/control-plane routes) |
| `RawChecklistJson` / `rawChecklistJson` | `apps/hb-webparts/src/webparts/safetyFieldExcellence` (excluding `__tests__/`) | 0 | ABSENT in production code. Two test-only matches: `__tests__/SafetyFieldExcellenceDynamicProvider.test.tsx:236` (negative assertion `expect(serialized).not.toMatch(/RawChecklistJson|rawChecklistJson|inspector/i)`) and `__tests__/SafetyFieldExcellenceDataAdapter.test.ts:153` (redaction fixture). Both prove the redaction path. |
| `RawChecklistJson` / `rawChecklistJson` | `packages/ui-kit/src/HbcSafetyHomepageSurface` | 0 | ABSENT |
| `msal` | `apps/hb-webparts/src/webparts/safetyFieldExcellence`, `apps/hb-webparts/src/webparts/hbHomepage` | 0 import statements; 2 doc-comment mentions only | ABSENT in code paths. Comments at `hbHomepageContract.ts:143` ("Never resolves an MSAL token...") and `SafetyFieldExcellenceDataAdapter.ts:8` ("...never uses MSAL.") explicitly confirm non-use. |

## Source manifest extraction (target version)

```json
{
  "id": "89ca5ff3-21f4-4b23-a953-4b7306ea1029",
  "alias": "SafetyFieldExcellenceWebPart",
  "componentType": "WebPart",
  "version": "0.0.8.0",
  "manifestVersion": 2,
  "supportedHosts": ["SharePointWebPart"]
}
```

(from `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json`)

## Runtime-proof field set (source contract)

The `SafetyFieldExcellenceRuntimeProof` interface at `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceRuntimeProof.ts:19-50` exposes the following fields and intentionally excludes tokens, raw payload JSON, raw findings text, raw checklist content, and Graph diagnostics:

```
generatedAt, sourceMode, dataSource, state,
backendFunctionAppUrlConfigured, currentEndpointConfigured,
currentEndpointUrl?, currentEndpointStatus?,
publishedHighlightId?, reportingPeriodId?, reportingPeriodSpItemId?,
periodLabel?, publishStatus?, freshUntil?, isStale?,
dataConfidence?, primaryProjectNumber?, secondaryCount,
fallbackReason?, lastFetchStartedAt?, lastFetchCompletedAt?,
packageVersion?, expectedPackageVersion?,
previewFallbackRendered?, staleTreatment?
```

These are the exact fields the hosted-runtime-proof runbook expects to find in the `JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)` capture.

## Build status — BUILD-BLOCKED

The SPFx packaging orchestrator (`npx tsx tools/build-spfx-package.ts --domain hb-webparts`) chains `tsc --noEmit && vite build`. The `tsc --noEmit` step fails on three pre-existing TypeScript errors that are **not in `safetyFieldExcellence`**:

| # | File | Line | Error | Owner |
|---|---|---|---|---|
| 1 | `apps/hb-webparts/src/homepage/__tests__/hbKudosAccessibilityGuardrails.test.tsx` | 76 | TS2741 — `<ArchiveList ... />` missing required prop `laneMode: 'standard' \| 'compact' \| 'handheld'` | `hbKudos` webpart |
| 2 | `apps/hb-webparts/src/homepage/__tests__/homepageHeroDaypartPrecedence.test.tsx` | 127 | TS7006 — parameter `call` has implicit `any` in `.filter((call) => call[0] === HERO_DEBUG_PREFIX)` | `hbSignatureHero` test |
| 3 | `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx` | 203 | TS2322 — local `PriorityRailOverflowStrategy = 'more-tools' \| 'sheet'` (`apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts:34`) is incompatible with ui-kit `PriorityRailOverflowStrategy = 'inline-disclosure' \| 'menu' \| 'sheet'` (`packages/ui-kit/src/HbcPriorityRail/types.ts:16`). Real cross-package type drift. | `priorityActionsRail` webpart |

These errors exist on `main` independent of Wave 05/06/07. They block production of any fresh `hb-webparts.sppkg` (since the orchestrator gates on the typecheck) but are out of Prompt 07's documented scope. Per the user-revised Prompt 07 plan: *"do not opportunistically broaden scope to fix unrelated webparts"*. Resolution is routed to the owners of `priorityActionsRail` and `hbKudos`.

**Resolution path to unblock fresh package proof:**
1. Owner of `priorityActionsRail` reconciles the two `PriorityRailOverflowStrategy` definitions (recommended: rename the local strategy or map `'more-tools'` to `'menu'`/`'inline-disclosure'` at the surface boundary).
2. Owner of `hbKudos` adds `laneMode` to the test render and types the spy callback in `homepageHeroDaypartPrecedence.test.tsx`.
3. Re-run `npx tsx tools/build-spfx-package.ts --domain hb-webparts`.
4. Re-execute Step 5 of the Prompt 07 plan (extract bundle, capture SHA256, run required-present and required-absent string proofs against the fresh bundle).
5. Update this document with the fresh `.sppkg` SHA256, build timestamp, and bundle-grep results.

## Stale-package exclusion

The pre-existing `dist/sppkg/hb-webparts.sppkg` predates Wave 05/06 and **must not be deployed** as the Wave 06 proof artifact.

| Field | Value |
|---|---|
| Path | `dist/sppkg/hb-webparts.sppkg` |
| Size | 4,444,398 bytes |
| File mtime | `Apr 21 04:38:01 2026` (4 days before Wave 05 commit `8a481694c` on 2026-04-25 15:17) |
| SHA256 | `d2defe6b1214cb4815c0d3ec6e9f49037feda7fe1aba49925a640354bbffa034` |
| Embedded `WebPart_89ca5ff3-…` `version` (in `1f447e99-…/WebPart_89ca5ff3-….xml`) | `1.0.0` (SPFx orchestrator default; source manifest version `0.0.8.0` is operative truth) |
| App bundle | `ClientSideAssets/hb-webparts-app-2970183f.js` (2,754,152 bytes) |

**Stale-bundle negative-grep (proves Wave 06 markers absent):**

```
$ for tok in __hbIntel_safetyFieldExcellenceRuntimeProof \
             dynamic-with-curated-fallback dynamic-preview dynamic-only \
             "/api/safety-field-excellence/homepage/current" \
             "Live data temporarily unavailable" \
             "High confidence" "Medium confidence" "Low confidence"; do
    grep -l "$tok" /tmp/hb-sppkg-stale/ClientSideAssets/hb-webparts-app-*.js
  done
# (no output — zero matches across all nine tokens)
```

The stale `.sppkg` is therefore conclusively pre-Wave-06 and must be replaced (not redeployed) once the build is unblocked. The deploy runbook in `safety-field-excellence-hosted-runtime-proof.md` step 1 names this artifact as the candidate for redeployment **only if rolling back from a future fresh deploy** — never as the Wave 07 forward-cutover artifact.

## Out of scope (this document)

- App catalog upload — see `safety-field-excellence-hosted-runtime-proof.md`
- Hosted bundle load confirmation — see hosted-runtime-proof
- Hosted runtime proof object capture — see hosted-runtime-proof
- Backend endpoint reachability under tenant identity — see hosted-runtime-proof
- Cutover recommendation — see `safety-field-excellence-cutover-readiness.md`

## Closure assertions

- Source manifest version is `0.0.8.0` and matches the Wave 06 expectation. **PASS**
- Source contains the runtime-proof symbol, all four source modes, the homepage-current endpoint string, and Wave 06 UI/UX strings. **PASS**
- Source contains no admin/control-plane endpoint references in production homepage code paths. **PASS**
- Source contains no MSAL imports or raw-checklist references in production homepage code paths. **PASS**
- All four package-relevant typechecks pass except `@hbc/spfx-hb-webparts`, whose three failures are pre-existing and unrelated to `safetyFieldExcellence`. **PASS (scoped) / BUILD-BLOCKED (workspace)**
- Vitest scoped to `safetyFieldExcellence` passes (6 files, 52 tests). **PASS**
- The pre-Wave-06 stale `.sppkg` is identified, hashed, and proven to lack all Wave 06 markers. **PASS**
- Fresh `.sppkg` SHA256 / bundle string proofs / embedded manifest extraction are **DEFERRED** until the three pre-existing TS blockers are resolved by their respective owners and a fresh build can be produced.
