# Prompt-02 — Wire governed asset acquisition through mount and all image surfaces

## Objective

Close the second half of the asset-governance gap by threading the concrete asset provider through the actual hosted runtime boundary and proving that all relevant authoring flows truly lead with governed browse/search in the supported Project Spotlight runtime.

## Why this matters

Repo truth currently shows a strong component-level design for governed asset acquisition, but the real mount boundary still does not pass `searchAssets` into `ArticlePublisher`.

That means the live hosted runtime is still at high risk of falling back to URL-first acquisition even though the UI was designed to avoid that.

This prompt closes that runtime truth gap.

## Live repo authorities to inspect first

- `apps/hb-publisher/src/mount.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/SecondaryImagePanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/MediaComposer.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/ImageAssetField.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/AssetLibraryBrowser.tsx`
- any dev-preview / hosted runtime fallback seams in `mount.tsx`
- Prompt 01 output

## Current deficiency

The authoring components are already written so that:

- governed library browse becomes the primary action when `searchAssets` exists
- raw custom URLs are demoted behind advanced disclosure
- gallery/media flows can seed preview and alt text from governed selections

But that design is not fully meaningful until the mount/runtime path actually provides the provider in the supported hosted page.

## Required implementation outcome

1. Wire the concrete provider from Prompt 01 through the supported hosted runtime boundary in `mount.tsx`.
2. Pass `searchAssets` into `ArticlePublisher` in the real hosted runtime.
3. Ensure every relevant image-authoring surface receives and uses that seam consistently:
   - hero image
   - secondary image
   - gallery/media composer
4. Keep raw URL entry available only as an explicit subordinate/advanced path where already intended.
5. Preserve dev-preview, tests, and any hostless fallback paths truthfully. They may remain without live asset search, but they must not pretend to have production governance they do not actually have.

## Implementation posture

- keep `ArticlePublisherProps` and image-surface props honest about optionality
- make the supported hosted runtime the clearly governed path
- keep fallback behavior explicit rather than magical
- do not fork divergent hero/secondary/gallery acquisition models
- preserve the current accessible overlay, keyboard, dismissal, and focus behavior already built into the governed UI

## Specific repo-truth expectations

The code agent must explicitly verify and preserve these behavioral outcomes:

- `ImageAssetField` still leads with “Browse library” when `searchAssets` exists
- `MediaComposer` still leads with “Browse library” / “Replace from library” when `searchAssets` exists
- advanced custom URL entry remains subordinate and explicit
- the hosted runtime path is the one that carries the governed seam
- any dev/test/storybook-like hostless mode remains truthful about lookup unavailability

## Closure proof requirements

The final implementation must prove all of the following:

- `mount.tsx` now passes a concrete `searchAssets` provider into `ArticlePublisher`
- the hosted runtime path exercises governed browse as the primary acquisition path
- hero, secondary-image, and gallery/media surfaces all receive the seam correctly
- URL-first dependence is removed from the supported live runtime
- targeted tests or runtime-focused validation cover the mount/provider threading
- any remaining fallback behavior is explicitly documented and truthful

## Prohibited outcomes

- no silent production fallback to URL-first when governed browse was intended
- no partial wiring where only some image surfaces use the provider
- no fake “wired” state that still relies on undefined provider behavior
- no weakening of the current overlay accessibility model
- no destination-scope expansion beyond Project Spotlight

## Final instruction to the code agent

Make the live runtime honor the governed asset-acquisition design the UI already advertises.
The supported hosted path must be actually governed, not cosmetically governed.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
