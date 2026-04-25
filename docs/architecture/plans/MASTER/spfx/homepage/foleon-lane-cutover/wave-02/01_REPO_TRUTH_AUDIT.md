# 01 — Repo Truth Audit

## Files Inspected

Shared Foleon reader package:

- `packages/foleon-reader/src/index.ts`
- `packages/foleon-reader/src/FoleonEmbeddedReaderLane.tsx`
- `packages/foleon-reader/src/runtime/embeddedRuntimeContract.ts`
- `packages/foleon-reader/package.json`

Homepage runtime and shell:

- `apps/hb-homepage/src/mount.tsx`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/hb-homepage/package.json`
- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-webparts/package.json`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantContentState.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/ProjectPortfolioSpotlightZone.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/CompanyPulseZone.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/**`

SPFx shell and package proof:

- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/src/webparts/shell/foleonRuntimeConfigBridge.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json`
- `tools/spfx-shell/config/package-solution.json`
- `docs/how-to/verify-hb-intel-homepage-sppkg.md`
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepagePackageAuthority.test.ts`
- `tools/build-spfx-package.ts`

## Shared Reader Facts

`@hbc/foleon-reader` exposes a bounded public API in `packages/foleon-reader/src/index.ts`.

`FoleonEmbeddedReaderLane` accepts only `lane: 'projectSpotlight' | 'companyPulse'` and dispatches to `ProjectSpotlightReader` or `CompanyPulseReader`.

`createEmbeddedFoleonRuntimeContract` accepts the hosted config values required for homepage embedding:

- list IDs
- accepted origins
- preview flag
- expected manifest/package version
- Foleon route
- API base/resource
- optional `getAccessToken`

The package has no property pane, no global mount, and no App Catalog concern. Wave 01 validation proved both lanes can render in a single React tree without `window.__hbIntel_foleon`.

## Homepage Shell Facts

Current occupant IDs are closed in `shellTypes.ts` and `shellSchema.ts`:

- `company-pulse`
- `leadership-message`
- `project-portfolio-spotlight`
- `people-culture-public`
- `hb-kudos`
- `safety-field-excellence`

The zone registry is in `HbHomepageShell.tsx`:

- `company-pulse` maps to `CompanyPulseZone`
- `project-portfolio-spotlight` maps to `ProjectPortfolioSpotlightZone`

The default preset preserves:

- Row 1: `project-portfolio-spotlight` primary major + `hb-kudos` secondary minor.
- Row 2: `safety-field-excellence` secondary minor + `company-pulse` primary major, right-dominant.

Protected row pairings in `protectedDecisions.ts` match the default preset. Wave 02 should not change these IDs or pairings.

## Current Zone Facts

`ProjectPortfolioSpotlightZone.tsx` currently renders legacy `ProjectPortfolioSpotlight` and does not report content state.

`CompanyPulseZone.tsx` currently renders legacy `CompanyPulse`, normalizes legacy Company Pulse config, and reports content state from that legacy feed.

Wave 02 must replace these zone internals and stop legacy feed-derived content state from driving shell diagnostics after the cutover.

## Config Flow Facts

`apps/hb-homepage/src/mount.tsx` reads `config.webPartProperties` and passes it as `HbHomepageProps.config` into `HbHomepage`.

`HbHomepageEntryStack` extracts wrapper-only hero/launcher config via `hbHomepageWrapperConfig.ts`.

`HbHomepageShell` extracts shell module config through `extractModuleConfigSlices(config)` and builds `zoneProps`.

`ShellWebPart.ts` currently calls `applyFoleonRuntimeConfigBridge(runtimeConfig, webPartId, this.properties, FOLEON_WEBPART_ID)`, which only bridges Foleon-specific properties when the webpart ID equals `2160edb3-675e-4451-92bb-8345f9d1c71e`. It does not apply to the homepage webpart ID `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`.

## Version Facts

The inspected workspace currently shows homepage version `1.1.76.0` in:

- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `packages/homepage-launcher/src/constants.ts`

The plan should verify whether these changes are already committed before implementation. If the execution baseline is still `1.1.75.0`, Wave 02 should bump to `1.1.76.0`. If `1.1.76.0` is already committed on main, Wave 02 should use the next coherent version.

## Dirty Working Tree Note

During planning, the workspace contained unrelated unstaged homepage and docs changes. Wave 02 implementation must start from a reviewed baseline or preserve user-owned changes without reverting them.
