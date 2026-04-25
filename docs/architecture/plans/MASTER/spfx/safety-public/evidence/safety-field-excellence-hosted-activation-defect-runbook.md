# Safety Field Excellence — Hosted Activation Defect Runbook (Wave 07.1)

## Purpose

The hosted HBCentral homepage Safety zone may render as the curated empty state with `runtimeProof.sourceMode: "curated-only"` even after the Wave 07 wiring (`HbHomepageWebPart 1.1.76.0`) shipped. The Wave 07.1 build adds two non-sensitive diagnostic fields to the runtime proof object so an operator can branch directly to the failing layer without reading source. This runbook walks the seven required checks, separates code/package proof (Section A — fully captured this session) from tenant/operator proof (Section B — OPERATOR-PENDING), and provides a decision tree (Section C) that maps each combination of proof field states to a root cause and a fix.

This runbook is diagnostic. It does not by itself configure the hosted page or deploy the package. Steps 1-4 of the decision tree are operator actions; Steps 5+ are observational.

## Section A — Code / package proof

Captured in this session.

| Field | Value |
|---|---|
| Wave | 07.1 (hosted activation defect diagnostic) |
| Date | 2026-04-25 |
| Branch | main |
| HbHomepageWebPart manifest version | `1.1.76.0` → **`1.1.77.0`** (both copies) |
| `apps/hb-homepage/config/package-solution.json` (solution + feature) | `1.1.76.0` → **`1.1.77.0`** |
| `packages/homepage-launcher/src/constants.ts` `HOMEPAGE_LAUNCHER_VERSION` | `1.1.76.0` → **`1.1.77.0`** (lockstep) |
| `SafetyFieldExcellenceWebPart.manifest.json` | `0.0.8.0` (unchanged — no Safety source change) |
| `.sppkg` path | `dist/sppkg/hb-intel-homepage.sppkg` |
| `.sppkg` size | 11,879,061 bytes (~11.32 MB) |
| `.sppkg` SHA256 | `e459311d2da6d68bf209ed865ef646320009a25aa949eea9f4e166fdd7ac5f59` |
| App bundle | `ClientSideAssets/hb-homepage-app-2358de33.js` (SHA256 prefix `2358de33f917...`) |
| Shell entry | `shell-entry-e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf-213e3921.js` |
| Effectiveness proof | `dist/sppkg/hb-intel-homepage-effectiveness-proof.json` reports `versionAuthorityAligned: true` at `1.1.77.0` |

### New diagnostic fields on `SafetyFieldExcellenceRuntimeProof`

```ts
/**
 * Wave 07.1 diagnostic. True when the raw `safetyFieldExcellenceDynamic`
 * key was present on the `ModuleConfigSlices` object the zone received
 * from the homepage shell — regardless of whether the value was a usable
 * shape. Lets operators distinguish "page config missing the key" from
 * "page config has the key but the value didn't validate".
 */
safetyFieldExcellenceDynamicConfigSeen?: boolean;

/**
 * Wave 07.1 diagnostic. True when `readDynamicConfig(moduleConfig)`
 * returned a usable `SafetyFieldExcellenceDynamicConfig` (the key exists
 * AND the value is an object the zone could resolve). Necessarily false
 * whenever `safetyFieldExcellenceDynamicConfigSeen` is false; may be
 * false even when seen is true (key present but value unusable).
 */
safetyFieldExcellenceDynamicConfigResolved?: boolean;
```

Both fields are pure booleans. Neither exposes any value, token, payload, or finding text. Both are `undefined` when the zone does not pass them in, allowing graceful coexistence with the prior runtime proof shape.

