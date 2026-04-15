# Publisher Wave-01 — Media authoring & hero/gallery closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-14/Prompt-04-Structural-redesign-media-acquisition-and-hero-gallery-authoring.md`
**Scope:** HeroPanel, SecondaryImagePanel, MediaComposer (flyout), shared image primitive.
**Manifest:** hb-publisher Feature 1.0.0.32.

## What media-authoring structures were replaced

The previous pattern for single-image authoring (hero + secondary) was **raw URL input rendered as a peer field alongside alt text and caption**. This is a textbook URL-first posture — it pushed authors into infrastructural data entry at the exact moment a world-class editorial product should be helping them choose, review, and commit an asset.

Both panels have been rebuilt around a new shared **`ImageAssetField`** primitive in `sharedChrome/` that presents a preview-first asset card. The URL entry field has been demoted:

- In the **empty state** the author sees a dominant dashed preview plate framed as "Choose an image" (with an HBC-accented image glyph), an explanatory editorial line, an `https://` URL input clearly subordinated to that framing, and the alt-text field already available so accessibility work can begin before the asset lands.
- In the **populated state** the author sees an editorial asset card with the real preview on the left (up to 220 px tall, object-fit cover, broken-preview reassurance alerts, Replace / Remove affordances anchored at the top of the card), and alt text + caption composed inline on the right. The URL sits behind a collapsed `<details>` "Asset URL" footer — fully available for edit but no longer leading the interaction.

## How hero / secondary / gallery flows now differ

- **Hero** — single non-captioned asset (no inline caption field since the hero has its own eyebrow/category/headline flourishes in the existing Advanced disclosure). Uses `ImageAssetField` with `role="hero"` and `withCaption={false}`.
- **Secondary** — single captioned asset, gated behind the existing "Show a secondary image alongside the body" toggle. The card only renders when the author opts in (or when a seeded draft already has a secondary image). Uses `ImageAssetField` with `role="secondary"` and `withCaption`.
- **Gallery / supporting** — already preview-first in Phase 12 (thumbnail grid, featured card, reorder, readiness summary). The `MediaComposer` flyout now **leads with the preview**: the dashed preview plate renders at the top of the flyout body with a contextual "Choose an image — paste an https:// URL below" prompt; the URL input has been reframed as a subordinate "Source" field. Alt-text assessment, caption guidance, role chooser, and feature toggle are unchanged.

## Tenant-safe asset-picking seam

No production-ready tenant-safe picker seam exists in the current `@hbc/ui-kit` or `@hbc/sharepoint-platform` surface (this was explicitly allowed by the prompt: *"If no production-ready tenant-safe picker seam exists, design and implement the strongest bounded acquisition flow that can be truthfully supported now"*). The `ImageAssetField` acquisition story is honest about this — both the empty-state plate and the MediaComposer "Source" helper explicitly state "A tenant-safe file picker will land here in a later wave." When the seam arrives, only the acquisition affordance inside `ImageAssetField.tsx` needs to change; its controlled value/onChange contract and the caller wiring in HeroPanel / SecondaryImagePanel stay put.

## Invariants & accessibility preserved

- **Persistence contract** unchanged: `ImageAssetField` is a controlled facade over the same `imageUrl` / `altText` / `caption` strings the existing `PublisherArticleRow` persists for hero and secondary. No schema change.
- **Gallery invariants** untouched: `applyFeaturedGalleryInvariant`, `moveMediaRow`, `restampMediaSortOrder`, alt-text assessment via `assessAltText`, caption assessment via `assessCaption`, role-level guidance via `roleGuidance`, and the single-featured rule all continue to gate the composer.
- **Alt-text posture**: alt text remains required; the field stays visible in both empty and populated states; for the `MediaComposer` flyout, `aria-invalid` still fires on `assessAltText.level === 'problem'`, and `altBlocking` still blocks save.
- **Preview semantics**: the populated asset card exposes a live `<img>` that reports `onLoad` → ready, `onError` → broken, with an explicit reassurance alert when the asset fails to load so authors know readers will see a broken image.
- **URL contract**: `https://` only, same as before. The populated card surfaces an `/^https:\/\/\S+/i` sanity check and renders an inline alert when the URL scheme is not `https`.
- **Keyboard semantics**: every interactive control is a real `<button>`, `<input>`, `<textarea>`, or `<summary>` — no custom a11y wiring required. Focus rings are standardised through `--hb-color-focus-ring`.
- **Test suite**: 614 passing, including the existing Hero panel disclosure suite, the MediaComposer + gallery alt/caption/invariants suites, and the Secondary image integration path. The HeroPanel tests were updated to target the new labelled control (`Hero image source URL`) that `ImageAssetField` exposes via `aria-label`.

## Validation runs performed

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing; 6 failures all pre-existing in `publisherAdapter/__tests__/publisherEndToEnd.test.ts`, unrelated to this change.
- Manifest bumped: `config/package-solution.json` 1.0.0.31 → 1.0.0.32.
