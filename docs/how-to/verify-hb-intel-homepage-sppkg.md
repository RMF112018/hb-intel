# Verify `hb-intel-homepage.sppkg` Package Effectiveness

## Purpose
This is the focused runbook for proving that a rebuilt
`hb-intel-homepage.sppkg` actually contains the wrapper-owned flagship
Priority Actions Rail path, the canonical homepage hero banner assets,
**and** that the package version is trustworthy enough for SharePoint
to apply. Use it whenever a change touches the HB Homepage flagship
runtime and you need to close on hosted effectiveness — not just local
compile success.

## Version authority
The standalone homepage package has exactly one authoritative version
field, and two fields that must mirror it:

1. **Authority** — `apps/hb-homepage/config/package-solution.json`
   → `solution.version` (SPFx 4-part schema: `{00}.{00}.{00}.{00}`)
2. **Mirror A** — same file → `solution.features[0].version`
3. **Mirror B** — `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
   → `version`

All three MUST be identical. The guard is enforced in two places:

- **Build-time**: `tools/build-spfx-package.ts --domain hb-homepage`
  refuses to produce a .sppkg if any of the three diverge.
- **Test-time**: `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepagePackageAuthority.test.ts`
  fails in CI / vitest if the authority drifts.

A version bump is always three coordinated edits.

## Rebuild command
```
npx tsx tools/build-spfx-package.ts --domain hb-homepage
```

Outputs:
- `dist/sppkg/hb-intel-homepage.sppkg` — the deployable artifact
- `dist/sppkg/hb-homepage-package-truth-proof.json` — structural /
  freshness / semantic / runtime-marker proof for the package
- `dist/sppkg/hb-homepage-shim-proof.json` — shim-entry proof
- `dist/sppkg/hb-intel-homepage-effectiveness-proof.json` — **focused
  effectiveness proof for the flagship rail path and canonical homepage
  hero-banner shipping contract (this runbook's
  primary artifact)**

For the Foleon communications-lane cutover, the expected closure
artifact is:

- `dist/sppkg/hb-intel-homepage.sppkg`
- homepage package version `1.1.78.0`
- embedded Foleon expected package version `1.0.23.0`
- generated proof JSONs:
  - `dist/sppkg/hb-intel-homepage-effectiveness-proof.json`
  - `dist/sppkg/hb-homepage-package-truth-proof.json`

Generated `dist/` artifacts are ignored by repo policy and must not be
staged for this documentation/evidence closure.

If the current proof JSON reports any homepage version other than
`1.1.78.0`, do not use that artifact to close the three-lane Foleon
communications cutover. The Prompt 05 evidence record documents one
such local mismatch: the ignored artifact on disk was fresh relative to
dirty local source, but reported `1.1.79.0` and therefore did not satisfy
the accepted `1.1.78.0` closure target.

Canonical homepage banner ownership seam:
- `apps/hb-homepage/assets/hero-banners/`
  - `banner_home_7_morning.png`
  - `banner_home_7_mid-day.png`
  - `banner_home_7_evening.png`
  - `banner_home_7_night.png`

Default homepage hero banner URL assembly is resolver-owned by:
- `apps/hb-webparts/src/webparts/hbSignatureHero/homepageHeroBannerAssetResolver.ts`
- The runtime hero uses this resolver instead of raw `assetBaseUrl + fileName`
  concatenation, so trailing slash formatting on `assetBaseUrl` is normalized.

Default banner filename selection is time-of-day contract owned by:
- `apps/hb-webparts/src/webparts/hbSignatureHero/homepageHeroBannerTimeOfDaySelector.ts`
- Contract (local system time):
  - `5:00 AM` through `9:00 AM` -> `banner_home_7_morning.png`
  - `9:01 AM` through `5:00 PM` -> `banner_home_7_mid-day.png`
  - `5:01 PM` through `8:00 PM` -> `banner_home_7_evening.png`
  - `8:01 PM` through `4:59 AM` -> `banner_home_7_night.png`

## Effectiveness proof — what to inspect
Open `dist/sppkg/hb-intel-homepage-effectiveness-proof.json` and
confirm every one of:

| Field | Expected |
|---|---|
| `versionAuthority.aligned` | `true` |
| `versionAuthority.solutionVersion` | matches `package-solution.json::solution.version` |
| `versionAuthority.webpartManifestVersion` | matches authority above |
| `checks.versionAuthorityAligned.pass` | `true` |
| `checks.flagshipMarkersPresent.pass` | `true` |
| `checks.homepageBannerAssetsPresent.pass` | `true` |
| `flagshipMarkerChecks[*].present` | all `true` |
| `homepageCanonicalBannerSource` | `apps/hb-homepage/assets/hero-banners` |
| `packagedHomepageBannerAssets[*].present` | all `true` |
| `criticalRuntimePaths` | includes `HbHomepageEntryStack.tsx`, `PriorityActionsRail.tsx`, `HbcPriorityRailSurface.tsx`, `priority-rail.module.css`, `hbHomepageWrapperConfig.ts`, etc. |
| `packagedAppBundle.sha256` | matches current source bundle SHA |

If `flagshipMarkersPresent.pass === false`, the disputed rail code did
**not** land in the packaged bundle — investigate the bundle
assembly, tree-shaking, or entry-graph before deploying.

If `homepageBannerAssetsPresent.pass === false`, the package is missing
one or more canonical homepage hero banners. Do not deploy until all
four banner files are present in `ClientSideAssets`.

Quick archive proof command:
```
unzip -Z1 dist/sppkg/hb-intel-homepage.sppkg | rg "ClientSideAssets/banner_home_7_(morning|mid-day|evening|night)\\.png"
```

## Critical runtime source coverage
The effectiveness proof fingerprints these files. Edits to any must
appear in the bundle or the proof fails:

- `apps/hb-homepage/src/mount.tsx`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsCuration.ts`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`

The canonical list lives in `tools/build-spfx-package.ts::HB_HOMEPAGE_CRITICAL_RUNTIME_PATHS`.
Update both the list and this doc together when the contract changes.

## Deploy the fresh package
1. Upload `dist/sppkg/hb-intel-homepage.sppkg` to the tenant app
   catalog (Site collection app catalog or Tenant app catalog per
   your governance).
2. Approve/enable the new version.
3. Navigate to the HB Intel homepage site. Hard refresh so SharePoint
   re-pulls the updated bundle (or wait for CDN/cache TTL).

## Hosted page composition
The homepage page must contain exactly one instance of the HB
Homepage webpart (ID `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`) placed
in full-width mode.

Cutover rule (single flagship hero + single flagship rail):
- Remove any separate standalone `HbSignatureHero` webpart instance
  (ID `28acd6a7-2582-4d8a-86d4-b52bfbeb375c`) from the flagship page.
- Remove any separate standalone `PriorityActionsRail` webpart
  instances from the flagship page.

During transition, if a standalone homepage hero is still authored
while the wrapper-owned hero exists, runtime duplicate guardrails
suppress the standalone homepage hero and emit diagnostics. Treat this
as a cutover defect that must be corrected in page authoring.

## Runtime DOM verification
Open DevTools on the deployed homepage and confirm each of these
selectors returns a live element:

### Wrapper layer
- `[data-hb-homepage-entry-stack="root"]`
- `[data-hb-homepage-entry-stack-owner="hb-homepage-wrapper"]`
- `[data-hb-homepage-entry-stack-region="hero"]`
- `[data-hb-homepage-entry-stack-hero-authority="shared-entry-state"]`
- `[data-hb-homepage-entry-stack-region="priority-actions"]`

### Flagship rail surface
- `[data-hbc-ui="priority-rail"][data-hbc-priority-rail-context="homepage-flagship"]`
- `[data-hbc-flagship-layout="command-strip"]`
- `[data-hbc-flagship-grid="true"]` (when at least one primary action)
- `[data-hbc-flagship-tile="true"]` with `data-hbc-flagship-tile-index="01|02|…"`
- `[data-hbc-flagship-strip-density]` equals `sparse` / `standard` / `dense`

### Container/device
- `[data-hbc-rail-device-class]`
- `[data-hbc-rail-shell-state]`

### Hero single-path checks
- Exactly one `[data-hbc-premium="signature-hero"]` should exist on the flagship page.
- The hero should report wrapper path authority:
  - `[data-hbc-hero-flagship-render-path="wrapper-embedded"]`
  - `[data-hbc-hero-entry-authority="shared-entry-state"]`
- Duplicate transition diagnostic must be absent after cleanup:
  - `[data-hb-signature-hero-duplicate-guard="suppressed-standalone-homepage"]`

If any wrapper-layer marker is missing, the homepage is rendering a
pre-wrapper build — redeploy with the fresh `.sppkg`.

If wrapper markers are present but flagship-rail markers are missing,
the rail context failed to activate — open the effectiveness proof
and confirm `flagshipMarkerChecks` all pass.

If all markers are present but the visual still reads as "generic
sparse card row," the `PriorityActionsConfig` list under
`bandKey = 'homepage-primary'` is unseeded or disabled. Seed at
least one enabled config row and 3+ items.

### Foleon communications lanes

For the three-lane Foleon cutover, also confirm:

- Project Spotlight renders in the former Project Portfolio Spotlight location.
- Company Pulse renders in the former Newsroom / Company Pulse location.
- Leadership Message renders in the former Message from Leadership location.
- With no active registry/placement record, each lane shows its preview/empty state.
- With valid active records and placements, live content replaces the preview state.
- The runtime proof has no package-version mismatch.
- Homepage embedded lanes do not depend on `window.__hbIntel_foleon`.

Existing homepage webpart instances must have these persisted
properties reviewed after package deployment:

```text
foleonContentRegistryListId
foleonPlacementsListId
foleonEventsListId
foleonAcceptedOrigins
foleonAllowPreview
foleonExpectedManifestId
foleonExpectedPackageVersion = 1.0.23.0
foleonApiBaseUrl
foleonApiResource
```

## Screenshot evidence for closure
Capture:
1. A hosted screenshot showing at least three command tiles each with
   a visible numeric index chip (`01`, `02`, `03`).
2. The masthead header with its brand-accent bottom rule.
3. DevTools with the `data-hbc-priority-rail-context="homepage-flagship"`
   attribute expanded.
4. The app catalog view showing the deployed `.sppkg` version
   matches the effectiveness-proof `versionAuthority.solutionVersion`.

For full breakpoint-matrix and packaged-truth sign-off across the
audited seven viewports, record evidence in
[`../reference/spfx-surfaces/homepage-hosted-breakpoint-evidence.md`](../reference/spfx-surfaces/homepage-hosted-breakpoint-evidence.md).

## Signals the wrong surface / package is still being rendered
- The homepage DOM has no `data-hb-homepage-entry-stack="root"`.
- The homepage DOM has no `data-hb-homepage-entry-stack-region="hero"`.
- `data-hbc-priority-rail-context` is `default` (or absent).
- Tiles are stretched to fill the full band with no index chip.
- The app catalog reports a .sppkg version older than the effectiveness proof’s `solutionVersion`.
- Two `data-hbc-ui="priority-rail"` roots exist on the page (indicates a stray standalone rail webpart).
- Two `[data-hbc-premium="signature-hero"]` roots exist (indicates a stray standalone flagship hero webpart).
- `[data-hb-signature-hero-duplicate-guard="suppressed-standalone-homepage"]` appears on hosted flagship pages after cutover (indicates stale standalone hero authoring).

Any one of these invalidates closure — stop and correct deployment
before signing off.