### Required-present marker strings (15/15 PRESENT in `hb-homepage-app-2358de33.js`)

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
PRESENT :: safetyFieldExcellenceDynamicConfigSeen
PRESENT :: safetyFieldExcellenceDynamicConfigResolved
```

### Required-absent marker strings (9/9 ABSENT)

```
ABSENT :: /safety-field-excellence/rollup/dry-run (0)
ABSENT :: /safety-field-excellence/rollup/generate (0)
ABSENT :: /candidates (0)
ABSENT :: /approve (0)
ABSENT :: /publish (0)
ABSENT :: /suppress (0)
ABSENT :: /rollback (0)
ABSENT :: RawChecklistJson (0)
ABSENT :: rawChecklistJson (0)
```

### Test proof (3 explicit Wave 07.1 cases)

`apps/hb-webparts/src/webparts/safetyFieldExcellence/__tests__/SafetyFieldExcellenceDynamicProvider.test.tsx`:

- **absent (props omitted):** runtime proof leaves both fields `undefined`.
- **seen=true, resolved=false:** both fields surface with those exact values.
- **seen=true, resolved=true:** both fields surface as `true`.

`apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.previewFallbackRoute.test.tsx`:

- The two existing full-route tests (no-published with token, no-published without token) now also assert `seen: true, resolved: true`.
- A third full-route test sends a config where `safetyFieldExcellenceDynamic = null` and asserts `seen: true, resolved: false` while the zone safely degrades to `sourceMode: "curated-only"` with `dataSource: "curated"`.

### Validation results

| Command | Result |
|---|---|
| `cd apps/hb-homepage && pnpm exec tsc --noEmit` | exit 0 |
| `pnpm --filter @hbc/ui-kit check-types` | exit 0 |
| `pnpm --filter @hbc/features-safety check-types` | exit 0 |
| `pnpm --filter @hbc/functions check-types` | exit 0 |
| `pnpm exec vitest run --config vitest.config.ts src/webparts/safetyFieldExcellence src/webparts/hbHomepage` | 35 files / **458 tests** PASS (up from 446; 12 new diagnostic assertions across 4 new tests) |
| `npx tsx tools/build-spfx-package.ts --domain hb-homepage` | succeeded; produced `.sppkg` SHA `e459311d…` |

This change improves diagnosis. **It does not by itself configure the hosted page** — Section B and the Section C decision tree are operator-driven.

---

## Section B — Tenant / operator proof

Every item in this section is `OPERATOR-PENDING` until captured against the live HBCentral homepage with the deployed `1.1.77.0` package. Use the structured block convention from `safety-field-excellence-hosted-runtime-proof.md`.

### B1 — App catalog version of `hb-intel-homepage.sppkg` — OPERATOR-PENDING

**Required action:** Open the SharePoint app catalog → locate `hb-intel-homepage.sppkg` → record version + uploaded timestamp + SHA (where exposed).
**Pass criteria:** version reads `1.1.77.0`. Uploaded SHA matches Section A SHA `e459311d2da6d68bf209ed865ef646320009a25aa949eea9f4e166fdd7ac5f59`.
**Captured value:** _OPERATOR-PENDING_

### B2 — Loaded hosted bundle URL + bundle file hash + 8-marker check — OPERATOR-PENDING

**Required action:** On the HBCentral homepage in DevTools → find the `hb-homepage-app-<hash>.js` resource. Record full URL and file hash. In console run the marker fetch script (see Section C, Step 1).
**Pass criteria:** Bundle hash starts with `2358de33`. All 8 markers from the script return `true` (including the two new Wave 07.1 markers).
**Captured value:** _OPERATOR-PENDING_

### B3 — Page web-part properties JSON — OPERATOR-PENDING

**Required action:** Edit the HBCentral homepage → click the HbHomepage web part → ⋮ → Edit web part → JSON properties editor. Record the top-level keys. Redact tenant-secret values; record only key names + value-type.
**Pass criteria:** `safetyFieldExcellenceDynamic`, `functionAppBaseUrl` (or nested under the dynamic block), and `functionAppAudience` (or legacy `backendAudience`) are present at the expected locations.
**Captured value:** _OPERATOR-PENDING_

### B4 — Runtime proof object capture — OPERATOR-PENDING

**Required action:** In hosted DevTools console run:
```js
JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
```
**Pass criteria for steady-state activation (`dynamic-only` + no published data):**
- `sourceMode: "dynamic-only"`
- `safetyFieldExcellenceDynamicConfigSeen: true`
- `safetyFieldExcellenceDynamicConfigResolved: true`
- `backendFunctionAppUrlConfigured: true`
- `currentEndpointConfigured: true`
- `dataSource: "preview-fallback"`
- `previewFallbackRendered: true`
- `state: "preview"` (or `"ready"`/`"stale"` when published data exists)
- No tokens, no raw payload, no raw checklist content
**Captured value:** _OPERATOR-PENDING_

### B5 — Preview fallback DOM proof — OPERATOR-PENDING

**Required action:** Inspect the safety surface element. Confirm:
- Surface root carries `data-hbc-premium="safety-homepage-surface"`
- `data-hbc-safety-preview="true"`
- `data-hbc-safety-fallback-reason="preview"`
- Visible text contains `Weekly Safety Excellence Preview` and `Preview — awaiting published weekly data`
**Captured value:** _OPERATOR-PENDING_

### B6 — Network panel proof — OPERATOR-PENDING

**Required action:** DevTools → Network → filter to `safety-field-excellence` → reload page (incognito).
**Pass criteria:** Only `/api/safety-field-excellence/homepage/current` is called from the homepage surface. No admin/control-plane endpoints. Status `200` for a normal authenticated delegated user; response shape consistent with `state: "no-published-highlight"` or `state: "published"`.
**Captured value:** _OPERATOR-PENDING_

---

## Section C — Decision tree (the seven checks, branched)

```
Step 1: Inspect hosted bundle markers (Section B2).
  In hosted DevTools console:
    fetch(document.querySelector('script[src*="hb-homepage-app-"]')?.src)
      .then(r=>r.text())
      .then(t=>({
        runtimeProofSym:  t.includes('__hbIntel_safetyFieldExcellenceRuntimeProof'),
        dynamicWithCurated: t.includes('dynamic-with-curated-fallback'),
        dynamicOnly:      t.includes('dynamic-only'),
        homepageCurrent:  t.includes('/api/safety-field-excellence/homepage/current'),
        weeklyPreview:    t.includes('Weekly Safety Excellence Preview'),
        getFunctionAppToken: t.includes('getFunctionAppToken'),
        functionAppBaseUrl: t.includes('functionAppBaseUrl'),
        configSeen:       t.includes('safetyFieldExcellenceDynamicConfigSeen'),
        configResolved:   t.includes('safetyFieldExcellenceDynamicConfigResolved'),
      }))

  ├── Any marker false
  │   └── DIAGNOSIS: stale tenant deploy or CDN/cache problem.
  │       FIX:
  │         - Re-upload dist/sppkg/hb-intel-homepage.sppkg
  │           (Section A SHA: e459311d2da6d68bf209ed865ef646320009a25aa949eea9f4e166fdd7ac5f59)
  │         - Confirm app catalog shows version 1.1.77.0 (B1)
  │         - Clear CDN/app-catalog cache per tenant practice
  │         - Reload in incognito; re-run Step 1.
  │
  └── All true → proceed to Step 2.

