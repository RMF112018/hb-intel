# 01 — Audit Summary

## Repo-truth judgment

The live `main` branch shows that `HbSignatureHero` is currently a **homepage-specific flagship identity surface**, not a reusable dynamic article hero.

## What the current implementation is

- A bespoke homepage component with:
  - personalized greeting
  - locked tagline
  - company logo
  - optional background override
- A narrow runtime contract:
  - `identity`
  - optional `backgroundImage`
  - optional `assetBaseUrl`
  - optional `now`
- No article headline contract
- No article subheading contract
- No author model
- No metadata row
- No publish date/time model
- No host-aware mode branch inside the component itself

## Current runtime wiring

The mount dispatcher maps the `hbSignatureHero` webpart ID to `HbSignatureHero` with only:

- `identity`
- `backgroundImage` from `backgroundImageUrl`
- `assetBaseUrl`

There is no current article binding seam.

## Current doctrine posture

The homepage overlay locks the flagship homepage hero to exactly three identity elements and explicitly disallows editorial headline, CTA, metadata row, eyebrow, and similar article furniture in the flagship homepage surface.

That means article requirements must not be implemented by weakening the homepage lock.

## Important positive seam already present in the repo

The repo already contains a richer shared primitive, `HbcSignatureHeroSurface`, with slots for:

- brand
- greeting
- editorial
- CTAs
- context
- metadata

That is a meaningful lower-level rendering seam for article-mode work.

## Important identity/photo seam already present in the repo

The Kudos public path uses a generic shared identity/photo pattern built around:

- `PersonEntry`
- SharePoint people search
- `createGraphPersonPhotoFn`
- cached photo hydration

That is the correct reuse direction for author identity and photo.

## Final recommendation

Use a **dual-mode architecture**:

- **Homepage mode** — locked, HBCentral-only, unchanged output
- **Article mode** — explicit, dynamic, non-HBCentral only

Implement this as a **structural redesign** with:
- thin mode adapters
- explicit article contract
- shared lower-level rendering and identity seams

Do **not** replace the current homepage hero.
Do **not** add article furniture directly into the homepage adapter.
