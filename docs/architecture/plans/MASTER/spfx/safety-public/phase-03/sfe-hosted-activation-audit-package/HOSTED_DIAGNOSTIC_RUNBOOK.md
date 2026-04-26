# Safety Field Excellence Hosted Activation — Diagnostic Runbook

## Purpose

Use this runbook on the live HBCentral homepage to prove exactly where Safety Field Excellence activation is failing.

The current evidence points to missing or incorrectly persisted HB Homepage webpart properties. This runbook is designed to confirm that without guessing.

## Required Page

Run these commands from the hosted HBCentral homepage where the HB Homepage webpart is actually rendering.

Recommended browser state:

- Use an incognito/private window.
- Sign in as a normal authenticated user first, then repeat as an admin/operator if needed.
- Open DevTools before reload so network evidence is captured.
- Disable cache in DevTools while DevTools is open.

## 1. Runtime Proof

Run:

```js
JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
```

### Expected pass state for controlled `dynamic-only` proof with no published data

```json
{
  "sourceMode": "dynamic-only",
  "dataSource": "preview-fallback",
  "state": "preview",
  "backendFunctionAppUrlConfigured": true,
  "currentEndpointConfigured": true,
  "previewFallbackRendered": true,
  "safetyFieldExcellenceDynamicConfigSeen": true,
  "safetyFieldExcellenceDynamicConfigResolved": true
}
```

### Interpretation

| Runtime proof value | Meaning | Action |
|---|---|---|
| `safetyFieldExcellenceDynamicConfigSeen: false` | Active page config did not deliver the dynamic block to the Safety zone. | Inspect `CanvasContent1`; fix page/webpart properties. |
| `ConfigSeen: true`, `ConfigResolved: false` | Key exists but value is malformed, `null`, stringified, or wrong shape. | Replace with canonical object JSON. |
| `ConfigResolved: true`, `backendFunctionAppUrlConfigured: false` | Dynamic block exists but Function App URL is absent. | Add `functionAppBaseUrl` top-level or nested. |
| `backendFunctionAppUrlConfigured: true`, `currentEndpointConfigured: false` | Base URL exists but no token provider was created. | Add `functionAppAudience` or legacy `backendAudience`. |
| `currentEndpointConfigured: true`, endpoint returns 401/403 | Auth/audience/API permission defect. | Validate Function App Entra app registration and delegated access. |
| `dataSource: "preview-fallback"`, `previewFallbackRendered: true` | Preview fallback path is working. | Controlled proof passes. |
| `dataSource: "dynamic"`, `state: "ready"` | Published data is rendering. | Production path passes. |

## 2. Loaded Bundle Marker Proof

Run:

```js
Promise.all(
  [...new Set(
    performance.getEntriesByType("resource")
      .map(e => e.name)
      .filter(src => /\.js(\?|$)/i.test(src))
  )].map(async (src) => {
    const text = await fetch(src, { cache: "no-store" }).then(r => r.text()).catch(() => "");
    return {
      src,
      length: text.length,
      hasOldEmptyState: text.includes("No safety and field excellence items configured"),
      hasPreview: text.includes("Weekly Safety Excellence Preview"),
      hasDynamicOnly: text.includes("dynamic-only"),
      hasFunctionAppBaseUrl: text.includes("functionAppBaseUrl"),
      hasFunctionAppToken: text.includes("getFunctionAppToken"),
      hasCurrentEndpoint: text.includes("/api/safety-field-excellence/homepage/current"),
      hasConfigSeen: text.includes("safetyFieldExcellenceDynamicConfigSeen"),
      hasConfigResolved: text.includes("safetyFieldExcellenceDynamicConfigResolved")
    };
  })
).then(rows => console.table(rows.filter(r =>
  r.hasOldEmptyState ||
  r.hasPreview ||
  r.hasDynamicOnly ||
  r.hasCurrentEndpoint ||
  /hb-homepage|homepage|e0a11c44/i.test(r.src)
)));
```

### Pass criteria

For the `hb-homepage-app-<hash>.js` bundle:

