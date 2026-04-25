# HOSTED_ACTIVATION_EVIDENCE — Operator Runbook

Tenant-operator runbook for capturing hosted SharePoint evidence for Safety Field Excellence on HB Central. Hosted/tenant/browser evidence is **OPERATOR-PENDING** until run on the live homepage; package truth alone does not establish runtime truth.

## Step 1 — Runtime proof

Open the live HB Central homepage and run in browser console:

```js
JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
```

Capture the JSON verbatim into the *Runtime proof captured* section below.

## Step 2 — Loaded bundle marker proof

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

## Step 3 — Page canvas inspection

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

## Step 4 — Network filter

In Network tab, filter by:

```
safety-field-excellence
```

Capture: request URL, response status, and (when 200) the JSON body.

## Step 5 — DOM proof

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

## Decision tree

| If runtime proof shows… | Branch | Action |
| --- | --- | --- |
| `safetyFieldExcellenceDynamicConfigSeen: false` AND bundle markers all present | **Page configuration** | Operator must set activation inputs on the webpart instance (raw JSON or new property-pane fields after Prompt 03 ships). No source change. |
| `safetyFieldExcellenceDynamicConfigSeen: true` AND `safetyFieldExcellenceDynamicConfigResolved: false` | **Bad config shape** | Operator config block is malformed; correct the JSON or use property-pane fields. No source change. |
| Bundle markers missing (no `dynamic-only`, no `functionAppBaseUrl`, no `safetyFieldExcellenceDynamicConfigSeen`) | **Stale package** | Republish or wait for CDN/cache to roll. No source change. |
| `backendFunctionAppUrlConfigured: false` after Prompt 03 fields are set | **Property-pane bridge defect** | Defect in `safetyFieldExcellenceDynamicConfigBridge`. Reopen Prompt 03. |
| `currentEndpointConfigured: true`, network 401/403 | **Backend auth / audience mismatch** | Verify `functionAppAudience` matches the Function App registration. Not a UI defect. |
| `currentEndpointConfigured: true`, network 200 with `state: "no-published-highlight"`, but DOM does not show `Weekly Safety Excellence Preview` | **Frontend defect** | Trigger Prompt 04 path; reproduce in failing local test, patch smallest defect. |

## Required analysis section

After capturing the five steps, fill in:

### Branch determination
<which decision-tree branch applies and why, citing the captured evidence>

### Responsible layer
<one of: code | package | page-config | cache | backend-auth | endpoint | operator-setup>

### Recommended next action
<no source change | re-run cache eviction | apply property-pane configuration | escalate to backend owner | trigger Prompt 04>

### Runtime proof captured
```json
<paste the Step 1 output verbatim>
```

### Bundle marker proof captured
<paste the console.table output>

### Page canvas matches captured
<paste the Step 3 output>

### Network captured
<URL, status, response body summary>

### DOM proof captured
<paste the Step 5 output>

## Boundaries

- Do not propose code changes unless evidence moves beyond the page-configuration branch.
- Do not propose backend, scoring, timer, publish, approval, or raw SharePoint list changes from this runbook.
- Do not introduce MSAL.
- Do not request hard-coded tenant Function App URL or audience values in manifest defaults.
