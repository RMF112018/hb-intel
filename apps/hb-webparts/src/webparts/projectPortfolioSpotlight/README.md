# Project / Portfolio Spotlight

Thin SPFx integration consumer for the **Project / Portfolio Spotlight**
homepage section. The authored presentation grammar (featured hero,
image-led composition, team strip + detail panel, supporting rail) lives
in the shared `HbcProjectSpotlightSurface` family in `@hbc/ui-kit/homepage`.
This webpart owns only data fetch, normalization, and view-model mapping.

## Manifest

- **ID:** `8370ab0c-b6df-4db0-82f1-24b54750f508`
- **Zone:** Operational Awareness
- **Alias:** `ProjectPortfolioSpotlightWebPart`
- **Version:** `0.0.22.0`

## Data source

**Primary:** SharePoint list `Homepage Project Spotlights` via REST API.
**Fallback:** Manifest `preconfiguredEntries` seed data (local dev / demo only).

The list is fetched when SPFx context provides a site URL. Items are
filtered server-side by `HomepageEnabled eq 1` and client-side by publish
window (`PublishStart`/`PublishEnd`). Audience filtering, stale detection,
and featured-vs-secondary partitioning happen during normalization.

Field mapping, fetch logic, and raw-to-contract mapping live in
`homepage/data/projectSpotlightListSource.ts`. The fetch hook with
5-minute cache is in `homepage/data/useProjectSpotlightData.ts`. Site URL
storage is in `homepage/data/spContext.ts`.

## Ownership boundary

| Layer | What lives there |
|-------|------------------|
| **Shared UI (`@hbc/ui-kit/homepage`)** | `HbcProjectSpotlightSurface` — the full authored surface family: root shell, editorial masthead, separator, featured composition (essentials + details disclosure), mode-aware hero media, team strip + detail panel, governed history (past-spotlights) disclosure wrapping a numbered supporting rail, hover/focus states, `ResizeObserver`-driven layout-mode resolver, visibility matrix, reduced-motion handling, content-completeness trimming. Reuses `HbcAvatarStack` for the project team visual. |
| **Webpart (local)** | This file — calls `useProjectSpotlightData()`, normalizes via `normalizeProjectPortfolioSpotlightConfig`, resolves empty/loading/authoring states, and maps the normalized collection (including `contentCompleteness`) into a `ProjectSpotlightSurfaceModel` before passing it to `HbcProjectSpotlightSurface`. |
| **Homepage data/helpers (local)** | `spContext.ts`, `projectSpotlightListSource.ts`, `useProjectSpotlightData.ts`, `operationalAwarenessConfig.ts` (normalization + completeness scoring), `operationalAwarenessContracts.ts` (business contracts), `authoringGovernance.ts`, `visibility.ts`. |
| **Homepage shared loading/empty (local)** | `HomepageLoadingState`, `HomepageEmptyState`. |

No presentation grammar, layout-mode logic, or disclosure state remains
local to the webpart. Mode resolution, visibility rules, media posture,
details/history disclosures, and content-completeness degradation are
all owned by the shared surface family.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `Partial<ProjectPortfolioSpotlightConfig>` | Fallback configuration (used when list unavailable) |
| `activeAudience` | `string` | Current audience filter for visibility rules |
| `isLoading` | `boolean` | Shows loading state when true |

## Config fields (section-level)

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `heading` | `string?` | `"Project and Portfolio Spotlight"` | Section heading |
| `maxSecondaryItems` | `number?` | `3` | Rail item limit |
| `staleAfterHours` | `number?` | `168` (7 days) | Freshness threshold |
| `allProjectsLabel` | `string?` | `"View all projects"` | Section-level CTA label (independent of featured CTA) |
| `allProjectsUrl` | `string?` | `"/sites/hb-central/portfolio"` | Section-level CTA URL |

## Selection logic

Items are sorted deterministically: `featured: true` first, then by
`order`, then by recency (`freshness.updatedAt`), then alphabetically by
title. The first item after sorting becomes the featured project. Stale
items are demoted to the end of the supporting rail.

## Layout modes & disclosures

The shared surface is **mode-governed**, not breakpoint-styled. It
resolves an explicit `SpotlightLayoutMode` from its own usable
container (measured via `ResizeObserver`) and applies a visibility
matrix that drives which regions are default-visible. CSS rules key
off `data-layout-mode` on the surface root; viewport media queries
only polish the resolved posture.

Width thresholds and vertical-pressure step-down are defined in
`packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`:

| Mode | Usable width | Hero media (min / max) | Headline | Milestone list | Inline history (freshness row) | Overlay chips | Team strip |
|------|--------------|------------------------|----------|----------------|--------------------------------|----------------|------------|
| `wide`    | ≥ 1040px    | 440 / 520px (21:9 cap)  | visible | inline          | inline    | visible | visible |
| `medium`  | 760–1040px  | 360 / 420px (16:9 cap)  | visible | inline          | inline    | visible | visible |
| `compact` | 440–760px   | 220 / 260px             | visible | inline (full)   | inline    | hidden  | visible |
| `minimal` | < 440px     | 140 / 180px             | hidden  | hidden          | hidden    | hidden  | hidden  |

A short-but-wide container (vertical pressure below ~520px) steps the
mode down one tier so the surface never renders tall media inside a
cramped slot. `minimal` is the narrowest stable nested mode.

### Details disclosure (featured body)

The featured slot is split into **essentials** (always visible: media,
title, compact milestone-progress pill) and a **details region** behind
an explicit disclosure control (`Show spotlight details` /
`Hide spotlight details`). Default state by mode:

| Mode    | Details default |
|---------|-----------------|
| `wide`    | **open**  |
| `medium`  | **open**  |
| `compact` | **closed** |
| `minimal` | **closed** |

