# Workstream D · Step 02 — Closure

## Objective
Build the Add/Edit Teammate flyout, wire `HbcPeoplePicker`, and hydrate `PublisherTeamMemberRow` data from directory selection instead of blank manual entry.

## What changed

### New: teammate composer module
`apps/hb-webparts/src/webparts/articlePublisher/teamComposer/`
- `hydrateTeamMember.ts` — pure hydration rules for `PersonEntry → PublisherTeamMemberRow`.
  - `createTeamMemberFromPerson` builds a new row from a directory pick.
  - `mergeTeamMemberWithPerson` edits an existing row without destroying the non-authored carry-over columns (`Role`, `GroupKey`, `ParentMemberId`, `ContactLink`).
  - `editorialsFromRow` / `personEntryFromRow` reverse-project a stored row so the composer can seed itself on edit; the role caption stays blank when the stored `Title` is a passthrough of the directory `jobTitle`.
- `hydrateTeamMember.test.ts` — 11 unit tests covering hydration, editorial overrides, whitespace handling, merge-preservation, and reverse projection.
- `TeamMemberComposer.tsx` — the flyout. Reuses `HbcKudosComposerFlyout` (governed composer chrome — focus trap, reduced-motion choreography, primary/secondary actions) and `HbcPeoplePicker` in `mode="single"` with Graph search + photo hooks threaded through. Disables `Save teammate` until a directory person is picked. Role caption and Bio caption fields include helper copy and live character counts with over-budget highlighting announced via `aria-live`. A directory readout chip shows the live job title + department so the author knows what the card will track.
- `teamComposer.module.css` + matching `.d.ts` — local styles; no `@hbc/ui-kit` primitives were duplicated.
- `index.ts` — barrel.

### Rewired: `TeamPanel` in `ArticlePublisher.tsx`
- Replaced the 9-input per-row CRUD grid with a chip-card stack. Each card is a clickable chip showing the person's display name, directory title, department, and optional bio caption, plus a featured badge when applicable. The chip button opens the composer in edit mode; a kebab-style row of actions (`Move up`, `Move down`, `Edit`, `Remove`) rounds out the row.
- `+ Add teammate` primary button now opens the composer in add mode instead of appending a blank row.
- `SortOrder` is re-stamped from stack position on every write (add / edit / remove / reorder), so the author never sees or edits `SortOrder` and the persisted order matches what is on screen.
- `applyTeamMemberPrincipalChange` is retained as an export because the existing unit test imports it, but it is no longer referenced by the UI.
- `ArticlePublisherProps` gains optional `searchPeople` and `fetchPersonPhoto` adapters — threaded from the SPFx mount boundary in the same shape as the existing `searchProjects` plumbing. When absent, `HbcPeoplePicker` falls back to its manual UPN entry mode, so the panel stays functional in test / unplumbed runtimes.

### Styles
- `article-publisher.module.css` + `.d.ts` — added `.teamChipButton`, `.teamChipName`, `.teamChipTitle`, `.teamChipMeta`, `.teamChipBio`, and a focus-visible treatment. The existing `.rowCard` / `.rowActions` are reused.

## Doctrine alignment
- **Directory identity, not hand-typed email.** `PersonPrincipal`, `DisplayName`, directory `jobTitle`, and `Department` are hydrated from `PersonEntry`. The author no longer sees or edits them as raw text.
- **Editorial, not CRUD.** Role title and bio become editorial captions, both optional, both defaulting to directory data. `GroupKey`, `ParentMemberId`, `ContactLink`, and `Role` are no longer surfaced as free-text (they carry over untouched on edit so no data is lost on existing rows).
- **Reusable primitives first.** `HbcPeoplePicker` and `HbcKudosComposerFlyout` are reused verbatim from `@hbc/ui-kit`. No duplicate picker, no duplicate flyout shell, no new shared primitive introduced.
- **Host-safe.** All changes are composition + local styles; no new dependencies, no cross-package exports added, no schema change. `teamMembers.replaceAllForArticle` remains the only write seam.
- **Author-confident.** Save is blocked until identity is picked; empty-state copy is editorial; counter feedback on captions prevents overflow; `aria-label`s on reorder/remove buttons include the person's name.

## Lifecycle safety
- Publish / republish / archive / withdraw unchanged — they still read `teamDraft` and call `replaceAllForArticle`. The composer only mutates the in-memory draft; the save path is untouched.
- `validationEngine`'s "Team Viewer is enabled but no team members are authored" rule continues to fire from chip-count — no rule changes needed.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run ArticlePublisher teamComposer hydrateTeamMember` — 108/108 pass (includes 11 new hydration tests and every existing Publisher + label + governance test).
- Manual scrub of touched files for stale comments, contradictory labels, and drift — none found. No placeholder UX or fake affordances ship; composer save is strictly disabled until a directory pick exists; empty state copy is editorial; every new button carries an accessible label.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/hydrateTeamMember.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/hydrateTeamMember.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/TeamMemberComposer.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/teamComposer.module.css` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/teamComposer.module.css.d.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/index.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css.d.ts`
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-d-team-authoring-redesign/step-02/CLOSURE.md` (this file)

## Remaining / follow-on (per the Step 01 design)
- **Step 03** — keyboard reorder + drag-and-drop on the chip stack; mutually-exclusive featured-teammate invariant enforced inside the composer (currently a plain toggle); live teammate-card preview pane inside the flyout; final a11y audit.
- **Step 04** — tests (interaction + hosted), doctrine docs update, hosted SharePoint vetting, final scrub.

No blockers.
