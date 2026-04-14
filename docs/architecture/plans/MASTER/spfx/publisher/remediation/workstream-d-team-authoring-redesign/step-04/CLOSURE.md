# Workstream D · Step 04 — Closure

## Objective
Verify that the redesigned team authoring flow persists correctly, previews correctly, and remains aligned with Team Viewer downstream contracts.

## Audit findings

### Persistence path — clean
- `mapTeamMemberRowToListFields` (`publisherWriters.ts`) emits every tenant column the composer touches: `ArticleId`, `TeamMemberId`, `Title`, `PersonPrincipalId`, `DisplayName`, `Department`, `BioSnippet`, `SortOrder`, `IsFeaturedMember`, plus carry-over columns (`Role`, `Company`, `GroupKey`, `ParentMemberId`, `ContactLink`).
- `createSharePointTeamMembersWriter.resolvePrincipal` translates the composer's `PersonPrincipal` (UPN string) into the required `PersonPrincipalId` (SharePoint user id) via `ensureUserByEmail` before the mapper runs, so the composer is not responsible for principal resolution.
- `replaceAllForArticle` remains the single write seam and is untouched.

### Preview / compositor path — clean
- `pageCompositor.composeTeam` delegates sort + visibility to `selectVisibleTeamMembers` in `teamViewerAdapter.ts`, which sorts by `SortOrder` with a `DisplayName` tiebreaker. The composer's `restampSortOrder` stamps position-derived sort orders, so chip-stack order is preserved through compose.

### Team Viewer contract drift — **found and fixed**
- `mapPublisherRowToTeamViewerPerson` previously read only `row.Role` as `jobTitle` / `projectRole`. The redesigned composer no longer surfaces `Role` as a free-text field (by design — authors use the editorial `Role caption` which lands in `row.Title`, matching the directory `jobTitle`). The result was that freshly composed rows rendered with no job title downstream.
- Fix: the adapter now prefers a non-empty `row.Role` (legacy rows) and falls back to a non-empty `row.Title` (composer-written rows). Whitespace is treated as empty. Behaviour for legacy rows with a `Role` value is unchanged; new composer rows now render the caption / directory title authors see in the Publisher UI.

## What changed

### `apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts`
- `mapPublisherRowToTeamViewerPerson` now sources `jobTitle` / `projectRole` from `firstNonEmpty(row.Role, row.Title)`. Private `firstNonEmpty` helper treats whitespace as absent. Doc block updated to describe the Step-02 / Step-04 reasoning.

### New: persistence round-trip integration tests
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/teamPersistence.test.ts` (new, 8 tests):
  - Composer-produced row + resolved `PersonPrincipalId` maps cleanly to the SharePoint field bag.
  - Mapper refuses to emit without `PersonPrincipalId`.
  - Edit merge preserves legacy `Role` / `GroupKey` / `ParentMemberId` / `ContactLink`.
  - Composer-written `Title` renders as `jobTitle` downstream when no legacy `Role` is set.
  - Legacy `Role` continues to take precedence over `Title`.
  - Whitespace-only `Role` is ignored, falling back to `Title`.
  - Chip-stack order (via `restampSortOrder`) becomes the Team Viewer render order.
  - Mutually-exclusive featured invariant holds across the roster before persistence.
  - `selectVisibleTeamMembers` tie-breaks on `DisplayName` when `SortOrder` collides.

## Doctrine alignment
- **Preview–publish parity.** Preview and publish both consume `selectVisibleTeamMembers` + `mapPublisherRowToTeamViewerPerson`, so the downstream-contract fix lands on both surfaces simultaneously — no chance of drift between what the composer previews and what ships.
- **Backwards-compatible.** The contract change is additive: legacy rows keep their existing `Role`-sourced `jobTitle`; the fallback only activates when `Role` is empty. No data migration required.
- **Host-safe.** Pure string logic, no new dependencies, no schema change, no cross-package export added. `teamMembers.replaceAllForArticle` remains the only team-member write seam.
- **Author-confident.** Authors now see what they wrote downstream: the role caption (or directory job title) from the composer renders as the teammate's job title on the published page.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run teamComposer teamViewer publisherWriters pageCompositor teamPersistence` — 67/67 pass.
- `pnpm vitest run teamViewerAdapter` — 9/9 pass; the behavioural change is backwards-compatible and the existing suite's `Role`-as-jobTitle assertions still hold because those rows all carry a populated `Role`.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/teamPersistence.test.ts` (new)
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-d-team-authoring-redesign/step-04/CLOSURE.md` (this file)

## Workstream D — overall state after this step
- Step 01 — interaction model design locked ✔
- Step 02 — composer flyout + `HbcPeoplePicker` hydration landed ✔
- Step 03 — chip-stack visual management surface + pure invariants landed ✔
- Step 04 — persistence / preview / Team Viewer contract hardened ✔ (this step)

## Remaining / blockers
- None blocking the workstream. Drag-and-drop pointer reorder remains deliberately deferred; keyboard reorder + button reorder cover author flows.
