# 09 — Local Agent Implementation Prompt

## Objective

Implement Wave 02 — Homepage Shell Foleon Lane Cutover.

Replace the current homepage shell zone internals so:

- `project-portfolio-spotlight` renders `FoleonEmbeddedReaderLane lane="projectSpotlight"`.
- `company-pulse` renders `FoleonEmbeddedReaderLane lane="companyPulse"`.

Preserve shell layout governance. This is not a redesign.

## Required Strategy

Use Strategy A: Shared React Component Integration.

Do not call or load `window.__hbIntel_foleon`.
Do not mount the Foleon IIFE twice.
Do not use the standalone Foleon app global mount.
Render `@hbc/foleon-reader` directly inside the homepage React tree.

## Scope

Implement only Wave 02.

Do not change:

- shell protected row pairings
- default preset occupant IDs
- hero
- Priority Actions launcher
- Safety
- Kudos
- PnP Ops
- unrelated shell code
- tenant schema

## Required Implementation

1. Add `@hbc/foleon-reader` to the homepage runtime dependency graph.
2. Add homepage-specific Foleon property-pane/config support for HB Homepage webpart ID `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`.
3. Support these homepage property names:
   - `foleonContentRegistryListId`
   - `foleonPlacementsListId`
   - `foleonEventsListId`
   - `foleonAcceptedOrigins`
   - `foleonAllowPreview`
   - `foleonExpectedManifestId`
   - `foleonExpectedPackageVersion`
   - `foleonApiBaseUrl`
   - `foleonApiResource`
4. Add `FoleonHomepageLaneHost`.
5. Map homepage-specific property names into `IFoleonMountConfig`.
6. Use Foleon expected package version `1.0.21.0` unless a newer Foleon package is produced during implementation.
7. Replace `ProjectPortfolioSpotlightZone.tsx` internals with Project Spotlight Foleon lane.
8. Replace `CompanyPulseZone.tsx` internals with Company Pulse Foleon lane.
9. Keep both zones wrapped in `ZoneErrorBoundary`.
10. Report shell content-state:
    - `loading` while resolving
    - `empty` for preview/no active record
    - `strong` for live reader
    - `invalid` for blocked/config/error
11. If needed, add minimal optional `onStatusChange` API to `@hbc/foleon-reader`.
12. Add/update tests for wiring, config, content-state, shell governance, and package authority.
13. Bump homepage package version coherently according to repo truth.
14. Validate and package.
15. Commit only scoped Wave 02 changes.

## Validation

Run:

```bash
pnpm --filter @hbc/spfx-hb-homepage lint
pnpm --filter @hbc/spfx-hb-homepage build

pnpm --filter @hbc/spfx-hb-webparts lint
pnpm --filter @hbc/spfx-hb-webparts check-types
pnpm --filter @hbc/spfx-hb-webparts test

pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader test

npx tsx tools/build-spfx-package.ts --domain hb-homepage
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage/__tests__/hbHomepagePackageAuthority.test.ts
unzip -Z1 dist/sppkg/hb-intel-homepage.sppkg | rg "ClientSideAssets/banner_home_7_(morning|mid-day|evening|night)\\.png"
```

If Foleon/shared-reader changes are packaged through Foleon, also run the full Foleon package proof chain and bump Foleon coherently.

Use Node 18 where SPFx tooling requires it.

## Commit

Suggested commit:

```text
hb-homepage: wire foleon reader lanes into homepage shell
```

## Closure Report

Return:

- files changed
- package boundaries changed
- version-bearing files changed
- embedding strategy
- occupants preserved
- config seam
- Project Spotlight behavior
- Company Pulse behavior
- content-state behavior
- multi-instance safety
- validation results
- package artifact path and staged status
- tenant follow-up
- commit SHA
