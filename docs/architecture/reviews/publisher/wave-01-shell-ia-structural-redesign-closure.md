# Publisher Wave-01 — Shell & IA structural redesign closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-14/Prompt-01-Structural-redesign-editorial-shell-and-information-architecture.md`
**Scope:** editorial shell composition, region hierarchy, information architecture.
**Manifest:** hb-publisher Feature 1.0.0.29.

## What structurally changed

- The symmetric three-column grid (equal-weight queue · canvas · readiness columns with card chrome on each) has been replaced with an **asymmetric editorial surface**. The center canvas is the dominant region; the left apron and right readiness dock are intentionally subordinate rails, each rendered borderless with a single hairline separator against the canvas.
- Card chrome was removed from the canvas (`border`, `border-radius`, `box-shadow`, card padding). The canvas now reads as the page editorial plane itself rather than a floating card among sibling cards. A subtle radial tonal shift at the top-left of the workspace establishes figure/ground between the dominant plane and the rails.
- Canvas max-width is constrained to an editorial measure (880 px) and horizontally centered in its column, with increased vertical rhythm between sections.

## Region hierarchy replaced

- **Left apron** now renders a continuous rail of two clusters: draft header (kicker + title + new-draft action) → draft queue → **editorial spine** (new primitive). No longer presents as a standalone "queue card."
- **Center canvas** header is restructured: single large `<h1>` title + kicker + inline outcome chip. Notices are rendered only when active; the previous always-visible sticky pill-strip `sectionIndex` nav is removed entirely.
- **Right readiness dock** reorders into: readiness summary (denser) → save/blocker/warning blocks → diagnostics → sticky **Ship** cluster pinned to the bottom (Publish / Republish / Save draft) with "Recompose preview" demoted to a small subordinate action below the cluster → workflow transitions → destructive block → status banner.

## New primitives

- `EditorialSpine` (`workspace/EditorialSpine.tsx`) — vertical progress rail rendered inside the draft apron. Each section is a hash anchor with a completion dot (complete / partial / empty / optional), a numeric index, and a status label. Active section is computed by an `IntersectionObserver` (`useActiveSection.ts`) and marked with `aria-current="location"`. Keyboard focus continues to be delegated to the shared `handleSectionIndexClick` helper, preserving the behaviour the existing `sectionFocus` test suite protects.
- `EditorialSection` (local in `ArticlePublisher.tsx`) — numbered editorial marker + body. Collapses the previous per-section `<h3>` + intent `<p>` duplication into a single marker row. Destination and preview are flagged as `governance` sections and rendered behind a subtle hairline separator to signal their proof role.

## What was intentionally preserved

- All controllers: `useDraftLifecycle`, `usePreviewController`, `useReadinessController`, `useStatusChannel`, `useDraftWorkspace`.
- Save / publish / republish gating, promotion policy application, validation surfacing, and `sectionAnchorForFindingField` readiness backlinks.
- Section anchor ids (`section-identity`, `section-hero`, `section-story`, `section-media`, `section-team`, `section-promotion`, `section-destination`, `section-preview`) — the spine, readiness backlinks, and existing `handleSectionIndexClick` focus helper all still resolve.
- `QueueRail` / `DraftQueue` internals, authoring panels, preview and readiness diagnostics components.
- SharePoint host respect — no fake global shell chrome introduced; all structure lives inside the web part root.

## Breakpoints exercised

- **≥1280**: apron ~260 · canvas fluid (max 880) · dock ~320. Rails recede; canvas dominates.
- **1080–1279**: apron ~232 · canvas fluid · dock ~296; tightened canvas padding.
- **720–1079**: apron + canvas two-column; readiness dock becomes a pinned bottom tray with `overscroll-behavior: contain`.
- **<720**: stacked — apron collapses to a short scrollable region, canvas goes full-bleed-with-gutter, readiness becomes a bottom tray.

## Why the result is materially more editorial

- The canvas is no longer a card among equal-weight cards; it is the editorial plane itself. Rails are explicitly subordinate (transparent surface, thin hairlines, demoted typography).
- The horizontal pill-strip `sectionIndex` — an operator pattern — is gone. Section navigation lives in an editorial progress spine in the apron, with completion dots that mirror the draft's composition state rather than a pure jump-list.
- Per-section header ceremony is reduced from two repeated lines per section to a single numbered marker row, halving shell-level prose.
- The readiness dock ends in a sticky Ship cluster; publish-time gravity is now clearly anchored at the bottom of the dock instead of dispersed across peer rectangles.

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing; 6 failures all pre-existing in `publisherAdapter/__tests__/publisherEndToEnd.test.ts` (confirmed by baseline run against `main` before this change; unrelated to the shell redesign scope).
- `pnpm --filter @hbc/spfx-hb-publisher lint` — blocked by a pre-existing ESLint config resolution error in the workspace, unrelated to this change.
- Manifest bumped: `config/package-solution.json` 1.0.0.28 → 1.0.0.29.

## States covered by the redesign

- **Empty** (no draft selected): canvas renders the centered empty state; readiness dock renders the "pick a draft" cue; spine is hidden (no composition state to report).
- **Selected draft**: spine populates from live draft fields; active section tracks scroll via `IntersectionObserver`.
- **Blocker state**: blocking validation findings render in the readiness dock; canvas surfaces `unsupportedDestinationMessage` / `unsupportedContentTypeMessage` as blocking notices; destination spine dot reports `partial`.
- **Warning state**: warnings render in their own readiness block; non-blocking notices render on the canvas.
- **Publish-ready state**: spine dots resolve to `complete` across required sections; the Ship cluster activates Publish with no disabled reason.
