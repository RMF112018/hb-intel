# Wave 01 — Team & gallery editorial management surfaces closure

**Scope:** phase-12 / Prompt-05 — take the team and gallery managers
from "already better than CRUD tables" to product-grade editorial
management surfaces that foreshadow published output and keep every
invariant intact.

**Status:** closed.

## Product-grade gaps after the earlier rebuild

The Wave-01 rebuild already shipped real managers: people-picker +
flyout composer + chip stack for the team, tile grid + role/feature
badges + composer flyout for the gallery, with invariant helpers
enforcing featured exclusivity and 1-indexed SortOrder. That was
genuine progress. What remained was interaction residue and flat
hierarchy:

- CSS residue from the pre-`PublisherButton` era — local
  `.iconBtn`, `.iconBtnActive`, `.actionBtn`, `.actionBtnDanger`,
  `.addBtn`, and the local `.featuredBadge` / `.roleBadge` chip
  classes were all dead after the button/chip primitive migration
  but still shipped in the module CSS and `.d.ts`.
- The featured teammate read the same as the roster — only a gold
  pill inline with the name signaled the editorial role, which does
  not match the published article where the featured teammate is
  the article-card lead.
- The featured gallery image read the same as supporting images —
  only a "Featured" pill signaled card-thumbnail behavior, which
  again does not match the published layout where the featured
  image is the card thumbnail.
- Raw enum language leaked: `MediaRole` was rendered verbatim
  (`'supporting'`, `'hero'`, `'secondary'`) even though an
  `authorLabels.mediaRoleLabel()` helper already existed for
  governed author-facing language.

## What was preserved

- People-picker adapter + `HbcKudosComposerFlyout` composer chrome
  (the composer UI was not touched).
- Persistence boundaries — `onChange` still emits
  `PublisherTeamMemberRow[]` / `PublisherMediaRow[]`; orchestration
  still routes through `teamMembers.replaceAllForArticle` /
  `media.replaceAllForArticle`.
- Featured-exclusivity invariants via `applyFeaturedInvariant` /
  `applyFeaturedGalleryInvariant`.
- 1-indexed sort-order restamp via `restampSortOrder` /
  `restampMediaSortOrder`.
- Keyboard reorder contracts (Alt+ArrowUp/Down on chip bodies,
  Alt+ArrowLeft/Right on gallery tile bodies).
- Add / edit / remove flows.
- Every mutation path continues to route through the same pure
  invariant helpers — the refactor only changed render structure.

## What was elevated

### Team manager (editorial roster)

- Split rendering into two semantic clusters when a featured
  teammate exists: **Article card lead** + **Roster**. When no one
  is featured, everyone reads as **Team**. Heading labels read as
  editorial section labels, not data-grid captions.
- New `.chipFeatured` treatment: subtle gold-to-surface gradient,
  featured-ramp border, 3px left accent rail, larger avatar (48px
  vs 40px with a soft ring halo), slightly larger name. Featured
  reads as the card lead at a glance.
- `TeammateAvatar` ring / elevation increased from the baseline
  36px to 40px to match the premium avatar language set in
  Prompt-03.
- Full move(idx, ±1) / removeAt(idx) still operate on the original
  `rows` indices (captured via `rowsWithIndex.filter`) so
  featured-exclusivity, keyboard reorder, and sort-order restamp
  continue to hold across the split layout.

### Gallery manager (editorial visual manager)

- Split rendering into **Card thumbnail** + **Gallery** clusters
  when a featured image exists; **Images** otherwise. Foreshadows
  the published layout where the featured image is the card
  thumbnail.
- New `.tileFeatured` treatment: featured-gradient surface,
  16:9 hero-aspect frame (vs 4:3 for supporting images), a 3px top
  accent rail, increased padding, larger caption clamp. The
  featured tile now visually reads as "this is the card
  thumbnail."
- Featured chip language updated from "Featured" to "Card
  thumbnail" to name the editorial role, not the data flag.
- Role badges now render through `mediaRoleLabel(r.MediaRole)` so
  the author never sees raw enum tokens (`supporting` →
  "Supporting", `hero` → "Hero", `secondary` → "Secondary").

### CSS debt removed

Deleted from `teamPanel.module.css` (+ `.d.ts`): `.iconBtn`,
`.iconBtnActive`, `.actionBtn`, `.actionBtnDanger`, `.addBtn`,
`.featuredBadge`.

Deleted from `galleryPanel.module.css` (+ `.d.ts`): `.iconBtn`,
`.iconBtnActive`, `.actionBtn`, `.actionBtnDanger`, `.addBtn`,
`.featuredBadge`, `.roleBadge`.

Added: `.rosterGroup`, `.rosterHeading`, `.chipFeatured` in team;
`.galleryCluster`, `.galleryHeading`, `.leadGrid`, `.tileFeatured`
in gallery.

## Invariant checks performed

- **Featured teammate exclusivity.** `applyFeaturedInvariant` is the
  sole mutation path for the featured flag; toggling featured on the
  featured row clears it; toggling featured on a new row clears it
  on the previously featured row. The new split render re-derives
  `featuredIndex` from the current `rows` array on every render, so
  the split layout cannot diverge from the invariant.
- **Featured gallery exclusivity.** `applyFeaturedGalleryInvariant`
  is the sole mutation path; same re-derivation pattern.
- **Sort-order restamp.** `restampSortOrder` /
  `restampMediaSortOrder` continue to fire after every
  add/edit/remove/reorder (unchanged).
- **Keyboard reorder.** Alt+Arrow handlers continue to route through
  `moveRow` / `moveMediaRow` with the true index from the full
  `rows` array, not a post-split index — confirmed by passing the
  original index into `renderChip` / `renderTile` via the
  `rowsWithIndex` pattern.
- **Add / edit / remove.** Primary `+ Add teammate` /
  `+ Add image` buttons still open the composer flyouts;
  `onSave` still applies `applyFeaturedInvariant` +
  `restampSortOrder` before `onChange`. `Remove` still calls
  `removeAt` with the original index.

## Proof of closure

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — pass.
- Full `@hbc/spfx-hb-publisher` suite — 564/570 pass; same 6
  pre-existing `publisherEndToEnd` orchestrator failures, unrelated
  to this UI work and not regressed. Team/media invariant test
  suites (`teamInvariants`, `teamPersistence`, `hydrateTeamMember`,
  `mediaInvariants`, `mediaPersistence`, `altTextGuidance`,
  `buildMediaRow`) all still pass.
- `.module.css.d.ts` surfaces updated: 6 classes removed, 3 added
  (team); 7 removed, 4 added (gallery). All remaining class
  declarations map to live callsites.
- No new runtime dependency.
- Composer flyouts, people-picker integration, and persistence
  boundaries unchanged.

## Bounded residual

- The featured chip inside the team chip's name line is preserved
  (label "Featured"). The row-level featured language now lives in
  the cluster heading ("Article card lead") which reads more
  clearly. Leaving the inline chip keeps screen-reader context
  self-contained on the row itself without adding verbose aria
  scaffolding.
- Gallery `leadGrid` uses a single-column grid instead of a
  full-width block so when the gallery is later extended to a
  multi-slot "lead family" (e.g., 1 card thumbnail + 1 inline hero)
  the grid expands without a layout rewrite.
