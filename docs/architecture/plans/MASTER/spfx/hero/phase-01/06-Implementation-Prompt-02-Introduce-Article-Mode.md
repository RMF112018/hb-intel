# 06 — Implementation Prompt 02 — Introduce Article Mode

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
## Objective

Add a dedicated article-mode renderer and explicit article contract for non-HBCentral usage without contaminating the homepage adapter.

## Required outcome

- A clean article-mode render path exists.
- Article mode supports:
  - primary image
  - title
  - subheading
  - author
  - published date
  - published time
  - optional labels / destination metadata
- Homepage mode remains untouched.

## Repo-truth starting points

Inspect, then work from the live footprint in:

- `apps/hb-webparts/src/webparts/hbSignatureHero/`
- `packages/ui-kit/src/HbcSignatureHeroSurface/`
- `apps/hb-webparts/src/homepage/webparts/`
- `apps/hb-webparts/src/homepage/helpers/`

## Required implementation direction

1. Create an explicit article contract in a neutral file.
2. Add a dedicated article adapter such as:
   - `HbSignatureHeroArticle.tsx`
3. Use a shared lower-level rendering seam.
4. Prefer `HbcSignatureHeroSurface` first if it can support article mode cleanly.
5. If that primitive proves materially wrong for article use, document why before promoting a new shared article surface.

## Hard constraints

- Do not add article headline/subheading/metadata props directly into the locked homepage adapter.
- Do not let HBCentral ever render article mode.
- Do not create a giant optional prop matrix.

## Required scrub

Remove or correct:
- ad hoc article placeholders
- temporary shape mismatches
- duplicate content models
- comments/docs that imply homepage and article are one loose component

## Validation

Prove all of the following before closing:

- article mode renders correctly outside HBCentral
- missing optional fields degrade gracefully
- homepage mode remains unchanged
- no new doctrine violations are introduced
- stories or local proof cases can exercise the article renderer

## Deliverable note

When finished, leave a closure note covering:
- final article contract shape
- shared seam chosen
- whether `HbcSignatureHeroSurface` was sufficient
- any remaining author/photo work deferred to the next closure unit
