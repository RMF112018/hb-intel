# 07 — Tenant Rollout Runbook

## Pre-Deployment

Confirm local package proof passed for the homepage package:

- `dist/sppkg/hb-intel-homepage.sppkg`
- `dist/sppkg/hb-intel-homepage-effectiveness-proof.json`
- version authority aligned
- flagship markers present
- canonical homepage banner assets present

Confirm Foleon package `1.0.21.0` is deployed if Wave 02 points homepage embedded lanes at that expected version.

## Deploy

1. Upload rebuilt `hb-intel-homepage.sppkg` to the appropriate App Catalog.
2. Approve/enable the new package version.
3. Keep the hosted page to one HB Homepage webpart instance in full-width mode.
4. Do not add standalone Foleon reader webparts to the same homepage for these two lanes.

## Homepage Webpart Properties

Update existing HB Homepage webpart properties with:

- `foleonContentRegistryListId`
- `foleonPlacementsListId`
- `foleonEventsListId`
- `foleonAcceptedOrigins`
- `foleonAllowPreview`
- `foleonExpectedManifestId`
- `foleonExpectedPackageVersion`
- `foleonApiBaseUrl`
- `foleonApiResource`

Required values:

- `foleonExpectedManifestId = 2160edb3-675e-4451-92bb-8345f9d1c71e`
- `foleonExpectedPackageVersion = 1.0.21.0` unless Wave 02 produces a newer Foleon package
- `foleonAcceptedOrigins` includes `https://viewer.us.foleon.com`
- tenant list IDs come from the actual provisioned HBCentral lists

Do not hardcode these GUIDs in source.

## Hosted Validation

Validate Project Spotlight:

- Old Project Portfolio Spotlight location now renders Foleon Project Spotlight.
- Preview renders when no active record exists.
- Live reader renders when an active Project Spotlight record exists.
- No `window.__hbIntel_foleon` mount is used by the homepage path.
- No fake preview CTA, fake archive button, fake Foleon URL, or preview telemetry.

Validate Company Pulse:

- Old Newsroom / Company Pulse location now renders Foleon Company Pulse.
- Preview renders when no active record exists.
- Live reader renders when an active Company Pulse record exists.
- No stale legacy CompanyPulse feed UI renders.

Validate shell:

- Protected row pairings are intact.
- No unknown occupant fallback appears.
- No invalid assignment fallback appears.
- `data-shell-occupant-content-state` reports expected values:
  - `empty` for preview/no active record
  - `strong` for live reader
  - `invalid` for blocked/config errors
  - `loading` while resolving

## Breakpoint Evidence

Capture hosted screenshots for:

- wide desktop
- desktop
- tablet landscape
- tablet portrait
- phone portrait
- narrowest stable
- short height

Confirm:

- no horizontal overflow
- row stacking remains shell-owned
- Project Spotlight stays in row 1 major/primary location
- Company Pulse stays in row 2 primary/major location
- restored blue/orange Foleon preview quality is preserved

## Rollback

Rollback options:

- restore previous homepage `.sppkg` version in App Catalog
- revert homepage webpart property updates
- keep Foleon package deployed; it remains independently usable by standalone Foleon webparts

Do not mutate tenant lists for rollback.
