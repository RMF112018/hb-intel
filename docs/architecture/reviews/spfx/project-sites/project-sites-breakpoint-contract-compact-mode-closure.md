# Project Sites Responsive Contract and Mode Responsibilities — Closure

> **Status:** Refreshed by Phase-03 Wave-01 (Prompts 01–08) of the Project
> Sites Responsive Audit package
> (`docs/architecture/plans/MASTER/spfx/project-sites/phase-03/wave-01`).
> This document supersedes the prior three-mode closure and records the
> end-state contract, the per-mode responsibilities, and the hosted
> validation matrix.

## Contract

Project Sites resolves layout from measured container width and viewport
height along two orthogonal axes, then collapses them into a public
three-mode name (`wide` | `medium` | `compact`) for consumers that only
need a coarse hook.

### Axis 1 — Display class (width authority)

| Display class  | Width range           | Rationale                                                                  |
|----------------|-----------------------|----------------------------------------------------------------------------|
| `phone`        | `width < 820`         | Single-hand reach, sub-iPad Mini widths, SharePoint mobile app embeds.     |
| `tablet`       | `820 ≤ width < 1180`  | iPad portrait / landscape, transitional narrow desktop embed columns.      |
| `desktop`      | `1180 ≤ width < 1600` | Standard landscape laptop and desktop SharePoint section widths.           |
| `wide-desktop` | `width ≥ 1600`        | Ultra-wide monitors and full-bleed SharePoint section renders.             |

Thresholds (exported from `projectSitesLayoutMode.ts`):

- `PROJECT_SITES_MEDIUM_MIN_WIDTH = 820`
- `PROJECT_SITES_WIDE_MIN_WIDTH = 1180`
- `PROJECT_SITES_WIDE_DESKTOP_MIN_WIDTH = 1600`

### Axis 2 — Height class (viewport authority)

| Height class | Rule                   | Meaning                                                              |
|--------------|------------------------|----------------------------------------------------------------------|
| `short`      | `viewportHeight ≤ 559` | Host environment is squeezed vertically (SPFx iframe, split view).   |
| `standard`   | `viewportHeight > 559` | Normal desktop / tablet vertical real estate.                        |

`short` is read from `window.visualViewport.height` (falling back to
`window.innerHeight`) rather than measured container height, so ordinary
content growth and shrink do not feed back into mode selection. The
`useProjectSitesContainerState` hook listens to `window.resize`,
`visualViewport.resize`, and `ResizeObserver` ticks so both axes update
without stale reads.

### Public mode collapse

| Mode      | Rule                                                                 |
|-----------|----------------------------------------------------------------------|
| `wide`    | `displayClass ∈ {desktop, wide-desktop}` AND `heightClass === 'standard'` |
| `medium`  | `displayClass === 'tablet'` AND `heightClass === 'standard'`         |
| `compact` | `displayClass === 'phone'` OR `heightClass === 'short'`              |

`displayClass` is still populated in short-height states so later prompts
can distinguish *compact-because-narrow* from *compact-because-short*.

## Mode responsibilities

Published as `PROJECT_SITES_MODE_RESPONSIBILITIES` in
`projectSitesLayoutMode.ts`. Consumer surfaces (root, control band, card
grid) honor these fields.

| Mode      | `controlBand`         | `cardDensity`  | `grid`                     | `sparse`              |
|-----------|-----------------------|----------------|----------------------------|-----------------------|
| `wide`    | `inline-row`          | `comfortable`  | `multi-column-auto-fill`   | `bounded-card-width`  |
| `medium`  | `two-lane`            | `regular`      | `balanced-auto-fill`       | `natural-flow`        |
| `compact` | `stacked-disclosure`  | `condensed`    | `single-column`            | `single-column`       |

### Control band composition

- **`inline-row` (wide)** — single horizontal row: search (260–480 px),
  scope segmented control, sort select, Filters button, Reset button.
- **`two-lane` (medium)** — lane 1 full-width search; lane 2 is a
  dedicated container (`data-project-sites-secondary-lane="medium"`) with
  a subtle top divider containing scope segmented control + sort select +
  filter/reset actions right-aligned.
- **`stacked-disclosure` (compact)** — full-width search, compact scope
  `<select>` replacing the segmented control, sort select, Filters
  button. "Scope:" / "Sort:" uppercase labels are visually hidden
  (selects retain their accessible `aria-label`). Active filter chips
  are behind a progressive disclosure: `N filters active · Show/Hide`;
  chips themselves render only on expand, and their remove targets grow
  to 28×28 px for touch.

