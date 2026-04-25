# Safety Field Excellence — Hosted Runtime Proof Runbook (Wave 07)

**Status at authoring:** All hosted/tenant/browser sections are `OPERATOR-PENDING`. This document is a runbook, not captured evidence. It becomes captured evidence only after the operator completes the Post-deploy operator checklist and replaces every `OPERATOR-PENDING` marker with real values, screenshot paths, and JSON output.

| Field | Value |
|---|---|
| Date authored | 2026-04-25 |
| Branch | main |
| Commit (HEAD at authoring) | `3022358e6fe2b8acd3769d66c657f6b0f41b7618` |
| Wave | 07 (Phase 02) |
| Surface | Safety Field Excellence dynamic homepage surface |
| Source manifest version | `0.0.8.0` |
| Package-solution version | `1.0.3.0` |
| Authority docs | `cut-over-plan/06_Verification_and_Hosted_Proof.md`, `cut-over-plan/07_Risk_Register_and_Governance.md` |
| Sibling evidence | `safety-field-excellence-package-truth-proof.md`, `safety-field-excellence-cutover-readiness.md`, `safety-field-excellence-rollback-runbook.md` |

## Why local automation cannot prove this

Hosted runtime proof, deployed-bundle identity, tenant-authenticated backend reachability, and DOM/network/console observations all require: (a) an actual `.sppkg` upload to the SharePoint app catalog, (b) a live HBCentral homepage render in a tenant browser session, and (c) a normal authenticated delegated user account with `access_as_user` against the Safety Function App. None of these can be produced inside a local code-agent session. Per the Wave 07 plan posture, package truth is **not** runtime truth — these proofs are owner-held until captured.

Note: at authoring time, the fresh `.sppkg` is **build-blocked** on three pre-existing TypeScript errors in unrelated webparts (see `safety-field-excellence-package-truth-proof.md` → "Build status — BUILD-BLOCKED"). The operator checklist below assumes those blockers are resolved by the relevant owners and a fresh `.sppkg` has been produced before the deploy step is attempted.

## OPERATOR-PENDING block format

Every operator-only item in this document follows this exact structure. Vague blanks are not acceptable — replace `_OPERATOR-PENDING_` with a concrete captured value, file path, or `N/A` with a reason.

```
### [Item title] — OPERATOR-PENDING

**Required action:** <exact step>
**Expected output format:** <JSON shape | screenshot path | network log shape | response body shape>
**Pass criteria:** <specific, falsifiable assertion>
**Who must provide:** <Operator with tenant credentials and app-catalog access>
**Why local automation cannot prove it:** <reason>
**Captured value:** _OPERATOR-PENDING_
```

---

## 1. App catalog upload + deployed package version — OPERATOR-PENDING

**Required action:** Upload the fresh `dist/sppkg/hb-webparts.sppkg` (produced after the build-blocker resolution per `safety-field-excellence-package-truth-proof.md` → "Resolution path to unblock fresh package proof") to the SharePoint app catalog. Confirm trust and tenant-wide deployment as required by tenant practice.
**Expected output format:** App catalog entry showing the uploaded file name, version, deployed timestamp, and SHA (where exposed by the app catalog UI).
**Pass criteria:**
- App catalog shows `hb-webparts.sppkg` with package-solution version `1.0.3.0` (or higher if the build-blocker resolution required a bump).
- The deployed `.sppkg` SHA256 matches the SHA recorded in `safety-field-excellence-package-truth-proof.md` for the freshly built artifact.
- Deployment timestamp is on or after the build-blocker resolution date.
- The stale `.sppkg` SHA `d2defe6b1214cb4815c0d3ec6e9f49037feda7fe1aba49925a640354bbffa034` is **not** the deployed artifact.
**Who must provide:** App catalog admin / HB Intel SPFx maintainer.
**Why local automation cannot prove it:** App catalog upload requires tenant credentials, admin privileges, and a tenant browser session.
**Captured value:**
- App catalog item URL: _OPERATOR-PENDING_
- Deployed `.sppkg` SHA256: _OPERATOR-PENDING_
- Package-solution version observed: _OPERATOR-PENDING_
- Deployment timestamp: _OPERATOR-PENDING_
- Operator account: _OPERATOR-PENDING_