Step 2: Capture runtime proof (B4) and read
        safetyFieldExcellenceDynamicConfigSeen.
  ├── seen === false (or undefined)
  │   └── DIAGNOSIS: page config does not contain the
  │       safetyFieldExcellenceDynamic key at the top level the zone reads.
  │       FIX:
  │         - Open page → HbHomepage webpart → JSON properties editor
  │         - Paste the recommended JSON from Section D
  │         - Save, republish page, reload in incognito
  │         - Re-run Step 2 expecting seen === true.
  │
  └── seen === true → proceed to Step 3.

Step 3: Read safetyFieldExcellenceDynamicConfigResolved.
  ├── resolved === false
  │   └── DIAGNOSIS: the key is present on the page config but its value
  │       is not a usable shape (null, string, malformed object).
  │       FIX:
  │         - Confirm the value is an object literal — not a string,
  │           array, or null
  │         - Confirm the object includes `sourceMode: 'dynamic-only'`
  │           (or another supported source mode)
  │         - Re-paste the canonical block from Section D, save, reload
  │         - Re-run Step 3 expecting resolved === true.
  │
  └── resolved === true → proceed to Step 4.

Step 4: Read backendFunctionAppUrlConfigured and currentEndpointConfigured.
  ├── backendFunctionAppUrlConfigured === false
  │   └── DIAGNOSIS: functionAppBaseUrl is not present on the page config
  │       at either the top level or inside the dynamic block.
  │       FIX: set functionAppBaseUrl per Section D; re-test.
  │
  ├── backendFunctionAppUrlConfigured === true and
  │   currentEndpointConfigured === false
  │   └── DIAGNOSIS: token provider missing — functionAppAudience (or
  │       legacy backendAudience) absent on the page config, so mount
  │       could not derive getFunctionAppToken.
  │       FIX: set functionAppAudience per Section D; re-test.
  │
  └── both === true → proceed to Step 5.

