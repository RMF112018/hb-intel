# 06 — Embed PeopleCulturePublic

## Objective

Embed `PeopleCulturePublic` into `hb-homepage` while preserving the People/Kudos split-runtime boundary.

## Files changed

| File | Change |
|------|--------|
| `src/webparts/hbHomepage/zones/PeopleCulturePublicZone.tsx` | Created. Extracts `peopleCulturePublic` config slice, constructs or passes through `profilePhotoResolver`, wraps module. |
| `src/webparts/hbHomepage/HbHomepageShell.tsx` | Constructs `profilePhotoResolver` from `siteUrl` at shell level, distributes to zone via `zoneProps`. |

## Shell contract

The shell passes:
- `config.peopleCulturePublic` — raw config blob for the module
- `identity` — viewer identity for audience scoping
- `assetBaseUrl` — for media resolution
- `profilePhotoResolver` — constructed via `createSharePointUserPhotoResolver({ siteUrl })` when `siteUrl` is available

The zone wrapper memoizes the resolver to avoid unnecessary re-creation on re-renders.

## Viewer context

- `identity` is passed from the shell's own `identity` prop (sourced from SPFx pageContext in mount.tsx)
- `viewerAudience` is not extracted from shell config in this implementation; PeopleCulturePublic falls back to its default audience handling (companyWide items render, targeted items hidden without viewer)

## Legacy bridge preservation

- `PeopleCulturePublic` still accepts both `config` (legacy merged shape) and `splitConfig` (split shape)
- The zone wrapper passes the raw config blob as `config`, allowing `resolvePublicConfig` in `legacyAdapter.ts` to detect and bridge legacy payloads
- No legacy bridge code was modified or removed
- The bridge continues to drop Kudos entries on entry, preserving the non-recognition guarantee

## Split-runtime boundary proof

- Recognition responsibility remains entirely with `HbKudos` (separate zone, separate wrapper)
- `PeopleCulturePublicZone` does not import any Kudos primitives, Kudos data hooks, or Kudos contracts
- `PeopleCulturePublic` source file unchanged — still explicitly documents "does NOT own recognition"
- `PeopleCultureCompanion` not modified

## Compile verification

- `check-types` passes
- `build` succeeds

## Boundary for HbKudos

HbKudos zone wrapper is implemented. See Prompt 07 closure.
