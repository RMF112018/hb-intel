# Safety Field Excellence Hosted Activation — Development Remediation Plan

## Remediation Position

Based on current repo-truth and the provided hosted proof, **no frontend code change is required to activate the intended preview fallback**.

The primary fix is an operator configuration fix on the active HB Homepage webpart instance.

However, the audit identifies several optional hardening improvements that should be considered after the immediate hosted activation is proven.

## Current Code State

### Already implemented and working in repo truth

1. `SafetyFieldExcellenceZone` reads `safetyFieldExcellenceDynamic` and publishes `ConfigSeen` / `ConfigResolved` proof fields.
2. `SafetyFieldExcellenceDynamicProvider` handles:
   - `curated-only`
   - `dynamic-only`
   - `dynamic-preview`
   - `dynamic-with-curated-fallback`
   - unconfigured Function App URL/token cases
   - no-published response to preview fallback
   - auth/network/invalid-payload fallbacks
3. `SafetyFieldExcellenceDataAdapter` calls only:
   - `GET /api/safety-field-excellence/homepage/current`
4. `safetyFieldExcellencePreviewFallback` builds clearly labeled preview content.
5. `HbHomepageShell` forwards `functionAppBaseUrl` and `getFunctionAppToken` into zone props.
6. `shellSchema` and `shellValidation` preserve `safetyFieldExcellenceDynamic`.
7. `mount.tsx` passes raw webpart properties into `HbHomepage` and uses `resolveSafetyFunctionAppWiring`.
8. `safetyFunctionAppWiring` supports expected URL/audience locations.
9. Local tests prove the preview fallback through the homepage path.

## Required Immediate Remediation

No source-code remediation should be performed before these tenant actions:

1. Inspect active homepage `CanvasContent1`.
2. Confirm the active HB Homepage webpart properties.
3. Add the required JSON block to the active page webpart instance.
4. Save and publish the page.
5. Re-run runtime proof.
6. Confirm `ConfigSeen: true`, `ConfigResolved: true`.
7. Confirm preview fallback DOM if no published data exists.

## Optional Hardening Improvements

### A. HB Homepage property pane support for Safety dynamic activation

#### Problem

Repo search did not find HB Homepage property pane fields for:

- `functionAppBaseUrl`
- `functionAppAudience`
- `safetyFieldExcellenceDynamic.sourceMode`
- `safetyFieldExcellenceDynamic.includeStale`
- `safetyFieldExcellenceDynamic.safetyHubUrl`
- `safetyFieldExcellenceDynamic.emergencyUseCuratedFallback`

This makes activation dependent on raw page JSON editing.

#### Proposed change

Update `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` inside the `if (webPartId === HB_HOMEPAGE_WEBPART_ID)` property pane branch.

Add a new group after the embedded Foleon settings:

```ts
{
  groupName: 'Safety Field Excellence dynamic source',
  groupFields: [
    PropertyPaneDropdown('safetyFieldExcellenceSourceMode', {
      label: 'Safety Field Excellence source mode',
      options: [
        { key: 'curated-only', text: 'Curated only' },
        { key: 'dynamic-only', text: 'Dynamic only' },
        { key: 'dynamic-with-curated-fallback', text: 'Dynamic with curated fallback' },
        { key: 'dynamic-preview', text: 'Dynamic preview' }
      ]
    }),
    PropertyPaneTextField('functionAppBaseUrl', {
      label: 'Function App base URL',
      placeholder: 'https://<function-app-host>'
    }),
    PropertyPaneTextField('functionAppAudience', {
      label: 'Function App audience',
      placeholder: 'api://<application-id-or-uri>'
    }),
    PropertyPaneToggle('safetyFieldExcellenceIncludeStale', {
      label: 'Include stale published highlight'
    }),
    PropertyPaneToggle('safetyFieldExcellenceEmergencyUseCuratedFallback', {
      label: 'Emergency use curated fallback'
    }),
    PropertyPaneTextField('safetyFieldExcellenceSafetyHubUrl', {
      label: 'Safety hub URL',
      placeholder: 'https://hedrickbrotherscom.sharepoint.com/sites/Safety'
    })
  ]
}
```

Then map these flat property pane fields into `safetyFieldExcellenceDynamic` before calling mount, or add support in `mount.tsx` / runtime config normalization.

#### Preferred implementation approach

Do **not** ask operators to edit a nested object in the property pane. Use flat property fields and normalize them into the nested runtime config.

Add a pure helper:

```text
apps/hb-webparts/src/webparts/hbHomepage/wiring/safetyFieldExcellenceDynamicConfigBridge.ts
```

Responsibilities:

- Read flat property-pane fields.
- Preserve existing nested `safetyFieldExcellenceDynamic` object if present.
- Prefer explicit nested object values when present.
- Create a normalized `safetyFieldExcellenceDynamic` object before passing to `HbHomepage`.
- Never hard-code tenant Function App URL or audience.

Suggested precedence:

1. Existing nested `safetyFieldExcellenceDynamic` values.
2. Flat property-pane fields.
3. No default dynamic activation; preserve `curated-only` unless operator chooses a source mode.

#### Tests

Add tests for:

- flat source mode creates nested object
- nested object wins over flat fields
- missing fields leaves dynamic block undefined
- flat `functionAppBaseUrl` remains top-level for `resolveSafetyFunctionAppWiring`
- flat `functionAppAudience` creates token provider
- no hard-coded URLs in manifest defaults

### B. Hosted activation self-check utility

Add a small diagnostic helper document or script under:

```text
scripts/sharepoint/verify-hb-homepage-safety-activation.mjs
```

Or as a markdown runbook only if no tenant automation should be added.

Inputs:

- page URL
- expected webpart ID
- expected package version

Outputs:

- active webpart instance ID
- top-level property keys
- dynamic config presence
- Function App URL presence only as boolean / redacted origin
- audience presence only as boolean / redacted value
- publish/draft status

Avoid printing tokens, full Function App audience if considered sensitive, or raw response payload.

### C. Runtime proof hardening

Optional additions to `SafetyFieldExcellenceRuntimeProof`:

- `configSource`: `top-level-dynamic-block | nested-url-only | flat-property-bridge | missing`
- `sourceModeReason`: `configured | defaulted-curated-only | malformed-config`
- `activeEndpointPath`: path only, not full URL
- `hasTokenProvider`: boolean

Keep proof non-sensitive.

### D. Documentation update

Add/refresh docs under:

```text

docs/architecture/plans/MASTER/spfx/safety-public/evidence/
```

Recommended files:

- `safety-field-excellence-hosted-activation-operator-guide.md`
- `safety-field-excellence-page-config-reference.md`
- `safety-field-excellence-property-pane-hardening-plan.md`

## Code Change Conditions

Only perform source remediation if one of these hosted proof branches occurs:

### Branch 1: `ConfigSeen: true`, `ConfigResolved: false` for a valid object

If `CanvasContent1` shows a valid object but proof says unresolved:

- Patch `readDynamicConfig(...)` in `SafetyFieldExcellenceZone.tsx` to validate expected `sourceMode` and tolerate supported shapes.
- Add tests for the exact hosted shape.

### Branch 2: `ConfigResolved: true`, `backendFunctionAppUrlConfigured: false` despite supported URL field

If the active properties include top-level `functionAppBaseUrl` or nested `safetyFieldExcellenceDynamic.functionAppBaseUrl` but proof says false:

- Patch `resolveSafetyFunctionAppWiring(...)` or prop forwarding.
- Add regression test using exact hosted config shape.

### Branch 3: endpoint returns `no-published-highlight` but preview does not render

If runtime proof shows dynamic mode active and endpoint returns `no-published-highlight`, but DOM does not show preview:

- Inspect `decideFromOutcome(...)` in `SafetyFieldExcellenceDynamicProvider.tsx`.
- Inspect `buildSafetyExcellencePreviewFallbackConfig(...)`.
- Inspect `SafetyFieldExcellence.tsx` `pickDynamicOrCurated(...)` behavior.
- Add an end-to-end test with the exact backend response body.

### Branch 4: property pane cannot save nested object and no raw JSON editor is available

Implement flat-field bridge described above.

## Required Validation Commands if Code Changes Are Made

Run from repo root unless the package script requires a subdirectory:

```bash
pnpm --filter @hbc/spfx-hb-webparts check-types
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/features-safety check-types
pnpm --filter @hbc/functions check-types
pnpm exec vitest run --config vitest.config.ts src/webparts/safetyFieldExcellence src/webparts/hbHomepage
npx tsx tools/build-spfx-package.ts --domain hb-homepage
```

If repo-correct scripts differ, record the actual commands and results in the closure report.

## Package Proof Requirements if Code Changes Are Made

The final closure must include:

- `hb-intel-homepage.sppkg` path
- package version
- package SHA256
- loaded app bundle filename/hash
- marker proof showing required strings present:
  - `Weekly Safety Excellence Preview`
  - `dynamic-only`
  - `functionAppBaseUrl`
  - `getFunctionAppToken`
  - `/api/safety-field-excellence/homepage/current`
  - `safetyFieldExcellenceDynamicConfigSeen`
  - `safetyFieldExcellenceDynamicConfigResolved`
- forbidden marker proof showing admin endpoints absent from homepage app bundle:
  - `/rollup/dry-run`
  - `/rollup/generate`
  - `/candidates`
  - `/approve`
  - `/publish`
  - `/suppress`
  - `/rollback`

## Rollback

Configuration rollback:

```json
{
  "safetyFieldExcellenceDynamic": {
    "sourceMode": "curated-only"
  }
}
```

Or remove `safetyFieldExcellenceDynamic` entirely from the active page properties.

Code rollback, if optional hardening is added:

1. Revert property pane bridge changes.
2. Rebuild `hb-intel-homepage.sppkg`.
3. Redeploy prior known-good package.
4. Publish page with `curated-only` config or no dynamic config.
5. Confirm runtime proof returns `sourceMode: "curated-only"`.

## Recommended Development Sequence

1. Complete operator configuration proof first.
2. If proof passes, do not touch source code for activation.
3. Create a separate improvement branch for property-pane hardening.
4. Add tests before editing runtime behavior.
5. Build and package.
6. Capture package truth.
7. Deploy to app catalog.
8. Re-run hosted proof.
9. Commit with clear summary and evidence.
