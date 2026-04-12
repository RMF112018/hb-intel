# HB Kudos — Reference Homepage Surface

HB Kudos is the HB Intel homepage webpart that handles employee
recognition end-to-end: public surface, archive, article reader,
composer, and HR governance companion. It is maintained as a
**reference-quality implementation**: future homepage webparts should
be able to read this source and learn how a premium,
presentation-lane, host-safe SPFx webpart is structured in this repo.

This README names the seams and points at the authoritative files.
It does not duplicate plan history — the source of truth is the
running code.

## Split runtime

HB Kudos ships two SharePoint webparts sharing one local product
layer:

| Runtime           | Component                                   | Webpart id constant                    |
|-------------------|---------------------------------------------|----------------------------------------|
| Public surface    | `HbKudos.tsx`                               | `HB_KUDOS_WEBPART_ID`                  |
| HR Approval Companion | `../hbKudosCompanion/HbKudosCompanion.tsx` | `HB_KUDOS_COMPANION_WEBPART_ID`        |

Both ids live in [`./kudosRuntimeContract.ts`](./kudosRuntimeContract.ts),
which is the single source of truth consumed by:

- `HbKudosWebPart.manifest.json` / `HbKudosCompanionWebPart.manifest.json`
- `../../mount.tsx` (renderer map)
- Wave 4 doctrine guards (`../../homepage/__tests__/` — see Proof)

`kudosRuntimeContract.ts` also exports `KUDOS_RUNTIME_OWNERSHIP`, a
machine-readable ownership map naming what each runtime owns, what
it must not own (owned by the sibling), and what is shared.

## Shared local product layer

Everything cross-runtime goes through
[`./kudosSurfaceFamily.ts`](./kudosSurfaceFamily.ts) — a single
barrel re-exporting:

- **Tokens** — `KUDOS_GOV_TOKENS`, `KUDOS_INTENT`, `KUDOS_SPACE`,
  `KUDOS_RADIUS` from
  [`../../homepage/shared/KudosGovernancePrimitives.tsx`](../../homepage/shared/KudosGovernancePrimitives.tsx).
  `KUDOS_GOV_TOKENS` is derived from `HBC_PRESENTATION_BLUE_RGB` /
  `HBC_PRESENTATION_ORANGE_RGB` via an `alpha()` helper; the
  brand/ink/governance/danger ramps are authored as alphas over
  the governed theme semantics, not raw hex.
- **Icons** — `Trophy`, `Sparkles`, `ThumbsUp`, `ChevronDown`,
  `ArrowRight` via [`./kudosIcons.ts`](./kudosIcons.ts), which
  re-exports from the curated `@hbc/ui-kit/homepage` lucide set.
  No Unicode / pseudo-icons appear in homepage-facing Kudos source.
- **Variants** — `kudosRow`, `kudosGiveCta`, `kudosCelebrateBtn`,
  `kudosReadmoreBtn`, `kudosFeaturedBadge`, `kudosArchiveToggle`,
  `kudosArchiveChevron`, `kudosArchiveViewAll`, plus the governance
  section primitives. `class-variance-authority` over CSS-module
  class names (see [`./kudosVariants.ts`](./kudosVariants.ts)).
- **Style modules** — `kudosSurfaceStyles`, `kudosReaderStyles`,
  `governanceStyles`. Layered grammar:
  - [`./kudosSurface.module.css`](./kudosSurface.module.css) — hero,
    masthead, featured card, recent rail, archive zone.
  - [`./kudosFlyout.module.css`](./kudosFlyout.module.css) — shared
    body rhythm for reader / feed / composer-adjacent flyouts via
    [`./KudosFlyoutBody.tsx`](./KudosFlyoutBody.tsx).
  - [`./kudosReader.module.css`](./kudosReader.module.css) — article
    reader specifics (header, body, footer, celebrate pill).
  - [`../../homepage/shared/governance.module.css`](../../homepage/shared/governance.module.css)
    — governance button, chip, alert, section heading, info row,
    detail-panel stack. Used by both runtimes.
  - [`../hbKudosCompanion/companion.module.css`](../hbKudosCompanion/companion.module.css)
    — companion root / header / filter bar / search cluster / bulk
    actions / queue grid.

## Thin-shell composition

`HbKudos.tsx` is a composition shell, not a logic sink. Runtime
concerns are carved into focused hooks under
[`./hooks/`](./hooks/):

- `useCurrentUserId` — SharePoint current-user resolution.
- `usePublicKudosData` — list load + the locked public-visibility /
  archive-eligibility predicates.
- `useRecipientPhotoHydration` — Graph-backed recipient photo cache,
  read through a `cacheRef` so the hook is `exhaustive-deps` clean.
