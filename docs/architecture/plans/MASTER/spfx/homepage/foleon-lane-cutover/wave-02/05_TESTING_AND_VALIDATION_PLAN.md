# 05 — Testing And Validation Plan

## Shared Package / Embedded Reader

Add or update tests in `packages/foleon-reader`:

- Both embedded lanes render in one React tree.
- No `window.__hbIntel_foleon` dependency.
- Preview state has no iframe or fake controls.
- Live state can render iframe path.
- Blocked/error state does not become preview.
- New `onStatusChange` callback, if added, reports `loading`, `preview`, `ready`, `blocked`, and `error` states without telemetry side effects.

## Homepage Zones

Add/update tests under `apps/hb-webparts/src/webparts/hbHomepage/__tests__`:

- `ProjectPortfolioSpotlightZone` renders `FoleonEmbeddedReaderLane` with `lane="projectSpotlight"`.
- `CompanyPulseZone` renders `FoleonEmbeddedReaderLane` with `lane="companyPulse"`.
- Legacy `ProjectPortfolioSpotlight` no longer renders after cutover.
- Legacy `CompanyPulse` no longer renders after cutover.
- Occupant IDs remain unchanged in shell slot data attributes.
- `ZoneErrorBoundary` still wraps the zones.

Mock `@hbc/foleon-reader` in zone tests so tests assert wiring without making SharePoint calls.

## Config Seam Tests

Add tests for the homepage-specific parser/bridge:

- accepts `foleonContentRegistryListId`
- accepts `foleonPlacementsListId`
- accepts `foleonEventsListId`
- accepts `foleonAcceptedOrigins`
- accepts `foleonAllowPreview`
- accepts `foleonExpectedManifestId`
- accepts `foleonExpectedPackageVersion`
- accepts `foleonApiBaseUrl`
- accepts `foleonApiResource`
- maps values correctly into `IFoleonMountConfig`
- sets `foleonRoute` to `projectSpotlight` or `companyPulse`
- uses Foleon expected package version `1.0.21.0`
- does not hardcode tenant GUIDs

## Shell Governance Tests

Run and update existing shell tests as needed:

- protected row pairings still pass
- no unknown occupant fallback
- no invalid assignment fallback
- occupant registry still recognizes the same IDs
- default preset still places `project-portfolio-spotlight` and `company-pulse` in the same locations
- content-state data attributes reflect:
  - `loading`
  - `empty`
  - `strong`
  - `invalid`

Specific existing areas:

- `shell/__tests__/protectedRowPairings.test.ts`
- `shell/__tests__/defaultPresetThreeRow.test.ts`
- `shell/__tests__/occupantRegistry.test.ts`
- `shell/__tests__/occupantContentState.test.tsx`
- `HbHomepageShell.previewFallbackRoute.test.tsx`
- `HbHomepageShell.zoneProps.test.tsx`

## Breakpoint / Fit Evidence

Add unit/hosted evidence where existing harnesses allow it:

- wide desktop
- desktop
- tablet landscape
- tablet portrait
- phone portrait
- narrowest stable
- short height

At minimum, document manual hosted screenshot validation if automated screenshot coverage is not available.

Assertions:

- Project Spotlight remains primary/major in row 1.
- Company Pulse remains primary/major in row 2, right-dominant with Safety.
- tablet/phone stacking remains shell-owned.
- no horizontal overflow.
- preview UI remains the restored blue/orange quality from Foleon `1.0.21.0`.
- mobile preview/collapsed behavior does not eagerly load an iframe in preview state.

## Required Validation Commands

Use repo-truth scripts only:

```bash
pnpm --filter @hbc/spfx-hb-homepage lint
pnpm --filter @hbc/spfx-hb-homepage build

pnpm --filter @hbc/spfx-hb-webparts lint
pnpm --filter @hbc/spfx-hb-webparts check-types
pnpm --filter @hbc/spfx-hb-webparts test

pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader test
```

If Foleon source or shared reader API changes require a deployable Foleon package rebuild:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Homepage package/proof:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-homepage
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage/__tests__/hbHomepagePackageAuthority.test.ts
unzip -Z1 dist/sppkg/hb-intel-homepage.sppkg | rg "ClientSideAssets/banner_home_7_(morning|mid-day|evening|night)\\.png"
```

Use Node 18 where the SPFx shell toolchain requires it.
