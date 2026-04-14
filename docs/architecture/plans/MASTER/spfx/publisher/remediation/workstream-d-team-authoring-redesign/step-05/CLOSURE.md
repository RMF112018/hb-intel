# Workstream D · Step 05 — Closure

## Objective
Exhaustive end-to-end scrub of the team authoring workstream; close every remaining friction, accessibility, and drift item.

## Scrub findings + fixes

### 1. SPFx mount boundary was not threading the directory adapters (real friction) — **fixed**
Steps 02–04 added `searchPeople` / `fetchPersonPhoto` to `ArticlePublisherProps`, but `mount.tsx` never passed them. In hosted SPFx the composer silently fell back to the `HbcPeoplePicker` UPN-entry mode, which defeats the entire workstream.

Fix:
- Swapped the prop shape to the idiomatic Kudos pattern: `ArticlePublisher` now receives `getGraphToken` from the mount, and calls `useSharePointPeopleSearch()` + `useGraphPersonPhotoFn(getGraphToken)` internally. This mirrors `HbKudos.tsx` exactly, so hosted Publisher now wires the directory picker automatically.
- `mount.tsx` passes `getGraphToken` alongside `siteUrl` + `identity.email`. The mount comment was updated so the wiring intent is explicit.
- `HbcPeoplePicker` still degrades gracefully to initials avatars when `getGraphToken` is absent (e.g. the test runtime / storybook) — the search itself uses the tenant SharePoint picker endpoint and does not need a Graph token.

### 2. Dead code — **removed**
`applyTeamMemberPrincipalChange` in `ArticlePublisher.tsx` was the legacy helper that recovered a display name from a hand-typed UPN in the pre-redesign CRUD grid. The redesigned composer replaces that flow entirely; the helper had no call sites and its test existed only to verify the helper.

Fix:
- Deleted the helper from `ArticlePublisher.tsx`.
- Deleted the corresponding describe block and its now-unused `PublisherTeamMemberRow` import from `ArticlePublisher.test.tsx`.

### 3. Documentation drift — **closed**
Added a workstream-level `README.md` linking the five step documents and summarising the final architecture, downstream contracts, runtime seams, and preserved lifecycle invariants. This replaces step-by-step archaeology for future readers.

### 4. Final scrub for friction / drift / a11y on the redesigned surface
All items verified clean after steps 02–04; no further code changes needed.

| Scrub item | Status |
| --- | --- |
| Empty state copy ("No teammates yet" + editorial description) | Editorial, not CRUD-like ✔ |
| Loading state | Not applicable — data is in-memory draft; picker has its own loading ✔ |
| Error state | Composer save disabled until identity picked; Publisher's save error channel unchanged ✔ |
| Keyboard reorder (Alt+ArrowUp / Alt+ArrowDown on chip) | Working; announced via `ol aria-label` ✔ |
| Featured invariant | Enforced on both composer save and chip star toggle via `applyFeaturedInvariant` ✔ |
| SortOrder drift | Re-stamped on every mutation via `restampSortOrder` ✔ |
| Downstream Team Viewer render | `firstNonEmpty(Role, Title)` fallback lands composer-written captions ✔ |
| Person-scoped aria-labels on chip actions | "Remove Alice Admirable", "Move Alice Admirable up", etc. ✔ |
| Star-button toggle semantics | Real `<button type="button" aria-pressed={…} aria-label={…}>` ✔ |
| Stale labels / contradictory wording | None found in touched files ✔ |
| Legacy `PersonPrincipal` / `ParentMemberId` / `GroupKey` surfacing | Removed from the UI; preserved on edit for legacy rows ✔ |

## Workstream D — end state
- Composer flyout + Graph-backed `HbcPeoplePicker` fully wired (including the mount-boundary seam this step closed).
- Chip-stack visual surface with keyboard reorder, featured mutual exclusivity, and directory-sourced initials avatars.
- Persistence: `teamMembers.replaceAllForArticle` writes through `mapTeamMemberRowToListFields`; `PersonPrincipal` → `PersonPrincipalId` resolution stays inside the writer.
- Preview/publish parity: both surfaces consume `selectVisibleTeamMembers` + `mapPublisherRowToTeamViewerPerson`.
- 144 targeted tests green; typecheck clean.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run teamComposer ArticlePublisher teamViewer` — 144/144 pass across 12 files (hydration, invariants, persistence round-trip, Publisher governance tests, Team Viewer adapter).
- Manual scrub of `ArticlePublisher.tsx`, `mount.tsx`, `teamComposer/*`, and `teamViewerAdapter.ts` for stale comments, dead exports, contradictory labels, and drift — none remaining.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (prop shape + internal hooks; removed `applyTeamMemberPrincipalChange`)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx` (removed legacy helper test + its import)
- `apps/hb-webparts/src/mount.tsx` (thread `getGraphToken` into the Publisher)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-d-team-authoring-redesign/README.md` (new; workstream index)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-d-team-authoring-redesign/step-05/CLOSURE.md` (this file)
- `apps/hb-webparts/config/package-solution.json` (version bump)

## Remaining / blockers
- None. Workstream D is closed.