- `useCelebrateAction` — celebrate mutation with pinned loading.
- `useHostSafeLayout` — SharePoint-hosted iframe detection +
  `SAFE_ZONE_SIZE_PX` single-source-of-truth for the bottom-right
  assistant safe-zone sentinel.
- `kudosFeatured` — `sortByRecency`, `isFeaturedWorthy`,
  `selectFeaturedAndRecent`.

Flyout chrome:

- [`./KudosComposerPanel.tsx`](./KudosComposerPanel.tsx) — composer
  flyout composition.
- [`./KudosFeedPanel.tsx`](./KudosFeedPanel.tsx) — "View all"
  flyout.
- [`./KudosFlyoutBody.tsx`](./KudosFlyoutBody.tsx) — shared body
  wrapper that gives reader, feed, and composer flyouts one rhythm.

## Behavior seams + debug posture

- `../../homepage/data/useSharePointPeopleSearch.ts` — the people-
  picker adapter. All diagnostic logging is gated behind
  `window.__HB_KUDOS_DEBUG__` via a single `debug()` helper.
- `../../homepage/data/useRecipientPhotoHydration.ts` — suppression-
  free: the cache is read through a ref so declared effect deps are
  honest.
- Governance writes go through `submitKudosGovernanceAction` in
  `../../homepage/data/kudosGovernanceWriter.ts` (single dispatch
  surface for both runtimes).

## Accessibility posture

- Focus-visible rings are governed at the module level
  (`kudosSurface`, `governance`, `companion`, `kudosReader`); every
  interactive element receives a consistent 2px outline anchored on
  the brand-blue token.
- Read-more button carries `aria-label` personalized with recipient
  name and `aria-describedby` linked to the excerpt id.
- Celebrate button + bulk approve carry `aria-busy` while the
  mutation is in flight.
- Article reader `<article>` carries `aria-labelledby` pointing at
  the `<h2>` recipient heading.
- Companion overdue / role meta cluster is a polite live region.
- `prefers-reduced-motion` media queries live in the per-module CSS
  where motion is authored.

## Host-safe behavior

- `useHostSafeLayout` detects `window.self !== window.top` once at
  mount, seeded from a pure `detectHostedEnvironment()` helper.
- `SAFE_ZONE_SIZE_PX` drives both the reserved right/bottom padding
  and the width/height of the bottom-right sentinel element the dev
  harness asserts against. Sentinel keeps the
  `data-hbc-testid="kudos-assistant-safezone"` contract.

## Proof

Executable closure checks (added in Wave 4 Prompt 04):

- `apps/hb-webparts/src/homepage/__tests__/kudosDoctrineGuards.test.ts`
  (Wave 4 Prompt 04 — upcoming) enforces:
  - no Unicode / pseudo-icons in homepage-facing Kudos source,
  - no `@hbc/ui-kit` root-barrel imports in HB Kudos,
  - no ungated production `console.*` in the shared data hooks,
  - manifest ids match `kudosRuntimeContract` constants,
  - manifest versions match the SPFx 4-part schema,
  - `KUDOS_GOV_TOKENS.brandBlue` / `brandOrange` equal the shared
    presentation-lane theme constants.

## What HB Kudos intentionally does NOT do

- Does not promote its primitives into `@hbc/ui-kit` — reuse
  pressure beyond HB Kudos has not yet justified a shared-ui-kit
  boundary.
- Does not animate via `motion` — micro-interactions are
  CSS-driven to stay host-safe and budget-friendly.
- Does not import from the `@hbc/ui-kit` root barrel — consumers
  import only from `@hbc/ui-kit/homepage`.
- Does not inline governance writes or audit events — both go
  through `submitKudosGovernanceAction`.
- Does not reach across the split runtime. Public and companion
  compose from the shared family index only.

## Learning from HB Kudos

If you are building a new homepage webpart, start here:

1. **Adopt the family pattern**: create a single `*SurfaceFamily.ts`
   barrel that re-exports your tokens, icons, variants, and style
   modules. Consumers compose from one place.
2. **Derive tokens** from shared presentation-lane theme semantics
   (`HBC_PRESENTATION_*`). Never author raw hex / rgba at the
   surface level.
3. **Govern icons** through a local seam that re-exports from the
   curated `@hbc/ui-kit/homepage` lucide set.
4. **Use CSS modules + `cva`** for repeated visual patterns.
   Inline style objects are for computed values that cannot be
   expressed as classes.
5. **Carve the top-level webpart into a thin-shell** over focused
   hooks. No data + workflow + layout in one file.
6. **Gate debug logging** behind `window.__HB_*_DEBUG__` so
   production is quiet by default.
7. **Treat webpart ids as contract constants** — one export,
   consumed by the manifest, the mount map, and the doctrine tests.
8. **Prove closure with executable doctrine guards.** A test
   failing is the only reliable way to resist drift.