- `hasPreview: true`
- `hasDynamicOnly: true`
- `hasFunctionAppBaseUrl: true`
- `hasFunctionAppToken: true`
- `hasCurrentEndpoint: true`
- `hasConfigSeen: true`
- `hasConfigResolved: true`

### Fail interpretation

If these are false in the homepage app bundle, the root cause shifts from page config to stale app catalog/cache/wrong package deployment.

## 3. Page Canvas / Webpart Properties Inspection

Run:

```js
(async () => {
  const pageUrl = _spPageContextInfo.serverRequestPath;
  const apiUrl =
    `${_spPageContextInfo.webAbsoluteUrl}/_api/web/GetFileByServerRelativeUrl('${pageUrl}')/ListItemAllFields?$select=CanvasContent1`;

  const data = await fetch(apiUrl, {
    headers: { Accept: "application/json;odata=nometadata" }
  }).then(r => r.json());

  const canvas = JSON.parse(data.CanvasContent1 || "[]");

  const matches = canvas
    .filter(c => JSON.stringify(c).includes("HbHomepageWebPart") || JSON.stringify(c).includes("e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf"))
    .map(c => ({
      id: c.id,
      controlType: c.controlType,
      webPartId: c.webPartId || c.webPartData?.id,
      title: c.webPartData?.title,
      properties: c.webPartData?.properties
    }));

  console.log(matches);
})();
```

### Required properties

The active HB Homepage webpart instance must include, at minimum:

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

### Inspect for these defects

- `safetyFieldExcellenceDynamic` missing entirely.
- `safetyFieldExcellenceDynamic` present but stored as a string instead of object.
- `safetyFieldExcellenceDynamic` present as `null`.
- Config nested under an unrelated wrapper such as `config`, `moduleConfig`, `homepageConfig`, or `properties.config`.
- Config exists on a different HB Homepage webpart instance than the one rendering the page.
- Function App URL only exists in a field not supported by `resolveSafetyFunctionAppWiring`.
- Audience exists under a non-supported field name instead of `functionAppAudience` or `backendAudience`.

## 4. Identify the Active HB Homepage Webpart Instance

Use this helper after the canvas command:

