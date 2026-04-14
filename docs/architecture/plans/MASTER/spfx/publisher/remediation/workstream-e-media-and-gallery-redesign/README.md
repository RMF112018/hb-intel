# Workstream E — Media and Gallery Redesign

Replaces raw media row editing in the Article Publisher with a visual, guided media workflow that improves author confidence and accessibility.

## Steps
- [Step 01 — Authoring model design](./step-01/DESIGN.md)
- [Step 02 — Composer flyout + thumbnail grid](./step-02/CLOSURE.md)
- [Step 03 — Alt-text / caption / role assistance](./step-03/CLOSURE.md)
- [Step 04 — Ordering, preview, readiness banner + validation warnings](./step-04/CLOSURE.md)
- [Step 05 — Scrub + hosted vetting closure](./step-05/CLOSURE.md)

## Final architecture

```
apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/
├── GalleryPanel.tsx               # thumbnail grid + readiness banner
├── MediaComposer.tsx              # right-side flyout with URL + thumbnail preview
├── buildMediaRow.ts               # hydration: draft → PublisherMediaRow (+ Title derivation, https-only URL)
├── mediaInvariants.ts             # applyFeaturedGalleryInvariant, restampMediaSortOrder, moveMediaRow
├── altTextGuidance.ts             # pure assessAltText / assessCaption / roleGuidance
├── mediaComposer.module.css       # flyout body styles
├── galleryPanel.module.css        # grid + readiness banner styles
├── buildMediaRow.test.ts          # 14 tests
├── mediaInvariants.test.ts        # 13 tests
├── altTextGuidance.test.ts        # 14 tests
├── mediaPersistence.test.ts       # 5 round-trip tests
└── index.ts
```

Downstream contracts:
- `publisherWriters.mapMediaRowToListFields` — tenant SharePoint payload mapping (unchanged).
- `pageGeneration/pageCompositor.composeGallery` — filters `MediaRole === 'gallery'`, sorts by `SortOrder` (unchanged).
- `validation/validationEngine.ts` Rule 14 — error for missing alt text (unchanged); non-blocking warnings for alt-text too long / leading-phrase added in Step 04.

## Author-surface narrowing (vs. pre-redesign)

| Field | Pre-redesign | After Workstream E |
| --- | --- | --- |
| `ImageAsset` | raw text box | https-only URL input with real-time thumbnail preview and failure state |
| `AltText` | required by validation, no UI enforcement | required at composer level; live guidance (ok/good/warn/problem); blocks save at problem |
| `Caption` | plain text input | counter-aware input with duplicate-of-alt warning |
| `MediaRole` | 4-option chooser (gallery/supporting/hero/secondary) | 2-option chooser (gallery/supporting only); hero + secondary authored on their own tabs |
| `FeaturedInGallery` | per-row checkbox (non-exclusive, render-less) | mutually-exclusive star toggle on chip; enforced in composer + panel; surfaced in readiness banner |
| `SortOrder` | re-stamped from index | re-stamped from grid position; keyboard reorder with Alt+Arrow (grid-aware) |
| `Title` | required text input | auto-derived from URL pathname / alt text / MediaId |
| `GalleryGroup` | free-text input | hidden; preserved verbatim on edit (deferred per Step 01 design) |

## Lifecycle invariants preserved
- `media.replaceAllForArticle` remains the only write seam.
- Publish / republish / archive / withdraw lifecycle untouched.
- `composeGallery` contract unchanged; preview and publish consume identical output.