### Card density policy

Density is derived from `layoutMode` via `cardDensity`, with an optional
explicit `density` prop on `ProjectSiteCard` for surfaces that need to
override. Each card echoes its resolved density via
`data-project-sites-card-density`.

| Content                           | comfortable (wide) | regular (medium) | condensed (compact) |
|-----------------------------------|--------------------|------------------|---------------------|
| Project number badge              | always             | always           | always              |
| Project name                      | always             | always           | always              |
| Stage badge                       | always             | always           | always              |
| Year identity chip                | always             | always           | always              |
| Office-division identity chip     | always             | always           | hidden              |
| Department identity chip          | always             | hidden           | hidden              |
| Launch-confidence message         | always             | only on blocked states | only on blocked states |
| Blocked `userMessage`             | always (if blocked) | always (if blocked) | always (if blocked) |
| Primary action (Open / View site) | launchable         | launchable       | launchable          |
| Provisioning / Attention label    | always (if blocked) | always (if blocked) | always (if blocked) |
| Metadata Client                   | always             | always           | always              |
| Metadata Location                 | always             | always           | always              |
| Metadata Type                     | always             | hidden           | hidden              |
| Metadata Project Manager          | always             | always           | hidden              |
| Metadata Lead Estimator           | always             | hidden           | hidden              |
| Metadata Project Executive        | always             | always           | hidden              |
| Footer department label           | always             | always           | hidden              |

### Grid composition

Normal (non-sparse) grid composition per mode is unchanged from the
prior closure: `wide` uses `repeat(auto-fill, minmax(320px, 1fr))`;
`medium` uses `repeat(auto-fill, minmax(260px, 1fr))`; `compact` uses a
single column.

Sparse behavior (`visibleCount ≤ 2`) is now variant-aware and published
via `data-project-sites-grid-sparse`:

| Variant    | When                                            | Composition                                                                              |
|------------|-------------------------------------------------|------------------------------------------------------------------------------------------|
| `dense`    | `visibleCount ≥ 3`                              | Default mode grid — no sparse overrides.                                                 |
| `bounded`  | `visibleCount ≤ 2` AND `layoutMode === 'compact'` | Single-column (existing compact stacking).                                              |
| `cluster`  | `visibleCount === 2` AND `layoutMode !== 'compact'` | Centered cluster, `maxWidth: 880 px`, `repeat(auto-fit, minmax(320px, 420px))`, `justify-content: center`. |
| `featured` | `visibleCount === 1` AND `layoutMode !== 'compact'` | Single bounded card column, `maxWidth: 520 px`, centered via auto margins.              |

### First-screen compression and host-fit resilience

Implemented by Prompt-07.

| Treatment                               | compact | medium | wide |
|-----------------------------------------|---------|--------|------|
| Root `paddingTop` reduced to MD         | yes     | yes    | no   |
| Eyebrow "HB Central · Projects"         | hidden  | shown  | shown |
| Scope-source pill                       | hidden  | hidden | shown |
| Non-warning scope-source context line   | hidden  | shown  | shown |
| Warning context summary                 | shown   | shown  | shown |
| Attention / provisioning counts         | shown   | shown  | shown |
| Header `paddingBottom` + `marginBottom` | tight   | tight  | standard |

Root padding honors `env(safe-area-inset-left|right|bottom)` via
`max(...)` expressions so mobile and iframe-embedded hosts with system
chrome do not crowd the edges, without bloating desktop rendering.

## Root surface diagnostics

`ProjectSitesRoot` publishes mode state on every render:

- `data-project-sites-layout-mode` — `wide` | `medium` | `compact`
- `data-project-sites-display-class` — `phone` | `tablet` | `desktop` | `wide-desktop`
- `data-project-sites-height-class` — `short` | `standard`
- `data-project-sites-short-height` — `true` | `false` (retained for backward compatibility)
- `data-project-sites-control-layout` — echoes the effective control-band mode on the `role="search"` element
- `data-project-sites-secondary-lane` — `"medium"` only in medium mode, on the lane-2 container
- `data-project-sites-compact-scope-control` — `"true"` only in compact on the scope `<select>`
- `data-project-sites-compact-filters-summary` — `"true"` on the compact filter progressive-disclosure summary
- `data-project-sites-grid-sparse` — `featured` | `cluster` | `bounded` | `dense` on the result grid
- `data-project-sites-card-layout` — `wide` | `medium` | `compact` on each card shell
- `data-project-sites-card-density` — `comfortable` | `regular` | `condensed` on each card shell

