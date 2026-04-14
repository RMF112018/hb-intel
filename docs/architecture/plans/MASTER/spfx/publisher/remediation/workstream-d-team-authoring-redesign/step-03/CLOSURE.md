# Workstream D · Step 03 — Closure

## Objective
Replace the row-card chip editor with a cleaner visual team-management surface that supports edit, reorder, remove, and featured-state control — all enforcing the invariants the authoring model requires.

## What changed

### Extracted TeamPanel into its own module
- Moved the team-management surface out of `ArticlePublisher.tsx` into `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/TeamPanel.tsx`. The inline implementation is deleted, not preserved — the composer folder is the single owner of the teammate surface.
- New `teamPanel.module.css` + `.d.ts` carry the presentation. The Publisher's top-level stylesheet no longer needs `.teamChip*` helpers (still defined there for now because other chip usages in this file could reuse them; not removed in this step to avoid unrelated refactors).

### Visual redesign
- **Chip card.** Each teammate renders as an ordered-list item with a circular initials avatar, a clickable chip body (name + featured badge + role caption + department + bio caption), a star button, and a tidy row of secondary actions (`Up`, `Down`, `Edit`, `Remove`).
- **Featured as a first-class affordance.** The star button is a real `aria-pressed` toggle that flips the featured state without opening the composer. The "Featured" label is a visible badge on the chip name when set, not a hidden checkbox.
- **Editorial chrome.** Cards read as a roster, not a grid: focus-within outlines the active chip, hover states are deliberate, the `+ Add teammate` call-to-action is the only primary button, and the empty state carries the same editorial copy voice the rest of the Publisher uses.

### Pure invariants + tests
- `teamInvariants.ts` (new) — `applyFeaturedInvariant`, `restampSortOrder`, `moveRow`, `teamMemberInitials`. All pure, reference-stable where possible (rows that already match the invariant are returned by reference).
- `teamInvariants.test.ts` (new) — 12 unit tests covering mutually-exclusive featured, reference stability on no-op, SortOrder re-stamping, reorder happy path + end boundaries, and the initials fallback chain (two-name → single-name → email local-part → `?`).

### Featured-state governance, end to end
- The quick star toggle on the chip calls `applyFeaturedInvariant`, so exactly one teammate can ever be featured at a time — toggling a featured chip off clears the flag everywhere; toggling an un-featured chip on clears the previous featured chip.
- The composer's `IsFeaturedMember: true` save also runs through `applyFeaturedInvariant`, so saving a row as featured from inside the flyout enforces the same invariant.
- Reorder, remove, and composer save all re-stamp `SortOrder` via `restampSortOrder`, so persisted order always tracks what the author sees.

### Keyboard reorder
- Focus a chip body and press `Alt+ArrowUp` / `Alt+ArrowDown` to move it without leaving the keyboard. The `<ol>` wrapper carries an `aria-label` that surfaces this affordance to screen-reader users. The existing pointer affordances (`Up` / `Down` buttons) remain for users who prefer them.

### `ArticlePublisher.tsx` diff
- Replaced the inline `TeamPanel` (144 LoC) with the imported `TeamPanel` from `teamComposer/`. Net: file is smaller and the CRUD-style inline helper code is gone.
- `PeopleSearchFn` / `PersonPhotoFn` imports remain — still referenced by `ArticlePublisherProps`.

## Doctrine alignment
- **Editorial, not CRUD.** No more row-card grid; the surface reads as a team roster with deliberate affordances, not an admin table.
- **Reusable primitives preserved.** `HbcEmptyState` and `HbcKudosComposerFlyout` + `HbcPeoplePicker` continue to carry the shared-UI load. No new ui-kit primitive was introduced; the chip-card is feature-scoped composition.
- **Pure invariants.** Featured, SortOrder, and reorder rules live in `teamInvariants.ts` so the composer and panel share one source of truth; every mutation path flows through these helpers.
- **Host-safe.** Local composition + local CSS. No new cross-package exports, no dependency changes, no schema changes.
- **Author-safe.** Empty / loading / error states: empty state uses `HbcEmptyState` with editorial copy; there is no loading state here (data is already in memory on the Publisher draft); error states continue to ride the Publisher's existing save error channel.

## Accessibility
- `<ol aria-label="Article teammates — use Alt+Up or Alt+Down to reorder">` announces the stack and its reorder affordance.
- Star button is a real `<button type="button" aria-pressed={…} aria-label={…}>` — not a checkbox, not a div.
- Reorder / edit / remove buttons carry person-scoped `aria-label`s (`Move Alice Admirable up`, `Remove Alice Admirable`), so screen-reader users know who each action targets.
- Chip body is a `<button>` with a focus-visible outline; keyboard focus ring is preserved by `:focus-visible`. `Alt+Arrow` reorder does not steal plain Tab navigation.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run ArticlePublisher teamComposer teamInvariants hydrateTeamMember` — 120/120 pass (adds 12 invariant tests to the existing 108).
- Scrubbed touched files for stale comments, duplicate affordances, and contradictory labels. No placeholder UX shipped; every button has an accessible label; the empty state copy is editorial and matches Step 02's direction.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/TeamPanel.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/teamPanel.module.css` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/teamPanel.module.css.d.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/teamInvariants.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/teamInvariants.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/index.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (inline `TeamPanel` removed; imports `TeamPanel` from the composer module)
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-d-team-authoring-redesign/step-03/CLOSURE.md` (this file)

## Remaining / follow-on
- **Step 04** — doctrine docs update, hosted SharePoint vetting of the refactored surface, end-to-end interaction tests, final scrub for drift.
- Pointer drag-and-drop reorder is deliberately deferred to a later hardening pass; keyboard reorder + button reorder cover the author flows for this step without pulling in a new dependency.

No blockers.
