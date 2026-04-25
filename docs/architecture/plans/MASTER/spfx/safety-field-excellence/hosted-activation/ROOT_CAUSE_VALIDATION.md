# ROOT_CAUSE_VALIDATION — Safety Field Excellence Hosted Activation

**Status:** Source code is correct. No source remediation required for activation.
**Required fix:** Active SharePoint page/webpart configuration of the deployed HbHomepageWebPart instance, plus a property-pane / config-bridge hardening pass so operators do not need raw nested-JSON edits.

## Evidence

Hosted runtime proof (current homepage instance):

- `sourceMode: "curated-only"`
- `dataSource: "curated"`
- `backendFunctionAppUrlConfigured: false`
- `currentEndpointConfigured: false`
- `previewFallbackRendered: false`
- `safetyFieldExcellenceDynamicConfigSeen: false`
- `safetyFieldExcellenceDynamicConfigResolved: false`

Hosted bundle marker proof (loaded `hbHomepage` IIFE):

- contains `Weekly Safety Excellence Preview`
- contains `dynamic-only`
- contains `functionAppBaseUrl`
- contains `getFunctionAppToken`
- contains `/api/safety-field-excellence/homepage/current`
- contains `safetyFieldExcellenceDynamicConfigSeen` and `safetyFieldExcellenceDynamicConfigResolved`

The bundle exposes the dynamic source code path; the runtime did not enter it.

## Repo-truth inspection

| File | Finding |
| --- | --- |
| `apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx` | Reads `moduleConfig.safetyFieldExcellenceDynamic`; emits both `safetyFieldExcellenceDynamicConfigSeen` and `safetyFieldExcellenceDynamicConfigResolved` diagnostics. Correct. |
| `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx` | Resolves `sourceMode`, builds token call, decides preview/curated fallback, publishes runtime proof with all expected fields. Correct. |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx` | Registers `SafetyFieldExcellenceZone` against the `safety-field-excellence` occupant id. Correct. |
| `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts` | `safety-field-excellence` is a registered occupant id and slot consumer. Correct. |
| `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts` | Existing module slice extraction pulls `safetyFieldExcellence` and `safetyFieldExcellenceDynamic` from `webPartProperties`; passes them into the shell. Correct. |
| `apps/hb-webparts/src/webparts/hbHomepage/wiring/safetyFunctionAppWiring.ts` | Pure helper; reads top-level `functionAppBaseUrl` (with nested fallback) and prefers `functionAppAudience` over `backendAudience`. Correct. |
| `apps/hb-homepage/src/mount.tsx` | Calls `resolveSafetyFunctionAppWiring(webPartProperties, createApiTokenProvider)` and forwards `functionAppBaseUrl` + `getFunctionAppToken` into `HbHomepage`. Correct. |
| `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | Property pane for `HB_HOMEPAGE_WEBPART_ID` exposes only Foleon fields. **No** Safety Field Excellence inputs (no `sourceMode`, `functionAppBaseUrl`, `functionAppAudience`, `safetyHubUrl`, `includeStale`, `emergencyUseCuratedFallback`, `diagnosticsEnabled`). |
| `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | `properties: {}` — no tenant-specific defaults. Correct. |
| `apps/hb-homepage/config/package-solution.json` | Package shipped at `1.1.78.0`. Correct. |
| `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.previewFallbackRoute.test.tsx` | End-to-end shell→zone→provider→adapter coverage for the dynamic preview fallback path is in place. Correct. |

## Tested hypotheses

| Hypothesis | Result |
| --- | --- |
| Bundle was published without dynamic markers (stale package on CDN) | **Ruled out.** Marker proof in operator evidence shows all dynamic markers present in the loaded bundle. |
| `SafetyFieldExcellenceZone` does not pass diagnostic flags into the provider | **Ruled out.** Both `…ConfigSeen` and `…ConfigResolved` are passed and forwarded into the runtime proof. |
| `mount.tsx` does not propagate `functionAppBaseUrl` / `getFunctionAppToken` | **Ruled out.** Both are derived from `resolveSafetyFunctionAppWiring` and forwarded into `HbHomepage` props. |
| Provider ignores nested `safetyFieldExcellenceDynamic` block | **Ruled out.** Zone resolves the nested object before invoking the provider; provider honors `sourceMode`, `functionAppBaseUrl`, `safetyHubUrl`, `includeStale`, `emergencyUseCuratedFallback`. |
| Manifest hard-coded a tenant Function App URL | **Ruled out.** `HbHomepageWebPart.manifest.json` `properties` is `{}`. |
| Page configuration is missing the activation inputs | **Confirmed.** `safetyFieldExcellenceDynamicConfigSeen: false` is the upstream signal that the `safetyFieldExcellenceDynamic` key was never present on the webpart instance properties. |

## Decision-tree branch

**Branch: page configuration.** The deployed page does not carry the `safetyFieldExcellenceDynamic` block, a `functionAppBaseUrl`, or a `functionAppAudience` on the HbHomepageWebPart instance properties. Curated-only is the safe default and is what is rendering.

## Operator actions (no source change required)

The deployed homepage page must be edited so the HbHomepageWebPart instance carries activation inputs. Either:

1. Set the nested `safetyFieldExcellenceDynamic` block on the webpart instance properties (current, raw-JSON path), with `sourceMode`, `functionAppBaseUrl`, and the preferred `functionAppAudience`; or
2. Use the new flat property-pane fields delivered by Prompt 03 hardening, which normalize into the same nested runtime shape.

Detailed runbook: `HOSTED_ACTIVATION_EVIDENCE.md`.

## Boundaries respected

- No backend scoring, timer, publish workflow, or admin-approval changes.
- No raw SharePoint Safety list aggregation introduced into SPFx.
- No MSAL.
- No tenant-specific Function App URL or audience hard-coded in manifest defaults.