---

## 2. Hosted page bundle/version load confirmation — OPERATOR-PENDING

**Required action:** Open the HBCentral homepage in a normal authenticated browser session and confirm it loads the freshly deployed bundle (not a cached prior version).
**Expected output format:**
- Hosted page URL captured.
- DevTools Sources panel showing `hb-webparts-app-<hash>.js` loaded from the SharePoint app catalog assets path.
- Runtime-proof object's `packageVersion` and `expectedPackageVersion` fields both populated and equal.
**Pass criteria:** `runtimeProof.packageVersion === runtimeProof.expectedPackageVersion`. Both are non-empty. The asset hash on the loaded bundle file name matches the freshly built bundle.
**Who must provide:** Operator with tenant credentials.
**Why local automation cannot prove it:** Bundle identity in the live SharePoint render is host-side state, not source-side state.
**Captured value:**
- Hosted page URL: _OPERATOR-PENDING_ (default expected pattern: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`)
- `runtimeProof.packageVersion`: _OPERATOR-PENDING_
- `runtimeProof.expectedPackageVersion`: _OPERATOR-PENDING_
- Match: _OPERATOR-PENDING_

---

## 3. Source-mode runtime proof captures

The runtime proof object's expected shape (from `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceRuntimeProof.ts:19-50`) is:

```ts
interface SafetyFieldExcellenceRuntimeProof {
  generatedAt: string;
  sourceMode: 'curated-only' | 'dynamic-preview' | 'dynamic-with-curated-fallback' | 'dynamic-only';
  dataSource: 'curated' | 'dynamic' | 'preview-fallback' | 'curated-fallback';
  state: SafetyFieldExcellenceDynamicState; // 'idle' | 'loading' | 'ready' | 'stale' | 'preview' | 'no-published-highlight' | 'error-fallback'
  backendFunctionAppUrlConfigured: boolean;
  currentEndpointConfigured: boolean;
  currentEndpointUrl?: string;
  currentEndpointStatus?: number;
  publishedHighlightId?: number;
  reportingPeriodId?: string;
  reportingPeriodSpItemId?: number;
  periodLabel?: string;
  publishStatus?: 'published';
  freshUntil?: string;
  isStale?: boolean;
  dataConfidence?: 'high' | 'medium' | 'low';
  primaryProjectNumber?: string;
  secondaryCount: number;
  fallbackReason?: string;
  lastFetchStartedAt?: string;
  lastFetchCompletedAt?: string;
  packageVersion?: string;
  expectedPackageVersion?: string;
  previewFallbackRendered?: boolean;
  staleTreatment?: boolean;
}
```

The runtime proof object **never** contains tokens, raw payload JSON, raw findings text, raw checklist content, employee performance detail, or Graph diagnostics. Any such content in a captured proof is a hard-stop rollback trigger (see `safety-field-excellence-rollback-runbook.md`).

### 3a. `curated-only` mode — OPERATOR-PENDING

**Required action:** Set source mode to `curated-only`, reload the homepage in a clean browser session, and capture the runtime proof.
**Expected output format:** JSON output of `JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)`.
**Pass criteria:**
- `sourceMode === 'curated-only'`
- `dataSource === 'curated'`
- No `currentEndpointStatus` (or no fetch attempted; `currentEndpointConfigured` may be `false`)
- No tokens, no raw payload, no raw checklist content
**Who must provide:** Operator.
**Why local automation cannot prove it:** Browser-side global is host-side state.
**Captured value:**
```json
_OPERATOR-PENDING_
```

### 3b. `dynamic-preview` mode — OPERATOR-PENDING

**Required action:** Set source mode to `dynamic-preview`, reload the homepage, and capture the runtime proof. Public render should remain curated; diagnostics-only paths reflect the dynamic fetch.
**Expected output format:** JSON output as above.
**Pass criteria:**
- `sourceMode === 'dynamic-preview'`
- Backend `/homepage/current` is fetched and `currentEndpointStatus` is recorded (200 expected for a normal authenticated user)
- Public homepage continues to render curated content (no premature dynamic cutover)
- No tokens, no raw payload, no raw checklist content
**Who must provide:** Operator.
**Why local automation cannot prove it:** Hosted fetch outcome and render state are host-side.
**Captured value:**
```json
_OPERATOR-PENDING_
```

### 3c. `dynamic-with-curated-fallback` mode (with published data) — OPERATOR-PENDING

**Required action:** Set source mode to `dynamic-with-curated-fallback` with a fresh published highlight available, reload the homepage, and capture the runtime proof. Validate against a controlled test page first; promote to homepage only after evidence is captured.
**Expected output format:** JSON output as above.
**Pass criteria:**
- `sourceMode === 'dynamic-with-curated-fallback'`
- `dataSource === 'dynamic'`
- `publishStatus === 'published'`
- `currentEndpointStatus === 200`
- `state === 'ready'`
- `dataConfidence` populated (`high` | `medium` | `low`)
- `previewFallbackRendered === false`
- `staleTreatment === false` (unless stale highlight is the test target)
**Who must provide:** Operator.
**Why local automation cannot prove it:** Requires hosted render against a real published payload.
**Captured value:**
```json
_OPERATOR-PENDING_
```

### 3d. `dynamic-with-curated-fallback` mode (no published data — fallback) — OPERATOR-PENDING

**Required action:** Set source mode to `dynamic-with-curated-fallback` with no qualifying published highlight (or with `/homepage/current` returning `no-published-highlight`), reload the homepage, and capture the runtime proof.
**Pass criteria:**
- `sourceMode === 'dynamic-with-curated-fallback'`
- `dataSource === 'curated-fallback'` (curated config staged) or `'preview-fallback'` (no curated config staged)
- `currentEndpointStatus` is 200 with `state: "no-published-highlight"`, or a network error captured in `fallbackReason`
- `previewFallbackRendered === true` only when curated config is absent
- No raw backend error rendered to user
**Captured value:**
```json
_OPERATOR-PENDING_
```

### 3e. `dynamic-only` mode (controlled test page only) — OPERATOR-PENDING

**Required action:** Validate `dynamic-only` only on a controlled test page or with explicit operator approval. **Do not enable `dynamic-only` on the production homepage** at Prompt 07 closure (see `safety-field-excellence-cutover-readiness.md`).
**Pass criteria:**
- On a controlled test page only.
- With published data: dynamic render succeeds, no curated fallback exposed.
- With no published data: preview fallback renders with clear preview labeling (`previewFallbackRendered === true`); never looks like production data.
- With auth/network/invalid-payload error: preview/error fallback renders with `fallbackReason` populated; no raw error text exposed.
**Captured value:** _OPERATOR-PENDING_ (or **N/A — deferred per cutover-readiness recommendation**)

---

## 4. Network panel proof — OPERATOR-PENDING

**Required action:** Open DevTools Network panel, filter to `safety-field-excellence`, reload the page, and capture the request list.
**Expected output format:** Network log (HAR export or screenshot) showing the URLs called from the homepage surface.
**Pass criteria:**
- Allowed: `/api/safety-field-excellence/homepage/current` only.
- Forbidden (must NOT appear from the homepage surface): `/api/safety-field-excellence/rollup/dry-run`, `/rollup/generate`, `/reporting-periods/{id}/candidates`, `/highlights/{id}` admin variants, `POST /approve`, `POST /override`, `POST /publish`, `POST /suppress`, `POST /rollback`.
**Who must provide:** Operator.
**Why local automation cannot prove it:** Live network egress under tenant identity is host-side.
**Captured value:**
- HAR / screenshot path: _OPERATOR-PENDING_
- Endpoints observed: _OPERATOR-PENDING_
- Forbidden endpoints absent: _OPERATOR-PENDING_

---

## 5. Console proof — OPERATOR-PENDING

**Required action:** Inspect DevTools console after the homepage loads.
**Pass criteria:**
- No Safety Field Excellence runtime exceptions.
- No auth loops (repeated 401/403 followed by retry storms).
- No unhandled promise rejections from the adapter or dynamic provider.
- Runtime proof object present at `window.__hbIntel_safetyFieldExcellenceRuntimeProof`.
- No token / raw payload exposure in any console output.
- Unrelated console messages, if present, are documented separately and proven unrelated.
**Who must provide:** Operator.
**Why local automation cannot prove it:** Console state is host-side runtime state.
**Captured value:**
- Console screenshot or text capture path: _OPERATOR-PENDING_
- Safety-attributed errors: _OPERATOR-PENDING_
- Unrelated errors documented separately: _OPERATOR-PENDING_

---

## 6. Backend `/homepage/current` reachability under normal authenticated user — OPERATOR-PENDING

**Required action:** As a normal authenticated delegated user (no Safety reviewer/admin role), open the homepage and confirm `/api/safety-field-excellence/homepage/current` returns 200 with a valid response state. Optionally call the endpoint directly via `fetch` from the authenticated browser context for a clean response capture.
**Expected output format:**
- HTTP status code.
- Response body (`state` field at minimum); never raw payload internals.
**Pass criteria (acceptable):**
- `200` with `{ state: "published", ... }` (mapped homepage-safe payload — `currentEndpointStatus` in runtime proof is 200, `dataSource: "dynamic"`, `publishStatus: "published"`).
- `200` with `{ state: "no-published-highlight" }` (no qualifying published item; runtime proof reports fallback path).
- `200` with stale content **only when** `?includeStale=true` is explicitly passed; default homepage call must not include stale unless specifically routed.
**Pass criteria (rejected — rollback trigger):**
- `401` or `403` for a normal authenticated homepage user, **unless** the failure is provably a token-acquisition setup issue documented separately and not an endpoint-side authorization regression.
- Any response containing raw candidate internals, `RawChecklistJson`, raw findings text, employee performance detail, or Graph/token diagnostics.
**Who must provide:** Operator + 1 normal authenticated test user.
**Why local automation cannot prove it:** Tenant-authenticated request requires a delegated user token against the Safety Function App.
**Captured value:**
- Endpoint URL invoked: _OPERATOR-PENDING_
- HTTP status: _OPERATOR-PENDING_
- Response `state`: _OPERATOR-PENDING_
- Auth context (role, account): _OPERATOR-PENDING_
- No raw internals confirmed: _OPERATOR-PENDING_

---

## 7. UI/UX hosted state checks — OPERATOR-PENDING

**Required action:** Visually verify the homepage Safety Field Excellence surface in standard, compact, and minimal/handheld modes.
**Pass criteria:**
- Preview chip visible when preview fallback renders.
- Stale chip visible when `isStale === true`.
- Confidence chip visible when `dataConfidence` is set on a published payload.
- Degraded/fallback notice uses icon + text (no color-only meaning).
- Compact / minimal mode cues survive the host-shell mode reduction (the surface keeps stale and preview indicators in compact mode).
- No color-only stale or degraded meaning.
- No hover-only signal meaning.
- No dead CTA.
- No raw backend error text rendered to user.
- No horizontal overflow in the SharePoint canvas.
**Who must provide:** Operator.
**Why local automation cannot prove it:** Final visual rendering depends on the SharePoint shell, real viewport, and tenant theming. Wave 06 scorecard already proved local code-side; hosted re-verification is the missing piece.
**Captured value:**
- Standard mode screenshot: _OPERATOR-PENDING_
- Compact mode screenshot: _OPERATOR-PENDING_
- Minimal/handheld screenshot: _OPERATOR-PENDING_
- Preview state screenshot: _OPERATOR-PENDING_
- Stale state screenshot (if reproducible): _OPERATOR-PENDING_

---

## 8. Per-source-mode screenshot index — OPERATOR-PENDING

| Source mode | State exercised | Screenshot path |
|---|---|---|
| `curated-only` | curated render | _OPERATOR-PENDING_ |
| `dynamic-preview` | curated render + dynamic diagnostics | _OPERATOR-PENDING_ |
| `dynamic-with-curated-fallback` | dynamic published render | _OPERATOR-PENDING_ |
| `dynamic-with-curated-fallback` | curated fallback (no published) | _OPERATOR-PENDING_ |
| `dynamic-only` (controlled test page) | preview fallback (no published) | _OPERATOR-PENDING_ or **N/A — deferred** |

---

## 9. Closure assertion: package = runtime truth — OPERATOR-PENDING

This assertion is only addressable after items 1–8 are populated.

**Required statement (operator fills):**

> On `<deploy date>`, the deployed `hb-webparts.sppkg` (SHA256 `<…>`, package-solution version `<…>`) loaded on the HBCentral homepage. The captured `window.__hbIntel_safetyFieldExcellenceRuntimeProof` reported `packageVersion === expectedPackageVersion === <0.0.8.0>`. Source mode `<…>` rendered with `dataSource === <…>` and `currentEndpointStatus === <…>`. Network panel showed only `/api/safety-field-excellence/homepage/current`. Console was clean of Safety Field Excellence runtime exceptions. Backend `/homepage/current` returned `<200 published | 200 no-published-highlight>` for a normal authenticated delegated user. Therefore: **package truth equals runtime truth.**

**Captured value:** _OPERATOR-PENDING_

---

## Post-deploy operator checklist

Run this checklist in order. Each step has a corresponding section above to update.

```
1. Resolve the build blockers documented in safety-field-excellence-package-truth-proof.md
   ("Build status — BUILD-BLOCKED") in their owners' scope. Confirm
   `pnpm --filter @hbc/spfx-hb-webparts check-types` exits 0.
