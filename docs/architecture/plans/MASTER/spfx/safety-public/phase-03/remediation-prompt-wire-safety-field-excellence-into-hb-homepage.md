# Remediation Prompt — Wire Dynamic Safety Field Excellence into HB Homepage and Prove Preview Fallback

You are working in a fresh local code-agent session inside the live `RMF112018/hb-intel` repository.

Use `main` as authoritative repo truth unless the operator explicitly tells you to work from a feature branch.

## Objective

Wire the updated **Safety Field Excellence** dynamic surface into the **HB Intel Homepage** runtime so that the homepage can actually pass the Function App base URL and token provider into the Safety zone, and so the polished **preview fallback** renders when no published Safety Field Excellence data is available.

This is a wiring/remediation wave, not a backend feature wave and not a UI redesign wave.

## Current Problem

Wave 05 and Wave 06 added the dynamic adapter, source modes, preview fallback, runtime proof, and UI/UX hardening.

However, current repo/package evidence indicates the HB Homepage shell is not yet fully passing the required Function App wiring into the `SafetyFieldExcellenceZone`.

Known current seams:

- `SafetyFieldExcellenceZone` expects:
  - `functionAppBaseUrl`
  - `getFunctionAppToken`
  - `moduleConfig.safetyFieldExcellenceDynamic`
- `HbHomepageZoneProps` includes `getFunctionAppToken` and `functionAppBaseUrl`.
- `HbHomepageProps` currently includes `getApiToken`, but not necessarily a dedicated `getFunctionAppToken` / `functionAppBaseUrl` path all the way through the wrapper/shell.
- `HbHomepageShell` currently builds `zoneProps` without forwarding Function App token/base URL into child zones.
- `mount.tsx` creates `getApiToken` from backend audience for legacy PnP mode and passes that to `HbHomepage`, but the Safety zone expects `getFunctionAppToken`, not `getApiToken`.

Result: the packaged homepage can contain the dynamic Safety code and still render curated/empty behavior because the dynamic provider is unconfigured. The preview fallback must be reachable through the actual `hb-intel-homepage` hosted runtime.

## Hard Requirements

Implement the missing homepage runtime wiring so:

1. `HbHomepage` receives a Function App base URL and token provider.
2. `HbHomepageShell` forwards them to `HbHomepageZoneProps`.
3. `SafetyFieldExcellenceZone` passes them into `SafetyFieldExcellenceDynamicProvider`.
4. `SafetyFieldExcellenceDynamicProvider` can call:
   `GET /api/safety-field-excellence/homepage/current`
5. If that endpoint returns no published data, or dynamic data is unavailable in `dynamic-only`, the preview fallback renders.
6. Runtime proof confirms the behavior through:
   `window.__hbIntel_safetyFieldExcellenceRuntimeProof`
7. The generated `.sppkg` contains the corrected homepage wiring and preview fallback strings.
8. No backend routes, timer behavior, publish workflow, scoring, or approval UI are changed.

## Files to Inspect First

Do not re-read files still in current context.

Inspect current repo truth:

```text
apps/hb-webparts/src/mount.tsx
apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts
apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx
apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDataAdapter.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePreviewFallback.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceRuntimeProof.ts
apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json
apps/hb-webparts/config/package-solution.json
tools/build-spfx-package.ts
```

## Required Implementation

### 1. Add explicit Function App wiring to `HbHomepageProps`

In `hbHomepageContract.ts`, add or confirm:

```ts
export interface HbHomepageProps {
  // existing props
  getFunctionAppToken?: () => Promise<string>;
  functionAppBaseUrl?: string;
}
```

Do not remove `getApiToken` if it is still used by PnP Ops or other legacy paths.

The Safety dynamic adapter should use `getFunctionAppToken`, not `getApiToken`.

### 2. Forward Function App wiring through the wrapper and shell

`HbHomepage.tsx` and `HbHomepageEntryStack.tsx` should continue to pass props through unchanged.

In `HbHomepageShell.tsx`, destructure and pass these through into `zoneProps`:

```ts
export function HbHomepageShell({
  config,
  identity,
  assetBaseUrl,
  siteUrl,
  getGraphToken,
  getFunctionAppToken,
  functionAppBaseUrl,
  container,
  shellRef,
}: HbHomepageProps & { ... }): React.JSX.Element {
  ...
  const zoneProps: HbHomepageZoneProps = {
    moduleConfig,
    identity,
    assetBaseUrl,
    siteUrl,
    getGraphToken,
    getFunctionAppToken,
    functionAppBaseUrl,
    profilePhotoResolver,
  };
}
```

This is the likely missing runtime wiring.

### 3. Correct `mount.tsx` token/base URL creation

In `apps/hb-webparts/src/mount.tsx`, create a dedicated Function App token provider from webpart properties.

