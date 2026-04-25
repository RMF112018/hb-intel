# Safety Field Excellence — Homepage Wiring Remediation (Wave 07)

| Field | Value |
|---|---|
| Date | 2026-04-25 |
| Branch | main |
| Wave | 07 (Phase 02 / wiring remediation) |
| Surface | Safety Field Excellence dynamic homepage surface, hosted via `hb-intel-homepage.sppkg` |
| HbHomepageWebPart manifest version | `1.1.75.0` → **`1.1.76.0`** |
| `apps/hb-homepage/config/package-solution.json` (solution + feature) | `1.1.75.0` → **`1.1.76.0`** |
| `packages/homepage-launcher/src/constants.ts` `HOMEPAGE_LAUNCHER_VERSION` | `1.1.75.0` → **`1.1.76.0`** (kept aligned per `hbHomepagePackageAuthority` test) |
| `SafetyFieldExcellenceWebPart.manifest.json` | `0.0.8.0` (unchanged — no Safety source change) |
| Authority docs | `cut-over-plan/06_Verification_and_Hosted_Proof.md`, `cut-over-plan/07_Risk_Register_and_Governance.md`, `safety-field-excellence-package-truth-proof.md`, `safety-field-excellence-cutover-readiness.md`, `safety-field-excellence-rollback-runbook.md`, `safety-field-excellence-hosted-runtime-proof.md` |

## Root cause (the wiring gap that this remediation closes)

Wave 05 added the dynamic adapter, source modes, preview fallback, and runtime proof; Wave 06 added the UI/UX hardening. Both shipped correctly inside `hb-intel-homepage.sppkg`. The remaining gap was that the homepage *runtime* never constructed or forwarded the seams the Safety dynamic provider needs:

1. `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts` — `HbHomepageProps` had no `getFunctionAppToken` and no `functionAppBaseUrl`. (`HbHomepageZoneProps` already declared both for the zone side.)
2. `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx` — neither prop was destructured or copied into `zoneProps`, so the safety zone could not receive them even if the host passed them.
3. `apps/hb-homepage/src/mount.tsx` — only constructed a generic `getApiToken` from `webPartProperties.backendAudience`; never built a Function App-scoped token provider, never read `functionAppBaseUrl`.
4. `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts` and `shellValidation.ts` — `safetyFieldExcellenceDynamic` was not declared on `ModuleConfigSlicesSchema` or in the schema-failure fallback path of `extractModuleConfigSlices`. zod's default `.object()` strips unknown keys, so the dynamic config block was silently dropped before reaching `SafetyFieldExcellenceZone.readDynamicConfig`. The zone always saw `sourceMode = 'curated-only'`, no matter what the homepage config asked for.

Net effect: even with Wave 06 code shipped in the bundle, the homepage runtime was structurally incapable of activating any `dynamic-*` source mode or rendering the preview fallback. This wave closes all four points.

## Files changed

**Source (homepage runtime wiring):**

- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts` — `HbHomepageProps` gains `getFunctionAppToken?` and `functionAppBaseUrl?`.
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx` — destructures both props and forwards them into `zoneProps`.
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts` — `ModuleConfigSlices` gains `safetyFieldExcellenceDynamic?`.
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts` — `ModuleConfigSlicesSchema` allows the dynamic block through.
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts` — schema-failure fallback path includes the dynamic block.
- `apps/hb-webparts/src/webparts/hbHomepage/wiring/safetyFunctionAppWiring.ts` — **new** pure helper exporting `readFunctionAppBaseUrl`, `readFunctionAppAudience`, `resolveSafetyFunctionAppWiring`. Documents `functionAppAudience` as the preferred property and `backendAudience` as a tenant-continuity fallback.
- `apps/hb-homepage/src/mount.tsx` — imports `resolveSafetyFunctionAppWiring`, derives `functionAppBaseUrl` and `getFunctionAppToken` from web-part properties, passes both into `<HbHomepage>` alongside the legacy `getApiToken`.
- `apps/hb-homepage/vite.config.ts` — reorders the `@hb-homepage/runtime` aliases so the regex subpath alias resolves before the bare-string alias (otherwise subpaths like `@hb-homepage/runtime/wiring/safetyFunctionAppWiring` would concatenate onto `HbHomepage.tsx`).

**Tests (new, all under `@hbc/spfx-hb-webparts` vitest config):**

- `apps/hb-webparts/src/webparts/hbHomepage/wiring/__tests__/safetyFunctionAppWiring.test.ts` — pure-helper coverage: top-level + nested + legacy fallback for base URL; preferred + legacy for audience; provider invoked iff audience present; URL-only degradation; legacy `backendAudience` continuity.
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.zoneProps.test.tsx` — module-mocks `SafetyFieldExcellenceZone`, renders `HbHomepageShell` with the new seams, asserts the zone receives both via `zoneProps`. Also asserts undefined seams pass through cleanly.
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.previewFallbackRoute.test.tsx` — full-route render with **real** `SafetyFieldExcellenceZone`, real `SafetyFieldExcellenceDynamicProvider`, real `SafetyFieldExcellenceDataAdapter`, real `HbcSafetyHomepageSurface`. Mocks `globalThis.fetch`. Two cases: (a) `dynamic-only` + `no-published-highlight` response, (b) `dynamic-only` + missing token. Both assert that the rendered surface carries `data-hbc-safety-preview="true"`, `data-hbc-safety-fallback-reason="preview"`, and contains the `Preview` label, AND that `window.__hbIntel_safetyFieldExcellenceRuntimeProof` reports `dataSource: "preview-fallback"`, `previewFallbackRendered: true`, with the correct `currentEndpointConfigured` (true vs false) and `fallbackReason` (`no-published-highlight` vs `function-app-token-not-configured`).

**Versioning:**

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` — `1.1.75.0` → `1.1.76.0`.
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` — `1.1.75.0` → `1.1.76.0` (canonical copy bound to the package-solution).
- `apps/hb-homepage/config/package-solution.json` — solution + feature `1.1.75.0` → `1.1.76.0`.
- `packages/homepage-launcher/src/constants.ts` — `HOMEPAGE_LAUNCHER_VERSION` `1.1.75.0` → `1.1.76.0` (locked in lockstep by `hbHomepagePackageAuthority.test.ts`).

## Wiring confirmation checklist

| Closure-proof requirement | Status | Evidence |
|---|---|---|
| `HbHomepageProps` includes `getFunctionAppToken` and `functionAppBaseUrl` | PASS | `hbHomepageContract.ts:124-141` (Wave 07 wiring block) |
| `HbHomepageShell` forwards both into `zoneProps` | PASS | `HbHomepageShell.tsx` destructure + `zoneProps` literal; `HbHomepageShell.zoneProps.test.tsx` asserts the safety zone receives both |
| `apps/hb-homepage/src/mount.tsx` resolves and passes both into `<HbHomepage>` | PASS | `mount.tsx` `resolveSafetyFunctionAppWiring(webPartProperties, createApiTokenProvider)` then passed in `createElement(HbHomepage, { ..., getFunctionAppToken, functionAppBaseUrl })` |
| Pure wiring helper has unit proof | PASS | `safetyFunctionAppWiring.test.ts` (12 cases across base URL, audience, and resolution) |
| `SafetyFieldExcellenceZone` receives the seams | PASS | `HbHomepageShell.zoneProps.test.tsx` |
| Full-route preview fallback proof: `dynamic-only` + no published data renders the preview | PASS | `HbHomepageShell.previewFallbackRoute.test.tsx` — both `no-published` and missing-token branches assert `data-hbc-safety-preview="true"` and `dataSource: "preview-fallback"` through the homepage path |
| Runtime proof shows `dataSource: "preview-fallback"` and `previewFallbackRendered: true` | PASS | both cases assert these values via `readSafetyFieldExcellenceRuntimeProof()` |
| `curated-only` remains the safe default | PASS | Default unchanged in `SafetyFieldExcellenceZone.tsx` line 30 (`dynamicConfig?.sourceMode ?? 'curated-only'`); no test or build path needs an opt-in to keep curated rendering |
| Package version `1.1.76.0` | PASS | Orchestrator `hb-intel-homepage-effectiveness-proof.json` reports `versionAuthorityAligned: true` with all three values at `1.1.76.0` |
| Package contains required strings | PASS | See "Package truth — required-present" below |
| Package does not contain forbidden strings | PASS | See "Package truth — required-absent" below |
| No backend route, timer, publish workflow, scoring, approval UI changes | PASS | No edits under `backend/functions`, `packages/features/safety`, or any timer/publish/scoring source |
| No MSAL introduced | PASS | `grep -R "msal" apps/hb-webparts/src/webparts/{safetyFieldExcellence,hbHomepage} apps/hb-homepage/src` returns only existing comment-only mentions confirming non-use |
| Hosted tenant proof remains explicitly OPERATOR-PENDING | PASS | This document does not claim hosted SharePoint observation; the existing `safety-field-excellence-hosted-runtime-proof.md` runbook continues to govern hosted capture |

## Local preview-fallback proof

Vitest output (run from `apps/hb-webparts/`):

```
$ pnpm exec vitest run --config vitest.config.ts \
    src/webparts/safetyFieldExcellence \
    src/webparts/hbHomepage
 Test Files  32 passed (32)
      Tests  446 passed (446)
