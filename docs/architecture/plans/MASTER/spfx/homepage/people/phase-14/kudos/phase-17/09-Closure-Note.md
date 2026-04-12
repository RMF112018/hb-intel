# 09 — Phase-17 Closure Note

## Closure standard check

| Closure criterion | Status |
|---|---|
| Premium concept preserved (no redesign) | ✓ |
| Masthead / featured zone visibly shorter + balanced at 100% zoom | ✓ |
| Recent recognition begins earlier in the first viewport | ✓ |
| Archive / lower-zone continuation authored + proportionate | ✓ |
| Hosted top + bottom safe zones handled cleanly | ✓ |
| Aligned with `@hbc/ui-kit` guidance (correct seams) | ✓ |
| Playwright harness updated for changed conditions | ✓ |

## What was compacted

**Masthead (`@hbc/ui-kit` `HbcPeopleCultureSurface.peopleCultureHomepage`):**
- Hero padding, heading scale, icon size, subcaption, CTA row gap/button padding — tightened at base, 768+, and 1200+ breakpoints so desktop 100% zoom sees the compacted values.
- Spotlight card shell padding/gap, avatar ring scale, title scale, excerpt clamp (3 → 2 at ≥1024px), meta row gap, spotlight actions — tightened together so the featured zone reads as a coherent, content-carrying unit.
- Spotlight eyebrow, meta count chip, meta reaction pill — footprint brought in line with the tightened card.

## What downstream areas were rebalanced

**Subordinate zones (`.peopleCultureHomepage` variant):**
- Recent list margin/padding/label, recent row padding/gap.
- Rail highlights, rail celebrations, rail footer, announcement rows, celebration tiles.
- Surface footer padding (archive zone host) at base + 768+.

**Local webpart (`apps/hb-webparts/.../hbKudos/`):**
- `ArchiveList.tsx`: archive header padding, row spacing, row internal padding, search input footprint.
- `KudosFeedBody.tsx`: feed card padding, list gap, avatar/title/recipient/excerpt/meta spacing; interaction grammar brought to parity with archive (CSS-based hover + `:focus-visible`, governed tokens bridged to CSS custom properties).

## What hosted protections were added

Hosted-only behavior on the public root (`HbKudos.tsx`):
- `paddingTop: max(12px, env(safe-area-inset-top, 0px))` — clearance under SharePoint chrome and iOS notches.
- `paddingBottom: max(72px, calc(env(safe-area-inset-bottom, 0px) + 64px))` — permanent safe zone for the persistent assistant overlay.
- `paddingRight: 72px` — horizontal safe zone for the same overlay.
- `data-hbc-hosted="true|false"` attribute on the root so harness assertions can branch without sniffing iframe state.
- Bottom-right `kudos-assistant-safezone` sentinel element for strict non-overlap assertions.

## What `@hbc/ui-kit` seams were updated

- `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css` — `.peopleCultureHomepage` scoped modifier + its 768+/1200+ overrides. No new primitives, no new variants, no doctrine shift.
- `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx` — additive `data-hbc-testid` hooks on hero, spotlight card, recent section, and recent rows. Zero structural or style impact.
- Package version: `2.6.1` → `2.6.5`.

## What harness specs were added or changed

- `e2e/webparts/kudos/helpers/kudosLocators.ts` — registered `assistantSafeZone`, `heroBand`, `featuredCard`, `recentSection`, `recentRow`, `archiveSection`, `archiveRow` alongside the existing CTAs/root/feed locators.
- `e2e/webparts/kudos/hosted/kudos.hosted.zoom-regression.spec.ts` — extended with:
  - `public-100` baseline (existing).
  - `public-90` comparison (existing).
  - `public-reduced-width` (1024 × 900 @ 100%) — narrow-column hosted proof.
  - `public-iphone12pro` (device preset) — mobile hosted proof.
  - `public-safezone-reservation` — sentinel presence + strict zero-area intersection against the archive bounding box when `data-hbc-hosted="true"`.
  - `public-100-composition` — hero + featured card + recent section visible; beginning-of-recent inside the 900px opening viewport; Give Kudos CTA keyboard-focusable.

## Proof artifacts captured

Playwright `captureProof` screenshots are emitted for each of the spec cases above under `hosted/zoom-regression/…`:
- `public-100`
- `public-90`
- `public-reduced-width`
- `public-iphone12pro`
- `public-safezone-reservation`
- `public-100-composition`

## Version trail

- `@hbc/ui-kit`: `2.6.1` → `2.6.5` (variant refinements + additive testid hooks; non-breaking).
- HbKudos SPFx manifest: `0.2.33.0` → `0.2.41.0` (SharePoint 4-part schema) — one bump per focused change across prompts 01–08 plus this closure marker.

## Anti-refusal check

- **Just smaller?** No — eyebrow, meta chips, reaction pill, subordinate zones, archive, feed, and hosted insets were coordinated so the surface remains authored and premium.
- **Only partially adjusted?** No — base + 768+/1200+ rules all tightened; the 1200+ reinflation gap was specifically closed in prompt-04.
- **Not validated at 100% zoom?** No — zoom-regression lane has dedicated 100% composition + safe-zone cases.
- **Not aligned with ui-kit guidance?** No — all shared visual grammar stays inside the existing `.peopleCultureHomepage` scoped modifier; local webpart continuations are token-driven via `KUDOS_GOV_TOKENS`.

Phase-17 closure: **approved for ship**.