## Interaction reachability

- Search, scope, sort, and filter entry points remain reachable in every mode.
- Primary launch action remains present in compact card mode.
- No primary interaction relies on horizontal scrolling in compact mode.
- Compact filter chips are reachable via the `Show` toggle
  (`aria-expanded`, `aria-controls`) — no hover-dependent access.
- Compact chip remove targets are ≥ 28×28 px.

## Hosted SharePoint validation matrix

Run this matrix on hosted Project Sites (`/SitePages/Project Sites.aspx`)
when the responsive seam changes. The six rows below span the display
classes and the short-height override.

For each row: load the page, let entries resolve, and capture a screenshot
for the repository record. The expected diagnostic values confirm the
responsive contract is live.

| # | Host width | Host height | Expected `data-project-sites-layout-mode` | Expected `data-project-sites-display-class` | Expected `data-project-sites-height-class` | What to observe                                                                 |
|---|------------|-------------|-------------------------------------------|---------------------------------------------|--------------------------------------------|---------------------------------------------------------------------------------|
| 1 | 375 px     | 760 px      | `compact`                                 | `phone`                                     | `standard`                                 | Stacked control band, compact scope `<select>`, no eyebrow, progressive chips summary when filtered. |
| 2 | 900 px     | 900 px      | `medium`                                  | `tablet`                                    | `standard`                                 | Two-lane control band with secondary lane divider; segmented scope; no scope-source pill; regular card density. |
| 3 | 1280 px    | 900 px      | `wide`                                    | `desktop`                                   | `standard`                                 | Inline control band; eyebrow + scope-source pill visible; comfortable card density; full metadata. |
| 4 | 1800 px    | 900 px      | `wide`                                    | `wide-desktop`                              | `standard`                                 | Same as #3 but ultrawide; sparse states center deliberately, no left-anchored island. |
| 5 | 1320 px    | 540 px      | `compact`                                 | `desktop`                                   | `short`                                    | Compact controls force-on despite wide container; attention/provisioning counts preserved. |
| 6 | 900 px     | 480 px      | `compact`                                 | `tablet`                                    | `short`                                    | Same as #5 but narrower; confirms short-height override remains authoritative.   |

Additional hosted checks:
- Filter 2026 down to 1 result on row 3 or 4 → grid `data-project-sites-grid-sparse="featured"`; the lone card is centered with `max-width: 520 px`.
- Filter down to exactly 2 results on row 3 or 4 → grid `data-project-sites-grid-sparse="cluster"`; cluster centers within an ~880 px envelope.
- On row 1, activate a stage filter → compact summary `"1 filter active · Show"` appears; clicking `Show` reveals chips with ≥ 28×28 px remove targets.

Visual regression tooling was not adopted in Wave-01; rerun this matrix
manually on the next responsive seam change, or introduce a Playwright
visual-regression seam before Wave-02 if drift becomes recurrent.

## Automated validation evidence (Wave-01)

- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.test.ts` — 13 tests covering:
  - width × height mode resolution (unchanged cases preserved)
  - short-height preserves underlying `displayClass`
  - display-class derivation at each threshold boundary
  - height-class derivation at the short-height threshold
  - `PROJECT_SITES_MODE_RESPONSIBILITIES` shape and per-mode strategy values
  - viewport short-height transition propagates via window resize without a ResizeObserver tick
  - repeated narrow short-height ResizeObserver ticks do not cause additional rerenders
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx` — 34 tests including:
  - medium mode composes a two-lane control band with scope/sort/filters grouped in the secondary lane
  - wide mode has no secondary lane
  - compact eyebrow and scope-source pill are suppressed; wide keeps them
  - compact progressive-disclosure filter summary renders in lieu of inline chips until expanded
  - grid sparse variants: `featured`, `cluster`, `dense`, `bounded`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.test.tsx` — 26 tests including:
  - comfortable density with full identity chips, launch-confidence, and all metadata
  - regular density with trimmed identity chips and metadata (drops Type + Lead Estimator)
  - condensed density with year-only identity chip and minimal metadata (Client + Location)
  - blocked launch messaging preserved at condensed density (provisioning)
  - explicit `density` prop wins over `layoutMode`-derived density