The button is keyboard- and touch-safe (`min-height: 36px`,
focus-visible outline), wired with `aria-expanded` + `aria-controls`,
and the collapsed region uses the native `hidden` attribute so it is
removed from the a11y tree. No hover gating.

### History disclosure (past spotlights / supporting rail)

The numbered supporting rail is rendered inside a governed
`HistoryDisclosure` shell (`Show past spotlights (N)` /
`Hide past spotlights`). Default state by mode:

| Mode    | History default |
|---------|-----------------|
| `wide`    | **open**  |
| `medium`  | **open**  |
| `compact` | **closed** |
| `minimal` | **closed** |

When an item collection has `secondary.length === 0`, the disclosure
is not rendered at all (no empty "Show past spotlights (0)" button).

### Content completeness

Normalization scores each item's `contentCompleteness` from authored
signals (image, headline, status). The shared surface uses it to trim
the featured body so thin payloads don't produce filler-looking
details regions:

- `minimal` — suppress headline; skip inline milestone list; force a
  tight summary clamp; skip team strip; default details region to
  closed even in wide/medium; if nothing meaningful remains, the
  disclosure control itself disappears.
- `partial` — keep milestone list only when ≥2 entries; otherwise let
  the essentials pill speak.
- `full` (default) — unchanged mode-governed behavior.

Completeness flows from `operationalAwarenessConfig.ts` through the
webpart's `toFeatured` / `toRailItem` mappers as `completeness` on
each shared model item.

### Consumer posture

This webpart does not select a mode, drive a disclosure, or inspect
completeness at render time. Those decisions are owned by the shared
surface. An optional `forceMode` prop exists for stories and
deterministic snapshot tests; it is not used by the webpart.

## Media reliability

Media safety, image fallbacks, and avatar initials fallbacks are
implemented inside `HbcProjectSpotlightSurface` — no local safe-media
components in this webpart. The surface renders a branded gradient
placeholder behind every featured image, swaps to a gradient placeholder
on rail-thumbnail error, and delegates avatar fallbacks to `HbcAvatarStack`.

## Accessibility

All accessibility guarantees live in the shared surface:

- Semantic HTML: `section`, `h2`, `h3`, `ul`, `li`, `button`, `a`
- Details disclosure: explicit `<button>` with `aria-expanded` +
  `aria-controls`; collapsed region uses the native `hidden` attribute
  so it is removed from the a11y tree. Animated chevron respects
  `prefers-reduced-motion`. Never hover-gated.
- History disclosure: same contract (`aria-expanded`, `aria-controls`,
  `hidden`); the expanded panel is an `aria-label`ed region.
- Team detail panel: `role="dialog"`, `aria-haspopup="dialog"`, Escape
  closes, focus returns to the trigger, outside-click dismissal.
- Mobile bottom-sheet: backdrop overlay; motion respects
  `prefers-reduced-motion`.
- Touch targets: ≥ 44px on all interactive elements; disclosures sit at
  36–40px with focus-visible outlines.
- Focus-visible outlines on every interactive control (disclosures,
  team strip button, rail tiles).
- Images: `decoding="async"`, `loading="lazy"`, explicit dimensions,
  `onError` fallbacks.
- CLS prevention: `contain` on image zones and thumbnail wrappers.

## Migration status

Cleanly migrated to shared presentation-lane ownership and then
redesigned in place:

1. Full authored spotlight grammar moved into `@hbc/ui-kit/homepage`
   under `HbcProjectSpotlightSurface`.
2. Presentation became **mode-governed** via a `ResizeObserver`-backed
   resolver and an explicit visibility matrix
   (`wide | medium | compact | minimal`).
3. The featured body was split into **essentials + details
   disclosure** so compact and minimal modes do not overwhelm on first
   paint.
4. The supporting rail was gated behind a **history disclosure** so
   past spotlights do not compete with the featured project.
5. Media scale and vertical footprint were bound to the resolved mode
   (hero height + aspect-ratio caps, masthead / content / rail rhythm).
6. Normalized `contentCompleteness` was promoted into the shared
   contract and now drives thin-payload trimming.
7. The surface module was split into focused seams
   (`types`, `layout-mode`, `use-spotlight-layout-mode`, `internals`,
   `Masthead`, `FeaturedMedia`, `Milestones`, `TeamStrip`,
   `FeaturedSlot`, `SupportingRail`, `HistoryDisclosure`, `index`).

Only data/business-logic plumbing, normalization, authoring-state
resolution, and view-model mapping remain local.

## Story coverage

Proof-grade Storybook coverage for the redesigned contract lives in
`packages/ui-kit/src/HbcProjectSpotlightSurface/HbcProjectSpotlightSurface.stories.tsx`:

- Live-measured: `Full Editorial` (wide), `Narrow SharePoint Section`
  (medium), `Handheld Width` (minimal) — prove the resolver selects
  the right mode from container width alone.
- Forced modes: `Mode / Wide`, `Mode / Medium`,
  `Mode / Compact — details + history collapsed by default`,
  `Mode / Minimal — narrowest stable`.
- Disclosure interaction: `Compact — details expanded (after click)`,
  `Compact — history expanded (after click)` (play functions).
- Completeness: `Sparse Content — completeness "minimal"`,
  `Partial Content — completeness "partial"`.
- Rail absence: `No history — railless` (play asserts absence).

## Related docs

- [UI-Kit Project Spotlight completion report](../../../../docs/architecture/reviews/project-spotlight-ui-kit-migration-completion.md)
- [People & Culture precedent](../../../../docs/architecture/reviews/people-culture-ui-kit-migration-completion.md)
- [UI System Layer Model](../../../../docs/reference/ui-kit/UI-System-Layer-Model.md)
