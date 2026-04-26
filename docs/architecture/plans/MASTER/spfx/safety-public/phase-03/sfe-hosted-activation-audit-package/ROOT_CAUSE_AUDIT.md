# Safety Field Excellence Hosted Activation — Root Cause Audit

## Executive Summary

The hosted HB Central homepage issue is best classified as a **SharePoint page/webpart configuration activation defect**, not a frontend component defect and not a stale deployed bundle defect.

The hosted runtime proof already shows:

```json
{
  "sourceMode": "curated-only",
  "dataSource": "curated",
  "backendFunctionAppUrlConfigured": false,
  "currentEndpointConfigured": false,
  "previewFallbackRendered": false,
  "safetyFieldExcellenceDynamicConfigSeen": false,
  "safetyFieldExcellenceDynamicConfigResolved": false
}
```

That combination is decisive under the requested decision tree:

- The Safety zone is rendering.
- The loaded homepage app bundle contains the dynamic Safety implementation markers.
- The Safety zone did **not** receive a `safetyFieldExcellenceDynamic` block through `moduleConfig`.
- Because the dynamic block was not present, the zone defaulted to `curated-only` and rendered the legacy curated empty state.

## Confirmed Root Cause

The active HB Homepage webpart instance on the hosted page is not delivering a usable `safetyFieldExcellenceDynamic` configuration block to `SafetyFieldExcellenceZone`.

Most likely tenant-level forms of the same root cause:

1. The active page/webpart properties do not contain `safetyFieldExcellenceDynamic` at all.
2. The block exists in a draft page version that has not been published.
3. The block was placed inside the wrong object/wrapper and is not available as a top-level `webPartProperties.safetyFieldExcellenceDynamic` value.
4. The wrong HB Homepage webpart instance was edited.
5. The operator has no practical property-pane path for configuring this feature and the required JSON has not been persisted.

## Evidence Reviewed

### Hosted Evidence Provided

- Hosted proof object reports `sourceMode: "curated-only"`.
- Hosted proof object reports `safetyFieldExcellenceDynamicConfigSeen: false`.
- Hosted proof object reports `safetyFieldExcellenceDynamicConfigResolved: false`.
- Hosted bundle marker inspection found `hb-homepage-app-2358de33.js` contains:
  - `Weekly Safety Excellence Preview`
  - `dynamic-only`
  - `functionAppBaseUrl`
  - `getFunctionAppToken`
  - `/api/safety-field-excellence/homepage/current`
  - `safetyFieldExcellenceDynamicConfigSeen`
  - `safetyFieldExcellenceDynamicConfigResolved`

### Repo-Truth Evidence Reviewed

Inspected current `main` repo files:

- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDataAdapter.ts`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePreviewFallback.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/wiring/safetyFunctionAppWiring.ts`
- `apps/hb-homepage/src/mount.tsx`
- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `docs/architecture/plans/MASTER/spfx/safety-public/evidence/safety-field-excellence-homepage-wiring-remediation.md`
- `docs/architecture/plans/MASTER/spfx/safety-public/evidence/safety-field-excellence-hosted-activation-defect-runbook.md`
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.previewFallbackRoute.test.tsx`

## Confirmed Facts

### 1. Safety Field Excellence defaults to curated-only when no dynamic config reaches the zone

`SafetyFieldExcellenceZone.tsx` reads:

```ts
const rawDynamicCandidate = (moduleConfig as Record<string, unknown>).safetyFieldExcellenceDynamic;
const safetyFieldExcellenceDynamicConfigSeen = rawDynamicCandidate !== undefined;
const dynamicConfig = readDynamicConfig(moduleConfig);
const safetyFieldExcellenceDynamicConfigResolved = dynamicConfig !== undefined;
const sourceMode: SafetyFieldExcellenceSourceMode =
  dynamicConfig?.sourceMode ?? 'curated-only';
