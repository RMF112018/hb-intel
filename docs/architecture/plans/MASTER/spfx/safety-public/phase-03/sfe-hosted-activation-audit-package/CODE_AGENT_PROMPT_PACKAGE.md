# Code Agent Prompt Package — Safety Field Excellence Hosted Activation

## Prompt 01 — Validate Operator-Only Root Cause Before Any Code Changes

```md
You are working in the `RMF112018/hb-intel` repository on the current `main` branch.

Objective: validate the Safety Field Excellence hosted activation defect without making code changes unless the evidence contradicts the current root-cause conclusion.

Current evidence:
- Hosted HB Central homepage renders the old curated empty state: `No safety and field excellence items configured`.
- Hosted runtime proof reports:
  - `sourceMode: "curated-only"`
  - `dataSource: "curated"`
  - `backendFunctionAppUrlConfigured: false`
  - `currentEndpointConfigured: false`
  - `previewFallbackRendered: false`
  - `safetyFieldExcellenceDynamicConfigSeen: false`
  - `safetyFieldExcellenceDynamicConfigResolved: false`
- Hosted loaded bundle marker proof indicates the homepage app bundle contains dynamic Safety markers, including `Weekly Safety Excellence Preview`, `dynamic-only`, `functionAppBaseUrl`, `getFunctionAppToken`, `/api/safety-field-excellence/homepage/current`, `safetyFieldExcellenceDynamicConfigSeen`, and `safetyFieldExcellenceDynamicConfigResolved`.

Do not re-read files that are still within your current context or memory. Use repo truth for any file not yet inspected.

Required repo-truth inspection:
- `apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/wiring/safetyFunctionAppWiring.ts`
- `apps/hb-homepage/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.previewFallbackRoute.test.tsx`

Required conclusion:
- If repo truth still matches the known state, conclude no source remediation is required for activation and the required fix is active SharePoint page/webpart configuration.
- If repo truth does not match, identify the exact file-level defect and propose a targeted patch.

Output:
- `ROOT_CAUSE_VALIDATION.md`
- Include exact evidence, tested hypotheses, ruled-out causes, and operator actions.

Do not change backend scoring, timers, publish workflow, admin UI, approval UI, or raw SharePoint list aggregation. Do not introduce MSAL. Do not hard-code tenant Function App URL or audience in manifest defaults.
```

## Prompt 02 — Operator Runbook Execution and Evidence Capture

```md
You are assisting a tenant operator with hosted SharePoint evidence capture for Safety Field Excellence on HB Central.

Objective: execute the hosted diagnostic runbook and produce a closure-ready evidence document.

Use these browser console commands on the live homepage:

Runtime proof:
```js
JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
```

Loaded bundle marker proof:
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

Page canvas inspection:
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

Network filter:
```text
safety-field-excellence
```

DOM proof:
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

Output file:
- `HOSTED_ACTIVATION_EVIDENCE.md`

Required analysis:
- State which root-cause decision-tree branch applies.
- Identify whether code, package, page config, cache, backend auth, endpoint, or operator setup is responsible.
- Do not propose code changes unless the evidence moves beyond the page configuration branch.
```

## Prompt 03 — Add Property Pane / Config Bridge Hardening Only After Operator Proof