2. Run `npx tsx tools/build-spfx-package.ts --domain hb-webparts` from repo root.
3. Capture the fresh `dist/sppkg/hb-webparts.sppkg`:
   - shasum -a 256 dist/sppkg/hb-webparts.sppkg
   - stat -f '%Sm %z bytes' dist/sppkg/hb-webparts.sppkg
   - unzip -l dist/sppkg/hb-webparts.sppkg | head
   Update safety-field-excellence-package-truth-proof.md with these values
   and run the required-present / required-absent string greps against the
   extracted bundle.
4. Upload the fresh `.sppkg` to the SharePoint app catalog. Confirm trust and
   tenant-wide deployment per tenant practice. Update Section 1 above.
5. Open the HBCentral homepage in a normal authenticated browser session.
   Update Section 2 above with the page URL and runtime-proof packageVersion match.
6. In DevTools console run:
     JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
   Paste into Sections 3a–3e (one per source mode tested).
7. Open DevTools Network panel, filter to "safety-field-excellence", reload
   the page, and confirm only /api/safety-field-excellence/homepage/current
   is called. Save HAR or screenshot. Update Section 4.
8. Inspect DevTools console for safety-attributed errors. Update Section 5.
9. As a normal authenticated delegated user, confirm /homepage/current returns
   200 (not 401/403) and the response shape matches the homepage-safe contract.
   Update Section 6.
10. Capture screenshots in standard / compact / minimal modes for the active
    source mode and any fallback states reachable. Update Sections 7 and 8.
11. Validate `dynamic-only` only on a controlled test page (do not enable on
    the production homepage). Update Section 3e or mark N/A — deferred.
12. Paste the closure assertion in Section 9.
13. Re-run the cutover-readiness matrix in
    `safety-field-excellence-cutover-readiness.md`. If all rows pass, update
    its final status from "Conditionally ready for hosted validation" to
    "Hosted runtime proof complete" and recommend
    `dynamic-with-curated-fallback` as the production source mode.
```

## Final status

**OPERATOR-PENDING.** This document is a runbook awaiting hosted capture. Do not treat as completed evidence.
