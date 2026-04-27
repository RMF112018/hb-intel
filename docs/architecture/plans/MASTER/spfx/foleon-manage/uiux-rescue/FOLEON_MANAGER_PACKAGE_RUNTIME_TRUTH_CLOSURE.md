# Foleon Manager package/runtime truth closure

Date: 2026-04-27  
Scope: package/runtime remediation only (no additional UI redesign)

## Summary

Hosted runtime proof confirms the Foleon Manager rescue UI is already live on the target SharePoint page, and old primary strings are absent from the rendered experience. Per operator decision, a forced governance version bump was still executed to `1.0.29.0`, then package truth was rebuilt and re-proven.

No backend route, registry/readiness architecture, or workflow behavior changes were introduced.

## Source-truth evidence

Required history/audit commands were run:

- `git status --short`
- `git branch --show-current`
- `git log --oneline -n 20`
- `git show --stat 782e1bc9e`
- `git show --stat 6f18b8734`
- `git show --stat 3bb6452e2`
- `git show --stat 2ba852fcd`
- `git show --stat 873a1a105 || true`
- `git show --stat f2f628dd9 || true`
- `git diff --stat`
- `git diff --name-only`

Wave commits present in repo truth:

- `782e1bc9e` (Wave 01)
- `6f18b8734` (Wave 02)
- `3bb6452e2` (Wave 03)
- `2ba852fcd` (Wave 04)
- `873a1a105a816bdb564ee6576600dc012631cb9a` (Wave 05)
- `f2f628dd9c4c56b567214abaae7b3cb6e02953c7` (follow-up package/proof collateral)

## Tenant runtime evidence (hosted page)

Target page:

- `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Foleon-Manager.aspx`

Provided runtime binding proof highlights:

- `manifestId`: `2160edb3-675e-4451-92bb-8345f9d1c71e`
- `packageVersion`: `1.0.28.0` (pre-bump runtime)
- `hostMode`: `sharepoint`
- `route`: `manage`
- `canInitialize`: `true`
- `governance.manifestIdMatchesExpected`: `true`
- `governance.packageVersionMatchesExpected`: `true`
- `foleonPropertyBridge.bridgeAppearsApplied`: `true`

Provided resource scan result:

- JS scan filtered result returned `Array(0)` for the specific string probe query.

Provided DOM scan result:

- `hasFoleonManager: true`
- `hasLimitedMode: true`
- `hasRuntimeReadinessSummary: false`
- `hasConfigSourceByValue: false`
- excerpt includes:
  - `Foleon Manager`
  - `MARKETING OPERATIONS`
  - `Manage homepage Foleon content, placements, and publishing readiness.`
  - `Limited mode`
  - `Showing Foleon Connector management.`

Runtime decision classification:

- **Case C**: new experience is present in rendered DOM; old primary strings are absent.

## Root cause finding

At time of hosted check, runtime was serving the expected Manager experience already (route `manage`, modern shell copy, limited/degraded-ready behavior), indicating no missing UI rescue deployment in source artifacts. Any “unchanged UI” perception was likely due to stale validation context, cache, or comparing against a different page/session snapshot.

## Forced remediation executed

Per explicit operator decision, applied a governance-only version bump to `1.0.29.0`:

- `apps/hb-intel-foleon/config/package-solution.json`
- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json`
- `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`

Plus directly-required package/version consistency files:

- `tools/spfx-shell/config/package-solution.json`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json`
- `apps/hb-intel-foleon/scripts/validate-foleon-feature-assets.ts`

## Validation commands and results

- `pnpm --filter @hbc/spfx-hb-intel-foleon lint` — pass (warnings only)
- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types` — pass
- `pnpm --filter @hbc/spfx-hb-intel-foleon test` — pass (306 tests)
- `pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate` — pass (498 checks)
- `pnpm --filter @hbc/spfx-hb-intel-foleon build` — pass

Package build notes:

- `pnpm exec tsx tools/build-spfx-package.ts --app hb-intel-foleon` failed in this environment because it attempted unrelated `hb-publisher` build under Node 22.
- Domain-scoped fallback used successfully:
  - `npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon`
  - packaging toolchain auto-selected Node 18 and completed.

## Package-truth evidence (post-bump)

Built package:

- `dist/sppkg/hb-intel-foleon.sppkg`

SHA256:

- `edbca5954bf6f7665473d8afe4b62028f54bba41bcef215019348a08a49e12d8`

App/feature identity:

- ProductID: `c23635f5-ab4d-44c2-96b5-2a2c90f4afc0`
- Component ID: `2160edb3-675e-4451-92bb-8345f9d1c71e`
- AppManifest version: `1.0.29.0`
- Feature version: `1.0.29.0`

Packaged assets:

- JS:
  - `hb-intel-foleon-app-f6d7d722.js`
  - `shell-entry-2160edb3-675e-4451-92bb-8345f9d1c71e-1e8d6e3d.js`
  - `shell-web-part_018b57f8134969896aae.js`
- CSS:
  - `spfx-hb-intel-foleon-1dbd7dd0.css`

String proof:

- Present in packaged app bundle:
  - `Foleon Manager`
  - `Marketing Operations`
  - `Required admin actions`
  - `System health`
  - `Limited mode`
- Legacy primary strings absent in packaged app bundle:
  - `Runtime Readiness Summary`
  - `Config Source by Value`
- `1.0.29.0` present in packaged manifest/feature/shell-entry references.
- `1.0.28.0` absent from key packaged manifest/feature/shell-entry files.

## App catalog / page-instance remediation guidance

Deploy the new package and verify:

1. Upload `dist/sppkg/hb-intel-foleon.sppkg` to app catalog.
2. Deploy/update app to `1.0.29.0`.
3. Confirm site app instance updated.
4. Confirm page webpart instance:
   - component ID `2160edb3-675e-4451-92bb-8345f9d1c71e`
   - `foleonRoute: "manage"`
   - expected package version aligned to `1.0.29.0`
5. Hard-refresh (cache disabled) and validate again in InPrivate/Incognito.

## Guardrail confirmation

- No backend route changes.
- No registry/readiness architecture changes.
- No split-readiness collapse.
- No degraded consent-required behavior removal.
- No unrelated homepage/hbKudos/hbHomepage/foleon-reader modifications.

## Commit message

`SPFx Foleon Manager: bump package version for tenant deployment`