```md
You are working in the `RMF112018/hb-intel` repository on the current `main` branch.

Objective: after hosted operator proof confirms the runtime works when correctly configured, add a safer configuration path so operators do not need raw nested JSON editing for Safety Field Excellence dynamic activation.

Do not re-read files that are still within your current context or memory.

Required implementation strategy:
1. Add flat HB Homepage property pane fields for Safety Field Excellence dynamic activation in `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`, under the `HB_HOMEPAGE_WEBPART_ID` branch.
2. Do not hard-code tenant-specific Function App URL or audience in manifest defaults.
3. Prefer `functionAppAudience` over legacy `backendAudience`.
4. Preserve existing nested `safetyFieldExcellenceDynamic` object support.
5. Normalize flat property-pane fields into the nested runtime shape before `HbHomepage` receives config.
6. Keep `curated-only` as the safe default unless the operator explicitly chooses a dynamic source mode.
7. Do not change backend routes, scoring, timers, publish workflow, approval UI, or raw Safety list aggregation.
8. Do not introduce MSAL.

Suggested new helper:
`apps/hb-webparts/src/webparts/hbHomepage/wiring/safetyFieldExcellenceDynamicConfigBridge.ts`

Required behavior:
- If `webPartProperties.safetyFieldExcellenceDynamic` is a valid object, preserve it.
- If flat fields exist, construct `safetyFieldExcellenceDynamic` from them.
- If both nested and flat exist, nested explicit values win.
- Top-level `functionAppBaseUrl` and `functionAppAudience` remain available for `resolveSafetyFunctionAppWiring`.
- Missing fields do not activate dynamic mode.

Required tests:
- flat source mode creates dynamic block
- nested block wins over flat fields
- missing source mode does not activate dynamic mode
- top-level Function App URL works
- nested Function App URL fallback still works
- preferred `functionAppAudience` wins over `backendAudience`
- no tenant-specific defaults inserted into manifest

Required validation:
```bash
pnpm --filter @hbc/spfx-hb-webparts check-types
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/features-safety check-types
pnpm --filter @hbc/functions check-types
pnpm exec vitest run --config vitest.config.ts src/webparts/safetyFieldExcellence src/webparts/hbHomepage
npx tsx tools/build-spfx-package.ts --domain hb-homepage
```

Required output:
- source changes
- tests
- package version bump if package truth changes
- package SHA and marker proof
- `PROPERTY_PANE_HARDENING_CLOSURE.md`
```

## Prompt 04 — Code Defect Branch Only If Preview Does Not Render After Correct Config

```md
You are working in the `RMF112018/hb-intel` repository on the current `main` branch.

Objective: remediate a confirmed frontend defect only if hosted evidence proves all of the following:
- loaded bundle has dynamic markers;
- runtime proof has `safetyFieldExcellenceDynamicConfigSeen: true`;
- runtime proof has `safetyFieldExcellenceDynamicConfigResolved: true`;
- runtime proof has `sourceMode: "dynamic-only"`;
- runtime proof has `backendFunctionAppUrlConfigured: true`;
- runtime proof has `currentEndpointConfigured: true`;
- network call to `/api/safety-field-excellence/homepage/current` returns 200 with `state: "no-published-highlight"`;
- DOM does not show `Weekly Safety Excellence Preview` or `data-hbc-safety-preview="true"`.

Do not re-read files that are still within your current context or memory.

Files to inspect:
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDataAdapter.ts`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePreviewFallback.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.previewFallbackRoute.test.tsx`

Required work:
1. Reproduce the exact hosted response shape in a failing local test.
2. Patch the smallest frontend defect.
3. Add regression coverage for the hosted response shape.
4. Preserve all safety boundaries:
   - no backend scoring changes;
   - no timer/publish workflow changes;
   - no admin approval UI changes;
   - no direct raw SharePoint Safety list aggregation from SPFx;
   - no MSAL;
   - no hard-coded tenant Function App URL or audience.
5. Rebuild package and capture package proof.

Output:
- code patch
- test patch
- `PREVIEW_FALLBACK_FRONTEND_DEFECT_CLOSURE.md`
```

## Prompt 05 — Commit Summary Template

```md
Summary: HbHomepageWebPart: activate Safety Field Excellence configuration path / hosted proof hardening

Description:
<Describe exactly what changed. State whether this was operator-only documentation, property-pane/config bridge hardening, or a frontend defect patch.>

Root cause:
<Use the decision-tree branch. If the root cause was page config, state that no runtime source defect was found.>

Files changed:
<List files by functional group.>

Validation:
- <command>: <result>
- <command>: <result>

Package proof:
- `.sppkg`: <path>
- version: <version>
- SHA256: <sha>
- app bundle: <filename>
- required-present markers: <pass/fail>
- forbidden homepage admin markers: <pass/fail>

Hosted proof:
- runtime proof: <pass/fail and key values>
- page config: <pass/fail and key presence>
- network: <pass/fail and endpoint/status>
- DOM: <pass/fail and preview/published state>

Rollback:
- <curated-only configuration or package rollback path>
```