```js
(async () => {
  const pageUrl = _spPageContextInfo.serverRequestPath;
  const apiUrl = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/GetFileByServerRelativeUrl('${pageUrl}')/ListItemAllFields?$select=CanvasContent1`;
  const data = await fetch(apiUrl, { headers: { Accept: "application/json;odata=nometadata" } }).then(r => r.json());
  const canvas = JSON.parse(data.CanvasContent1 || "[]");
  const rows = canvas.map((c, idx) => ({
    index: idx,
    id: c.id,
    webPartId: c.webPartId || c.webPartData?.id,
    title: c.webPartData?.title,
    hasHbHomepageId: JSON.stringify(c).includes("e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf"),
    hasDynamicConfig: JSON.stringify(c).includes("safetyFieldExcellenceDynamic"),
    topLevelKeys: c.webPartData?.properties ? Object.keys(c.webPartData.properties) : []
  }));
  console.table(rows.filter(r => r.hasHbHomepageId || r.hasDynamicConfig));
})();
```

Pass condition:

- Exactly one active HB Homepage webpart instance is found, or if multiple exist, the rendered/live instance is clearly identified.
- The active instance has the dynamic properties.

## 5. Draft vs Published State Verification

Use SharePoint page UI first:

1. Edit the homepage.
2. Confirm whether the page shows unpublished changes.
3. Save as draft if needed.
4. Republish the page.
5. Hard refresh or reload in incognito.
6. Re-run the runtime proof and canvas inspection.

Console helper to inspect common page item metadata:

```js
(async () => {
  const pageUrl = _spPageContextInfo.serverRequestPath;
  const apiUrl =
    `${_spPageContextInfo.webAbsoluteUrl}/_api/web/GetFileByServerRelativeUrl('${pageUrl}')/ListItemAllFields` +
    `?$select=Id,Title,FileRef,Modified,Editor/Title,Editor/EMail,OData__UIVersionString,PromotedState,CheckoutUser/Title&$expand=Editor,CheckoutUser`;
  const data = await fetch(apiUrl, {
    headers: { Accept: "application/json;odata=nometadata" }
  }).then(r => r.json());
  console.log(data);
})();
```

Interpretation:

- Check whether the page is checked out.
- Check version string after publish.
- Confirm the editor/modified timestamp updated after config save.

## 6. Network Proof

In DevTools Network, filter:

```text
safety-field-excellence
```

Expected when dynamic mode is active and configured:

```text
GET /api/safety-field-excellence/homepage/current
```

Not expected from homepage:

```text
/rollup/dry-run
/rollup/generate
/candidates
/approve
/publish
/suppress
/rollback
```

### Network interpretation

| Observation | Meaning | Action |
|---|---|---|
| No request to `/homepage/current` and runtime proof says `curated-only` | Dynamic config not active. | Fix page config. |
| No request and `sourceMode: dynamic-only` but `currentEndpointConfigured: false` | Token provider missing. | Add `functionAppAudience`. |
| Request returns 200 with `no-published-highlight` | Preview fallback should render. | Check DOM/proof. |
| Request returns 200 with `published` | Dynamic published data should render. | Check DOM/proof. |
| Request returns 401/403 | Auth/audience/API permission issue. | Validate Entra/API permissions. |
| Request returns 500 | Backend endpoint defect. | Escalate backend logs. |

## 7. Preview DOM Proof

Run after page load:

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

Pass state for controlled preview:

```json
{
  "found": true,
  "preview": "true",
  "fallbackReason": "preview"
}
```

Visible text should contain:

- `Weekly Safety Excellence Preview`
- `Preview — awaiting published weekly data`

## 8. App Catalog / Package Version Proof

Record from SharePoint app catalog:

- package name: `hb-intel-homepage.sppkg`
- deployed version: expected `1.1.77.0`
- upload timestamp
- app catalog approval/deployment status

Repo truth indicates `apps/hb-homepage/config/package-solution.json` and the HB Homepage manifest are currently `1.1.77.0`.

## 9. Root-Cause Decision Tree

1. If loaded bundle lacks dynamic markers:
   - root cause = stale app catalog / cache / wrong bundle deployment
   - solution = redeploy correct `.sppkg`, clear cache, prove package/runtime alignment

2. If loaded bundle has dynamic markers but runtime proof says `safetyFieldExcellenceDynamicConfigSeen: false`:
   - root cause = page/webpart config missing or saved at wrong level
   - solution = update active HB Homepage webpart properties and publish page

3. If `ConfigSeen: true` but `ConfigResolved: false`:
   - root cause = malformed config or schema/readDynamicConfig defect
   - solution = correct config shape or patch schema/reader

4. If `ConfigResolved: true` but `backendFunctionAppUrlConfigured: false`:
   - root cause = missing Function App base URL
   - solution = add top-level or supported nested `functionAppBaseUrl`

5. If endpoint configured but `currentEndpointConfigured: false`:
   - root cause = missing token provider / functionAppAudience
   - solution = add `functionAppAudience` or supported `backendAudience`

6. If endpoint call returns 401/403:
   - root cause = backend auth / API permission / token audience issue
   - solution = validate Function App app registration/API permissions and `homepage/current` auth

7. If endpoint returns `no-published-highlight` but preview does not render:
   - root cause = provider/mapper/render defect
   - solution = targeted frontend remediation

## 10. Evidence Capture Template

Copy this into the closure note:

```md
# Hosted Safety Field Excellence Activation Evidence

## Page
- URL:
- User context:
- Browser/session:
- Date/time:

## Package / Bundle
- App catalog version:
- Loaded `hb-homepage-app-*.js` URL:
- Marker proof result:

## Runtime Proof
```json
<paste runtime proof>
```

## Canvas/Webpart Config
- Active HB Homepage webpart ID:
- Top-level property keys:
- `safetyFieldExcellenceDynamic` present: yes/no
- `functionAppBaseUrl` present: yes/no
- `functionAppAudience` or `backendAudience` present: yes/no

## Network Proof
- `/homepage/current` called: yes/no
- Status:
- Response state:

## DOM Proof
- Surface found: yes/no
- Preview attribute:
- Fallback reason:
- Visible preview text present: yes/no

## Conclusion
- Root cause branch:
- Fix applied:
- Validation outcome:
```