```

Specifically the new `HbHomepageShell.previewFallbackRoute.test.tsx` passes both:

- `renders the preview fallback when sourceMode=dynamic-only and the backend returns no-published`
- `renders the preview fallback when sourceMode=dynamic-only and the Function App token is missing`

Both end-of-test assertions verify the runtime-proof shape reflects the wiring path the homepage will take in production:

```ts
expect(proof?.sourceMode).toBe('dynamic-only');
expect(proof?.dataSource).toBe('preview-fallback');
expect(proof?.previewFallbackRendered).toBe(true);
expect(proof?.backendFunctionAppUrlConfigured).toBe(true);
// no-published case:
expect(proof?.currentEndpointConfigured).toBe(true);
expect(proof?.fallbackReason).toBe('no-published-highlight');
// missing-token case:
expect(proof?.currentEndpointConfigured).toBe(false);
expect(proof?.fallbackReason).toBe('function-app-token-not-configured');
```

## Package truth

**`hb-intel-homepage.sppkg`** rebuilt by `npx tsx tools/build-spfx-package.ts --domain hb-homepage`:

| Field | Value |
|---|---|
| Path | `dist/sppkg/hb-intel-homepage.sppkg` |
| Built at | 2026-04-25 17:48:25 |
| Size | 11,885,623 bytes (~11.34 MB) |
| SHA256 | `a2516dc2cd0650737eff3cbbb7e41b7d4495ca310a374936a7c3f6923d5b22d3` |
| App bundle | `ClientSideAssets/hb-homepage-app-1be367ce.js` (SHA256 prefix `1be367ce0dd4...`) |
| Shell entry | `shell-entry-e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf-4c7a7baf.js` |
| Version-authority alignment | solution = feature = webpart = `1.1.76.0` (`hb-intel-homepage-effectiveness-proof.json` `aligned: true`) |
| Bundle hash delta | Wave 07 wiring bundle `1be367ce` differs from prior Wave 06 bundle `115c4645` (post-`tools/build-spfx-package.ts` rebuild) and from the original pre-wiring bundle `29f838fd` (Apr 24) — confirming the new wiring source is in the artifact |

### Required-present strings (in `hb-homepage-app-1be367ce.js`)

All 13 PRESENT:

```
PRESENT :: __hbIntel_safetyFieldExcellenceRuntimeProof
PRESENT :: dynamic-with-curated-fallback
PRESENT :: dynamic-preview
PRESENT :: dynamic-only
PRESENT :: curated-only
PRESENT :: /api/safety-field-excellence/homepage/current
PRESENT :: Weekly Safety Excellence Preview
PRESENT :: Live data temporarily unavailable
PRESENT :: High confidence
PRESENT :: Medium confidence
PRESENT :: Low confidence
PRESENT :: getFunctionAppToken
PRESENT :: functionAppBaseUrl
```

### Required-absent strings

All 9 ABSENT:

```
ABSENT :: /safety-field-excellence/rollup/dry-run (0 occurrences)
ABSENT :: /safety-field-excellence/rollup/generate (0)
ABSENT :: /candidates (0)
ABSENT :: /approve (0)
ABSENT :: /publish (0)
ABSENT :: /suppress (0)
ABSENT :: /rollback (0)
ABSENT :: RawChecklistJson (0)
ABSENT :: rawChecklistJson (0)
```

## Future production config (preferred)

`functionAppAudience` is the preferred property going forward; `backendAudience` is accepted only as a tenant-continuity fallback because it has historically served PnP Ops and other Function App-backed paths.

Recommended top-level form:

```json
{
  "functionAppBaseUrl": "https://<function-app-host>",
  "functionAppAudience": "<api-audience-or-client-id-uri>",
  "safetyFieldExcellenceDynamic": {
    "sourceMode": "dynamic-only",
    "includeStale": false,
    "diagnosticsEnabled": false,
    "emergencyUseCuratedFallback": false,
    "safetyHubUrl": "https://hedrickbrotherscom.sharepoint.com/sites/Safety"
  }
}
```

Equivalently, a nested form is supported (the helper checks `safetyFieldExcellenceDynamic.functionAppBaseUrl` after the top-level property):

```json
{
  "functionAppAudience": "<api-audience-or-client-id-uri>",
  "safetyFieldExcellenceDynamic": {
    "sourceMode": "dynamic-only",
    "functionAppBaseUrl": "https://<function-app-host>",
    "includeStale": false,
    "diagnosticsEnabled": false,
    "emergencyUseCuratedFallback": false,
    "safetyHubUrl": "https://hedrickbrotherscom.sharepoint.com/sites/Safety"
  }
}
```

For production cutover after hosted proof, the preferred steady-state mode is `dynamic-with-curated-fallback` (see `safety-field-excellence-cutover-readiness.md`); `dynamic-only` is recommended only for controlled test pages or after explicit owner sign-off.

## Hosted tenant proof — OPERATOR-PENDING

This remediation does not claim hosted SharePoint runtime evidence. The existing `safety-field-excellence-hosted-runtime-proof.md` runbook continues to govern hosted capture. The post-deploy operator checklist there now applies to the Wave 07 build (`.sppkg` SHA `a2516dc2…`, app bundle SHA `1be367ce…`, manifest version `1.1.76.0`); the operator-pending sections must still be populated with browser-console runtime-proof JSON, network-panel proof, screenshots, and backend reachability under a normal authenticated delegated user before this wiring can be declared hosted-proven.

## Out of scope (this remediation, confirmed)

- No backend routes, timer behavior, publish workflow, scoring, or approval UI changes.
- No edits to `apps/hb-webparts/src/mount.tsx` (build-blocked, removed from the SPFx orchestrator pipeline at commit `be922f7ad`; not the operative SFE-host artifact).
- No new Safety source code; `SafetyFieldExcellenceWebPart` manifest stays at `0.0.8.0`.
- No MSAL.

## Validation results

| Command | Result |
|---|---|
| `cd apps/hb-homepage && pnpm exec tsc --noEmit` | exit 0 |
| `pnpm --filter @hbc/ui-kit check-types` | exit 0 |
| `pnpm --filter @hbc/features-safety check-types` | exit 0 |
| `pnpm --filter @hbc/functions check-types` | exit 0 |
| `pnpm exec vitest run --config vitest.config.ts src/webparts/safetyFieldExcellence src/webparts/hbHomepage` | 32 files / 446 tests PASS |
| `npx tsx tools/build-spfx-package.ts --domain hb-homepage` | succeeded; produced `hb-intel-homepage.sppkg` SHA `a2516dc2…` |

Pre-existing 3 TS errors in `@hbc/spfx-hb-webparts` (unrelated webparts: `priorityActionsRail`, `hbKudos` test, `homepageHero` test) remain unaffected and do not block the homepage build path; documented in `safety-field-excellence-package-truth-proof.md` → "Build status — BUILD-BLOCKED".

## Final status

**Local wiring complete and packaged. Hosted tenant proof remains operator-pending.** The `hb-intel-homepage.sppkg` at `1.1.76.0` (SHA `a2516dc2…`) now ships the runtime wiring required to activate `dynamic-only` (and any other dynamic source mode) and to render the preview fallback when no published Safety Field Excellence highlight is available.