Preferred property names:

```ts
functionAppBaseUrl
functionAppAudience
```

Accept existing legacy fallback names if already used in the tenant, but document them:

```ts
backendAudience
```

Recommended behavior:

```ts
const functionAppBaseUrl =
  typeof webPartProperties?.functionAppBaseUrl === 'string'
    ? webPartProperties.functionAppBaseUrl.trim()
    : typeof (webPartProperties?.safetyFieldExcellenceDynamic as any)?.functionAppBaseUrl === 'string'
      ? (webPartProperties.safetyFieldExcellenceDynamic as any).functionAppBaseUrl.trim()
      : undefined;

const functionAppAudience =
  typeof webPartProperties?.functionAppAudience === 'string'
    ? webPartProperties.functionAppAudience.trim()
    : typeof webPartProperties?.backendAudience === 'string'
      ? webPartProperties.backendAudience.trim()
      : '';
```

Create:

```ts
const getFunctionAppToken = functionAppAudience
  ? createApiTokenProvider(spfxContext, functionAppAudience)
  : undefined;
```

Pass these to `HbHomepage`:

```ts
[HB_HOMEPAGE_WEBPART_ID]: ({
  config,
  identity,
  assetBaseUrl,
  siteUrl,
  getGraphToken,
  getFunctionAppToken,
  functionAppBaseUrl,
}) =>
  createElement(HbHomepage, {
    config,
    identity,
    assetBaseUrl,
    siteUrl,
    getGraphToken,
    getFunctionAppToken,
    functionAppBaseUrl,
  }),
```

And pass them from `mount(...)` into `renderWebPart(...)`.

Do not rely on the PnP legacy `getApiToken` path for Safety Field Excellence.

### 4. Ensure homepage config activates dynamic/preview behavior

The preview fallback will not render if the source mode remains `curated-only`.

Implement or document the HBCentral homepage configuration needed to activate preview fallback.

For a fallback-preview-first state, use:

```json
{
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

When `GET /api/safety-field-excellence/homepage/current` returns `state: "no-published-highlight"`, the rendered Safety Field Excellence zone must show the polished preview fallback, not an empty state.

For production cutover after proof, the preferred mode remains:

```json
{
  "safetyFieldExcellenceDynamic": {
    "sourceMode": "dynamic-with-curated-fallback",
    "functionAppBaseUrl": "https://<function-app-host>",
    "includeStale": false,
    "diagnosticsEnabled": false,
    "emergencyUseCuratedFallback": false,
    "safetyHubUrl": "https://hedrickbrotherscom.sharepoint.com/sites/Safety"
  }
}
```

But for the immediate requirement — proving the preview surface renders when data is unavailable — use `dynamic-only` on a controlled page or test configuration.

### 5. Add a runtime proof field if needed

If existing proof is sufficient, do not change it.

If helpful, add only non-sensitive fields such as:

```ts
functionAppBaseUrlConfigured: boolean;
functionAppTokenProviderConfigured: boolean;
```

Do not add:
- tokens
- payload JSON
- raw checklist data
- raw findings
- employee detail

### 6. Add tests for the missing wiring

Add or update tests to prove:

#### `HbHomepageShell`

- receives `getFunctionAppToken` and `functionAppBaseUrl`
- passes both into `zoneProps`
- `SafetyFieldExcellenceZone` receives them

#### `mount.tsx`

- creates `getFunctionAppToken` from `functionAppAudience`
- passes `functionAppBaseUrl` and `getFunctionAppToken` into the HB Homepage renderer
- does not require PnP legacy mode for Safety Field Excellence token creation
- still preserves existing `getApiToken` behavior for PnP Ops

#### `SafetyFieldExcellenceDynamicProvider`

- with `sourceMode: "dynamic-only"` and no published data, renders preview fallback
- with missing function app config in `dynamic-only`, renders preview/error fallback, not empty state
- with `no-published-highlight`, runtime proof shows:
  - `sourceMode: "dynamic-only"`
  - `dataSource: "preview-fallback"`
  - `state: "no-published-highlight"` or resolved preview state
  - `previewFallbackRendered: true`

#### Package guard

- bundled package contains:
  - `__hbIntel_safetyFieldExcellenceRuntimeProof`
  - `/api/safety-field-excellence/homepage/current`
  - `dynamic-only`
  - preview fallback strings
- bundled package does not contain homepage calls to:
  - `/rollup/dry-run`
  - `/rollup/generate`
  - `/candidates`
  - `/approve`
  - `/publish`

### 7. Versioning

Because this changes deployed HB Homepage runtime wiring, bump the relevant manifest/package versions according to repo policy.

At minimum evaluate:

```text
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json
apps/hb-webparts/config/package-solution.json
```

Expected likely versioning:

- bump `HbHomepageWebPart` because the homepage shell/wrapper wiring changed
- bump package-solution if repo policy requires it
- bump `SafetyFieldExcellenceWebPart` only if its source or manifest changes

Do not bump unrelated manifests.

## Validation Commands

Use repo-correct commands. Suggested:

```bash
git status --short
pnpm --filter @hbc/spfx-hb-webparts check-types
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/features-safety check-types
pnpm --filter @hbc/functions check-types
pnpm exec vitest run --config vitest.config.ts apps/hb-webparts/src/webparts/safetyFieldExcellence
pnpm exec vitest run --config vitest.config.ts apps/hb-webparts/src/webparts/hbHomepage
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