Step 5: Inspect rendered Safety surface (B5) and runtime proof.
  ├── dataSource: "preview-fallback" AND
  │   data-hbc-safety-preview="true" in DOM AND
  │   "Weekly Safety Excellence Preview" text rendered
  │   └── PASS: end-to-end activation proven; preview fallback path works.
  │       Document captured Section B values; close runbook.
  │
  └── Any of the above missing
      └── DIAGNOSIS: provider/mapper/render bug not visible from local
          tests. Capture full runtime proof + DOM, escalate as a Wave 08
          code defect.
```

---

## Section D — Recommended page web-part properties JSON

Top-level form (preferred):

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

Equivalently nested form (the helper checks the nested location after the top-level):

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

`functionAppAudience` is the preferred property going forward. `backendAudience` is accepted only as a tenant-continuity fallback because it has historically served PnP Ops and other Function-App-backed paths.

For production cutover after hosted activation is proven, the preferred steady-state mode is `dynamic-with-curated-fallback` (see `safety-field-excellence-cutover-readiness.md`); `dynamic-only` is recommended only for controlled test pages or after explicit owner sign-off.

---

## Section E — Closure assertions

- Diagnostic fields added: `safetyFieldExcellenceDynamicConfigSeen`, `safetyFieldExcellenceDynamicConfigResolved`. Semantics matched to names per the docstrings in Section A. ✓
- Three test cases prove proof behavior (absent / seen-but-unresolved / seen-and-resolved). ✓
- Package version: `1.1.77.0`. ✓
- `.sppkg` SHA256: `e459311d2da6d68bf209ed865ef646320009a25aa949eea9f4e166fdd7ac5f59`. ✓
- App bundle: `hb-homepage-app-2358de33.js`. ✓
- Required-present bundle strings (15/15) present, including the two new Wave 07.1 markers. ✓
- Required-absent admin / raw-data strings (9/9) absent. ✓
- Runbook path: `docs/architecture/plans/MASTER/spfx/safety-public/evidence/safety-field-excellence-hosted-activation-defect-runbook.md`. ✓
- This change improves diagnosis but **does not by itself configure the hosted page**. Steps 1-4 of the decision tree are operator actions. ✓
- Section B is explicitly OPERATOR-PENDING for actual tenant deployment / config validation. ✓

## Boundary (unchanged)

- No backend route, scoring, timer, publish workflow, or approval UI changes.
- No edits to `apps/hb-webparts/src/mount.tsx` (build-blocked, removed from the SPFx orchestrator pipeline at commit `be922f7ad`).
- No MSAL introduced.
- No defaults inserted into `HbHomepageWebPart.manifest.json` `preconfiguredEntries[0].properties` — `functionAppBaseUrl` and `functionAppAudience` remain tenant-specific page configuration.

## Final status

**Diagnostic visibility shipped at `HbHomepageWebPart 1.1.77.0` (`.sppkg` SHA `e459311d…`). Hosted activation remains operator-pending.** Once the operator completes Section B captures and walks Section C to PASS, this runbook converts to a closed activation evidence record.
