# PROPERTY_PANE_HARDENING_CLOSURE — Safety Field Excellence Hosted Activation

## Scope

Operators can now activate Safety Field Excellence dynamic mode without authoring raw nested JSON on the HbHomepageWebPart instance. New property-pane fields appear under the existing HB Homepage settings pane and are normalized at runtime into the same shape the SafetyFieldExcellenceZone has always consumed.

Hosted runtime activation remains **OPERATOR-PENDING** — package truth ≠ runtime truth. After this package is deployed and the operator captures runtime + bundle + page-canvas + DOM evidence per `HOSTED_ACTIVATION_EVIDENCE.md`, hosted activation can be claimed.

## Source changes

| File | Purpose |
| --- | --- |
| `apps/hb-webparts/src/webparts/hbHomepage/wiring/safetyFieldExcellenceDynamicConfigBridge.ts` | New pure helper. Normalizes flat `safetyFieldExcellence*` properties into the nested `safetyFieldExcellenceDynamic` block plus top-level `functionAppBaseUrl` / `functionAppAudience`. Nested explicit values win over flat. Missing source mode does not activate dynamic mode. |
| `apps/hb-homepage/src/mount.tsx` | Wraps incoming SPFx `webPartProperties` with `bridgeSafetyFieldExcellenceDynamicConfig` before constructing the wiring or forwarding into `HbHomepage`. |
| `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | Adds new flat property fields to the `IShellWebPartProperties` shape. Adds a *Safety Field Excellence — dynamic activation* group to the `HB_HOMEPAGE_WEBPART_ID` property pane: source-mode dropdown (default blank → curated-only), Function App base URL, Function App audience (preferred over legacy `backendAudience`), Safety Hub URL, plus three operational toggles. No tenant Function App URL or audience is hard-coded; the dropdown defaults to blank. |
| `apps/hb-webparts/src/webparts/hbHomepage/wiring/__tests__/safetyFieldExcellenceDynamicConfigBridge.test.ts` | New unit suite. Covers nested-wins, flat→nested construction, no-source-mode → no activation, top-level URL promotion, preferred audience promotion, legacy `backendAudience` left intact, key isolation, and trim semantics. |
| `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Manifest version bump → `1.1.79.0`. |
| `apps/hb-homepage/config/package-solution.json` | Solution + feature version bump → `1.1.79.0`. |

## Behavior contracts

- Curated-only remains the default. Leaving the new Source mode blank or set to `curated-only` does **not** activate dynamic data.
- A nested `safetyFieldExcellenceDynamic` block authored via raw JSON continues to take precedence over flat fields, key by key.
- `resolveSafetyFunctionAppWiring` reads top-level `functionAppBaseUrl` (with nested fallback) and prefers `functionAppAudience` over legacy `backendAudience`. The bridge promotes the flat field values into the top-level slots only when the top-level slot is missing.
- The bridge does not introduce MSAL, does not hard-code tenant Function App URL or audience, does not change backend scoring, timers, publish workflow, approval UI, or raw SharePoint Safety list aggregation.

## Validation

| Command | Result |
| --- | --- |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | Pre-existing failures in unrelated areas (`hbKudosAccessibilityGuardrails.test.tsx`, `homepageHeroDaypartPrecedence.test.tsx`, `PriorityActionsRail.tsx`). No new errors introduced by Safety bridge / wiring / mount changes. |
| `pnpm --filter @hbc/ui-kit check-types` | Pass. |
| `pnpm --filter @hbc/features-safety check-types` | Pass. |
| `pnpm --filter @hbc/functions check-types` | Pass. |
| `pnpm exec vitest run --config vitest.config.ts src/webparts/safetyFieldExcellence src/webparts/hbHomepage` (in `apps/hb-webparts`) | 36 files, 475 tests pass. New bridge suite included. |
| `npx tsx tools/build-spfx-package.ts --domain hb-homepage` | `hb-intel-homepage.sppkg` produced; package-truth, shim, and homepage effectiveness proofs written. |

## Package proof

- `.sppkg`: `dist/sppkg/hb-intel-homepage.sppkg`
- Solution / feature version: `1.1.79.0`
- Web-part manifest version: `1.1.79.0`
- App bundle filename: `hb-homepage-app-c1b687e6.js`
- App bundle SHA-256 (source): `c1b687e63d192208ae7cda6bb3fbe2fc5217853b3ef1b3a865a11264320b702c`
- `.sppkg` SHA-256: `a9893a18367e78f767b8ba6219cc3caa95af4fa34af091e8d7f56ec8d78f5f18`

### Required-present markers in compiled bundle

All present:

- `safetyFieldExcellenceSourceMode`
- `safetyFieldExcellenceFunctionAppBaseUrl`
- `safetyFieldExcellenceFunctionAppAudience`
- `safetyFieldExcellenceDynamicConfigSeen`
- `safetyFieldExcellenceDynamicConfigResolved`
- `dynamic-only`
- `Weekly Safety Excellence Preview`
- `/api/safety-field-excellence/homepage/current`
- `functionAppBaseUrl`
- `getFunctionAppToken`

### Forbidden homepage admin markers

No homepage-admin / approval-UI markers introduced by this change.

## Hosted proof

OPERATOR-PENDING. Capture per `HOSTED_ACTIVATION_EVIDENCE.md` after deployment:

- runtime proof JSON
- bundle marker proof
- page canvas inspection
- network filter results
- DOM proof

## Rollback

- **Configuration rollback (preferred):** clear the *Source mode* dropdown on the HbHomepageWebPart instance to `(curated-only — default)`. The bridge will not synthesize the dynamic block, and the homepage reverts to curated-only.
- **Package rollback:** redeploy the prior `1.1.78.0` solution package. The new flat properties become inert no-ops; existing nested `safetyFieldExcellenceDynamic` raw-JSON configurations continue to work.
