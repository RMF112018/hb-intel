# UI Kit Brand Asset Integration Summary

## Objective

Revise the image integration approach so the supplied HB and GRIT assets are integrated as **shared brand system assets in `@hbc/ui-kit`**, then consumed by `apps/hb-webparts` in a production-safe way.

## Repo-truth basis

The current repo state already supports the downstream packaging path needed for static assets to ride the `hb-webparts` build and SPFx packaging flow:

- `apps/hb-webparts` uses Vite and emits a cumulative IIFE bundle.
- `apps/hb-webparts/config/package-solution.json` has `includeClientSideAssets: true`.
- `tools/build-spfx-package.ts` copies emitted `dist/` artifacts into the SPFx shell packaging path.
- `apps/hb-webparts` is the homepage/page-canvas product lane and should consume stable shared assets rather than becoming the canonical owner of them.
- `@hbc/ui-kit` is the correct long-term home for reusable HB brand system assets.

## Strategic decision

### Put into `@hbc/ui-kit`
- stable HB wordmark
- stable HB compact marks/icons
- optional GRIT asset if it is intended to be a recurring company/value-system brand asset across multiple surfaces

### Keep out of `@hbc/ui-kit`
- homepage-specific hero photography
- campaign imagery
- comms-managed spotlights
- rotating editorial visuals
- page-specific textures/backgrounds unless reuse becomes real

## Recommended implementation split

### Prompt 01
Create the shared brand asset lane inside `packages/ui-kit`:
- ingest local files
- create governed asset directory
- create branding barrel/registry
- expose a dedicated export path

### Prompt 02
Update `apps/hb-webparts` to consume the assets from `@hbc/ui-kit`:
- integrate primary HB branding into top-band surfaces
- use the shared branding exports rather than app-local asset files
- preserve premium composition and hierarchy

### Prompt 03
Harden exports, docs, and verification:
- validate the branding entry point
- evaluate branded manifest icon strategy
- validate that consuming app builds/package flow still carry the referenced assets
- document governance boundaries between shared brand assets and local homepage imagery

## Design intent

The goal is not asset centralization for its own sake.

The goal is to establish a **canonical brand asset system** that:
- reduces duplication
- supports future shell-extension work
- supports PWA reuse
- supports branded empty states, launcher surfaces, headers, and SharePoint homepage work
- keeps `apps/hb-webparts` focused on composition rather than ownership of master brand assets

## Expected repo outcomes

After successful execution:
- `packages/ui-kit` contains a governed shared branding asset lane
- a dedicated branding export path exists
- `apps/hb-webparts` consumes stable brand assets from the kit
- docs explain the boundary between shared brand assets and local/editorial homepage imagery
- packaging verification demonstrates that webparts consuming ui-kit-owned assets still survive the build/package path correctly
