# Workstream G · Step 02 — Closure

## Objective
Add search + filter + friendly row metadata to the Publisher's drafts queue.

## What changed

### New `draftQueue/` module
Pure helpers + the extracted component:

- `humaniseAge.ts` — `humaniseAge(iso, now)` returns "just now" / "Nm" (minutes) / "Nh" (hours) / "yesterday" / "Mar 12" / "Feb 3 2025". Safe against undefined, malformed, and clock-skew future timestamps. Covered by 8 unit tests.
- `authorAttribution.ts` — `authorAttribution(authorEmail, actorEmail)` returns "you" when the draft is the acting operator's, else a readable display name derived from the email local-part ("alice.smith" → "Alice Smith", "c-j_long" → "C J Long"). Case-insensitive comparison. Covered by 5 unit tests.
- `draftFilter.ts` — `matchesDraftQuery(row, query)` does a case-insensitive substring match across Title / ProjectName / Subhead / SummaryExcerpt / Slug / AuthorEmail (whitespace query matches everything). `highlightMatches(text, query)` returns typed `[{ text, match }]` segments so a renderer can wrap matches in `<mark>` without parsing HTML. Covered by 11 unit tests including multi-match splits and casing preservation.
- `DraftQueue.tsx` — the extracted rail component. Pinned search input with 150ms debounce, `sessionStorage` persistence under `hb-publisher:draftQueue.search`, `/` global shortcut to focus, `Escape` inside the input to clear, empty-matches editorial copy ("No drafts match '<query>'. Clear the search to see everything."). Rows now render:
  - Primary line: title (with `<mark>` highlights) + right-aligned humanised age chip; `title` attribute on both title and age for truncation + exact-timestamp tooltip.
  - Secondary line: project name (highlighted) · `articleContentTypeLabel`.
  - Tertiary line: author attribution ("you" or derived display name).
- `draftQueue.module.css` + `.d.ts` — 25 feature-scoped classes with focus-visible treatments, tabular-nums age chip, highlight styling, and collapsed-group transitions. Palette consistent with the rest of the Publisher surface.
- `index.ts` — barrel.

### `ArticlePublisher.tsx`
- Imports `DraftQueue` and replaces the inline rail JSX (52 lines) with a single `<DraftQueue>` invocation. Loading / empty / error handling is preserved; the loading state is now delegated to the component so the rail header ("Start new draft", "Articles" count) stays visible while drafts stream in.
- Passes `actorEmail` to the queue so the "you" attribution works without additional plumbing.

### Tests
- 24 new unit tests land across `humaniseAge`, `authorAttribution`, and `draftFilter`. All 222 targeted Publisher tests pass.

## Doctrine alignment
- **Editorial, not CRUD.** Rows now carry three lines with hierarchy (title + age, project + type, attribution). Search highlights what the author typed so the result set feels navigable. Collapsed-group count pill is a filled chip rather than plain text.
- **Author voice.** "No drafts match '<query>'. Clear the search to see everything." / "you" attribution / friendly age ("3h", "yesterday") in place of machine timestamps.
- **Host-safe.** Pure helpers + local composition + local CSS. `sessionStorage` access wrapped in try/catch for locked-down browsers / tests. No new dependencies, no schema change, no cross-package export.
- **Primitive reuse.** No new shared UI-kit primitive. `articleContentTypeLabel`, `draftGroupLabel`, `draftGroupEmptyCopy` from `authorLabels.ts` are reused; `HbcEmptyState` still handles the zero-articles shell.

## Accessibility
- `<input type="search" aria-label="Search drafts">` with placeholder hint.
- `/` shortcut only fires when the focus target isn't already an input.
- Group headers gain `aria-controls` linking to their list id for screen-reader cohesion (in addition to the existing `aria-expanded`).
- `<mark>` elements carry the standard browser highlight semantics; style uses a coloured background + inherited text colour (not colour-only).
- Age chip carries a `title` attribute with the full ISO timestamp as a progressive detail for mouse users.
- Row `<button>` elements preserve `aria-current="true"` on the active row.

## Lifecycle safety
- No schema change.
- `PublisherRepositories` / orchestrator / write-seam untouched.
- Group ordering (`DRAFT_GROUP_ORDER`) + default-collapsed (`COLLAPSED_GROUPS_BY_DEFAULT`) still owned by `ArticlePublisher.tsx`; the queue is a pure view over `groups` + `selectedArticleId`.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run draftQueue ArticlePublisher` — 222/222 pass across 19 files (24 new draftQueue helper tests + 198 existing).

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/humaniseAge.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/humaniseAge.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/authorAttribution.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/authorAttribution.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/draftFilter.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/draftFilter.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/DraftQueue.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/draftQueue.module.css` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/draftQueue.module.css.d.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/index.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-g-queue-and-draft-management/step-02/CLOSURE.md` (this file)

## Remaining / follow-on (per Step 01 design)
- **Step 03** — Draft completeness chip: pure `assessDraftCompleteness(row)` + tests; "Ready" / "N TODO" / "Blocked" pill rendered in the row tertiary line next to attribution, with `aria-label` including the missing-field list.
- **Step 04** — Persist collapsed-group state to `sessionStorage`; wire a visible keyboard-shortcut hint; a11y polish pass on chips.
- **Step 05** — Full behavioural scrub + workstream README + hosted SPFx vetting.

No blockers.
