# Phase 10 — Packaging, Runtime Proof, and Production Hardening

## Objective

Validate the complete merged feature through the existing hb-webparts package lane and SharePoint-hosted runtime.

## Why this package exists

This phase exists because the finished feature must be proven in the real deployment path rather than assumed correct from local structure alone.

## Package contents

- implementation summary
- prompt 01
- prompt 02
- validation checklist

## Verification results (P10-01)

- **check-types**: pass
- **lint**: pass (clean)
- **build**: pass — 522.07 KB JS, 24.84 KB CSS
- **test**: 98 pass, 14 pre-existing failures in unrelated files
- **validate-manifests**: 2 pre-existing errors (CSS hero marker, estimating IIFE) — not related to People & Culture
- **spfx-bundle-check**: homepage Lane A budget exceedance is pre-existing (509.8 KB → 400 KB budget) — People & Culture contribution is incremental and within expected growth
- **version bump**: 0.0.12 → 0.0.13

## Hosted runtime proof (P10-02)

- **mount dispatcher**: updated to route webpart ID `27ac10f4` to `PeopleCultureMerged`
- **manifest**: updated to merged config shape (announcements, kudos, celebrations arrays)
- **build**: pass — 540.99 KB JS (merged component now tree-shaken into bundle)
- **test**: 98 pass, 14 pre-existing failures
- **old component**: `PeopleCulture.tsx` preserved for reference composition and backwards compatibility

## Implementation artifacts

- `apps/hb-webparts/src/mount.tsx` — dispatcher routes to PeopleCultureMerged
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json` — merged config shape