If the exact vitest paths differ, use repo-correct targeted test commands.

## Package Truth Proof

After packaging, prove the `.sppkg` contains the corrected wiring.

Required-present string checks:

```text
__hbIntel_safetyFieldExcellenceRuntimeProof
/api/safety-field-excellence/homepage/current
dynamic-only
dynamic-with-curated-fallback
Weekly Safety Excellence Preview
Live data temporarily unavailable
getFunctionAppToken
functionAppBaseUrl
```

Required-absent production bundle checks:

```text
/safety-field-excellence/rollup/dry-run
/safety-field-excellence/rollup/generate
/candidates
/approve
/publish
/suppress
/rollback
RawChecklistJson
rawChecklistJson
```

Also inspect the generated bundle around the `HbHomepage` mount. The corrected package should clearly pass Function App base URL/token provider through the homepage path.

## Hosted Runtime Proof

On a controlled HBCentral test page or controlled homepage configuration, set:

```json
"safetyFieldExcellenceDynamic": {
  "sourceMode": "dynamic-only",
  "functionAppBaseUrl": "https://<function-app-host>",
  "includeStale": false,
  "diagnosticsEnabled": false,
  "emergencyUseCuratedFallback": false,
  "safetyHubUrl": "https://hedrickbrotherscom.sharepoint.com/sites/Safety"
}
```

When no published highlight exists, verify the preview fallback renders.

Browser console proof:

```js
JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
```

Expected proof pattern when no data is available:

```json
{
  "sourceMode": "dynamic-only",
  "dataSource": "preview-fallback",
  "previewFallbackRendered": true,
  "backendFunctionAppUrlConfigured": true,
  "currentEndpointConfigured": true,
  "currentEndpointStatus": 200
}
```

If the Function App endpoint is not configured or token provider is missing, the preview/error fallback may still render, but the proof must clearly show the missing config reason.

## Hard Stop Conditions

Do not close this remediation if:

- `HbHomepageShell` still does not pass `getFunctionAppToken` and `functionAppBaseUrl` into zone props
- `mount.tsx` still only creates `getApiToken` and never creates a Safety/Function App token provider
- preview fallback cannot be rendered through the `hb-intel-homepage` path
- runtime proof is missing
- source mode remains effectively `curated-only` in the tested config
- package proof shows stale bundle content
- homepage calls admin/control-plane endpoints
- raw Safety data appears in frontend bundle/render/proof
- MSAL is introduced into SPFx
- no rollback path exists

## Required Closure Report

Return:

```md
# Safety Field Excellence Homepage Wiring Closure Report

## Summary

## Root Cause

Explain the missing wiring between mount/HbHomepage/HbHomepageShell/SafetyFieldExcellenceZone.

## Files Inspected

## Files Changed

## Wiring Implemented

Confirm:
- mount creates `getFunctionAppToken`
- mount passes `functionAppBaseUrl`
- HbHomepageProps carries both
- HbHomepageShell forwards both into zoneProps
- SafetyFieldExcellenceZone receives both
- Dynamic provider can call `homepage/current`

## Preview Fallback Proof

Confirm the preview fallback renders when no data is available.

## Runtime Proof

Paste expected or actual:

```js
JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
```

## Package Truth

Include:
- `.sppkg` path
- SHA256
- manifest/package versions
- required-present strings
- required-absent strings

## Validation Results

Include exact commands and pass/fail results.

## Hosted / Local Proof

Separate:
- local/package proof
- hosted SharePoint proof
- operator-pending evidence, if any

## Versioning Decision

## Rollback

Confirm source mode can be reset to `curated-only` and prior package can be redeployed.

## Out of Scope Confirmed

Confirm no backend route/timer/publish/scoring changes.

## Final Status

State one:
- ready for hosted validation
- hosted preview fallback proven
- blocked, with exact blocker
```

## Commit Guidance

Use a commit title like:

```text
HbHomepageWebPart <next-version>: wire safety field excellence dynamic preview fallback
```

Commit body should mention:

- Function App token/base URL passed through homepage runtime
- Safety zone dynamic provider now configured from HB Homepage
- preview fallback proven for no published data
- package truth proof
- no backend changes
- no scoring changes
- no admin endpoint calls
