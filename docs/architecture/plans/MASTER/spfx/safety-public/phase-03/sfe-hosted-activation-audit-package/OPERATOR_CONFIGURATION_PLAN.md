# Safety Field Excellence Hosted Activation — Operator Configuration Plan

## Objective

Activate Safety Field Excellence dynamic mode on the active HBCentral HB Homepage webpart instance so the homepage renders either:

- published weekly Safety Field Excellence data; or
- the labeled `Weekly Safety Excellence Preview` fallback when no published weekly data exists.

The current hosted proof indicates the active webpart instance is still in `curated-only` because the page config is not delivering `safetyFieldExcellenceDynamic` to the zone.

## Configuration Modes

### Controlled proof mode

Use this first to prove the preview fallback path:

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

### Safer production cutover mode

Use this after proof passes:

```json
{
  "functionAppBaseUrl": "https://<function-app-host>",
  "functionAppAudience": "<api-audience-or-client-id-uri>",
  "safetyFieldExcellenceDynamic": {
    "sourceMode": "dynamic-with-curated-fallback",
    "includeStale": false,
    "diagnosticsEnabled": false,
    "emergencyUseCuratedFallback": false,
    "safetyHubUrl": "https://hedrickbrotherscom.sharepoint.com/sites/Safety"
  }
}
```

### Supported nested URL alternative

If the operator prefers to keep the URL inside the Safety block, this is supported by repo truth:

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

Top-level `functionAppBaseUrl` is preferred for clarity.

## Values to Fill In

| Field | Required | Notes |
|---|---:|---|
| `functionAppBaseUrl` | Yes for live endpoint call | Base URL only, no trailing `/api/safety-field-excellence/homepage/current`. |
| `functionAppAudience` | Yes for token provider | Preferred over legacy `backendAudience`. |
| `safetyFieldExcellenceDynamic.sourceMode` | Yes | Use `dynamic-only` only for controlled proof. |
| `includeStale` | Recommended | Use `false` for production unless intentionally showing stale highlight. |
| `diagnosticsEnabled` | Optional | Use `false` unless debugging. |
| `emergencyUseCuratedFallback` | Optional | Use `false` during proof so preview fallback is visible. |
| `safetyHubUrl` | Recommended | Enables CTA to Safety hub. |

## Where to Place the JSON

The required keys must be stored on the **active HB Homepage webpart instance properties**. They must be visible in `CanvasContent1` at:

```text
webPartData.properties.functionAppBaseUrl
webPartData.properties.functionAppAudience
webPartData.properties.safetyFieldExcellenceDynamic
```

Do not place the block only under:

```text
webPartData.properties.config.safetyFieldExcellenceDynamic
webPartData.properties.moduleConfig.safetyFieldExcellenceDynamic
webPartData.properties.homepageConfig.safetyFieldExcellenceDynamic
webPartData.properties.safetyFieldExcellence.safetyFieldExcellenceDynamic
```

Those wrappers are not the shape currently read by `extractModuleConfigSlices(config)` and `SafetyFieldExcellenceZone`.

## Step-by-Step Activation

### 1. Confirm package version

In the SharePoint app catalog, confirm:

- package: `hb-intel-homepage.sppkg`
- version: `1.1.77.0`

If the app catalog version is not `1.1.77.0`, redeploy the current package before proceeding.

### 2. Inspect current active webpart properties

On the hosted homepage, run the `CanvasContent1` command from `HOSTED_DIAGNOSTIC_RUNBOOK.md`.

Confirm whether the active HB Homepage instance has:

- `safetyFieldExcellenceDynamic`
- `functionAppBaseUrl` or nested dynamic `functionAppBaseUrl`
- `functionAppAudience` or legacy `backendAudience`

### 3. Edit the active HB Homepage webpart

Use the available tenant-supported method:

- SharePoint page edit mode property pane, if it exposes JSON properties; or
- PnP/CLI page property update process approved for the tenant; or
- a temporary admin script that updates the active page webpart `webPartData.properties`.

Do not update a different webpart instance.

### 4. Add controlled proof config

Add this block to the active HB Homepage webpart properties:

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

Preserve existing unrelated properties such as Foleon list IDs, Kudos list host URL, priority actions settings, and shell layout settings.

### 5. Save and publish

1. Save the page.
2. Republish the page.
3. Close the editing session.
4. Open the page in an incognito/private window.
5. Hard refresh.

### 6. Confirm config persisted

Run the `CanvasContent1` command again.

Pass condition:

```js
properties.safetyFieldExcellenceDynamic.sourceMode === "dynamic-only"
```

Also confirm:

```js
Boolean(properties.functionAppBaseUrl || properties.safetyFieldExcellenceDynamic?.functionAppBaseUrl) === true
Boolean(properties.functionAppAudience || properties.backendAudience) === true
```

### 7. Confirm runtime proof

Run:

```js
JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
```

Expected for controlled proof:

```json
{
  "sourceMode": "dynamic-only",
  "safetyFieldExcellenceDynamicConfigSeen": true,
  "safetyFieldExcellenceDynamicConfigResolved": true,
  "backendFunctionAppUrlConfigured": true,
  "currentEndpointConfigured": true
}
```

If there is no published highlight yet, also expect:

```json
{
  "dataSource": "preview-fallback",
  "state": "preview",
  "previewFallbackRendered": true,
  "fallbackReason": "no-published-highlight"
}
```

If the endpoint has a published highlight, expect:

```json
{
  "dataSource": "dynamic",
  "state": "ready"
}
```

### 8. Confirm network proof

Filter DevTools Network by:

```text
safety-field-excellence
```

Expected:

```text
GET /api/safety-field-excellence/homepage/current
```

Not expected:

```text
/rollup/dry-run
/rollup/generate
/candidates
/approve
/publish
/suppress
/rollback
```

### 9. Confirm DOM proof

Run:

```js
(() => {
  const surface = document.querySelector('[data-hbc-premium="safety-homepage-surface"]');
  return {
    found: Boolean(surface),
    preview: surface?.getAttribute('data-hbc-safety-preview'),
    fallbackReason: surface?.getAttribute('data-hbc-safety-fallback-reason'),
    text: surface?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 1000)
  };
})();
```

For no published data, expected text includes:

```text
Weekly Safety Excellence Preview
Preview — awaiting published weekly data
```

## Transition to Safer Production Mode

After `dynamic-only` proof passes:

1. Edit the active HB Homepage webpart properties.
2. Change only:

```json
"sourceMode": "dynamic-with-curated-fallback"
```

3. Save and publish.
4. Re-run runtime proof.

Expected:

- If published data exists: `dataSource: "dynamic"`.
- If no published data exists and curated config exists: `dataSource: "curated-fallback"`.
- If no published data exists and no curated config exists: `dataSource: "preview-fallback"`.

## Rollback to Curated-Only

### Option A — explicit rollback

```json
{
  "safetyFieldExcellenceDynamic": {
    "sourceMode": "curated-only"
  }
}
```

### Option B — remove dynamic block

Remove:

```json
"safetyFieldExcellenceDynamic"
```

Then save and publish.

Expected proof:

```json
{
  "sourceMode": "curated-only",
  "dataSource": "curated"
}
```

## Common Failure Patterns

### `ConfigSeen: false` after publishing

Most likely:

- wrong webpart instance edited;
- page not published;
- JSON placed under a wrapper;
- property update script targeted the wrong page URL;
- webpart properties were overwritten by a later edit.

### `ConfigSeen: true`, `ConfigResolved: false`

Most likely:

- `safetyFieldExcellenceDynamic` is `null`;
- `safetyFieldExcellenceDynamic` is a stringified JSON string;
- config pasted into a text field rather than object property;
- array was used instead of object.

### `backendFunctionAppUrlConfigured: false`

Most likely:

- missing `functionAppBaseUrl`;
- URL stored under unsupported key name;
- URL stored only in old `backendUrl` field;
- URL contains only whitespace.

### `currentEndpointConfigured: false`

Most likely:

- missing `functionAppAudience`;
- unsupported audience property name;
- `backendAudience` exists but blank;
- token provider failed to initialize because SPFx context was unavailable.

### 401/403 from endpoint

Most likely:

- Function App app registration audience mismatch;
- user lacks delegated role claim;
- API permissions not granted/admin-consented;
- backend route gate rejects normal homepage users.

## Closure Criteria

Activation can be considered closed when all are true:

- App catalog version confirmed at expected version.
- Loaded bundle marker proof passes.
- Active page `CanvasContent1` contains required config on the active HB Homepage webpart instance.
- Runtime proof reports `ConfigSeen: true` and `ConfigResolved: true`.
- Runtime proof reports `sourceMode: dynamic-only` during controlled proof.
- Runtime proof reports either `previewFallbackRendered: true` or `dataSource: dynamic`.
- Network proof shows only `/api/safety-field-excellence/homepage/current` for this homepage surface.
- Page is saved and published.
- Rollback path is documented.
