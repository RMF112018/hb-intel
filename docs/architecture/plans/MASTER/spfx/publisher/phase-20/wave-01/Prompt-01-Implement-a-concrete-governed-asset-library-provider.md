# Prompt-01 — Implement a concrete governed asset-library provider

## Objective

Close the first half of the asset-governance gap by implementing or confirming the **real concrete provider** behind `AssetLibrarySearchFn` for the supported hosted Publisher runtime.

The codebase already has a strong typed seam for governed image acquisition, but repo truth does not currently prove that a real tenant-safe provider exists behind it. This prompt closes that gap first, before the mount/runtime wiring work.

## Why this matters

The current UI and composer surfaces already present governed asset browse as the intended production posture. If there is no concrete provider behind that seam, the product is still depending on a latent contract rather than a live governed workflow.

That is not acceptable for the supported Project Spotlight runtime.

## Live repo authorities to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/assetLibrarySource.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/AssetLibraryBrowser.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/ImageAssetField.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/MediaComposer.tsx`
- `apps/hb-publisher/src/mount.tsx`
- `packages/sharepoint-platform/src/listDescriptor.ts`
- `packages/sharepoint-platform/src/listRead.ts`
- any existing list-descriptor, SharePoint read-helper, or media-library contract seams already used elsewhere in the repo
- the current doctrine files governing SPFx surface quality and host fit

## Current deficiency

The Publisher has already been rebuilt so that image-authoring surfaces can prefer a governed `searchAssets` seam. But the seam is still only a type-level promise until there is a concrete provider that:

- has a truthful source of asset data
- is explicit about its tenant/site/list assumptions
- returns the typed `AssetLookupEntry` contract the UI expects
- degrades honestly when the host context or library is unavailable

Do not leave this as an abstract placeholder.

## Required implementation outcome

1. Inspect the repo to determine whether a governed asset source already exists.
2. If it does not exist, add it now in the Publisher domain or the appropriate shared seam — do **not** leave the contract abstract.
3. Keep the UI-facing seam typed as `AssetLibrarySearchFn` / `AssetLookupEntry`; do not leak SharePoint transport details upward into the authoring surfaces.
4. Use the repo's strongest current SharePoint binding patterns where practical instead of inventing a one-off fetch style.
5. Make the provider explicit about:
   - target site / library assumptions
   - selected fields
   - search behavior
   - alt-text seeding inputs
   - empty / unavailable / error outcomes
6. Preserve the current Project Spotlight runtime truth and do not broaden this into a general media-platform effort.

## Implementation posture

- favor a single authoritative adapter over scattered inline fetch logic
- centralize mapping from raw SharePoint rows to `AssetLookupEntry`
- centralize request construction instead of baking library details into multiple components
- make failures truthful and author-understandable
- prefer maintainable list/library binding over convenience shortcuts

## Accessibility and interaction constraints

The provider is not allowed to degrade the existing browser/dialog quality already present in the asset UI. Preserve the current accessible overlay posture, including modal semantics, focus containment/return, keyboard dismissal, and visible close affordances where applicable.

## Closure proof requirements

The final implementation must prove all of the following:

- the concrete provider now exists and is no longer implicit
- the provider returns `AssetLookupEntry` in the exact shape the UI needs
- alt-text seeding behavior is defined and truthful
- failures and empty results are handled explicitly
- targeted tests cover mapping and search behavior, not just UI happy paths
- no unsupported destination or generic media-platform scope was introduced

## Prohibited outcomes

- no “TODO later” asset provider
- no raw fetch logic duplicated across hero/secondary/gallery surfaces
- no hidden dependence on title-only or ad hoc binding when the repo already provides a stronger binding pattern
- no regression to URL-first live posture
- no broad redesign of the media UI itself

## Final instruction to the code agent

Make the governed asset provider real, typed, maintainable, and production-truthful now.
Do not stop at interface cleanup.
Do not leave runtime-critical assumptions implicit.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