```

This means `safetyFieldExcellenceDynamicConfigSeen: false` directly explains `sourceMode: "curated-only"`.

### 2. The dynamic provider intentionally does nothing dynamic in curated-only mode

`SafetyFieldExcellenceDynamicProvider.tsx` returns the curated path when `props.sourceMode === 'curated-only'`:

```ts
if (props.sourceMode === 'curated-only') {
  const curatedResolution = {
    state: 'idle',
    dataSource: 'curated',
    isStale: false,
  };
  setResolution(curatedResolution);
  publishProof(props, curatedResolution, {});
  return;
}
```

Therefore no backend call, no preview fallback, and no dynamic proof should be expected when the hosted proof reports `curated-only`.

### 3. Preview fallback code exists and is properly labeled

`safetyFieldExcellencePreviewFallback.ts` defines the visible preview title:

```ts
const PREVIEW_HEADING = 'Safety and Field Excellence';
...
primarySpotlight: {
  id: 'safety-excellence-preview',
  title: 'Weekly Safety Excellence Preview',
  ...
}
```

It also uses explicit labels like `Preview — awaiting published weekly data` and avoids fake project recognition.

### 4. The frontend calls only the homepage/current endpoint for this homepage surface

`SafetyFieldExcellenceDataAdapter.ts` defines:

```ts
export const HOMEPAGE_CURRENT_PATH = '/api/safety-field-excellence/homepage/current';
```

The adapter uses delegated bearer token access and explicitly states it does not query raw SharePoint Safety lists directly, does not import backend code, and does not use MSAL.

### 5. The shell passes Function App seams when it receives them

`HbHomepageShell.tsx` destructures `getFunctionAppToken` and `functionAppBaseUrl`, then passes both through `zoneProps`:

```ts
const zoneProps: HbHomepageZoneProps = {
  ...,
  getFunctionAppToken,
  functionAppBaseUrl,
  ...
};
```

This rules out the earlier Wave 07 shell-to-zone wiring gap as the current primary issue.

### 6. The module config schema now allows `safetyFieldExcellenceDynamic`

`shellSchema.ts` includes:

```ts
safetyFieldExcellenceDynamic: z.record(z.unknown()).optional(),
```

`shellValidation.ts` also preserves the same key in the schema-failure fallback path:

```ts
safetyFieldExcellenceDynamic: config.safetyFieldExcellenceDynamic as Record<string, unknown> | undefined,
```

This rules out the former zod-stripping defect as the current primary issue, assuming the current bundle is loaded.

### 7. The mount path can derive Function App URL and token provider from webpart properties

`mount.tsx` passes raw `webPartProperties` into `<HbHomepage config={webPartProperties}>` and derives Function App wiring through `resolveSafetyFunctionAppWiring(...)`.

`safetyFunctionAppWiring.ts` supports:

- top-level `functionAppBaseUrl`
- nested `safetyFieldExcellenceDynamic.functionAppBaseUrl`
- preferred `functionAppAudience`
- legacy `backendAudience`

### 8. The HB Homepage package/manifest version is currently 1.1.77.0 in repo truth

`apps/hb-homepage/config/package-solution.json` and `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` both show `1.1.77.0`.

The manifest `preconfiguredEntries[0].properties` is `{}`, which is correct for avoiding tenant-specific defaults, but it also means the required dynamic configuration must be authored on the page instance.

### 9. The default homepage placement includes Safety Field Excellence

`defaultPreset.ts` places Safety Field Excellence in Row 2:

- band: `band-row-2-communications-newsroom`
- slot: `slot-row-2-safety-field-excellence`
- occupant ID: `safety-field-excellence`
- role: `secondary`
- column span: `minor`
- paired with Company Pulse as the major/right-dominant occupant

This supports the hosted observation that the Safety zone is present and rendering.

### 10. Existing local tests prove the preview fallback through the homepage path

`HbHomepageShell.previewFallbackRoute.test.tsx` proves:

- `dynamic-only` + backend `no-published-highlight` renders preview fallback.
- `dynamic-only` + missing token still renders preview fallback via the unconfigured branch.
- `safetyFieldExcellenceDynamic: null` yields `seen=true`, `resolved=false`, and falls back to `curated-only`.

This is important: the code path can render the preview fallback if the dynamic config is actually delivered.

## Hypotheses Tested

| Hypothesis | Result | Rationale |
|---|---:|---|
| Stale bundle / wrong package | Mostly ruled out by provided hosted marker proof | The loaded `hb-homepage-app-2358de33.js` contains the dynamic markers. Final confirmation should still record app catalog package version and loaded bundle URL. |
| Safety zone not placed in homepage | Ruled out | The hosted page renders the Safety curated empty state, and default preset includes occupant `safety-field-excellence`. |
| Shell drops dynamic config via schema | Ruled out in current repo truth | `ModuleConfigSlicesSchema` and fallback both include `safetyFieldExcellenceDynamic`. |
| Shell does not pass Function App seams | Ruled out in current repo truth | `HbHomepageShell` forwards `getFunctionAppToken` and `functionAppBaseUrl`. |
| Mount cannot resolve Function App URL/audience | Ruled out in current repo truth, if configured | `resolveSafetyFunctionAppWiring` supports expected top-level and nested URL plus `functionAppAudience`/`backendAudience`. |
| Backend endpoint failure is causing curated empty state | Ruled out for current hosted symptom | Runtime proof shows dynamic config was not seen; frontend never attempted the dynamic endpoint. |
| No published weekly data is causing curated empty state | Ruled out for current hosted symptom | No published data should produce preview fallback when dynamic mode is active; current proof says dynamic mode is not active. |
| Page/webpart config missing or wrong | Confirmed class of root cause | `ConfigSeen: false` is the exact diagnostic for missing key at the zone module config layer. |

## Contributing Causes

1. **No tenant-specific defaults in manifest.** The manifest intentionally has empty properties, so the page instance must carry all dynamic settings.
2. **Property pane support appears incomplete.** Repo search did not find property pane fields for `functionAppBaseUrl`, `functionAppAudience`, or `safetyFieldExcellenceDynamic` in the HB Homepage webpart path. This makes activation dependent on raw JSON/page property editing.
3. **Page instance state can drift independently from package state.** A correct `.sppkg` does not update existing webpart instance properties.
4. **Dynamic preview fallback is opt-in.** `curated-only` remains the safe default, so missing config will intentionally render the curated path.

## Ruled-Out Causes

The following should not be treated as the primary fix path unless new evidence contradicts the current runtime proof:

- Backend scoring or ranking logic.
- Weekly timer/publish workflow logic.
- Admin approval UI logic.
- Direct Safety list aggregation from SPFx.
- MSAL/token library changes inside SPFx.
- Rebuilding the SafetyFieldExcellence component itself.
- Changing the preview fallback copy.
- Changing the default shell layout.

## Files Responsible for Config/Wiring Behavior

| File | Responsibility | Audit Finding |
|---|---|---|
| `SafetyFieldExcellenceZone.tsx` | Reads `safetyFieldExcellenceDynamic`; defaults to `curated-only` | Current runtime proof indicates this file did not receive the key. |
| `SafetyFieldExcellenceDynamicProvider.tsx` | Fetch/fallback state machine and runtime proof | Behaves correctly for `curated-only`; does not fetch or preview unless dynamic mode is active. |
| `SafetyFieldExcellenceDataAdapter.ts` | Calls `/api/safety-field-excellence/homepage/current` only | Not reached in current hosted symptom. |
| `safetyFieldExcellencePreviewFallback.ts` | Builds labeled preview config | Preview fallback exists and is appropriate. |
| `HbHomepageShell.tsx` | Extracts module config and forwards zone props | Current repo truth forwards config and seams. |
| `shellSchema.ts` / `shellValidation.ts` | Allows/preserves module config slices | Current repo truth preserves `safetyFieldExcellenceDynamic`. |
| `mount.tsx` | Reads webpart properties and derives token/base URL seams | Current repo truth supports expected properties. |
| `safetyFunctionAppWiring.ts` | Pure helper for Function App URL/audience | Current repo truth supports top-level/nested URL and preferred/legacy audience. |
| `ShellWebPart.ts` | SPFx host passes `this.properties` to mount | Current repo truth passes `webPartProperties` into runtime config. |
| `HbHomepageWebPart.manifest.json` | Default webpart properties | Empty `{}`; no dynamic defaults, so tenant page config is required. |

## Hosted Evidence Interpretation

Given the hosted proof:

```json
"sourceMode": "curated-only",
"safetyFieldExcellenceDynamicConfigSeen": false,
"safetyFieldExcellenceDynamicConfigResolved": false
```

The current production page never entered any dynamic Safety Field Excellence source mode. The reason is upstream of backend access, endpoint response, scoring, and preview rendering.

The active defect is: **the hosted page instance lacks a correctly persisted dynamic configuration block at the level consumed by the homepage runtime.**

## Risk Classification

- **Severity:** Medium operational visibility defect.
- **Safety/business impact:** Low to medium. No unsafe data mutation or backend publish behavior is implicated. The risk is inaccurate or stale homepage communication.
- **Deployment risk:** Low if fixed via page configuration first.
- **Code-change risk:** Moderate if property pane/admin configuration support is added, because it touches the generic SPFx shell property pane and homepage activation workflow.
- **Rollback path:** Set `sourceMode: "curated-only"` or remove `safetyFieldExcellenceDynamic` from the active page webpart properties, then save and publish.

## Final Root Cause

The dynamic Safety Field Excellence implementation is present in the hosted bundle, but the active HB Homepage webpart instance is still configured as if no dynamic Safety configuration exists. The runtime therefore defaults to `curated-only` and renders the legacy curated empty state. The required fix is to update and publish the active HB Homepage page/webpart properties with a valid `safetyFieldExcellenceDynamic` block plus Function App URL/audience settings, then validate with runtime proof and DOM/network checks.
