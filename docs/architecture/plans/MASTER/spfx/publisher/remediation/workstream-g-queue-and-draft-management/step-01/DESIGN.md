# Workstream G · Step 01 — Drafts queue information model (DESIGN)

Target-state design for the Article Publisher's left-rail drafts queue. No code changes in this step; the spec is what Steps 02–05 implement against.

## 1. Current state (repo truth)

**Surface:** the `draftRail` aside in `ArticlePublisher.tsx` (~L925–978).

**Shape:** collapsible groups keyed by `WorkflowState` (`DRAFT_GROUP_ORDER`), each group showing a count and a flat list of rows. Each row renders:

```
<displayTitle>         // Title || 'Untitled draft'
<displayProject>       // ProjectName || 'No project linked yet'
```

Two lines. That is the entire model.

### Problems
- **No search.** In a busy operational moment an author with 40 drafts has no way to find one except by scrolling the groups.
- **No completeness signal.** Rows that are missing required fields (hero image, alt text, body, subhead…) look identical to rows that are ready to publish. Authors only find out at publish-time.
- **No recency.** `UpdatedDateUtc` is never shown. Authors can't tell which drafts they were last working on.
- **No author signal.** `AuthorEmail` is never shown; a team member cannot tell at a glance which drafts are theirs vs. a colleague's.
- **Metadata in technical voice.** `WorkflowState` values like `readyForReview` are shown as verbatim enum strings by `draftGroupLabel`.
- **Weak row hierarchy.** Same typographic weight for title and project name; no eye-guide between the two; no tertiary metadata line.
- **No filter persistence.** Group collapse state resets on reload.

## 2. Target state

### Search
- Search input pinned at the top of the rail, debounced 150ms.
- Matches are case-insensitive across `Title`, `ProjectName`, `Subhead`, `SummaryExcerpt`, `Slug`, `AuthorEmail`.
- When a search is active: groups still render, but only groups with ≥1 match are shown; the matched substring is highlighted via `<mark>` in the title/project line.
- `Escape` while focused in the input clears the filter. `/` from anywhere in the rail focuses the search input.
- Empty-state copy when a search matches nothing: "No drafts match <query>. Clear the search to see everything."

### Row content (three-line hierarchy)

```
┌──────────────────────────────────────────────────┐
│ [badge] <Title>                       <age-chip> │   ← primary
│ <ProjectName> · <ArticleContentType>             │   ← secondary
│ <SubjectOrSpotlight> · you · 3 TODO              │   ← tertiary
└──────────────────────────────────────────────────┘
```

- **Badge** — small coloured dot (template colour per destination) replacing the current plain-background row when active.
- **Title** — `Title || 'Untitled draft'`; truncated on overflow with `title` attribute carrying the full string.
- **Age chip** — human-relative `UpdatedDateUtc` ("2m ago", "3h ago", "yesterday", "Mar 12"). Right-aligned, tabular-nums.
- **Secondary line** — `ProjectName · ContentType`. Project name uses `projectStageLabel` / friendly wording; content type uses `articleContentTypeLabel`.
- **Tertiary line** — first of { `SpotlightType`, `ArticleSubject`, `Destination` } that is set; then "you" if `AuthorEmail === actorEmail` else the author's display name (local-part of the email is the fallback), then a **completeness chip** ("Ready" / "N TODO" / "Blocked").

### Draft completeness cues

Pure function `assessDraftCompleteness(article)` classifies each draft into:
- `ready` — all validator-required fields present AND `WorkflowState ∈ {'approved', 'published'}` (or `readyForReview` with no blocking findings).
- `todo` — some required fields blank; counts the number missing.
- `blocked` — `WorkflowState === 'archived' | 'withdrawn'` or validation would surface `page-generation-blocker`.

The rail does NOT re-run the full `validationEngine` per row (that requires resolution + shell). The row-level assessment is a cheaper heuristic over the master row fields: Title, Subhead, SummaryExcerpt, BodyRichText (non-empty via the Step-c-04 `isRichBodyEmpty` heuristic), HeroPrimaryImage, HeroPrimaryImageAltText, Slug, ArticleContentType, Destination.

Rows show the completeness chip in the tertiary line:
- `ready` → green "Ready" pill.
- `todo(n)` → ochre "{n} TODO" pill with a `title` tooltip listing which fields are missing.
- `blocked` → red "Blocked" pill.

### Friendly metadata

