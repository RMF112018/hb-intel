# Workstream G — Queue and Draft-Management Improvements

Turns the Article Publisher's left rail into a useful editorial queue — search, friendly metadata, completeness signalling, needs-attention rollup, stable selection behaviour, and keyboard navigation.

## Steps
- [Step 01 — Information model design](./step-01/DESIGN.md)
- [Step 02 — Search + friendly metadata](./step-02/CLOSURE.md)
- [Step 03 — Completeness + needs-attention signalling](./step-03/CLOSURE.md)
- [Step 04 — Selection persistence + keyboard navigation](./step-04/CLOSURE.md)
- [Step 05 — Scrub + zoom / hosted vetting](./step-05/CLOSURE.md)

## Final architecture

```
apps/hb-webparts/src/webparts/articlePublisher/draftQueue/
├── DraftQueue.tsx                 # the extracted rail component
├── draftFilter.ts                 # matchesDraftQuery + highlightMatches
├── draftCompleteness.ts           # assessDraftCompleteness + rollupGroupCompleteness
├── humaniseAge.ts                 # relative-age formatting
├── authorAttribution.ts           # "you" vs derived display name
├── draftFilter.test.ts            # 11 tests
├── draftCompleteness.test.ts      # 11 tests
├── humaniseAge.test.ts            # 8 tests
├── authorAttribution.test.ts      # 5 tests
├── draftQueue.module.css
├── draftQueue.module.css.d.ts
└── index.ts
```

## Before / after

| Concern | Before | After Workstream G |
| --- | --- | --- |
| Find a draft in a 40-draft queue | Scroll blindly | Search (debounced, highlighted); `/` to focus; sessionStorage-persisted |
| See what a row means | Title + ProjectName (2 lines) | Title + age chip, project · content type, attribution · completeness chip (3 lines) |
| Spot drafts needing work | Open each, run validator | `todo(n)` chip per row + `N TODO` rollup per group, all derived from the master-row heuristic |
| Tell "you" vs a colleague's drafts | `AuthorEmail` never shown | "you" when acting operator, derived display name otherwise |
| Resume across reloads | Selection and collapsed groups reset | Collapsed-group set persisted; auto-expand on selection; active row scrolled into view |
| Keyboard usage | Click only | `/` to focus search, arrows to move selection, `Escape` to clear search |
| Narrow rail / zoom | Row clipping | Primary line wraps the age chip below the title at ≤320px |

## Lifecycle invariants preserved
- No schema change.
- `PublisherRepositories` / orchestrator / write seam unchanged.
- `DRAFT_GROUP_ORDER` + `COLLAPSED_GROUPS_BY_DEFAULT` remain owned by `ArticlePublisher.tsx`; `DraftQueue` is a pure view over the groups + selected article id.
- `isRichBodyEmpty` from Workstream C step 04 is the one source of body-emptiness truth shared by composer, validator, and queue classifier.

## Accessibility summary
- `<input type="search" aria-label="Search drafts">` + placeholder hint; `/` shortcut only fires when focus isn't already in an input.
- `aria-controls` on group headers linking to their list id; `aria-expanded` preserved.
- `<mark>` highlights for matched substrings.
- Completeness chip: colour + text + aria-label that names the missing fields; group rollup carries its own aria-label.
- Arrow-key navigation; `aria-current="true"` on the active row; active row scrolled into view on selection.
- `title` attributes carry exact timestamps and full missing-field lists for mouse users.