`draftGroupLabel` already exists for group labels. Extend / expose author-voice labels for:
- **Content type** — reuse `articleContentTypeLabel`.
- **Age / updated time** — new pure `humaniseAge(iso, now)` helper with the "2m / 3h / yesterday / Mar 12" treatment; tested against fixed `now`.
- **Author attribution** — pure `authorAttribution(email, actorEmail)` returning "you" when the draft is the acting operator's and otherwise a reasonable display name derived from the email local-part.

### Group header polish
- Group count pill visually distinct (filled background) rather than plain text.
- `aria-expanded` and heading button already correct; add `aria-controls` linking the header to its list for screen-reader cohesion.

### Persistence
- Search term persists in `sessionStorage` under a namespaced key so refreshes don't drop the author's filter.
- Collapsed-group state persists under the same key.

## 3. Lifecycle + contract safety

- No schema change; the new metadata is derived from existing fields on `PublisherArticleRow`.
- No orchestrator or write-seam change.
- `draftGroupLabel` / `draftGroupEmptyCopy` / `articleContentTypeLabel` / `projectStageLabel` continue to be the canonical label sources.
- Row click still selects the article — navigation semantics unchanged.

## 4. Accessibility

- Search input: real `<input type="search">` with `aria-label="Search drafts"`, `role="searchbox"` (default), `<mark>` highlighting inside matches.
- Rows: remain `<button>` elements; `aria-current="true"` on the active row.
- Completeness chips: text + coloured pill (not colour-only); `aria-label` including the count for TODO chips.
- Group headers: keep `aria-expanded`; add `aria-controls`.
- `Escape` to clear search; `/` global shortcut to focus search, with a small hint rendered next to the input.

## 5. Primitive reuse

No new shared UI-kit primitive. All row / search / chip UI is Publisher-scoped; styles live in a new `draftQueue/` folder alongside the other workstream composers.

Reused:
- `HbcEmptyState` for the no-matches empty state (optional — the design can use a lightweight inline paragraph instead).
- `draftGroupLabel`, `draftGroupEmptyCopy`, `articleContentTypeLabel`, `projectStageLabel` from `authorLabels.ts`.
- The Step-c-04 `isRichBodyEmpty` helper for the completeness `BodyRichText` check.

New Publisher-scoped helpers (steps 02+):
- `draftQueue/draftCompleteness.ts` — `assessDraftCompleteness(row)` + tests.
- `draftQueue/humaniseAge.ts` — `humaniseAge(iso, now)` + tests.
- `draftQueue/authorAttribution.ts` — `authorAttribution(email, actorEmail)` + tests.
- `draftQueue/draftFilter.ts` — `matchesDraftQuery(row, query)` + `highlightMatches(text, query)` + tests.
- `draftQueue/DraftQueue.tsx` — the extracted rail component consuming the helpers.

## 6. Sequencing — steps 02 – 05

- **Step 02** — Extract the rail into `draftQueue/DraftQueue.tsx`; add search + highlight; persist search in sessionStorage. Add `humaniseAge` + `authorAttribution` + `matchesDraftQuery` pure helpers with tests.
- **Step 03** — Add the three-line row hierarchy and the completeness chip; pure `assessDraftCompleteness` + tests.
- **Step 04** — Persistence of collapsed-group state; keyboard shortcuts (`/` to focus, `Escape` to clear); a11y polish (aria-controls on group headers; completeness chip aria-labels).
- **Step 05** — Full behavioural scrub, workstream README, hosted SPFx vetting.

## 7. Scope cuts

- **No server-side search.** The queue reads from the already-loaded `groups` state. A 1000-draft operational scale is not today's concern; if that ever lands it's a separate ticket.
- **No multi-select / bulk actions.** The queue remains a single-select rail.
- **No drag reorder.** Group ordering is driven by `DRAFT_GROUP_ORDER`.
- **No filter by author / content-type chips.** Search covers author by email; chip-based filter UI is out of scope unless a second consumer materialises.

## 8. Files touched by this step

- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-g-queue-and-draft-management/step-01/DESIGN.md` (this file).
- No source, no manifest, no tests. No version bump.

## 9. Definition of completion for this step

- Target information model for the drafts queue defined ✔
- Search behaviour, row hierarchy, completeness cues, friendly metadata specified ✔
- Tenant schema and lifecycle contracts preserved ✔
- Accessibility contract specified ✔
- Primitive reuse and pure-helper plan anchored in workstream patterns ✔
- Explicit scope cuts + Step 02–05 sequencing ✔
